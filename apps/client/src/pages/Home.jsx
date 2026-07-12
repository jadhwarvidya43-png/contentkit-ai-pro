import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0">
                <img className="h-8 w-8" src="https://via.placeholder.com/40" alt="Logo" />
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-indigo-300">
                    Dashboard
                  </a>
                  <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-indigo-300">
                    Templates
                  </a>
                  <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 hover:border-indigo-300">
                    Analytics
                  </a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/40" alt="User" />
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-900">{user?.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-md"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to ContentKit AI Pro
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Transform your content into multi-platform marketing assets with AI.
          </p>

          {/* Placeholder for the main functionality */}
          <div className="mt-10 p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
            <p className="text-gray-600">
              The main content repurposing interface will be here. This is where you'll
              upload your content and generate platform-specific outputs.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;