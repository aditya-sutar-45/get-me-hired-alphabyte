import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

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
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
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
              width: "400px", 
              height: "400px", 
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

export default SplineAnimation;
