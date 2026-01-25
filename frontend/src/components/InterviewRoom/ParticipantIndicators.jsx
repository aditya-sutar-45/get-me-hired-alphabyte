import React from 'react';

const ParticipantIndicators = ({ participants }) => {
  return (
    <div className="border-2 border-gray-700 rounded-lg bg-base-200 p-4">
      <div className="flex justify-center gap-4">
        {participants.map((participant) => (
          <div
            key={participant.id}
            className={`w-16 h-16 rounded-full transition-all ${
              participant.active 
                ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                : 'bg-cyan-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ParticipantIndicators;