import { useState } from 'react';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import TicketModal from './TicketModal';
import StatusBadge from './StatusBadge';

const EventCard = ({ event, showStatus = false }) => {
  const [showTicketModal, setShowTicketModal] = useState(false);

  return (
    <>
      <div className="glass-card overflow-hidden group cursor-pointer animate-slide-up">
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80'}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
          
          {showStatus && (
            <div className="absolute top-4 right-4">
              <StatusBadge status={event.status} />
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center space-x-2 text-white/80 text-sm mb-2">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(event.dateTime), 'MMM dd, yyyy')}</span>
              <Clock className="w-4 h-4 ml-2" />
              <span>{format(new Date(event.dateTime), 'hh:mm a')}</span>
            </div>
            <h3 className="text-xl font-semibold text-white line-clamp-2">
              {event.title}
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-start space-x-2 text-white/70 mb-4">
            <MapPin className="w-4 h-4 shrink-0 mt-1" />
            <div>
              <p className="font-medium text-white">{event.venueName}</p>
              {event.venueAddress && (
                <p className="text-sm text-white/60">{event.venueAddress}</p>
              )}
            </div>
          </div>
          
          {event.description && (
            <p className="text-white/70 text-sm line-clamp-2 mb-4">
              {event.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/50">
              Source: {event.sourceWebsite || 'Various'}
            </span>
            <button
              onClick={() => setShowTicketModal(true)}
              className="glass-button flex items-center space-x-2"
            >
              <span>Get Tickets</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showTicketModal && (
        <TicketModal
          event={event}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </>
  );
};

export default EventCard;