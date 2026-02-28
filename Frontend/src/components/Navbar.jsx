import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, Layout as LayoutIcon, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-semibold text-white">
            <Calendar className="w-6 h-6" />
            <span>Sydney Events</span>
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/tickets"
                  className="flex items-center space-x-2 px-4 py-2 glass-button"
                >
                  <Ticket className="w-4 h-4" />
                  <span>My Tickets</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 glass-button"
                >
                  <LayoutIcon className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 glass-button"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
                <span className="text-white/80 hidden md:block">{user.name}</span>
              </>
            ) : (
              <Link to="/login" className="glass-button">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;