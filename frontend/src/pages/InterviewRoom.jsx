import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/InterviewRoom/Header";
import TranscriptPanel from "../components/InterviewRoom/TranscriptPanel";
import VideoPanel from "../components/InterviewRoom/VideoPanel";
import ControlButtons from "../components/InterviewRoom/ControlButtons";
import AvatarVideo from "../components/InterviewRoom/AvatarVideo";
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

  // Violation tracking states
  const [participantViolationCount, setParticipantViolationCount] = useState(0);
  const [eyeMovementViolations, setEyeMovementViolations] = useState(0);
  const [language, setLanguage] = useState(
    location.state?.jobData.languages[0] || "javascript",
  );
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    if (job?.title) {
      setInterviewName(job.title);
    }
  }, [job]);

  const roomID = "room-001";
  useEffect(() => {
    const socket = io("http://127.0.0.1:6969");

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
      socket.emit("join_room", { roomId: roomID });
      console.log(`[+] Joined room: ${roomID}`);
    });

    socket.on("violation_detected", (data) => {
      console.log("Violation detected:", data);
      alert("violation detected please close any restricted software");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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

  // Track if avatar has joined
  const avatarJoinedRef = useRef(false);
  const avatarVideoTimeoutRef = useRef(null);

  // NEW: Track current agent segment for live streaming
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

    if (avatarVideoTimeoutRef.current) {
      clearTimeout(avatarVideoTimeoutRef.current);
      avatarVideoTimeoutRef.current = null;
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

    // Reset current segment tracking when final transcript is received
    if (speaker === "Agent" && currentAgentSegmentRef.current === segmentId) {
      currentAgentSegmentRef.current = null;
    }
  };

  const addInterimTranscript = (speaker, text, segmentId) => {
    if (!text || !text.trim()) return;

    // Track current agent segment for streaming
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

  const connectToRoom = async () => {
    if (isConnectingRef.current || roomRef.current) {
      return;
    }

    try {
      isConnectingRef.current = true;
      setIsConnecting(true);
      setStatus("Connecting...");
      avatarJoinedRef.current = false; // Reset avatar joined flag

      const jobData = location.state?.jobData || {
        companyName: "Default Company",
        title: "Default Position",
        description: "General technical interview",
        languages: ["JavaScript"],
      };

      const participantName =
        user?.username || "User-" + Math.random().toString(36).substr(2, 9);

      const response = await fetch("http://localhost:5000/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant: participantName,
          jobData: jobData,
          resumeData: user?.parsed_resume || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create room. Make sure backend is running.");
      }

      const { token, url, room_name } = await response.json();
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
        console.log("All participants in room:");
        room.remoteParticipants.forEach((participant) => {
          console.log(
            `- Identity: "${participant.identity}", Name: "${participant.name}"`,
          );
        });

        room.remoteParticipants.forEach((participant) => {
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

                // If avatar already present, close modal after short delay
                if (!avatarJoinedRef.current) {
                  avatarJoinedRef.current = true;
                  avatarVideoTimeoutRef.current = setTimeout(() => {
                    setIsConnecting(false);
                    console.log("Modal closed - Avatar video ready");
                  }, 1000);
                }
              }
            }
          });
        });

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

              console.log("=== Transcription Received ===");
              console.log("Participant Identity:", participantInfo.identity);
              console.log("Participant Name:", participantInfo.name);
              console.log("Message:", message);
              console.log("Is Transcription:", isTranscription);
              console.log("Is Final:", isFinal);
              console.log("Segment ID:", segmentId);
              console.log("All attributes:", reader.info.attributes);

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

                console.log(`Detected speaker: ${speaker}`);
                console.log(
                  `   Identity matched: ${isAgent ? "YES (Agent)" : "NO (User)"}`,
                );

                if (speaker === "Agent") {
                  // Set agent speaking immediately when interim or final transcript received
                  setIsAgentSpeaking(true);

                  // Clear any existing timeout
                  if (agentSpeakingTimeoutRef.current) {
                    clearTimeout(agentSpeakingTimeoutRef.current);
                  }

                  // Only set timeout to turn off speaking if this is final
                  if (isFinal) {
                    agentSpeakingTimeoutRef.current = setTimeout(() => {
                      setIsAgentSpeaking(false);
                    }, 800);
                  }
                }

                const shouldBeFinal = isFinal || (isAgent && !isTranscription);

                if (shouldBeFinal) {
                  console.log(
                    `Adding FINAL transcript: ${speaker} - ${message}`,
                  );
                  addFinalTranscript(speaker, message, segmentId);
                } else {
                  console.log(
                    `Adding INTERIM transcript: ${speaker} - ${message}`,
                  );
                  addInterimTranscript(speaker, message, segmentId);
                }
              } else {
                console.log("Transcription skipped - empty message");
              }

              // if (message.trim()) {
              //   const identity = participantInfo.identity.toLowerCase();

              //   const isAgent =
              //     identity.includes("agent") ||
              //     identity.includes("ai") ||
              //     identity.includes("voice") ||
              //     identity.includes("assistant") ||
              //     identity.includes("interviewer") ||
              //     identity.includes("avatar") ||
              //     identity.includes("simli");

              //   const speaker = isAgent ? "Agent" : "You";

              //   console.log(`Detected speaker: ${speaker}`);
              //   console.log(`   Identity matched: ${isAgent ? "YES (Agent)" : "NO (User)"}`);

              //   if (speaker === "Agent") {
              //     // Set agent speaking for both interim and final
              //     setIsAgentSpeaking(true);

              //     // Clear any existing timeout
              //     if (agentSpeakingTimeoutRef.current) {
              //       clearTimeout(agentSpeakingTimeoutRef.current);
              //     }

              //     // Set timeout to turn off speaking state after final transcript
              //     if (isFinal) {
              //       agentSpeakingTimeoutRef.current = setTimeout(() => {
              //         setIsAgentSpeaking(false);
              //       }, 1500);
              //     }
              //   }

              //   // Show interim transcripts as streaming for Agent
              //   if (!isFinal && speaker === "Agent") {
              //     console.log(`Adding INTERIM transcript: ${speaker} - ${message}`);
              //     addInterimTranscript(speaker, message, segmentId);
              //   } else {
              //     // Show final transcripts or user messages immediately
              //     console.log(`Adding FINAL transcript: ${speaker} - ${message}`);
              //     addFinalTranscript(speaker, message, segmentId);
              //   }
              // } else {
              //   console.log("Transcription skipped - empty message");
              // }
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

        // Check if this is the avatar/agent joining
        const identity = participant.identity.toLowerCase();
        if (
          identity.includes("agent") ||
          identity.includes("ai") ||
          identity.includes("avatar") ||
          identity.includes("interviewer")
        ) {
          console.log("Avatar/Agent participant detected!");
          avatarJoinedRef.current = true;

          // Wait a bit for video track to be ready, then close modal
          avatarVideoTimeoutRef.current = setTimeout(() => {
            setIsConnecting(false);
            console.log("Modal closed - Avatar ready");
          }, 1500);
        }
      });

      room.on(LiveKit.RoomEvent.TrackPublished, (publication, participant) => {
        console.log(`=== Track Published ===`);
        console.log(`By: ${participant.identity}`);
        console.log(`Kind: ${publication.kind}`);
        console.log(`Source: ${publication.source}`);
        console.log(`Track Name: ${publication.trackName}`);
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
                const audioContext = new (window.AudioContext ||
                  window.webkitAudioContext)();
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

                  // More sensitive threshold for real-time detection
                  if (average > 5) {
                    setIsAgentSpeaking(true);

                    // Clear existing timeout
                    if (agentSpeechDetectionTimeoutRef.current) {
                      clearTimeout(agentSpeechDetectionTimeoutRef.current);
                    }

                    // Set timeout to turn off after silence
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
                `Setting AGENT video track from: ${participant.identity}`,
              );
              setVideoTrack(track);

              // Avatar video track subscribed - close modal after short delay
              if (!avatarJoinedRef.current) {
                avatarJoinedRef.current = true;
                avatarVideoTimeoutRef.current = setTimeout(() => {
                  setIsConnecting(false);
                  console.log("Modal closed - Avatar video track subscribed");
                }, 1000);
              }
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
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("Error: " + error.message);
      setIsConnecting(false);
      cleanupResources();
      roomRef.current = null;
      isConnectingRef.current = false;
    }
  };

  // const disconnectFromRoom = async () => {
  //   if (!roomRef.current || isDisconnectingRef.current) {
  //     return;
  //   }

  //   try {
  //     isDisconnectingRef.current = true;
  //     const room = roomRef.current;
  //     roomRef.current = null;

  //     if (violationTimeoutRef.current) {
  //       clearTimeout(violationTimeoutRef.current);
  //       violationTimeoutRef.current = null;
  //     }
  //     if (eyeViolationTimeoutRef.current) {
  //       clearTimeout(eyeViolationTimeoutRef.current);
  //       eyeViolationTimeoutRef.current = null;
  //     }
  //     if (avatarVideoTimeoutRef.current) {
  //       clearTimeout(avatarVideoTimeoutRef.current);
  //       avatarVideoTimeoutRef.current = null;
  //     }

  //     cleanupResources();
  //     await room.disconnect();

  //     setIsConnected(false);
  //     setIsAgentSpeaking(false);
  //     setHasVideo(false);
  //     setIsVideoOn(false);
  //     setVideoTrack(null);
  //     setStatus("Disconnected");
  //     setIsConnecting(false);
  //     currentAgentSegmentRef.current = null;

  //     navigate("/feedback", {
  //       state: {
  //         transcript: transcript,
  //         roomId: roomId,
  //         interviewName: interviewName,
  //         duration: "Session ended",
  //       },
  //     });

  //     setTranscript([]);
  //     isConnectingRef.current = false;
  //   } catch (error) {
  //     console.error("Error during disconnect:", error);
  //     roomRef.current = null;
  //     isConnectingRef.current = false;
  //     isDisconnectingRef.current = false;
  //   }
  // };


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
      if (avatarVideoTimeoutRef.current) {
        clearTimeout(avatarVideoTimeoutRef.current);
        avatarVideoTimeoutRef.current = null;
      }

      cleanupResources();
      await room.disconnect();

      // Exit fullscreen mode
      if (document.fullscreenElement) {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            // Safari support
            await document.webkitExitFullscreen();
          } else if (document.mozCancelFullScreen) {
            // Firefox support
            await document.mozCancelFullScreen();
          } else if (document.msExitFullscreen) {
            // IE11 support
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

  // useEffect(() => {
  //   if (!isConnected || isDisconnectingRef.current) {
  //     return;
  //   }

  //   if (violationTimeoutRef.current) {
  //     clearTimeout(violationTimeoutRef.current);
  //     violationTimeoutRef.current = null;
  //   }

  //   if (participantViolationCount > 1) {
  //     alert(
  //       `VIOLATION DETECTED!\n\nMultiple participants detected on screen (${participantViolationCount}).\n\nOnly 1 participant is allowed during the interview.\n\nYou will be disconnected in 5 seconds.`,
  //     );

  //     violationTimeoutRef.current = setTimeout(() => {
  //       alert("Interview terminated due to multiple participants violation.");
  //       disconnectFromRoom();
  //     }, 1000);
  //   }

  //   return () => {
  //     if (violationTimeoutRef.current) {
  //       clearTimeout(violationTimeoutRef.current);
  //       violationTimeoutRef.current = null;
  //     }
  //   };
  // }, [participantViolationCount, isConnected]);

  <Toaster position="top-center" />

  // In your useEffect
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
            background: '#ef4444',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            padding: '16px',
            maxWidth: '500px',
          },
        }
      );

      violationTimeoutRef.current = setTimeout(() => {
        toast.error('Interview terminated due to violation.');
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
      if (avatarVideoTimeoutRef.current) {
        clearTimeout(avatarVideoTimeoutRef.current);
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
    // <>
    //   <Toaster />
    //   <ConnectionLoadingModal isVisible={isConnecting} />
    //   <div className="h-screen bg-base-300 text-white flex flex-col overflow-hidden">
    //     <Header
    //       interviewName={interviewName}
    //       isRecording={isRecording}
    //       onRecordToggle={toggleRecording}
    //       isConnected={isConnected}
    //       onDisconnect={disconnectFromRoom}
    //       onConnect={connectToRoom}
    //       codeValue={codeValue}
    //       setCodeValue={setCodeValue}
    //       output={output}
    //       setOutput={setOutput}
    //       handleCodeSubmit={handleCodeSubmit}
    //       language={language}
    //       setLanguage={setLanguage}
    //       analysis={analysis}
    //       loadingAnalysis={loadingAnalysis}
    //     />

    //     <div className="flex-1 flex gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 overflow-hidden">
    //       <div className="w-full lg:w-[55vw] xl:w-[900px] flex flex-col min-w-0">
    //         <TranscriptPanel
    //           transcript={transcript}
    //           isAgentSpeaking={isAgentSpeaking}
    //           onSendMessage={handleSendMessage}
    //           messageInputDisabled={!isConnected}
    //         />
    //       </div>

    //       <div className="flex-1 flex flex-col gap-2 sm:gap-3 md:gap-4 overflow-y-auto min-w-0">
    //         <div className="flex justify-center items-center bg-black rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
    //           <div className="w-full max-w-[400px] aspect-[10/7]">
    //             <AvatarVideo videoTrack={videoTrack} />
    //           </div>
    //         </div>

    //         <VideoPanel
    //           isConnected={isConnected}
    //           videoRef={videoRef}
    //           hasVideo={hasVideo}
    //           onParticipantCountChange={setParticipantViolationCount}
    //           onEyeViolationCountChange={setEyeMovementViolations}
    //         />

    //         <ControlButtons
    //           isMuted={isMuted}
    //           isVideoOn={isVideoOn}
    //           onMuteToggle={handleMuteToggle}
    //           onVideoToggle={handleVideoToggle}
    //           disabled={!isConnected}
    //           onMicChange={handleMicChange}
    //           currentMicId={currentMicId}
    //           room={roomRef.current}
    //           isAgentSpeaking={isAgentSpeaking}
    //         />
    //       </div>
    //     </div>
    //   </div>
    // </>
    <>
      <Toaster />
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
        />

        <div className="flex-1 flex flex-col lg:flex-row gap-3 md:gap-4 lg:gap-5 xl:gap-6 p-3 md:p-4 lg:p-5 xl:p-6 overflow-hidden">
          {/* Left Panel - Transcript */}
          <div className="w-full lg:w-[58%] xl:w-[60%] 2xl:w-[62%] flex flex-col min-w-0">
            <TranscriptPanel
              transcript={transcript}
              isAgentSpeaking={isAgentSpeaking}
              onSendMessage={handleSendMessage}
              messageInputDisabled={!isConnected}
            />
          </div>

          {/* Right Panel - Video and Controls */}
          <div className="w-full lg:w-[42%] xl:w-[40%] 2xl:w-[38%] flex flex-col gap-3 md:gap-4 lg:gap-5 overflow-y-auto min-w-0">
            {/* Avatar Video */}
            <div className="flex justify-center items-center bg-base-300 rounded-xl shadow-lg overflow-hidden">
              <div className="w-full max-w-full lg:max-w-[450px] xl:max-w-[500px] aspect-[10/7]">
                <AvatarVideo videoTrack={videoTrack} />
              </div>
            </div>

            {/* User Video Panel */}
            <VideoPanel
              videoRef={videoRef}
            />

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

