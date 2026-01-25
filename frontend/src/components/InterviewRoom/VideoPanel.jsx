const VideoPanel = ({
  videoRef,
}) => {
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
    </div>
  );
};

export default VideoPanel;
