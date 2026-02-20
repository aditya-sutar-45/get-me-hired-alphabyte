import React, { useEffect, useState, useRef } from "react";

const VideoPanel = ({
  videoRef,
  onParticipantCountChange,
  onEyeViolationCountChange,
}) => {
  const [isFocused, setIsFocused] = useState(true);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [peopleCount, setPeopleCount] = useState(1);
  const [analysis, setAnalysis] = useState(null);
  const [warningCount, setWarningCount] = useState(0);
  const [hasStream, setHasStream] = useState(false);

  const canvasRef = useRef(null);
  const analysisTimeoutRef = useRef(null);

  //  stable timers
  const unfocusedStartRef = useRef(null);
  const phoneStartRef = useRef(null);

  const VIOLATION_TIME = 1500;
  const PHONE_TIME = 1200;

  // ───────── detect camera stream ─────────
  useEffect(() => {
    const checkStream = () => {
      const video = videoRef?.current;
      const active =
        video &&
        video.srcObject instanceof MediaStream &&
        video.srcObject.active &&
        video.srcObject.getVideoTracks().length > 0;

      setHasStream(!!active);
    };

    const interval = setInterval(checkStream, 500);
    checkStream();
    return () => clearInterval(interval);
  }, [videoRef]);

  // ───────── send participant count ─────────
  useEffect(() => {
    if (onParticipantCountChange) {
      onParticipantCountChange(peopleCount);
    }
  }, [peopleCount, onParticipantCountChange]);

  // ───────── stable eye violation logic ─────────
  useEffect(() => {
    if (!hasStream) return;

    const interval = setInterval(() => {
      if (!isFocused) {
        if (!unfocusedStartRef.current) {
          unfocusedStartRef.current = Date.now();
        }

        const duration = Date.now() - unfocusedStartRef.current;

        if (duration > VIOLATION_TIME) {
          setWarningCount((prev) => prev + 1);

          if (onEyeViolationCountChange) {
            onEyeViolationCountChange((prev) => prev + 1);
          }

          unfocusedStartRef.current = Date.now();
        }
      } else {
        unfocusedStartRef.current = null;
      }
    }, 300); // check every 300ms

    return () => clearInterval(interval);
  }, [isFocused, hasStream]);

  // ───────── phone warning logic ─────────
  useEffect(() => {
    if (!hasStream) return;

    const interval = setInterval(() => {
      if (phoneDetected) {
        if (!phoneStartRef.current) {
          phoneStartRef.current = Date.now();
        }

        const duration = Date.now() - phoneStartRef.current;

        if (duration > PHONE_TIME) {
          setWarningCount((prev) => prev + 1);
          phoneStartRef.current = Date.now();
        }
      } else {
        phoneStartRef.current = null;
      }
    }, 300);

    return () => clearInterval(interval);
  }, [phoneDetected, hasStream]);

  // ───────── draw triangle ─────────
  useEffect(() => {
    if (!canvasRef.current || !videoRef?.current || !analysis?.nose_pos) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const mirrorX = (x) => canvas.width - x;
    const { nose_pos, left_eye, right_eye } = analysis;

    ctx.beginPath();
    ctx.moveTo(mirrorX(left_eye[0]), left_eye[1]);
    ctx.lineTo(mirrorX(right_eye[0]), right_eye[1]);
    ctx.lineTo(mirrorX(nose_pos[0]), nose_pos[1]);
    ctx.closePath();

    ctx.strokeStyle = isFocused ? "lime" : "red";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [analysis, isFocused, videoRef]);

  // ───────── backend analyze loop ─────────
  useEffect(() => {
    if (!hasStream || !videoRef?.current) {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = null;
      }
      return;
    }

    let cancelled = false;

    const analyzeFrame = async () => {
      if (cancelled) return;

      const video = videoRef.current;
      if (!video || !video.videoWidth) {
        if (!cancelled) {
          analysisTimeoutRef.current = setTimeout(analyzeFrame, 300);
        }
        return;
      }

      const offscreen = document.createElement("canvas");
      offscreen.width = 640;
      offscreen.height = Math.round(
        (video.videoHeight / video.videoWidth) * 640,
      );

      const ctx = offscreen.getContext("2d");
      ctx.drawImage(video, 0, 0, offscreen.width, offscreen.height);

      const base64Frame = offscreen.toDataURL("image/jpeg", 0.5).split(",")[1];

      try {
        const res = await fetch("http://127.0.0.1:5001/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frame: base64Frame }),
        });

        if (res.ok) {
          const data = await res.json();
          setIsFocused(data.is_focused);
          setPhoneDetected(data.phone_detected);
          setPeopleCount(data.people_count ?? 1);
          setAnalysis(data.analysis);
        }
      } catch (err) {}

      if (!cancelled) {
        analysisTimeoutRef.current = setTimeout(analyzeFrame, 200);
      }
    };

    analyzeFrame();

    return () => {
      cancelled = true;
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
        analysisTimeoutRef.current = null;
      }
    };
  }, [hasStream, videoRef]);

  const statusColor =
    !isFocused || phoneDetected ? "bg-red-600" : "bg-green-600";

  return (
    <div className="relative w-full h-[320px] bg-base-300 rounded-xl overflow-hidden shadow-lg">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
      />

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ transform: "scaleX(-1)" }}
      />

      {!hasStream && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
           Camera off
        </div>
      )}

      {hasStream && (
        <>
          <div
            className={`absolute top-3 left-3 ${statusColor} text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md`}
          >
            {isFocused && !phoneDetected ? " Focused" : " Warning"}
            {phoneDetected && " |  Phone"}
          </div>

          <div
            className={`absolute top-3 right-3 ${
              peopleCount > 1 ? "bg-red-600" : "bg-blue-600"
            } text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md`}
          >
             {peopleCount} Person{peopleCount !== 1 ? "s" : ""}
          </div>

          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md">
             Warnings: {warningCount}
          </div>
        </>
      )}
    </div>
  );
};

export default VideoPanel;
