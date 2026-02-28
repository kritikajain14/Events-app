import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ticketApi } from '../api'; 
import { format } from 'date-fns';
import { Ticket, Calendar, MapPin, Mail, Download, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    fetchTickets();
  }, []);

const fetchTickets = async () => {
  setLoading(true);
  try {
    const response = await ticketApi.getMyTickets();

    const ticketsData = response.data?.tickets || response.data || [];

    setTickets(Array.isArray(ticketsData) ? ticketsData : []);
  } catch (err) {
    setError('Failed to load your tickets');
    console.error('Error fetching tickets:', err);
    setTickets([]);
  } finally {
    setLoading(false);
  }
};

  const handleExportTickets = async () => {
    try {
      const response = await ticketApi.exportMyTickets();
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `my-tickets-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting tickets:', err);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const eventDate = new Date(ticket.eventId?.dateTime);
    const now = new Date();
    
    if (filter === 'upcoming') {
      return eventDate > now;
    } else if (filter === 'past') {
      return eventDate < now;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-white/70">
            View and manage all your event ticket requests
          </p>
        </div>
        {tickets.length > 0 && (
          <button
            onClick={handleExportTickets}
            className="glass-button flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Tickets</span>
          </button>
        )}
      </div>

      {/* Filters */}
      {tickets.length > 0 && (
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'all'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'upcoming'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg transition-all ${
              filter === 'past'
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            Past Events
          </button>
        </div>
      )}

      {/* Tickets Grid */}
      {error ? (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchTickets}
            className="glass-button mt-4"
          >
            Try Again
          </button>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-16 glass">
          <Ticket className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No tickets found</h3>
          <p className="text-white/70 mb-6">
            You haven't requested any tickets yet. Browse events to get started!
          </p>
          <a href="/" className="glass-button inline-block">
            Browse Events
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket._id}
              onClick={() => setSelectedTicket(ticket)}
              className="glass-card overflow-hidden group cursor-pointer animate-slide-up"
            >
              {ticket.eventId?.imageUrl && (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={ticket.eventId.imageUrl}
                    alt={ticket.eventId.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <StatusBadge status={ticket.eventId.status} />
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                  {ticket.eventId?.title || 'Event'}
                </h3>
                
                <div className="space-y-2 text-sm text-white/70 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>
                      {ticket.eventId?.dateTime 
                        ? format(new Date(ticket.eventId.dateTime), 'MMM dd, yyyy - hh:mm a')
                        : 'Date TBD'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="line-clamp-1">
                      {ticket.eventId?.venueName || 'Venue TBD'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="text-white/50 text-xs">{ticket.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-xs text-white/40">
                    Requested {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                  </span>
                  {ticket.eventId?.originalUrl && (
                    <a
                      href={ticket.eventId.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-white/60 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {selectedTicket.eventId && (
              <div className="space-y-6">
                {selectedTicket.eventId.imageUrl && (
                  <img
                    src={selectedTicket.eventId.imageUrl}
                    alt={selectedTicket.eventId.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {selectedTicket.eventId.title}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-white/70">
                        <span className="text-white/50">Date:</span>{' '}
                        {format(new Date(selectedTicket.eventId.dateTime), 'MMMM dd, yyyy')}
                      </p>
                      <p className="text-white/70">
                        <span className="text-white/50">Time:</span>{' '}
                        {format(new Date(selectedTicket.eventId.dateTime), 'hh:mm a')}
                      </p>
                      <p className="text-white/70">
                        <span className="text-white/50">Venue:</span>{' '}
                        {selectedTicket.eventId.venueName}
                      </p>
                      {selectedTicket.eventId.venueAddress && (
                        <p className="text-white/70">
                          <span className="text-white/50">Address:</span>{' '}
                          {selectedTicket.eventId.venueAddress}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-white/70">
                        <span className="text-white/50">Your Email:</span>{' '}
                        {selectedTicket.email}
                      </p>
                      <p className="text-white/70">
                        <span className="text-white/50">Requested on:</span>{' '}
                        {format(new Date(selectedTicket.createdAt), 'MMMM dd, yyyy')}
                      </p>
                      <p className="text-white/70">
                        <span className="text-white/50">Consent given:</span>{' '}
                        {selectedTicket.consent ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {selectedTicket.eventId.description && (
                    <div className="mt-4">
                      <h4 className="text-white/50 mb-2">Event Description</h4>
                      <p className="text-white/70">{selectedTicket.eventId.description}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-white/10">
                    {selectedTicket.eventId.originalUrl && (
                      <a
                        href={selectedTicket.eventId.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-button flex items-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>View Event Page</span>
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="glass-button"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;