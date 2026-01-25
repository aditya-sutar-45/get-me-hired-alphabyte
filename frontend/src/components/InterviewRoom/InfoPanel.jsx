import React from 'react';

const InfoPanel = ({ roomId, status }) => {
  return (
    <div className="border-2 border-gray-700 rounded-lg bg-base-200 p-4 space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Room ID :</span>
        <span className="text-white">{roomId || '0000000000000'}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Status :</span>
        <span className={`${
          status === 'Connected' ? 'text-green-400' : 
          status === 'Connecting...' ? 'text-yellow-400' : 
          status.startsWith('Error') ? 'text-red-400' :
          'text-gray-400'
        }`}>
          {status || 'connected /disconnected'}
        </span>
      </div>
    </div>
  );
};

export default InfoPanel;