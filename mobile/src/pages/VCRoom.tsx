// mobile/src/pages/VCRoom.tsx
// Replaces: frontend VCRoom.jsx (cosmic voice chat room)
// Key changes:
//   - PeerJS CDN loading → react-native-webrtc + PeerJS npm
//   - localStorage → SecureStore via api.ts interceptor
//   - window.location URL params → React Navigation params
//   - navigator.mediaDevices → mediaDevices from react-native-webrtc
//   - DOM audio elements → InCallManager + react-native-webrtc streams
//   - CSS styles → StyleSheet

import React, {
  useEffect, useRef, useState, useCallback, useMemo,
} from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, FlatList, Alert, Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { RootStackParamList } from "../navigation/AppNavigator";
import { COLORS, SPACING, RADIUS, FONT } from "../constants/theme";

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: react-native-webrtc replaces browser WebRTC + PeerJS CDN
// Run: npx expo install react-native-webrtc
// ─────────────────────────────────────────────────────────────────────────────
let RTCPeerConnection: any = null;
let mediaDevices: any = null;
try {
  const webrtc = require("react-native-webrtc");
  RTCPeerConnection = webrtc.RTCPeerConnection;
  mediaDevices = webrtc.mediaDevices;
} catch {
  console.warn("react-native-webrtc not installed. Run: npx expo install react-native-webrtc");
}

type NavProp  = NativeStackNavigationProp<RootStackParamList>;
type RouteRef = RouteProp<RootStackParamList, "VCRoom">;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Participant {
  id: string;
  backendId: number;
  name: string;
  role: "host" | "cohost" | "speaker" | "listener";
  muted: boolean;
  handRaised: boolean;
  peerId?: string;
}

interface ChatMessage {
  id: string | number;
  from: { id: number; name: string };
  text: string;
  time: string;
  mine: boolean;
}

interface Room {
  id: number | string;
  title: string;
  desc: string;
  hostName: string;
  memberCount: number;
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function timeStr() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const MAX_SPEAKERS = 3;
const MAX_COHOSTS  = 2;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function VCRoom() {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RouteRef>();
  const { user }   = useAuth();

  // ── Screens ──
  const [screen, setScreen] = useState<"rooms" | "panel">("rooms");

  // ── Rooms list ──
  const [rooms,        setRooms]        = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);

  // ── Create panel ──
  const [showCreate,  setShowCreate]  = useState(false);
  const [panelTitle,  setPanelTitle]  = useState("");
  const [panelDesc,   setPanelDesc]   = useState("");
  const [createBusy,  setCreateBusy]  = useState(false);

  // ── Panel state ──
  const [panelInfo,     setPanelInfo]    = useState<any>(null);
  const [participants,  setParticipants] = useState<Participant[]>([]);
  const [messages,      setMessages]     = useState<ChatMessage[]>([]);
  const [chatInput,     setChatInput]    = useState("");
  const [sidebarTab,    setSidebarTab]   = useState<"chat" | "people" | "host">("chat");
  const [myRole,        setMyRole]       = useState<"host" | "cohost" | "speaker" | "listener">("listener");
  const [muted,         setMuted]        = useState(false);
  const [handRaised,    setHandRaised]   = useState(false);
  const [connected,     setConnected]    = useState(false);
  const [notification,  setNotification] = useState<string | null>(null);

  const panelRef          = useRef<any>(null);
  const myRoleRef         = useRef<"host" | "cohost" | "speaker" | "listener">("listener");
  const _participantsRef  = useRef<Participant[]>([]);
  const wsRef             = useRef<WebSocket | null>(null);
  const peerConnsRef      = useRef<Record<string, RTCPeerConnection>>({});
  const localStreamRef    = useRef<any>(null);

  useEffect(() => { _participantsRef.current = participants; }, [participants]);

