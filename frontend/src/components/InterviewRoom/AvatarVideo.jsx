import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from "framer-motion";

export default function AvatarVideo({ 
  videoTrack, 
  onVideoReady, 
  isAvatarEnabled,
}) {
  const videoRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const onVideoReadyRef = useRef(onVideoReady);

  // Keep the callback ref updated
  useEffect(() => {
    onVideoReadyRef.current = onVideoReady;
  }, [onVideoReady]);

  useEffect(() => {
    if (videoTrack && videoRef.current && isAvatarEnabled) {
      // Use LiveKit's attach method
      videoTrack.attach(videoRef.current);
      
      videoRef.current.onloadedmetadata = () => {
        setIsReady(true);
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      };

      // Notify parent when video is actually playing and visible
      videoRef.current.onplaying = () => {
        console.log("Avatar video is now playing on screen");
        if (onVideoReadyRef.current) {
          onVideoReadyRef.current();
        }
      };
    }

    // Cleanup on unmount or track change
    return () => {
      if (videoRef.current && videoTrack) {
        videoTrack.detach(videoRef.current);
      }
    };
  }, [videoTrack, isAvatarEnabled]);

  // If avatar is disabled, show Spline animation
  if (!isAvatarEnabled) {
    return <SplineAnimation />;
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading State (when avatar is enabled but not ready) */}
      {!isReady && videoTrack && isAvatarEnabled && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-base-300 rounded-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-white font-medium">Loading avatar...</p>
        </div>
      )}

      {/* Waiting State (when no track yet) */}
      {!videoTrack && isAvatarEnabled && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-base-300 rounded-lg">
          <div className="animate-pulse">
            <svg 
              className="w-16 h-16 text-gray-600 mb-4" 
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
          <p className="text-gray-400 text-lg">Waiting for avatar...</p>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
          isAvatarEnabled && isReady ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Status indicator when enabled and ready
      {isAvatarEnabled && isReady && (
        <div className="absolute bottom-3 left-3">
          <div className="px-3 py-1.5 rounded-full bg-green-600/90 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
            <span>Avatar Active</span>
          </div>
        </div>
      )} */}
    </div>
  );
}

// Spline Animation Component (embedded)
// function SplineAnimation() {
//   const [loaded, setLoaded] = useState(false);

//   useEffect(() => {
//     const existing = document.querySelector(
//       'script[src="https://unpkg.com/@splinetool/viewer@1.10.77/build/spline-viewer.js"]'
//     );

//     if (existing) {
//       setLoaded(true);
//       return;
//     }

//     const script = document.createElement("script");
//     script.src =
//       "https://unpkg.com/@splinetool/viewer@1.10.77/build/spline-viewer.js";
//     script.type = "module";
//     script.onload = () => setLoaded(true);
//     document.body.appendChild(script);
//   }, []);

//   return (
//     <div className="relative w-[170%] h-full flex items-center justify-center overflow-hidden bg-black rounded-lg">
//       {loaded ? (
//         <div
//           className="flex items-center justify-center"
//           style={{ 
//             width: '100%',
//             height: '100%',
//           }}
//         >
//           <spline-viewer
//             url="https://prod.spline.design/tXemuG89kH1tVmDm/scene.splinecode"
//             time-scale={0.3}
//             events-target="global"
//             camera-controls="false"
//             style={{ 
//               width: "100%", 
//               height: "100%", 
//               display: "block"
//             }}
//           ></spline-viewer>
//         </div>
//       ) : (
//         <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
//           <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mb-4"></div>
//           <p className="text-sm">Loading 3D Animation...</p>
//         </div>
//       )}
//     </div>
//   );
//}



const SplineAnimation = ({
  // url = "https://prod.spline.design/m6ct2Cnh5SFGzyz8/scene.splinecode",// robot 
  // url = "https://prod.spline.design/m6ct2Cnh5SFGzyz8/scene.splinecode",
  // url = "https://prod.spline.design/9vVkXuI7IUC3hRHa/scene.splinecode",
  // url ="https://prod.spline.design/9vVkXuI7IUC3hRHa/scene.splinecode",
  // url ="https://prod.spline.design/jJ5FkxfHPNUuKc-V/scene.splinecode",// partially final robo
  url ="https://prod.spline.design/tXemuG89kH1tVmDm/scene.splinecode", // aditya la aavdlela robo ( L in my opinion)
  // url ="https://prod.spline.design/tXemuG89kH1tVmDm/scene.splinecode",
  // url ="https://prod.spline.design/GZq2EtvWm27xuUjH/scene.splinecode", //bolb
  className = "",
  timeScale = 0.3, // Slowed down from 0.5 to 0.3
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const existing = document.querySelector(
      'script[src="https://unpkg.com/@splinetool/viewer@1.10.77/build/spline-viewer.js"]'
    );

    if (existing) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.10.77/build/spline-viewer.js";
    script.type = "module";
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-black overflow-hidden ${className}`}>
      {loaded ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-center"
          style={{ 
            width: '400px',
            height: '400px',
            margin: '0 auto'
          }}
        >
          <spline-viewer
            url={url}
            time-scale={timeScale}
            events-target="global"
            camera-controls="false"
            style={{ 
              width: "440px", 
              height: "460px", 
              display: "block"
            }}
          ></spline-viewer>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
          <div className="w-10 h-10 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm">Loading 3D Animation...</p>
        </div>
      )}
    </div>
  );
};

AvatarVideo.propTypes = {
  videoTrack: PropTypes.object,
  onVideoReady: PropTypes.func,
  isAvatarEnabled: PropTypes.bool.isRequired,
};