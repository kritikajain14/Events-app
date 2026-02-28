import { useState } from 'react';
import { X, Mail, CheckCircle } from 'lucide-react';
import { ticketApi } from '../api';
import LoadingSpinner from './LoadingSpinner';

const TicketModal = ({ event, onClose }) => {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await ticketApi.createTicketLead({
  email,
  consent,
  eventId: event._id
});

      setSuccess(true);
      
      // Redirect to original event URL after 2 seconds
      setTimeout(() => {
        window.open(event.originalUrl, '_blank');
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to save your information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass max-w-md w-full p-6 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold text-white mb-2">Get Tickets</h2>
        <p className="text-white/70 mb-6">{event.title}</p>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-white text-lg">Success!</p>
            <p className="text-white/70">Redirecting to ticket website...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white/80 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="glass-input w-full pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
                className="mt-1 w-4 h-4 bg-transparent border border-white/30 rounded checked:bg-white/20"
              />
              <span className="text-white/70 text-sm">
                I consent to receive updates about this event and future events. 
                Your information will only be used for ticket-related communications.
              </span>
            </label>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Continue to Tickets</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TicketModal;