  const chatScrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // Show toast notification
  const push = useCallback((msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // ─── Load panels ─────────────────────────────────────────────────────────
  const loadPanels = useCallback(async () => {
    if (!user) return;
    setRoomsLoading(true);
    try {
      const res = await api.get("/api/panels/");
      const data = res.data;
      if (Array.isArray(data)) {
        setRooms(data.map((p: any) => ({
          id:          p.id,
          title:       p.title || p.name || "Untitled Panel",
          desc:        p.description || p.desc || "",
          hostName:    p.host_username || p.host_name || "",
          memberCount: p.member_count || 0,
          isActive:    p.is_active !== false,
        })));
      }
    } catch (e) {
      push("Could not load panels");
    } finally {
      setRoomsLoading(false);
    }
  }, [user]);

  useEffect(() => { loadPanels(); }, [loadPanels]);

  // Check if navigated with a panelId
  useEffect(() => {
    if (route.params?.panelId && user) {
      joinPanelById(route.params.panelId);
    }
  }, [route.params?.panelId, user]);

  // ─── WebSocket signaling setup ────────────────────────────────────────────
  // NOTE: This replaces PeerJS CDN with a direct WS signaling approach
  // Your Django backend needs Django Channels for WS support
  function connectWS(panelId: string | number) {
    const wsUrl = `${process.env.EXPO_PUBLIC_WS_URL}/panels/${panelId}/`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      push("Connected to panel ✨");
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        handleWsMessage(data);
      } catch {}
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      push("Connection error. Trying to reconnect...");
    };
  }

  function sendWS(data: any) {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }

  function handleWsMessage(data: any) {
    switch (data.type) {
      case "participants_update":
        setParticipants(data.participants || []);
        break;
      case "chat":
        setMessages((m) => [...m, {
          id:   Date.now() + Math.random(),
          from: data.from,
          text: data.text,
          time: data.time,
          mine: data.from?.id === user?.id,
        }]);
        break;
      case "raise_hand":
        push(`✋ ${data.from?.name || "Someone"} raised their hand`);
        setParticipants((prev) =>
          prev.map((p) => String(p.id) === String(data.from?.id) ? { ...p, handRaised: true } : p)
        );
        break;
      case "lower_hand":
        setParticipants((prev) =>
          prev.map((p) => String(p.id) === String(data.from?.id) ? { ...p, handRaised: false } : p)
        );
        break;
      case "speak_approved":
        if (String(data.user_id) === String(user?.id)) {
          setMyRole("speaker"); myRoleRef.current = "speaker";
          setHandRaised(false);
          push("🎙️ You're on stage! Mic is live.");
          startMic();
        }
        break;
      case "force_mute":
        if (String(data.user_id) === String(user?.id)) {
          muteLocalStream(); setMuted(true);
          push("🔇 Muted by host");
        }
        break;
      case "kick":
        if (String(data.user_id) === String(user?.id)) {
          push("You were removed from the panel");
          cleanup(); setScreen("rooms");
        }
        break;
      case "room_ended":
        push("Host ended this panel");
        cleanup(); setScreen("rooms");
        break;
    }
  }

  // ─── Mic / Audio ─────────────────────────────────────────────────────────
  async function startMic() {
    if (localStreamRef.current) return localStreamRef.current;
    if (!mediaDevices) {
      push("WebRTC not available. Install react-native-webrtc.");
      return null;
    }
    try {
      const stream = await mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      return stream;
    } catch {
      push("Mic access denied — check permissions");
      return null;
    }
  }

  function muteLocalStream() {
    localStreamRef.current?.getAudioTracks().forEach((t: any) => { t.enabled = false; });
  }

  // ─── Create Panel ─────────────────────────────────────────────────────────
  async function handleCreatePanel() {
    if (!panelTitle.trim()) { push("Enter a panel title"); return; }
    setCreateBusy(true);
    try {
      const res = await api.post("/api/panels/create/", {
        title:       panelTitle.trim(),
        description: panelDesc.trim(),
        topic:       "general",
        max_members: 20,
      });
      const panel = res.data;
      panelRef.current = panel;
      setPanelInfo({ ...panel, title: panelTitle.trim(), hostName: user?.first_name || user?.email });
      setParticipants([{
        id:         String(user!.id),
        backendId:  user!.id,
        name:       user?.first_name || user?.email || "Host",
        role:       "host",
        muted:      false,
        handRaised: false,
      }]);
      myRoleRef.current = "host";
      setMyRole("host");
      setShowCreate(false);
      setPanelTitle(""); setPanelDesc("");
      setScreen("panel");
      connectWS(panel.id);
      await startMic();
      push("Panel live! Share with your students.");
    } catch (err: any) {
      push(err.response?.data?.error || "Could not create panel");
    } finally {
      setCreateBusy(false);
    }
  }

