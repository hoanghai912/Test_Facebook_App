/* eslint-disable react/prop-types */
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl flex flex-col items-center shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
        <p className="text-gray-700 font-semibold animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingScreen;