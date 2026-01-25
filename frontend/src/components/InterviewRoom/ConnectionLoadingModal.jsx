import React from 'react';
import { Loader2 } from 'lucide-react';

const ConnectionLoadingModal = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-base-300/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-base-300 rounded-2xl shadow-2xl border border-gray-700 p-8 max-w-md w-full mx-4 animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            Starting Your Interview
          </h2>
          <p className="text-gray-400 text-sm">
            Please wait while we set everything up
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex flex-col items-center space-y-6">
          {/* Spinner */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-gray-700 border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          {/* Loading Steps */}
          <div className="w-full space-y-3">
            <LoadingStep 
              text="Connecting to interview room" 
              delay="0s"
            />
            <LoadingStep 
              text="Initializing AI interviewer" 
              delay="0.3s"
            />
            <LoadingStep 
              text="Setting up avatar" 
              delay="0.6s"
            />
            <LoadingStep 
              text="Preparing audio/video" 
              delay="0.9s"
            />
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-white animate-progressBar"></div>
          </div>

          
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes progressBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-progressBar {
          animation: progressBar 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const LoadingStep = ({ text, delay }) => {
  return (
    <div 
      className="flex items-center space-x-3 animate-pulse-slow"
      style={{ animationDelay: delay }}
    >
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      <span className="text-gray-300 text-sm">{text}</span>
    </div>
  );
};

export default ConnectionLoadingModal;