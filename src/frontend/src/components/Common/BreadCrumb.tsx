import React from 'react';
import { Link } from 'react-router-dom';

export const Breadcrumbs = () => {
  return (
    <nav className="bg-gray-100 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              <svg className="flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 4.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="ml-4">Home</span>
            </Link>
            <span className="mx-2 font-medium text-gray-500">/</span>
            <p className="text-sm font-medium text-gray-700">Breadcrumbs</p>
          </div>
          <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
            <button type="button" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
