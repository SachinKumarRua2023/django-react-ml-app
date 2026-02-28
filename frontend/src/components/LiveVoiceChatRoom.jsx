import React, { useState, useEffect, useRef } from 'react';

// ==================== CONFIGURATION ====================
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

const LiveVoiceChatRoom = () => {
  const [user, setUser] = useState(null);
  const [isTrainer, setIsTrainer] = useState(false);
  const [panels, setPanels] = useState([]);
  const [currentPanel, setCurrentPanel] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // WebRTC state
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [speakingUsers, setSpeakingUsers] = useState(new Set());
  
  // UI state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [handRaises, setHandRaises] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  
  // Refs
  const wsRef = useRef(null);
  const localAudioRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const pendingOffersRef = useRef({});

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setIsTrainer(parsed.profile?.role === 'trainer');
      fetchPanels(token);
    }
  }, []);

  const fetchPanels = async (token) => {
    try {
      const res = await fetch(`${API_URL}/panels/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await res.json();
      setPanels(data);
    } catch (err) {
      console.error('Failed to fetch panels:', err);
    }
  };

  // ==================== PANEL MANAGEMENT ====================
  const createPanel = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData(e.target);
    
    try {
      const res = await fetch(`${API_URL}/panels/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.get('title'),
          topic: formData.get('topic'),
          max_members: parseInt(formData.get('max_members')) || 4
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        setShowCreateModal(false);
        fetchPanels(token);
        joinPanel(data.id);
      }
    } catch (err) {
      console.error('Failed to create panel:', err);
    }
  };

  const joinPanel = async (panelId) => {
    const token = localStorage.getItem('token');
    
    try {
      await fetch(`${API_URL}/panels/${panelId}/join/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      
      const panel = panels.find(p => p.id === panelId);
      setCurrentPanel(panel);
      
      await initializeVoiceChat(panelId);
      
    } catch (err) {
      console.error('Failed to join panel:', err);
    }
  };

  const leavePanel = async () => {
    if (!currentPanel) return;
    
    const token = localStorage.getItem('token');
    
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    setRemoteStreams({});
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    await fetch(`${API_URL}/panels/${currentPanel.id}/leave/`, {
      method: 'POST',
      headers: { 'Authorization': `Token ${token}` }
    });
    
    setCurrentPanel(null);
    setConnectedUsers([]);
    setMessages([]);
  };

  // ==================== WEBRTC & WEBSOCKET ====================
  const initializeVoiceChat = async (panelId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }, 
        video: false 
      });
      
      setLocalStream(stream);
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }
      
      setupSpeakingDetection(stream, 'local');
      
      const token = localStorage.getItem('token');
      const wsUrl = `${WS_URL}/ws/voice/panel/${panelId}?token=${token}`;
      console.log('Connecting WebSocket to:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        addMessage('System', 'Connected to voice panel');
      };
      
      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data.type, data);
        await handleSignalingMessage(data);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        addMessage('System', 'Disconnected from panel');
      };
      
      wsRef.current = ws;
      
    } catch (err) {
      console.error('Failed to initialize voice chat:', err);
      alert('Could not access microphone. Please allow microphone access.');
    }
  };

  const setupSpeakingDetection = (stream, userId) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    source.connect(analyser);
    analyser.fftSize = 256;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const check = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;
      const isSpeaking = average > 30;
      
      setSpeakingUsers(prev => {
        const newSet = new Set(prev);
        if (isSpeaking) newSet.add(userId);
        else newSet.delete(userId);
        return newSet;
      });
      
      requestAnimationFrame(check);
    };
    
    check();
  };

  // ==================== SIGNALING ====================
  const handleSignalingMessage = async (data) => {
    const { type, from_user, to_user } = data;
    
    switch (type) {
      case 'user_joined':
        console.log('User joined:', data.username, 'ID:', from_user);
        if (from_user !== user.id) {
          addMessage('System', `${data.username} joined`);
          setConnectedUsers(prev => [...prev, { id: from_user, username: data.username }]);
          
          // CRITICAL: Create offer if we have lower ID (prevents collision)
          if (user.id < from_user) {
            console.log('I have lower ID, creating offer to:', from_user);
            await createPeerConnection(from_user, data.username, true);
          }
        }
        break;
        
      case 'user_left':
        console.log('User left:', from_user);
        addMessage('System', `${data.username} left`);
        setConnectedUsers(prev => prev.filter(u => u.id !== from_user));
        
        if (peerConnectionsRef.current[from_user]) {
          peerConnectionsRef.current[from_user].close();
          delete peerConnectionsRef.current[from_user];
          setRemoteStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[from_user];
            return newStreams;
          });
        }
        break;
        
      case 'offer':
        console.log('Received offer from:', from_user);
        await handleOffer(data);
        break;
        
      case 'answer':
        console.log('Received answer from:', from_user);
        await handleAnswer(data);
        break;
        
      case 'ice_candidate':
        await handleIceCandidate(data);
        break;
        
      case 'hand_raised':
        setHandRaises(prev => [...prev, { user_id: from_user, username: data.username }]);
        addMessage('System', `${data.username} raised hand ✋`);
        break;
        
      case 'hand_lowered':
        setHandRaises(prev => prev.filter(h => h.user_id !== from_user));
        break;
        
      case 'mute_all':
        setIsMuted(true);
        if (localStream) {
          localStream.getAudioTracks().forEach(track => track.enabled = false);
        }
        addMessage('System', 'Host muted everyone 🔇');
        break;
    }
  };

  const createPeerConnection = async (targetUserId, username, createOffer = false) => {
    console.log('Creating peer connection to:', targetUserId, 'Create offer:', createOffer);
    
    if (peerConnectionsRef.current[targetUserId]) {
      console.log('Connection already exists');
      return peerConnectionsRef.current[targetUserId];
    }
    
    const pc = new RTCPeerConnection(ICE_SERVERS);
    
    // Add local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }
    
    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream from:', targetUserId);
      const [remoteStream] = event.streams;
      
      setRemoteStreams(prev => ({
        ...prev,
        [targetUserId]: { stream: remoteStream, username }
      }));
      
      setupSpeakingDetection(remoteStream, targetUserId);
    };
    
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ice_candidate',
          to_user: targetUserId,
          candidate: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex
          }
        }));
      }
    };
    
    // Log state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state with', targetUserId, ':', pc.connectionState);
    };
    
    pc.oniceconnectionstatechange = () => {
      console.log('ICE state with', targetUserId, ':', pc.iceConnectionState);
    };
    
    peerConnectionsRef.current[targetUserId] = pc;
    
    if (createOffer) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        console.log('Sending offer to:', targetUserId);
        wsRef.current.send(JSON.stringify({
          type: 'offer',
          to_user: targetUserId,
          offer: {
            type: offer.type,
            sdp: offer.sdp
          }
        }));
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    }
    
    return pc;
  };

  const handleOffer = async (data) => {
    try {
      const { from_user, from_username, offer } = data;
      
      console.log('Handling offer from:', from_user);
      
      // Create connection (don't create offer)
      let pc = peerConnectionsRef.current[from_user];
      if (!pc) {
        pc = await createPeerConnection(from_user, from_username, false);
      }
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      
      console.log('Sending answer to:', from_user);
      wsRef.current.send(JSON.stringify({
        type: 'answer',
        to_user: from_user,
        answer: {
          type: answer.type,
          sdp: answer.sdp
        }
      }));
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  };

  const handleAnswer = async (data) => {
    try {
      const { from_user, answer } = data;
      const pc = peerConnectionsRef.current[from_user];
      
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('Answer set successfully for:', from_user);
      }
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  };

  const handleIceCandidate = async (data) => {
    try {
      const { from_user, candidate } = data;
      const pc = peerConnectionsRef.current[from_user];
      
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('ICE candidate added for:', from_user);
      }
    } catch (err) {
      console.error('Error handling ICE candidate:', err);
    }
  };

  // ==================== ACTIONS ====================
  const toggleMute = () => {
    if (localStream) {
      const newMuted = !isMuted;
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !newMuted;
      });
      setIsMuted(newMuted);
    }
  };

  const toggleHandRaise = () => {
    if (!wsRef.current) return;
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    wsRef.current.send(JSON.stringify({
      type: newState ? 'raise_hand' : 'lower_hand'
    }));
  };

  const muteAll = () => {
    if (!isTrainer && currentPanel?.host_id !== user.id) return;
    wsRef.current?.send(JSON.stringify({ type: 'mute_all' }));
  };

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text, time: new Date().toLocaleTimeString() }]);
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addMessage(user?.first_name || user?.username, chatInput);
    setChatInput('');
  };

  // ==================== RENDER ====================
  if (!user) {
    return <div style={styles.loginPrompt}>Please login to access voice chat</div>;
  }

  if (!currentPanel) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>🔴 Live Voice Panels</h1>
          {isTrainer && (
            <button style={styles.createButton} onClick={() => setShowCreateModal(true)}>
              + Create Panel
            </button>
          )}
        </div>

        <div style={styles.panelsGrid}>
          {panels.map(panel => (
            <div key={panel.id} style={styles.panelCard}>
              <div style={styles.panelHeader}>
                <span style={styles.topicBadge(panel.topic)}>{panel.topic}</span>
                <span style={styles.liveIndicator}>● LIVE</span>
              </div>
              <h3 style={styles.panelTitle}>{panel.title}</h3>
              <p style={styles.panelHost}>Host: {panel.host}</p>
              <p style={styles.panelMembers}>{panel.member_count}/{panel.max_members} members</p>
              <button 
                style={styles.joinButton}
                onClick={() => joinPanel(panel.id)}
                disabled={panel.member_count >= panel.max_members}
              >
                {panel.member_count >= panel.max_members ? 'Full' : 'Join Panel'}
              </button>
            </div>
          ))}
        </div>

        {showCreateModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2>Create New Panel</h2>
              <form onSubmit={createPanel}>
                <input name="title" placeholder="Panel Title" required style={styles.input} />
                <select name="topic" style={styles.input}>
                  <option value="ai_tech">AI & Technology</option>
                  <option value="innovation">Innovation</option>
                  <option value="spiritual">Spiritual & Philosophy</option>
                  <option value="skills">Skills & Learning</option>
                  <option value="general">General Discussion</option>
                </select>
                <select name="max_members" style={styles.input}>
                  <option value="4">4 Members</option>
                  <option value="5">5 Members</option>
                  <option value="6">6 Members</option>
                </select>
                <div style={styles.modalButtons}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={styles.cancelButton}>
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitButton}>Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.roomContainer}>
      {/* Header */}
      <div style={styles.roomHeader}>
        <div style={styles.headerLeft}>
          <span style={styles.topicBadgeSmall(currentPanel.topic)}>{currentPanel.topic}</span>
          <h2 style={styles.roomTitle}>{currentPanel.title}</h2>
        </div>
        <div style={styles.headerControls}>
          <span style={styles.memberCount}>
            {Object.keys(remoteStreams).length + 1} / {currentPanel.max_members}
          </span>
          <button onClick={leavePanel} style={styles.leaveButton}>Leave</button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Voice Stage */}
        <div style={styles.voiceStage}>
          {/* Local User */}
          <div style={{
            ...styles.userCircle,
            ...(speakingUsers.has('local') ? styles.speakingCircle : {}),
            ...(isMuted ? styles.mutedCircle : {})
          }}>
            <div style={styles.avatar}>
              {(user.first_name?.[0] || user.username[0]).toUpperCase()}
            </div>
            <span style={styles.userName}>You {isMuted && '🔇'}</span>
            {speakingUsers.has('local') && (
              <>
                <div style={styles.speakingWave} />
                <div style={styles.speakingWave2} />
              </>
            )}
          </div>

          {/* Remote Users */}
          {Object.entries(remoteStreams).map(([userId, { stream, username }]) => (
            <div key={userId} style={{
              ...styles.userCircle,
              ...(speakingUsers.has(parseInt(userId)) ? styles.speakingCircle : {})
            }}>
              <div style={styles.avatar}>{username?.[0].toUpperCase()}</div>
              <span style={styles.userName}>{username}</span>
              {speakingUsers.has(parseInt(userId)) && (
                <>
                  <div style={styles.speakingWave} />
                  <div style={styles.speakingWave2} />
                </>
              )}
              <audio 
                autoPlay 
                playsInline
                ref={el => {
                  if (el && stream) {
                    el.srcObject = stream;
                    console.log('Audio element set for user:', userId);
                  }
                }}
                style={{ display: 'none' }}
              />
            </div>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: Math.max(0, (currentPanel.max_members || 4) - Object.keys(remoteStreams).length - 1) }).map((_, i) => (
            <div key={`empty-${i}`} style={styles.emptyCircle}>
              <span style={styles.plusIcon}>+</span>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {handRaises.length > 0 && (
            <div style={styles.handRaisesSection}>
              <h4 style={styles.sidebarTitle}>✋ Raised Hands</h4>
              {handRaises.map(hand => (
                <div key={hand.user_id} style={styles.handRaiseItem}>
                  <span>{hand.username}</span>
                  {(isTrainer || currentPanel.host_id === user.id) && (
                    <button onClick={() => {}} style={styles.promoteBtn}>Add</button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={styles.usersSection}>
            <h4 style={styles.sidebarTitle}>👥 In Room ({connectedUsers.length + 1})</h4>
            <div style={styles.userList}>
              <div style={styles.userListItem}>
                <span style={styles.userIndicator}>🎤</span>
                <span>You ({user.profile?.role})</span>
              </div>
              {connectedUsers.map(u => (
                <div key={u.id} style={styles.userListItem}>
                  <span style={styles.userIndicator}>🔊</span>
                  <span>{u.username}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.chatSection}>
            <h4 style={styles.sidebarTitle}>💬 Chat</h4>
            <div style={styles.messages}>
              {messages.map((msg, i) => (
                <div key={i} style={styles.message}>
                  <strong style={{ color: msg.sender === 'System' ? '#f39c12' : '#3498db' }}>
                    {msg.sender}:
                  </strong>
                  <span style={styles.messageText}>{msg.text}</span>
                  <span style={styles.messageTime}>{msg.time}</span>
                </div>
              ))}
            </div>
            <form onSubmit={sendChatMessage} style={styles.chatForm}>
              <input 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type message..."
                style={styles.chatInput}
              />
              <button type="submit" style={styles.sendButton}>➤</button>
            </form>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controlsBar}>
        <button 
          onClick={toggleMute}
          style={{ ...styles.controlButton, background: isMuted ? '#e74c3c' : '#2ecc71' }}
        >
          {isMuted ? '🔇 Unmute' : '🎤 Mute'}
        </button>
        
        <button 
          onClick={toggleHandRaise}
          style={{ ...styles.controlButton, background: isHandRaised ? '#f39c12' : '#3498db' }}
        >
          {isHandRaised ? '✋ Lower Hand' : '✋ Raise Hand'}
        </button>
        
        {(isTrainer || currentPanel.host_id === user.id) && (
          <button onClick={muteAll} style={{ ...styles.controlButton, background: '#e74c3c' }}>
            🔇 Mute All
          </button>
        )}
      </div>

      <audio ref={localAudioRef} autoPlay muted playsInline style={{ display: 'none' }} />
    </div>
  );
};

// ==================== STYLES ====================
const styles = {
  roomContainer: {
    position: 'fixed',
    top: '70px',
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: 'white',
    zIndex: 10,
    overflow: 'hidden',
  },
  
  roomHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 25px',
    background: 'rgba(0,0,0,0.3)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  
  topicBadgeSmall: (topic) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    background: {
      'ai_tech': '#3498db',
      'innovation': '#9b59b6',
      'spiritual': '#e67e22',
      'skills': '#27ae60',
      'general': '#95a5a6'
    }[topic] || '#95a5a6',
    color: 'white',
  }),
  
  roomTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
  },
  
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  
  memberCount: {
    background: 'rgba(255,255,255,0.1)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
  },
  
  leaveButton: {
    padding: '10px 24px',
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  
  mainContent: {
    flex: 1,
    display: 'flex',
    padding: '20px',
    gap: '20px',
    overflow: 'hidden',
  },
  
  voiceStage: {
    flex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '30px',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    overflowY: 'auto',
  },
  
  userCircle: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    border: '3px solid transparent',
  },
  
  speakingCircle: {
    transform: 'scale(1.05)',
    borderColor: '#2ecc71',
    boxShadow: '0 0 40px rgba(46, 204, 113, 0.4)',
  },
  
  mutedCircle: {
    opacity: 0.5,
    background: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
  },
  
  emptyCircle: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    border: '2px dashed rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  plusIcon: {
    fontSize: '48px',
    color: 'rgba(255,255,255,0.3)',
  },
  
  avatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  speakingWave: {
    position: 'absolute',
    top: '-5px',
    left: '-5px',
    right: '-5px',
    bottom: '-5px',
    borderRadius: '50%',
    border: '2px solid rgba(46, 204, 113, 0.6)',
    animation: 'ripple 1.5s infinite',
  },
  
  speakingWave2: {
    position: 'absolute',
    top: '-15px',
    left: '-15px',
    right: '-15px',
    bottom: '-15px',
    borderRadius: '50%',
    border: '2px solid rgba(46, 204, 113, 0.3)',
    animation: 'ripple 1.5s infinite 0.5s',
  },
  
  sidebar: {
    width: '320px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    overflow: 'hidden',
  },
  
  sidebarTitle: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#95a5a6',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  
  handRaisesSection: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '15px',
    maxHeight: '150px',
    overflowY: 'auto',
  },
  
  handRaiseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  
  promoteBtn: {
    padding: '6px 12px',
    background: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
  },
  
  usersSection: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '15px',
    maxHeight: '200px',
    overflowY: 'auto',
  },
  
  userList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  
  userListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    fontSize: '14px',
  },
  
  userIndicator: {
    fontSize: '16px',
  },
  
  chatSection: {
    flex: 1,
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '200px',
  },
  
  messages: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '10px',
    paddingRight: '5px',
  },
  
  message: {
    padding: '10px',
    marginBottom: '8px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  
  messageText: {
    marginLeft: '5px',
    color: '#ecf0f1',
  },
  
  messageTime: {
    fontSize: '11px',
    color: '#7f8c8d',
    marginLeft: '8px',
    float: 'right',
  },
  
  chatForm: {
    display: 'flex',
    gap: '8px',
  },
  
  chatInput: {
    flex: 1,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
  },
  
  sendButton: {
    padding: '12px 20px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  
  controlsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    padding: '20px',
    background: 'rgba(0,0,0,0.4)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  
  controlButton: {
    padding: '15px 30px',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
  },
  
  loginPrompt: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontSize: '24px',
    color: '#7f8c8d',
  },
  
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Segoe UI, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    color: '#2c3e50',
    margin: 0,
  },
  createButton: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  panelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  panelCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  topicBadge: (topic) => ({
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    background: {
      'ai_tech': '#3498db',
      'innovation': '#9b59b6',
      'spiritual': '#e67e22',
      'skills': '#27ae60',
      'general': '#95a5a6'
    }[topic] || '#95a5a6',
    color: 'white',
  }),
  liveIndicator: {
    color: '#e74c3c',
    fontSize: '12px',
    fontWeight: 'bold',
    animation: 'pulse 2s infinite',
  },
  panelTitle: {
    margin: '10px 0',
    color: '#2c3e50',
  },
  panelHost: {
    color: '#7f8c8d',
    fontSize: '14px',
  },
  panelMembers: {
    color: '#7f8c8d',
    fontSize: '14px',
  },
  joinButton: {
    width: '100%',
    padding: '12px',
    marginTop: '15px',
    background: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    color: '#7f8c8d',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '400px',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '10px 20px',
    background: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '10px 20px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  @keyframes ripple {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.3); opacity: 0; }
  }
`;
document.head.appendChild(styleSheet);

export default LiveVoiceChatRoom;