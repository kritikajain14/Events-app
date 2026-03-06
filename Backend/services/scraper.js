import puppeteer from 'puppeteer';
import Event from '../models/Event.js';

const SOURCES = [
  {
    name: 'Sydney Events Hub',
    url: 'https://www.eventbrite.com/d/australia--sydney/events',
    scrapeFunction: scrapeSydneyEvents
  },
 
];

async function scrapeSydneyEvents(page) {
  const events = [];

  console.log("Navigating...");
  await page.goto(
    'https://www.eventbrite.com.au/d/australia--sydney/events/',
    { waitUntil: 'networkidle2' }
  );
  console.log("Page loaded");

  await page.waitForSelector('a[href*="/e/"]');

  const test = await page.$$('a[href*="/e/"]');
  console.log("Elements found:", test.length);

  const scrapedEvents = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('a[href*="/e/"]'));

    return cards.map(card => ({
      title: card.querySelector('h3')?.innerText || null,
      dateText: card.querySelector('time')?.innerText || null,
      imageUrl: card.querySelector('img')?.src || null,
      originalUrl: card.href
    }));
  });

  console.log("Scraped raw events:", scrapedEvents.length);

  for (const e of scrapedEvents) {
    if (!e.title || !e.originalUrl) continue;

    events.push({
      title: e.title,
      dateTime: new Date(), // safe date
      venueName: 'Sydney',
      venueAddress: 'Sydney, Australia',
      description: '',
      imageUrl: e.imageUrl,
      sourceWebsite: 'Eventbrite',
      originalUrl: e.originalUrl,
      city: 'Sydney',
      category: ['Event']
    });
  }

  console.log("Processed events:", events.length);

  return events;
}


async function scrapeWhatsOnSydney(page) {
  // Similar implementation for other source
  return [];
}

export async function scrapeAllEvents() {
  const browser = await puppeteer.launch({
  headless: false,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
  try {
    const page = await browser.newPage();
    const allEvents = [];
    
    for (const source of SOURCES) {
      const events = await source.scrapeFunction(page);
      allEvents.push(...events);
    }
    
    // Process and update database
    for (const eventData of allEvents) {
      const existingEvent = await Event.findOne({ originalUrl: eventData.originalUrl });
      
      if (!existingEvent) {
        // New event
        try {
  await Event.create({
    ...eventData,
    status: 'new',
    lastScrapedAt: new Date()
  });
  console.log("Inserted:", eventData.title);
} catch (err) {
  console.error("Insert failed:", err.message);
}
      } else {
        // Check if event data changed
        const hasChanged = Object.keys(eventData).some(key => 
          eventData[key]?.toString() !== existingEvent[key]?.toString()
        );
        
        if (hasChanged) {
          existingEvent.set({ ...eventData, status: 'updated' });
          await existingEvent.save();
        }
        
        existingEvent.lastScrapedAt = new Date();
        await existingEvent.save();
      }
    }

    console.log("Saving:", eventData.title);
    
    // Mark events as inactive if not found in recent scrapes
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Event.updateMany(
      { lastScrapedAt: { $lt: twentyFourHoursAgo }, status: { $ne: 'inactive' } },
      { status: 'inactive' }
    );
    
  } catch (error) {
    console.error('Scraping error:', error);
  } finally {
    await browser.close();
  }
}

// await scrapeAllEvents();
