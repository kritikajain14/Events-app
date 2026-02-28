import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chrome } from 'lucide-react';
import { authApi } from '../api';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: you could check authApi.checkAuth() here if needed
  }, []);

  const handleLogin = () => {
    authApi.login();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="glass max-w-md w-full p-8 text-center animate-slide-up">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-white/70 mb-8">
          Sign in to access your dashboard and manage events
        </p>

        <button
          onClick={handleLogin}
          className="glass-button flex items-center justify-center space-x-3 w-full py-4 text-lg"
        >
          <Chrome className="w-6 h-6" />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Login;