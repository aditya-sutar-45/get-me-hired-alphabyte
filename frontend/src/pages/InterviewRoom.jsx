import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/InterviewRoom/Header";
import TranscriptPanel from "../components/InterviewRoom/TranscriptPanel";
import VideoPanel from "../components/InterviewRoom/VideoPanel";
import ControlButtons from "../components/InterviewRoom/ControlButtons";
import AvatarVideo from "../components/InterviewRoom/AvatarVideo";
import AvatarConfirmationModal from "../components/InterviewRoom/Avatarconfirmationmodal";
import ConnectionLoadingModal from "../components/InterviewRoom/ConnectionLoadingModal";
import toast, { Toaster } from "react-hot-toast";
import { io } from "socket.io-client";
import { useAuth } from "../contexts/AuthContext";

const InterviewRoom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.jobData;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [interviewName, setInterviewName] = useState("AI Interview Session");
  const [hasVideo, setHasVideo] = useState(false);
  const [currentMicId, setCurrentMicId] = useState("");
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [videoTrack, setVideoTrack] = useState(null);

  const [codeValue, setCodeValue] = useState("");
  const [output, setOutput] = useState("");

  // Avatar control states - SIMPLIFIED (no toggle button)
  const [showAvatarConfirmation, setShowAvatarConfirmation] = useState(false);
  const [isAvatarEnabled, setIsAvatarEnabled] = useState(false);

  // Violation tracking states
  const [participantViolationCount, setParticipantViolationCount] = useState(0);
  const [eyeMovementViolations, setEyeMovementViolations] = useState(0);
  const [language, setLanguage] = useState(
    location.state?.jobData.languages[0] || "javascript",
  );
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState("");

  const [hints, setHints] = useState([]);
  const [hintTopic, setHintTopic] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    if (job?.title) {
      setInterviewName(job.title);
    }
  }, [job]);

  // const roomID = "room-001";
  // useEffect(() => {
  //   const socket = io("http://127.0.0.1:6969");

  //   socket.on("connect", () => {
  //     console.log("Connected to server:", socket.id);
  //     socket.emit("join_room", { roomId: roomID });
  //     console.log(`[+] Joined room: ${roomID}`);
  //   });

  //   socket.on("violation_detected", (data) => {
  //     console.log("Violation detected:", data);
  //     alert("violation detected please close any restricted software");
  //   });

  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("User switched to different browser tab");
        toast.error("do not switch tabs during interview");
      }
    };

    const handleBlur = () => {
      toast.error("do not switch tabs during interview");
      console.log("User switched to different window/application (Alt+Tab)");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  const handleCodeSubmit = async () => {
    setLoadingAnalysis(true);
    if (!codeValue.trim()) {
      console.warn("Code value is empty");
      return;
    }

    const formattedMessage = `Here is my code solution:\n\`\`\`\n${codeValue}\n\`\`\``;
    handleSendMessage(formattedMessage);
    console.log("Code sent to agent:", codeValue);
    setAnalysis("");

    const res = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: codeValue,
        language: language,
      }),
    });

    if (!res.ok) {
      console.error("Analysis request failed");
    }

    const result = await res.json();
    console.log(result);
    setAnalysis(result.ai_analysis);
    setLoadingAnalysis(false);
  };

  const roomRef = useRef(null);
  const videoRef = useRef(null);
  const agentSpeakingTimeoutRef = useRef(null);
  const audioContextsRef = useRef([]);
  const audioElementsRef = useRef([]);
  const animationFrameIdsRef = useRef([]);
  const isConnectingRef = useRef(false);

  const currentAgentSegmentRef = useRef(null);
  const agentSpeechDetectionTimeoutRef = useRef(null);

  const violationTimeoutRef = useRef(null);
  const eyeViolationTimeoutRef = useRef(null);
  const isDisconnectingRef = useRef(false);

  const cleanupResources = () => {
    if (agentSpeakingTimeoutRef.current) {
      clearTimeout(agentSpeakingTimeoutRef.current);
      agentSpeakingTimeoutRef.current = null;
    }

    if (agentSpeechDetectionTimeoutRef.current) {
      clearTimeout(agentSpeechDetectionTimeoutRef.current);
      agentSpeechDetectionTimeoutRef.current = null;
    }

    animationFrameIdsRef.current.forEach((id) => {
      try {
        cancelAnimationFrame(id);
      } catch (e) {
        console.error("Error canceling animation frame:", e);
      }
    });
    animationFrameIdsRef.current = [];

    audioContextsRef.current.forEach((context) => {
      try {
        if (context.state !== "closed") {
          context.close();
        }
      } catch (e) {
        console.error("Error closing audio context:", e);
      }
    });
    audioContextsRef.current = [];

    audioElementsRef.current.forEach((element) => {
      try {
        element.pause();
        element.srcObject = null;
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (e) {
        console.error("Error removing audio element:", e);
      }
    });
    audioElementsRef.current = [];

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const addFinalTranscript = (speaker, text, segmentId) => {
    if (!text || !text.trim()) return;

    setTranscript((prev) => {
      const filtered = prev.filter((msg) => msg.segmentId !== segmentId);
      return [
        ...filtered,
        {
          speaker,
          text: text.trim(),
          timestamp: new Date().toLocaleTimeString(),
          isFinal: true,
          segmentId,
        },
      ];
    });

    if (speaker === "Agent" && currentAgentSegmentRef.current === segmentId) {
      currentAgentSegmentRef.current = null;
    }
  };

  const addInterimTranscript = (speaker, text, segmentId) => {
    if (!text || !text.trim()) return;

    if (speaker === "Agent") {
      currentAgentSegmentRef.current = segmentId;
    }

    setTranscript((prev) => {
      const filtered = prev.filter((msg) => msg.segmentId !== segmentId);
      return [
        ...filtered,
        {
          speaker,
          text: text.trim(),
          timestamp: new Date().toLocaleTimeString(),
          isFinal: false,
          segmentId,
          isStreaming: speaker === "Agent",
        },
      ];
    });
  };

  const handleAvatarVideoReady = () => {
    console.log("✅ Avatar video is now visible - closing loading modal");
    setIsConnecting(false);
  };

  // Handle initial avatar confirmation
  const handleAvatarConfirm = () => {
    console.log("✅ User confirmed: Load avatar");
    setShowAvatarConfirmation(false);
    setIsAvatarEnabled(true);
    // Now connect to room
    connectToRoomWithAvatar(true);
  };

  const handleAvatarDecline = () => {
    console.log("⏭️  User declined: Skip avatar, show Spline animation");
    setShowAvatarConfirmation(false);
    setIsAvatarEnabled(false);
    toast.success("Starting interview with 3D animation");
    // Connect without avatar
    connectToRoomWithAvatar(false);
  };

  const connectToRoomWithAvatar = async (enableAvatar) => {
    if (isConnectingRef.current || roomRef.current) {
      return;
    }

    try {
      isConnectingRef.current = true;
      setIsConnecting(enableAvatar); // Only show loading if avatar enabled
      setStatus("Connecting...");

      const jobData = location.state?.jobData || {
        companyName: "Default Company",
        title: "Default Position",
        description: "General technical interview",
        languages: ["JavaScript"],
      };

      const participantName =
        user?.username || "User-" + Math.random().toString(36).substr(2, 9);

      console.log("📡 Creating room with avatar:", enableAvatar);

      const response = await fetch("http://localhost:5000/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant: participantName,
          jobData: jobData,
          resumeData: user?.parsed_resume || "",
          enableAvatar: enableAvatar, // Send avatar preference
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create room: ${errorText}`);
      }

      const { token, url, room_name } = await response.json();
      console.log("✅ Room created:", room_name);

      const LiveKit = await import("livekit-client");

      const room = new LiveKit.Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      roomRef.current = room;

      room.on(LiveKit.RoomEvent.Connected, () => {
        setIsConnected(true);
        setStatus("Connected");
        setRoomId(room.name);
        isConnectingRef.current = false;

        console.log("=== Room Connected ===");

        // =============================================
        // 🧠 LISTEN FOR HINTS FROM LIVEKIT AGENT
        // =============================================
        room.on("dataReceived", (payload, participant) => {
          try {
            const decoded = new TextDecoder().decode(payload);
            const msg = JSON.parse(decoded);

            console.log("📩 Data received from agent:", msg);

            if (msg.type === "hint_response") {
              console.log("💡 HINT RECEIVED:", msg.data);

              setHints(msg.data.hints || []);
              setHintTopic(msg.data.topic || "");
              
              // Show toast notification that hints are available
              toast.success("New hints available! Check the Hints button in the header.");
            }
          } catch (err) {
            console.error("Error parsing data channel message:", err);
          }
        });

        // ✅ FIXED: Check if remoteParticipants exists and is iterable
        if (
          room.remoteParticipants &&
          typeof room.remoteParticipants.forEach === "function"
        ) {
          console.log("All participants in room:");
          room.remoteParticipants.forEach((participant) => {
            console.log(
              `- Identity: "${participant.identity}", Name: "${participant.name}"`,
            );
          });
        } else {
          console.log("Room connected, waiting for remote participants...");
        }

        // If not using avatar, close loading immediately
        if (!enableAvatar) {
          setIsConnecting(false);
        }

        // ✅ FIXED: Check for existing avatar video tracks with null checks
        if (
          room.remoteParticipants &&
          typeof room.remoteParticipants.forEach === "function"
        ) {
          room.remoteParticipants.forEach((participant) => {
            if (
              participant.videoTracks &&
              typeof participant.videoTracks.forEach === "function"
            ) {
              participant.videoTracks.forEach((publication) => {
                if (publication.isSubscribed && publication.videoTrack) {
                  const identity = participant.identity.toLowerCase();
                  if (
                    identity.includes("agent") ||
                    identity.includes("ai") ||
                    identity.includes("avatar") ||
                    identity.includes("interviewer")
                  ) {
                    console.log(
                      `Setting video track from existing participant: ${participant.identity}`,
                    );
                    setVideoTrack(publication.videoTrack);
                  }
                }
              });
            }
          });
        }

        room.registerTextStreamHandler(
          "lk.transcription",
          async (reader, participantInfo) => {
            try {
              const message = await reader.readAll();
              const isTranscription =
                reader.info.attributes["lk.transcribed_track_id"] != null;
              const isFinal =
                reader.info.attributes["lk.transcription_final"] === "true";
              const segmentId =
                reader.info.attributes["lk.segment_id"] ||
                `segment-${Date.now()}-${Math.random()}`;

              if (message.trim()) {
                const identity = participantInfo.identity.toLowerCase();

                const isAgent =
                  identity.includes("agent") ||
                  identity.includes("ai") ||
                  identity.includes("voice") ||
                  identity.includes("assistant") ||
                  identity.includes("interviewer") ||
                  identity.includes("avatar") ||
                  identity.includes("simli");

                const speaker = isAgent ? "Agent" : "You";

                if (speaker === "Agent") {
                  setIsAgentSpeaking(true);

                  if (agentSpeakingTimeoutRef.current) {
                    clearTimeout(agentSpeakingTimeoutRef.current);
                  }

                  if (isFinal) {
                    agentSpeakingTimeoutRef.current = setTimeout(() => {
                      setIsAgentSpeaking(false);
                    }, 800);
                  }
                }

                const shouldBeFinal = isFinal || (isAgent && !isTranscription);

                if (shouldBeFinal) {
                  addFinalTranscript(speaker, message, segmentId);
                } else {
                  addInterimTranscript(speaker, message, segmentId);
                }
              }
            } catch (error) {
              console.error("Error processing transcription:", error);
            }
          },
        );
      });

      room.on(LiveKit.RoomEvent.Disconnected, () => {
        cleanupResources();
        setIsConnected(false);
        setHasVideo(false);
        setVideoTrack(null);
        setStatus("Disconnected");
        setIsAgentSpeaking(false);
        setIsConnecting(false);
        roomRef.current = null;
        isConnectingRef.current = false;
        isDisconnectingRef.current = false;
        currentAgentSegmentRef.current = null;
      });

      room.on(LiveKit.RoomEvent.ParticipantConnected, (participant) => {
        console.log(`=== Participant Joined ===`);
        console.log(`Identity: "${participant.identity}"`);
        console.log(`Name: "${participant.name}"`);
      });

      room.on(LiveKit.RoomEvent.TrackPublished, (publication, participant) => {
        console.log(`=== Track Published ===`);
        console.log(`By: ${participant.identity}`);
        console.log(`Kind: ${publication.kind}`);
      });

      room.on(
        LiveKit.RoomEvent.TrackSubscribed,
        (track, publication, participant) => {
          console.log(`=== Track Subscribed ===`);
          console.log(`By: ${participant.identity}`);
          console.log(`Track Kind: ${track.kind}`);

          if (track.kind === "audio") {
            const audioElement = track.attach();
            audioElement.volume = 1.0;
            document.body.appendChild(audioElement);
            audioElementsRef.current.push(audioElement);

            const identity = participant.identity.toLowerCase();
            if (
              identity.includes("agent") ||
              identity.includes("ai") ||
              identity.includes("avatar") ||
              identity.includes("interviewer") ||
              identity.includes("voice")
            ) {
              console.log("Setting up audio analysis for agent");
              try {
                const audioContext = new (
                  window.AudioContext || window.webkitAudioContext
                )();
                audioContextsRef.current.push(audioContext);

                const source = audioContext.createMediaStreamSource(
                  new MediaStream([track.mediaStreamTrack]),
                );
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                analyser.smoothingTimeConstant = 0.8;
                source.connect(analyser);

                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const checkAudioLevel = () => {
                  if (audioContext.state === "closed") return;

                  analyser.getByteFrequencyData(dataArray);
                  const average =
                    dataArray.reduce((a, b) => a + b) / dataArray.length;

                  if (average > 5) {
                    setIsAgentSpeaking(true);

                    if (agentSpeechDetectionTimeoutRef.current) {
                      clearTimeout(agentSpeechDetectionTimeoutRef.current);
                    }

                    agentSpeechDetectionTimeoutRef.current = setTimeout(() => {
                      setIsAgentSpeaking(false);
                    }, 500);
                  }

                  const frameId = requestAnimationFrame(checkAudioLevel);
                  if (!animationFrameIdsRef.current.includes(frameId)) {
                    animationFrameIdsRef.current.push(frameId);
                  }
                };

                checkAudioLevel();
              } catch (error) {
                console.error("Error setting up audio analysis:", error);
              }
            }
          }

          if (track.kind === "video") {
            const identity = participant.identity.toLowerCase();

            if (
              identity.includes("agent") ||
              identity.includes("ai") ||
              identity.includes("avatar") ||
              identity.includes("interviewer")
            ) {
              console.log(
                `✅ Setting AGENT video track from: ${participant.identity}`,
              );
              setVideoTrack(track);
            } else {
              console.log(
                `Setting USER video track from: ${participant.identity}`,
              );
              if (videoRef.current) {
                track.attach(videoRef.current);
                setHasVideo(true);
              }
            }
          }
        },
      );

      room.on(
        LiveKit.RoomEvent.TrackUnsubscribed,
        (track, publication, participant) => {
          if (track.kind === "video") {
            const identity = participant.identity.toLowerCase();

            if (
              identity.includes("agent") ||
              identity.includes("ai") ||
              identity.includes("avatar") ||
              identity.includes("interviewer")
            ) {
              console.log("Agent video track removed");
              setVideoTrack(null);
            } else {
              console.log("User video track removed");
              track.detach();
              setHasVideo(false);
            }
          }
          if (track.kind === "audio") {
            track.detach();
          }
        },
      );

      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);

      console.log("✅ Successfully connected to LiveKit room");
    } catch (error) {
      console.error("❌ Connection error:", error);
      setStatus("Error: " + error.message);
      setIsConnecting(false);
      cleanupResources();
      roomRef.current = null;
      isConnectingRef.current = false;
      toast.error("Failed to connect: " + error.message);
    }
  };

  const connectToRoom = async () => {
    // Show confirmation modal first
    setShowAvatarConfirmation(true);
  };

  const disconnectFromRoom = async () => {
    if (!roomRef.current || isDisconnectingRef.current) {
      return;
    }

    try {
      isDisconnectingRef.current = true;
      const room = roomRef.current;
      roomRef.current = null;

      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
        violationTimeoutRef.current = null;
      }
      if (eyeViolationTimeoutRef.current) {
        clearTimeout(eyeViolationTimeoutRef.current);
        eyeViolationTimeoutRef.current = null;
      }

      cleanupResources();
      await room.disconnect();

      // Exit fullscreen mode
      if (document.fullscreenElement) {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            await document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
          }
        } catch (error) {
          console.error("Error exiting fullscreen:", error);
        }
      }

      setIsConnected(false);
      setIsAgentSpeaking(false);
      setHasVideo(false);
      setIsVideoOn(false);
      setVideoTrack(null);
      setStatus("Disconnected");
      setIsConnecting(false);
      currentAgentSegmentRef.current = null;

      navigate("/feedback", {
        state: {
          transcript: transcript,
          roomId: roomId,
          interviewName: interviewName,
          duration: "Session ended",
        },
      });

      setTranscript([]);
      isConnectingRef.current = false;
    } catch (error) {
      console.error("Error during disconnect:", error);
      roomRef.current = null;
      isConnectingRef.current = false;
      isDisconnectingRef.current = false;
    }
  };

  const handleMuteToggle = async () => {
    if (roomRef.current) {
      const newState = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newState);
      setIsMuted(newState);
    }
  };

  const handleMicChange = async (deviceId) => {
    if (!roomRef.current) {
      return;
    }

    try {
      const wasMuted = isMuted;

      if (!wasMuted) {
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
      }

      await roomRef.current.switchActiveDevice("audioinput", deviceId);
      setCurrentMicId(deviceId);

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (!wasMuted) {
        await roomRef.current.localParticipant.setMicrophoneEnabled(true);
      }
    } catch (error) {
      console.error("Error switching microphone:", error);
      if (!isMuted) {
        await roomRef.current?.localParticipant.setMicrophoneEnabled(true);
      }
    }
  };

  const handleVideoToggle = async () => {
    if (!roomRef.current) {
      return;
    }

    const newState = !isVideoOn;

    try {
      if (newState) {
        const publication =
          await roomRef.current.localParticipant.setCameraEnabled(true);

        if (publication && publication.track && videoRef.current) {
          publication.track.attach(videoRef.current);
          setHasVideo(true);
          setIsVideoOn(true);
        }
      } else {
        await roomRef.current.localParticipant.setCameraEnabled(false);
        setHasVideo(false);
        setIsVideoOn(false);

        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    } catch (error) {
      console.error("Error toggling video:", error);
      setIsVideoOn(false);
      setHasVideo(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSendMessage = async (message) => {
    if (!roomRef.current || !message.trim()) {
      return;
    }

    try {
      if (typeof roomRef.current.localParticipant.sendText === "function") {
        await roomRef.current.localParticipant.sendText(message, {
          topic: "lk.chat",
        });
      } else {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);

        await roomRef.current.localParticipant.publishData(data, {
          reliable: true,
          topic: "lk.chat",
        });
      }

      setTranscript((prev) => [
        ...prev,
        {
          speaker: "You",
          text: message.trim(),
          timestamp: new Date().toLocaleTimeString(),
          isFinal: true,
        },
      ]);
    } catch (error) {
      console.error("Failed to send text message:", error);
    }
  };

  useEffect(() => {
    if (!isConnected || isDisconnectingRef.current) {
      return;
    }

    if (violationTimeoutRef.current) {
      clearTimeout(violationTimeoutRef.current);
      violationTimeoutRef.current = null;
    }

    if (participantViolationCount > 1) {
      toast.error(
        ` Multiple participants detected (${participantViolationCount}).\nOnly 1 participant allowed.\n\nDisconnecting in 5 seconds...`,
        {
          duration: 2000,
          style: {
            background: "#ef4444",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "600",
            padding: "16px",
            maxWidth: "500px",
          },
        },
      );

      violationTimeoutRef.current = setTimeout(() => {
        toast.error("Interview terminated due to violation.");
        disconnectFromRoom();
      }, 2000);
    }

    return () => {
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
        violationTimeoutRef.current = null;
      }
    };
  }, [participantViolationCount, isConnected]);

  useEffect(() => {
    return () => {
      if (violationTimeoutRef.current) {
        clearTimeout(violationTimeoutRef.current);
      }
      if (eyeViolationTimeoutRef.current) {
        clearTimeout(eyeViolationTimeoutRef.current);
      }
      cleanupResources();
      if (roomRef.current) {
        roomRef.current
          .disconnect()
          .catch((e) => console.error("Cleanup disconnect error:", e));
      }
    };
  }, []);

  return (
    <>
      <Toaster />
      <AvatarConfirmationModal
        isVisible={showAvatarConfirmation}
        onConfirm={handleAvatarConfirm}
        onDecline={handleAvatarDecline}
      />
      <ConnectionLoadingModal isVisible={isConnecting} />
      <div className="h-screen bg-base-100 text-white flex flex-col overflow-hidden">
        <Header
          interviewName={interviewName}
          isRecording={isRecording}
          onRecordToggle={toggleRecording}
          isConnected={isConnected}
          onDisconnect={disconnectFromRoom}
          onConnect={connectToRoom}
          codeValue={codeValue}
          setCodeValue={setCodeValue}
          output={output}
          setOutput={setOutput}
          handleCodeSubmit={handleCodeSubmit}
          language={language}
          setLanguage={setLanguage}
          analysis={analysis}
          loadingAnalysis={loadingAnalysis}
          hints={hints}
          hintTopic={hintTopic}
        />

        <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-4 lg:gap-5 xl:gap-6 p-3 md:p-4 lg:p-5 xl:p-6 overflow-hidden">
          {/* Left Panel - Transcript */}
          <div className="w-full lg:w-[58%] xl:w-[60%] 2xl:w-[62%] flex flex-col min-w-0">
            <TranscriptPanel
              transcript={transcript}
              isAgentSpeaking={isAgentSpeaking}
              onSendMessage={handleSendMessage}
              messageInputDisabled={!isConnected}
              apiBaseUrl="http://localhost:6969"
            />
          </div>

          {/* Right Panel - Video and Controls */}
          <div className="w-full lg:w-[42%] xl:w-[40%] 2xl:w-[38%] flex flex-col gap-3 md:gap-4 lg:gap-5 overflow-y-auto min-w-0">
            {/* Avatar Video OR Spline Animation */}
            <div className="flex justify-center items-center bg-base-300 rounded-xl shadow-lg overflow-hidden">
              <div className="w-full max-w-full lg:max-w-[450px] xl:max-w-[500px] aspect-[10/7]">
                <AvatarVideo
                  videoTrack={videoTrack}
                  onVideoReady={handleAvatarVideoReady}
                  isAvatarEnabled={isAvatarEnabled}
                />
              </div>
            </div>

            {/* User Video Panel */}
            <VideoPanel videoRef={videoRef} />

            {/* Control Buttons */}
            <ControlButtons
              isMuted={isMuted}
              isVideoOn={isVideoOn}
              onMuteToggle={handleMuteToggle}
              onVideoToggle={handleVideoToggle}
              disabled={!isConnected}
              onMicChange={handleMicChange}
              currentMicId={currentMicId}
              room={roomRef.current}
              isAgentSpeaking={isAgentSpeaking}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewRoom;