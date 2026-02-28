import { useState, useEffect } from 'react';
import { dashboardApi } from '../api';
import { format } from 'date-fns';
import { Search, Calendar, MapPin, Filter, Download } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    city: 'Sydney',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [page, filters]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await dashboardApi.getDashboardEvents({
        params: { ...filters, page, limit: 20 },
        withCredentials: true
      });
      // setEvents(response.data.events);
      setEvents(Array.isArray(response.data.events) ? response.data.events : []);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (eventId) => {
    setImporting(true);
    try {
      await dashboardApi.importEvent(eventId, 'Imported from dashboard');
      
      // Refresh events
      fetchEvents();
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to import event:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Events Dashboard</h1>
        <button className="glass-button flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="glass p-6 space-y-4">
        <div className="flex items-center space-x-2 text-white/80">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="glass-input w-full pl-10"
            />
          </div>
          
          <select
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            className="glass-input"
          >
            <option value="Sydney">Sydney</option>
            <option value="Melbourne">Melbourne</option>
            <option value="Brisbane">Brisbane</option>
          </select>
          
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="glass-input"
            placeholder="Start Date"
          />
          
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="glass-input"
            placeholder="End Date"
          />
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="glass-input"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="updated">Updated</option>
            <option value="inactive">Inactive</option>
            <option value="imported">Imported</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="glass overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Status</th>
                    <th className="text-left p-4 text-white/60 font-medium">Title</th>
                    <th className="text-left p-4 text-white/60 font-medium">Date & Time</th>
                    <th className="text-left p-4 text-white/60 font-medium">Venue</th>
                    <th className="text-left p-4 text-white/60 font-medium">City</th>
                    <th className="text-left p-4 text-white/60 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event._id}
                      onClick={() => setSelectedEvent(event)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="p-4 text-white font-medium">{event.title}</td>
                      <td className="p-4 text-white/70">
                        {format(new Date(event.dateTime), 'MMM dd, yyyy hh:mm a')}
                      </td>
                      <td className="p-4 text-white/70">{event.venueName}</td>
                      <td className="p-4 text-white/70">{event.city}</td>
                      <td className="p-4">
                        {event.status !== 'imported' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImport(event._id);
                            }}
                            disabled={importing}
                            className="glass-button px-3 py-1 text-sm"
                          >
                            Import
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 p-4 border-t border-white/10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="glass-button px-4 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="glass-button px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="glass-button px-4 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {selectedEvent.imageUrl && (
              <img
                src={selectedEvent.imageUrl}
                alt={selectedEvent.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}

            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-white/80">
                <Calendar className="w-5 h-5" />
                <span>{format(new Date(selectedEvent.dateTime), 'MMMM dd, yyyy - hh:mm a')}</span>
              </div>

              <div className="flex items-start space-x-2 text-white/80">
                <MapPin className="w-5 h-5 shrink-0 mt-1" />
                <div>
                  <p className="font-medium">{selectedEvent.venueName}</p>
                  {selectedEvent.venueAddress && (
                    <p className="text-sm text-white/60">{selectedEvent.venueAddress}</p>
                  )}
                </div>
              </div>

              {selectedEvent.description && (
                <div className="text-white/70">
                  <h3 className="font-medium text-white mb-2">Description</h3>
                  <p>{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <StatusBadge status={selectedEvent.status} />
                
                {selectedEvent.status !== 'imported' && (
                  <button
                    onClick={() => handleImport(selectedEvent._id)}
                    disabled={importing}
                    className="glass-button"
                  >
                    {importing ? 'Importing...' : 'Import to Platform'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;