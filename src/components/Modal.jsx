/* eslint-disable react/prop-types */
import React from 'react';

const Modal = (props) => {
  // Prevent click inside modal from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={props.handleCloseModal}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fadeIn overflow-hidden"
        onClick={handleContentClick}
      >
        <div className='flex justify-between items-center p-6 border-b border-gray-100'>
          <h2 className='text-xl font-bold text-gray-800'>Details</h2>
          <button
            className='text-gray-400 hover:text-red-500 transition focus:outline-none p-2 rounded-full hover:bg-gray-100'
            onClick={props.handleCloseModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-0">
          {props.children}
        </div>
      </div>
    </div>
  );
}

export default Modal;