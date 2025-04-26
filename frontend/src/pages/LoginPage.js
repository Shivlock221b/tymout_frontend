import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useOAuthVerification } from '../hooks/queries/useAuthQueries';
import { toast } from 'react-toastify';

// Following Single Responsibility Principle - this component only handles login UI
const LoginPage = () => {
  const { isAuthenticated, handleOAuthVerification } = useAuthStore();
  const oauthMutation = useOAuthVerification();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for token in URL (from Google OAuth callback)
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    
    if (token) {
      // Use the mutation for OAuth verification
      oauthMutation.mutate(token, {
        onSuccess: (userData) => {
          // Update the auth store with the user data
          handleOAuthVerification(token);
          toast.success('Successfully logged in!');
          navigate('/');
        },
        onError: (error) => {
          toast.error(`Authentication failed: ${error.message}`);
          navigate('/login');
        }
      });
    }
  }, [location, oauthMutation, handleOAuthVerification, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check if there's a redirect destination in the state
      const from = location.state?.from?.pathname || '/';
      navigate(from);
    }
  }, [isAuthenticated, navigate, location]);

  // Handle Google login
  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000'}/api/users/auth/google`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            {/* Google Sign In Button */}
            <div>
              <button
                onClick={handleGoogleLogin}
                disabled={oauthMutation.isPending}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  oauthMutation.isPending
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                {oauthMutation.isPending ? 'Signing in...' : 'Sign in with Google'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Email/Password Login Form - Placeholder for future implementation */}
              <div className="mt-6">
                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
