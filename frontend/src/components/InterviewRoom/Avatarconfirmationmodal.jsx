import React from 'react';
import PropTypes from 'prop-types';

export default function AvatarConfirmationModal({ isVisible, onConfirm, onDecline }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-base-200 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-base-300">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">
            Load Avatar Interviewer?
          </h2>

          {/* Description */}
          <p className="text-gray-400 mb-8 leading-relaxed">
            The avatar provides a visual interviewer experience with synchronized video and audio. 
            You can proceed without it.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onDecline}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200
                bg-base-300 hover:bg-base-100 text-white border border-base-100
                hover:border-gray-600"
            >
              No, Skip Avatar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200
                bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30
                hover:shadow-primary/50"
            >
              Yes, Load Avatar
            </button>
          </div>

          {/* Info note */}
          <p className="text-xs text-gray-500 mt-4">
            You can toggle the avatar on/off during the interview
          </p>
        </div>
      </div>
    </div>
  );
}

AvatarConfirmationModal.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
};