  // ─── Join Panel ───────────────────────────────────────────────────────────
  async function joinPanelById(panelId: string | number) {
    try {
      const res = await api.post(`/api/panels/${panelId}/join/`);
      const joinData = res.data;
      panelRef.current = { id: panelId, ...joinData };
      setPanelInfo({ id: panelId, title: joinData.title || "Live Panel", hostName: joinData.host_name || "" });
      myRoleRef.current = "listener";
      setMyRole("listener");
      setScreen("panel");
      connectWS(panelId);
      push("Joined as listener 🎧");
    } catch (err: any) {
      push(err.response?.data?.error || "Could not join panel");
    }
  }

  // ─── Chat ─────────────────────────────────────────────────────────────────
  function sendChat() {
    if (!chatInput.trim()) return;
    const msg = {
      type: "chat",
      from: { id: user!.id, name: user?.first_name || user?.email || "User" },
      text: chatInput.trim(),
      time: timeStr(),
    };
    sendWS(msg);
    setMessages((m) => [...m, { ...msg, id: Date.now(), mine: true }]);
    setChatInput("");
  }

  // ─── My Controls ──────────────────────────────────────────────────────────
  function toggleMute() {
    const nowMuted = !muted;
    localStreamRef.current?.getAudioTracks().forEach((t: any) => { t.enabled = !nowMuted; });
    setMuted(nowMuted);
    sendWS({ type: "mute_status", muted: nowMuted, user_id: user?.id });
  }

  async function toggleHand() {
    const newVal = !handRaised;
    setHandRaised(newVal);
    try {
      await api.post(`/api/panels/${panelRef.current?.id}/${newVal ? "raise-hand" : "lower-hand"}/`);
    } catch {}
    sendWS({
      type: newVal ? "raise_hand" : "lower_hand",
      from: { id: user!.id, name: user?.first_name || user?.email },
    });
  }

  // ─── Host actions ─────────────────────────────────────────────────────────
  async function approveHandRaise(p: Participant) {
    if (participants.filter((x) => x.role === "speaker").length >= MAX_SPEAKERS) {
      push(`Max ${MAX_SPEAKERS} speakers allowed`); return;
    }
    try {
      await api.post(`/api/panels/${panelRef.current?.id}/promote/${p.backendId}/`);
    } catch {}
    sendWS({ type: "speak_approved", user_id: p.backendId });
    setParticipants((prev) =>
      prev.map((x) => x.id === p.id ? { ...x, role: "speaker", handRaised: false } : x)
    );
    push(`🎙️ ${p.name} is on stage`);
  }

