"use client";
import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="min-h-flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Page not found</h1>
        <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
          We couldn’t find the page you were looking for.
        </p>
        <div className="mt-6 flex justify-center space-x-3">
          <Link href="/" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;


