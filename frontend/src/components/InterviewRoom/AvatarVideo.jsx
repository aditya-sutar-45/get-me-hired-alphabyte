import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

export default function AvatarVideo({ videoTrack }) {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (videoTrack && videoRef.current) {
      // Use LiveKit's attach method instead of creating MediaStream manually
      videoTrack.attach(videoRef.current);
      
      videoRef.current.onloadedmetadata = () => {
        setIsReady(true);
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      };
    }

    // Cleanup on unmount or track change
    return () => {
      if (videoRef.current && videoTrack) {
        videoTrack.detach(videoRef.current);
      }
    };
  }, [videoTrack]);

  return (
    <div className="w-full h-full relative">
      {!isReady && videoTrack && (
        <div className="absolute inset-0 flex justify-center items-center text-white">
          Loading avatar…
        </div>
      )}
      {!videoTrack && (
        <div className="absolute inset-0 flex justify-center items-center text-xl text-gray-500">
          Waiting for avatar...
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

AvatarVideo.propTypes = {
  videoTrack: PropTypes.object,
};
