// ControlButtons.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, ChevronDown } from 'lucide-react';

const ControlButtons = ({
  isMuted,
  isVideoOn,
  onMuteToggle,
  onVideoToggle,
  disabled,
  onMicChange,
  currentMicId,
  room,
  isAgentSpeaking,
}) => {
  const [mics, setMics] = useState([]);
  const [showMicDropdown, setShowMicDropdown] = useState(false);
  const [userAudioLevel, setUserAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Get available microphones
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        setMics(audioInputs);
      })
      .catch(console.error);
  }, []);

  // Monitor user's audio level
  useEffect(() => {
    let mounted = true;

    const setupAudioAnalyser = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: currentMicId || undefined },
          video: false
        });
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256;
        microphone.connect(analyser);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateAudioLevel = () => {
          if (!mounted || !analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);
          
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1);
          
          setUserAudioLevel(isMuted ? 0 : normalizedLevel);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        
        updateAudioLevel();
      } catch (error) {
        console.error('Error setting up audio analyser:', error);
      }
    };

    setupAudioAnalyser();

    return () => {
      mounted = false;
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentMicId, isMuted]);

  const handleMicChange = async (deviceId) => {
    try {
      await room.switchActiveDevice('audioinput', deviceId);
      onMicChange?.(deviceId);
      setShowMicDropdown(false);
    } catch (error) {
      console.error('Error switching microphone:', error);
    }
  };

  // Generate bar heights based on audio level - responsive bar count
  const generateBars = () => {
    const bars = [];
    // Responsive bar count: more bars on larger screens
    const numBars = typeof window !== 'undefined' && window.innerWidth >= 1536 ? 20 : 
                    typeof window !== 'undefined' && window.innerWidth >= 1280 ? 18 : 
                    typeof window !== 'undefined' && window.innerWidth >= 1024 ? 15 : 
                    typeof window !== 'undefined' && window.innerWidth >= 768 ? 12 : 10;
    
    const activeBars = Math.floor(userAudioLevel * numBars);

    for (let i = 0; i < numBars; i++) {
      const isActive = i < activeBars && !isMuted;
      const baseHeight = 8;
      const maxHeight = 24;
      const height = isActive 
        ? baseHeight + Math.random() * (maxHeight - baseHeight)
        : baseHeight;

      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-100 ${
            isActive ? 'bg-green-500' : 'bg-gray-600'
          }`}
          style={{
            height: `${height}px`,
            animationDelay: isActive ? `${i * 0.05}s` : '0s',
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="rounded-lg bg-base-300 p-2 sm:p-3 w-full">
      <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {/* Left: User Voice Audio Indicator - Responsive width */}
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-[100px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px] xl:min-w-[180px] 2xl:min-w-[200px] h-8">
          {generateBars()}
        </div>

        {/* Center: Microphone Controls - Responsive sizing */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative">
            <button
              onClick={onMuteToggle}
              disabled={disabled}
              className={`btn btn-sm h-10 sm:h-11 md:h-12 px-3 sm:px-3.5 md:px-4 rounded-lg transition-all ${
                isMuted
                  ? 'bg-base-100 hover:bg-base-100 text-white'
                  : 'bg-base-100 hover:bg-base-100 text-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? (
                <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMicDropdown(!showMicDropdown)}
              disabled={disabled || isAgentSpeaking}
              className={`btn btn-sm h-10 sm:h-11 md:h-12 px-2 sm:px-2.5 md:px-3 rounded-lg  bg-base-100 hover:bg-base-200  text-white transition-all ${
                (disabled || isAgentSpeaking) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={isAgentSpeaking ? "Cannot change mic while agent is speaking" : "Select microphone"}
            >
              <ChevronDown 
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform ${showMicDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Microphone Dropdown - Responsive positioning */}
            {showMicDropdown && !disabled && !isAgentSpeaking && (
              <div className="absolute bottom-full mb-2 right-0 w-56 sm:w-60 md:w-64 lg:w-72 bg-base-300 rounded-lg shadow-xl z-50 max-h-52 sm:max-h-60 md:max-h-64 overflow-y-auto">
                <div className="py-2">
                  <div className="px-3 sm:px-4 py-2 text-xs text-gray-400 font-semibold uppercase">
                    Select Microphone
                  </div>
                  <div
                    onClick={() => handleMicChange('')}
                    className={`px-3 sm:px-4 py-2 hover:bg-base-100 cursor-pointer transition-colors ${
                      !currentMicId ? 'bg-base-100 text-white' : 'text-gray-300'
                    }`}
                  >
                    <div className="text-xs sm:text-sm">Default Microphone</div>
                  </div>
                  {mics.map((mic) => (
                    <div
                      key={mic.deviceId}
                      onClick={() => handleMicChange(mic.deviceId)}
                      className={`px-3 sm:px-4 py-2 hover:bg-base-100 cursor-pointer transition-colors ${
                        currentMicId === mic.deviceId ? 'bg-base-100 text-white' : 'text-gray-300'
                      }`}
                    >
                      <div className="text-xs sm:text-sm truncate">
                        {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider - Responsive visibility */}
        <div className="h-6 sm:h-7 md:h-8 w-px bg-gray-700" />

        {/* Right: Video Button - Responsive sizing */}
        <button
          onClick={onVideoToggle}
          disabled={disabled}
          className={`btn btn-sm h-10 sm:h-11 md:h-12 px-3 sm:px-3.5 md:px-4 rounded-lg  transition-all ${
            isVideoOn
              ? 'bg-base-100 hover:bg-base-200 text-white'
              : 'bg-red-500 hover:bg-base-200 text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? (
            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {showMicDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMicDropdown(false)}
        />
      )}
    </div>
  );
};

export default ControlButtons;
