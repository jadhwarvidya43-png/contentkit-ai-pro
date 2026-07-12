import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    // In a real app, you might call an API to invalidate the token
    logout();
  };

  return (
    <nav className="bg-white border-gray-200 px-2 sm:px-4 py-2.5 dark:bg-gray-800">
      <div className="container flex flex-wrap items-center justify-between mx-auto">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            ContentKit AI Pro
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link
                to="/profile"
                className="text-sm font-medium text-gray-900 dark:text-white hover:underline"
              >
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="ml-2 text-sm bg-gray-800 hover:bg-gray-900 text-white font-medium py-1 px-3 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium py-1 px-3 rounded">
                Login
              </Link>
              <Link
                to="/register"
                className="ms-3 text-sm bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;