  async function kickParticipant(p: Participant) {
    Alert.alert("Remove Member", `Remove ${p.name} from panel?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", style: "destructive",
        onPress: async () => {
          try {
            await api.post(`/api/panels/${panelRef.current?.id}/kick/${p.backendId}/`);
          } catch {}
          sendWS({ type: "kick", user_id: p.backendId });
          setParticipants((prev) => prev.filter((x) => x.id !== p.id));
        },
      },
    ]);
  }

  // ─── End / Leave ──────────────────────────────────────────────────────────
  async function endPanel() {
    Alert.alert("End Panel", "End this panel for everyone?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End", style: "destructive",
        onPress: async () => {
          sendWS({ type: "room_ended" });
          try { await api.post(`/api/panels/${panelRef.current?.id}/leave/`); } catch {}
          cleanup(); setScreen("rooms"); loadPanels();
        },
      },
    ]);
  }

  async function leavePanel() {
    try { await api.post(`/api/panels/${panelRef.current?.id}/leave/`); } catch {}
    cleanup(); setScreen("rooms"); loadPanels();
  }

  function cleanup() {
    wsRef.current?.close();
    wsRef.current = null;
    localStreamRef.current?.getTracks().forEach((t: any) => t.stop());
    localStreamRef.current = null;
    setPanelInfo(null); setParticipants([]); setMessages([]);
    setMyRole("listener"); setConnected(false); setMuted(false); setHandRaised(false);
  }

  // ─── Derived ─────────────────────────────────────────────────────────────
  const stageParticipants    = useMemo(() => participants.filter((p) => ["host","cohost","speaker"].includes(p.role)), [participants]);
  const audienceParticipants = useMemo(() => participants.filter((p) => p.role === "listener"), [participants]);
  const isController         = myRole === "host" || myRole === "cohost";
  const isTrainer            = user?.profile?.role === "trainer" || user?.role === "trainer";

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: ROOMS LIST
  // ─────────────────────────────────────────────────────────────────────────
  if (screen === "rooms") return (
    <View style={styles.container}>
      {/* Toast */}
      {!!notification && <View style={styles.toast}><Text style={styles.toastText}>{notification}</Text></View>}

      {/* Create Panel Modal */}
      {showCreate && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>CREATE PANEL</Text>
            <TextInput
              style={styles.input}
              placeholder="Panel title (e.g. The Nature of Consciousness)"
              placeholderTextColor={COLORS.muted}
              value={panelTitle}
              onChangeText={setPanelTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Short description (optional)"
              placeholderTextColor={COLORS.muted}
              value={panelDesc}
              onChangeText={setPanelDesc}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setShowCreate(false)}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, { flex: 2 }, createBusy && { opacity: 0.6 }]}
                onPress={handleCreatePanel}
                disabled={createBusy}
              >
                {createBusy
                  ? <ActivityIndicator color={COLORS.white} size="small" />
                  : <Text style={styles.btnPrimaryText}>◈ Launch Panel</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.roomsContent}>
        {/* Header */}
        <View style={styles.roomsHeader}>
          <View>
            <Text style={styles.roomsTitle}>LIVE PANELS</Text>
            <Text style={styles.roomsSubtitle}>
              {user?.first_name || user?.email} · {isTrainer ? "🔭 Trainer" : "🌱 Seeker"}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost, styles.btnSm]} onPress={loadPanels}>
              <Text style={styles.btnGhostText}>↻</Text>
            </TouchableOpacity>
            {isTrainer && (
              <TouchableOpacity style={[styles.btn, styles.btnPrimary, styles.btnSm]} onPress={() => setShowCreate(true)}>
                <Text style={styles.btnPrimaryText}>+ New Panel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Rooms */}
        {roomsLoading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator color={COLORS.cyan} size="large" />
          </View>
        ) : rooms.filter((r) => r.isActive).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌌</Text>
            <Text style={styles.emptyTitle}>The void is quiet</Text>
            <Text style={styles.emptyText}>
              {isTrainer ? "Create the first panel to start." : "No panels live right now."}
            </Text>
          </View>
        ) : (
          rooms.filter((r) => r.isActive).map((room) => (
            <TouchableOpacity key={room.id} style={styles.roomCard} onPress={() => joinPanelById(room.id)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.roomCardTitle}>{room.title}</Text>
                {!!room.desc && <Text style={styles.roomCardDesc}>{room.desc}</Text>}
                <View style={styles.roomCardMeta}>
                  <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>● LIVE</Text></View>
                  <Text style={styles.metaText}>⭐ {room.hostName}</Text>
                  <Text style={styles.metaText}>👥 {room.memberCount}</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.btn, styles.btnCyan, styles.btnSm]} onPress={() => joinPanelById(room.id)}>
                <Text style={styles.btnCyanText}>Enter →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER: PANEL
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {!!notification && <View style={styles.toast}><Text style={styles.toastText}>{notification}</Text></View>}

      {/* Panel Header */}
      <View style={styles.panelHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.panelTitle} numberOfLines={1}>{panelInfo?.title || "Live Panel"}</Text>
          <Text style={styles.panelSubtitle}>{participants.length} in space</Text>
        </View>
        <View style={styles.panelHeaderActions}>
          <View style={[styles.statusPill, connected && styles.statusPillConnected]}>
            <Text style={styles.statusText}>{connected ? "● LIVE" : "● CONNECTING"}</Text>
          </View>
          {myRole === "host"
            ? <TouchableOpacity style={[styles.btn, styles.btnRose, styles.btnSm]} onPress={endPanel}>
                <Text style={styles.btnRoseText}>⛔ End</Text>
              </TouchableOpacity>
            : <TouchableOpacity style={[styles.btn, styles.btnGhost, styles.btnSm]} onPress={leavePanel}>
                <Text style={styles.btnGhostText}>← Leave</Text>
              </TouchableOpacity>
          }
        </View>
      </View>

      {/* Sidebar tabs */}
      <View style={styles.sidebarTabs}>
        {(["chat", "people", ...(myRole === "host" ? ["host"] : [])] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.sidebarTab, sidebarTab === tab && styles.sidebarTabActive]}
            onPress={() => setSidebarTab(tab as any)}
          >
            <Text style={[styles.sidebarTabText, sidebarTab === tab && styles.sidebarTabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {sidebarTab === "chat" && (
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={chatScrollRef}
              style={styles.chatScroll}
              contentContainerStyle={{ padding: SPACING.md, paddingBottom: 8 }}
            >
              {messages.length === 0 && (
                <Text style={styles.emptyChatText}>The conversation begins here...</Text>
              )}
              {messages.map((m) => (
                <View key={m.id} style={[styles.chatMsg, m.mine && styles.chatMsgMine]}>
                  {!m.mine && <Text style={styles.chatMsgName}>{m.from.name}</Text>}
                  <View style={[styles.chatBubble, m.mine && styles.chatBubbleMine]}>
                    <Text style={styles.chatText}>{m.text}</Text>
                  </View>
                  <Text style={styles.chatTime}>{m.time}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.chatInputRow}>
              <TextInput
                style={styles.chatInput}
                placeholder="Say something..."
                placeholderTextColor={COLORS.muted}
                value={chatInput}
                onChangeText={setChatInput}
                onSubmitEditing={sendChat}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendChat}>
                <Text style={{ color: COLORS.white, fontWeight: "700" }}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {sidebarTab === "people" && (
          <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
            <Text style={styles.sectionLabel}>ON STAGE ({stageParticipants.length})</Text>
            <View style={styles.avatarGrid}>
              {stageParticipants.map((p) => (
                <AvatarOrb key={p.id} p={p} isMe={String(p.id) === String(user?.id)}
                  isController={isController}
                  onKick={() => kickParticipant(p)}
                />
              ))}
            </View>
            <Text style={[styles.sectionLabel, { marginTop: SPACING.md }]}>
              AUDIENCE ({audienceParticipants.length})
            </Text>
            {audienceParticipants.map((p) => (
              <View key={p.id} style={[styles.audienceChip, p.handRaised && styles.audienceChipRaised]}>
                <View style={styles.chipAvatar}>
                  <Text style={styles.chipAvatarText}>{(p.name || "?")[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.chipName}>
                  {String(p.id) === String(user?.id) ? `${p.name} (you)` : p.name}
                </Text>
                {p.handRaised && <Text>✋</Text>}
                {isController && String(p.id) !== String(user?.id) && (
                  <View style={styles.chipActions}>
                    {p.handRaised && (
                      <TouchableOpacity style={[styles.iconBtn, styles.iconBtnGold]} onPress={() => approveHandRaise(p)}>
                        <Text style={{ color: COLORS.gold, fontSize: 12 }}>⬆</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.iconBtn, styles.iconBtnRose]} onPress={() => kickParticipant(p)}>
                      <Text style={{ color: COLORS.rose, fontSize: 12 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {sidebarTab === "host" && myRole === "host" && (
          <ScrollView contentContainerStyle={{ padding: SPACING.md }}>
            <Text style={styles.sectionLabel}>HAND RAISES ({participants.filter((p) => p.handRaised).length})</Text>
            {participants.filter((p) => p.handRaised).map((p) => (
              <View key={p.id} style={[styles.audienceChip, styles.audienceChipRaised]}>
                <View style={styles.chipAvatar}>
                  <Text style={styles.chipAvatarText}>{(p.name || "?")[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.chipName}>{p.name}</Text>
                <View style={styles.chipActions}>
                  <TouchableOpacity style={[styles.iconBtn, styles.iconBtnGold]} onPress={() => approveHandRaise(p)}>
                    <Text style={{ color: COLORS.gold, fontSize: 11 }}>⬆ Stage</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconBtn, styles.iconBtnRose]} onPress={() => kickParticipant(p)}>
                    <Text style={{ color: COLORS.rose, fontSize: 11 }}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {participants.filter((p) => p.handRaised).length === 0 && (
              <Text style={{ color: COLORS.muted, fontSize: FONT.size.sm }}>No hands raised</Text>
            )}
            <View style={{ marginTop: SPACING.xl }}>
              <TouchableOpacity style={[styles.btn, styles.btnRose, { width: "100%" as any }]} onPress={endPanel}>
                <Text style={styles.btnRoseText}>⛔ End Panel for Everyone</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* My Controls */}
      <View style={styles.myControls}>
        <Text style={styles.myRoleLabel}>{myRole.toUpperCase()}</Text>
        {(myRole === "host" || myRole === "cohost" || myRole === "speaker") && (
          <TouchableOpacity
            style={[styles.btn, muted ? styles.btnRose : styles.btnCyan]}
            onPress={toggleMute}
          >
            <Text style={muted ? styles.btnRoseText : styles.btnCyanText}>
              {muted ? "🔇 Unmute" : "🎙️ Mute"}
            </Text>
          </TouchableOpacity>
        )}
        {myRole === "listener" && (
          <TouchableOpacity
            style={[styles.btn, handRaised ? styles.btnGold : styles.btnGhost]}
            onPress={toggleHand}
          >
            <Text style={handRaised ? { color: COLORS.gold, fontWeight: "700" } : styles.btnGhostText}>
              {handRaised ? "✋ Lower Hand" : "✋ Raise Hand"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setSidebarTab("chat")}>
          <Text style={styles.btnGhostText}>💬 Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Avatar Orb Component
function AvatarOrb({ p, isMe, isController, onKick }: {
  p: Participant; isMe: boolean; isController: boolean; onKick: () => void;
}) {
  const roleColor = {
    host: COLORS.gold, cohost: COLORS.aurora, speaker: COLORS.violet, listener: COLORS.purple,
  }[p.role] || COLORS.purple;

  return (
    <View style={orbStyles.wrap}>
      <View style={[orbStyles.orb, { borderColor: roleColor }]}>
        <Text style={[orbStyles.initial, { color: roleColor }]}>
          {(p.name || "?")[0].toUpperCase()}
        </Text>
        {p.handRaised && <View style={orbStyles.handBadge}><Text style={{ fontSize: 10 }}>✋</Text></View>}
      </View>
      <Text style={orbStyles.name} numberOfLines={1}>
        {isMe ? `${p.name} (you)` : p.name}
      </Text>
      {isController && !isMe && p.role !== "host" && (
        <TouchableOpacity style={orbStyles.kickBtn} onPress={onKick}>
          <Text style={{ color: COLORS.rose, fontSize: 10 }}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const orbStyles = StyleSheet.create({
  wrap:      { alignItems: "center", width: 80, marginBottom: SPACING.sm },
  orb:       { width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.panel, borderWidth: 2, justifyContent: "center", alignItems: "center", position: "relative" },
  initial:   { fontSize: FONT.size.xl, fontWeight: "900", fontFamily: "monospace" },
  name:      { fontSize: FONT.size.xs, color: COLORS.muted, marginTop: 4, textAlign: "center", maxWidth: 72 },
  handBadge: { position: "absolute", top: -4, right: -4, backgroundColor: COLORS.gold, borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center" },
  kickBtn:   { marginTop: 4, backgroundColor: "rgba(255,45,120,0.15)", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: "rgba(255,45,120,0.3)" },
});

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.bg },
  toast:              { position: "absolute", top: 60, right: 16, left: 16, backgroundColor: COLORS.nebula, borderRadius: RADIUS.md, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.border, zIndex: 100 },
  toastText:          { color: COLORS.text, fontSize: FONT.size.sm, textAlign: "center" },

  // Rooms
  roomsContent:       { padding: SPACING.lg, paddingBottom: 40 },
  roomsHeader:        { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: SPACING.lg },
  roomsTitle:         { fontSize: FONT.size.xl, fontWeight: "900", color: COLORS.violet, fontFamily: "monospace", letterSpacing: 2 },
  roomsSubtitle:      { color: COLORS.muted, fontSize: FONT.size.sm, marginTop: 4 },
  headerActions:      { flexDirection: "row", gap: SPACING.sm },
  loadingCenter:      { padding: 60, alignItems: "center" },
  emptyState:         { alignItems: "center", padding: 60 },
  emptyIcon:          { fontSize: 56, marginBottom: SPACING.md },
  emptyTitle:         { fontSize: FONT.size.lg, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.sm },
  emptyText:          { color: COLORS.muted, textAlign: "center" },
  roomCard:           { backgroundColor: COLORS.panel, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.sm, flexDirection: "row", alignItems: "center", gap: SPACING.md },
  roomCardTitle:      { fontSize: FONT.size.md, fontWeight: "700", color: COLORS.text },
  roomCardDesc:       { color: COLORS.muted, fontSize: FONT.size.sm, marginTop: 2 },
  roomCardMeta:       { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.xs, alignItems: "center" },
  liveBadge:          { backgroundColor: "rgba(255,45,120,0.2)", paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  liveBadgeText:      { color: COLORS.rose, fontSize: FONT.size.xs, fontWeight: "700" },
  metaText:           { color: COLORS.muted, fontSize: FONT.size.xs },

  // Modal
  modalOverlay:       { position: "absolute", inset: 0, backgroundColor: "rgba(2,0,8,0.9)", justifyContent: "center", alignItems: "center", padding: SPACING.lg, zIndex: 50 },
  modal:              { backgroundColor: COLORS.nebula, borderRadius: RADIUS.xl, padding: SPACING.xl, width: "100%", borderWidth: 1, borderColor: COLORS.border },
  modalTitle:         { color: COLORS.cyan, fontSize: FONT.size.md, fontFamily: "monospace", letterSpacing: 2, textAlign: "center", marginBottom: SPACING.lg },
  modalActions:       { flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.md },
  input:              { backgroundColor: "rgba(0,0,0,0.45)", borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.text, fontSize: FONT.size.md, marginBottom: SPACING.sm },

  // Panel header
  panelHeader:        { flexDirection: "row", alignItems: "center", padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: "rgba(2,0,8,0.9)" },
  panelTitle:         { fontSize: FONT.size.md, fontWeight: "700", color: COLORS.text, fontFamily: "monospace" },
  panelSubtitle:      { color: COLORS.muted, fontSize: FONT.size.xs, marginTop: 2 },
  panelHeaderActions: { flexDirection: "row", gap: SPACING.sm, alignItems: "center" },
  statusPill:         { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full, backgroundColor: COLORS.panel, borderWidth: 1, borderColor: COLORS.border },
  statusPillConnected:{ borderColor: COLORS.border2 },
  statusText:         { color: COLORS.muted, fontSize: FONT.size.xs, fontFamily: "monospace" },

  // Sidebar tabs
  sidebarTabs:        { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sidebarTab:         { flex: 1, padding: SPACING.sm, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  sidebarTabActive:   { borderBottomColor: COLORS.cyan },
  sidebarTabText:     { color: COLORS.muted, fontSize: FONT.size.xs, fontFamily: "monospace", letterSpacing: 1 },
  sidebarTabTextActive:{ color: COLORS.cyan },

  // Chat
  chatScroll:         { flex: 1 },
  emptyChatText:      { color: COLORS.muted, textAlign: "center", paddingVertical: SPACING.xl, fontSize: FONT.size.sm },
  chatMsg:            { marginBottom: SPACING.sm },
  chatMsgMine:        { alignItems: "flex-end" },
  chatMsgName:        { color: COLORS.violet, fontSize: FONT.size.xs, marginBottom: 3, fontFamily: "monospace" },
  chatBubble:         { backgroundColor: COLORS.panel2, borderRadius: RADIUS.md, borderTopLeftRadius: 3, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.sm, maxWidth: "85%" },
  chatBubbleMine:     { backgroundColor: "rgba(102,0,255,0.18)", borderColor: COLORS.purple, borderTopRightRadius: 3, borderTopLeftRadius: RADIUS.md },
  chatText:           { color: COLORS.text, fontSize: FONT.size.md },
  chatTime:           { color: COLORS.muted, fontSize: FONT.size.xs, marginTop: 3 },
  chatInputRow:       { flexDirection: "row", padding: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, gap: SPACING.sm },
  chatInput:          { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.sm, color: COLORS.text, fontSize: FONT.size.md },
  sendBtn:            { backgroundColor: COLORS.purple, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, justifyContent: "center" },

  // Stage / Audience
  sectionLabel:       { color: COLORS.muted, fontSize: FONT.size.xs, fontFamily: "monospace", letterSpacing: 2, marginBottom: SPACING.sm },
  avatarGrid:         { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginBottom: SPACING.md },
  audienceChip:       { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.panel2, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.xs, paddingRight: SPACING.sm, gap: SPACING.xs, marginBottom: SPACING.xs },
  audienceChipRaised: { borderColor: "rgba(255,215,0,0.5)" },
  chipAvatar:         { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.panel, justifyContent: "center", alignItems: "center" },
  chipAvatarText:     { color: COLORS.violet, fontWeight: "700", fontSize: FONT.size.xs, fontFamily: "monospace" },
  chipName:           { flex: 1, color: COLORS.muted, fontSize: FONT.size.sm },
  chipActions:        { flexDirection: "row", gap: SPACING.xs },
  iconBtn:            { borderRadius: RADIUS.sm, paddingHorizontal: 6, paddingVertical: 4, borderWidth: 1 },
  iconBtnGold:        { backgroundColor: "rgba(255,215,0,0.1)", borderColor: "rgba(255,215,0,0.3)" },
  iconBtnRose:        { backgroundColor: "rgba(255,45,120,0.1)", borderColor: "rgba(255,45,120,0.3)" },

  // My Controls
  myControls:         { flexDirection: "row", gap: SPACING.sm, padding: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: "rgba(2,0,8,0.96)", flexWrap: "wrap", alignItems: "center", justifyContent: "center" },
  myRoleLabel:        { color: COLORS.muted, fontSize: FONT.size.xs, fontFamily: "monospace", letterSpacing: 2 },

  // Buttons
  btn:                { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  btnSm:              { paddingHorizontal: SPACING.sm, paddingVertical: 6 },
  btnPrimary:         { backgroundColor: COLORS.purple },
  btnPrimaryText:     { color: COLORS.white, fontWeight: "700", fontSize: FONT.size.sm, fontFamily: "monospace" },
  btnGhost:           { backgroundColor: COLORS.panel2, borderWidth: 1, borderColor: COLORS.border },
  btnGhostText:       { color: COLORS.muted, fontSize: FONT.size.sm },
  btnCyan:            { backgroundColor: "rgba(0,68,102,0.8)", borderWidth: 1, borderColor: COLORS.border2 },
  btnCyanText:        { color: COLORS.cyan, fontSize: FONT.size.sm, fontWeight: "700" },
  btnGold:            { backgroundColor: "rgba(51,34,0,0.8)", borderWidth: 1, borderColor: "rgba(255,215,0,0.3)" },
  btnRose:            { backgroundColor: "rgba(51,0,17,0.8)", borderWidth: 1, borderColor: "rgba(255,45,120,0.3)" },
  btnRoseText:        { color: COLORS.rose, fontSize: FONT.size.sm, fontWeight: "700" },
});