import React, { useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, useAuthActions } from '../hooks/stores/useAuthStoreHooks';

/**
 * SignupPage Component
 * 
 * Following Single Responsibility Principle - this component only handles signup UI
 * and user registration flows
 */
const SignupPage = () => {
  // Use optimized hooks with memoization instead of direct store access
  const { isAuthenticated } = useAuth();
  const { handleOAuthVerification } = useAuthActions();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL (if present)
  const token = useMemo(() => {
    const query = new URLSearchParams(location.search);
    return query.get('token');
  }, [location.search]);

  // Handle OAuth token - only runs when token changes
  useEffect(() => {
    if (token) {
      handleOAuthVerification(token);
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Redirect if already authenticated - using stable dependency
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle Google signup - memoized to prevent recreation on every render
  const handleGoogleSignup = useCallback(() => {
    window.location.href = `${process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000'}/api/users/auth/google`;
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">  
        {/* Content container */}
        <div className="pt-6">  
          {/* Vibrant heading with Tymout in purple */}
          <h2 className="text-center text-3xl font-black tracking-tight leading-tight mb-5">
            Welcome to the <br/><span className="text-indigo-600" style={{fontSize: '110%', color: '#4f46e5'}}>Tymout</span> Community!
          </h2>
          
          {/* Single feature bubble */}
          <div className="mt-6">
            <div className="p-4 bg-white rounded-2xl shadow-sm border border-indigo-100">
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-xl mr-3">🌟</span>
                  <p className="font-medium text-gray-800 text-sm">Connect with like‑minded people</p>
                </div>
                
                <div className="flex items-center">
                  <span className="text-xl mr-3">🗺️</span>
                  <p className="font-medium text-gray-800 text-sm">Explore experiences crafted by locals</p>
                </div>
                
                <div className="flex items-center">
                  <span className="text-xl mr-3">❤️</span>
                  <p className="font-medium text-gray-800 text-sm">Discover your city like never before—your city has come to life!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            {/* Call to action message */}
            <div className="text-center mb-1">
              <p className="text-lg font-bold" style={{color: '#4f46e5'}}>Join Your First Table!</p>
            </div>
            
            {/* Google Sign Up Button */}
            <div>
              <button
                onClick={handleGoogleSignup}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-base font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                  </g>
                </svg>
                Sign up with Google
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>
            </div>

            {/* Regular Sign Up Form */}
            <p className="text-center text-sm text-gray-600">
              Email signup is coming soon. For now, you can use Google to sign up.
            </p>

            {/* Link to login */}
            <div className="mt-6">
              <div className="relative">
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Sign in
                    </Link>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
