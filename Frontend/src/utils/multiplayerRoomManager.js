/**
 * Netrium Multiplayer Room Manager
 * Provides 4-digit code collaborative room management for all Practical Orientation modes:
 * - Computer Networks Topology
 * - Global Content Delivery Network (CDN)
 * - Routing Algorithms (Autonomous Systems)
 * - Page Replacement Algorithms (Memory Architecture)
 *
 * Automatically attempts real backend synchronization via /api/topology-rooms,
 * with zero-downtime fallback to BroadcastChannel & localStorage for offline/local multi-tab testing.
 */

import { getApiUrl, safeJsonParse } from './api';

const BROADCAST_CHANNEL_NAME = 'netrium_multiplayer_sync';
let broadcastChannel = null;

if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (err) {
    console.warn('[Multiplayer BroadcastChannel init warning]', err);
  }
}

/**
 * Generate a random 4-digit numeric code
 */
export function generate4DigitCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Read local fallback room from localStorage
 */
function getLocalRoom(code) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`netrium_room_${code}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Save local fallback room to localStorage and broadcast change
 */
function saveLocalRoom(room) {
  if (typeof window === 'undefined' || !room?.code) return;
  try {
    localStorage.setItem(`netrium_room_${room.code}`, JSON.stringify(room));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'ROOM_UPDATE', room });
    }
  } catch (e) {
    console.warn('[saveLocalRoom error]', e);
  }
}

/**
 * Subscribe to local broadcast room updates (across tabs/windows)
 */
export function subscribeToRoomBroadcast(code, callback) {
  if (!broadcastChannel) return () => {};

  const handler = (event) => {
    if (event.data?.type === 'ROOM_UPDATE' && event.data?.room?.code === code) {
      callback(event.data.room);
    }
  };

  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel.removeEventListener('message', handler);
  };
}

/**
 * Create a multiplayer room with a 4-digit code
 */
export async function createRoomApi({
  topologyType = 'cdn',
  maxParticipants = 4,
  hostEmail = 'researcher@netrium.site',
  hostName = 'Room Creator (Host)',
  nodes = [],
  sourceNodeId = '',
  targetNodeId = '',
  payloadText = 'Hello Netrium'
}) {
  const code = generate4DigitCode();
  const cleanEmail = hostEmail.toLowerCase().trim();

  // Try backend first
  try {
    const res = await fetch(getApiUrl('/api/topology-rooms/create'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topologyType,
        maxParticipants,
        hostEmail: cleanEmail,
        hostName
      })
    });

    if (res.ok) {
      const data = await safeJsonParse(res);
      if (data.success && data.room) {
        // If custom nodes were supplied that backend didn't have, overlay them if needed
        saveLocalRoom(data.room);
        return { success: true, room: data.room, code: data.room.code };
      }
    }
  } catch (err) {
    console.warn('[Backend createRoom fallback to local sync]', err.message);
  }

  // Local fallback room creation
  const fallbackNodes = nodes.length > 0 ? nodes : [
    { id: 'node-origin', label: 'O', name: 'Primary Origin Server', status: 'online', role: 'origin' },
    { id: 'node-edge', label: 'E', name: 'CDN Edge POP', status: 'online', role: 'edge' },
    { id: 'node-client', label: 'C', name: 'Client Consumer', status: 'online', role: 'client' },
    { id: 'node-backup', label: 'B', name: 'Secondary Regional POP', status: 'online', role: 'edge' }
  ];

  const fallbackRoom = {
    code,
    topologyType,
    hostEmail: cleanEmail,
    hostName,
    maxParticipants: Math.max(2, Math.min(maxParticipants, 8)),
    participants: [
      {
        email: cleanEmail,
        name: hostName,
        nodeId: fallbackNodes[0]?.id || 'node-origin',
        isOnline: true,
        lastPing: new Date().toISOString()
      }
    ],
    nodes: fallbackNodes,
    sourceNodeId: sourceNodeId || fallbackNodes[0]?.id || '',
    targetNodeId: targetNodeId || fallbackNodes[Math.min(2, fallbackNodes.length - 1)]?.id || '',
    payloadText,
    simulation: {
      status: 'idle',
      path: [],
      currentStepIndex: 0,
      currentHop: { from: '', to: '', stepNumber: 0, totalSteps: 0 },
      lastAction: 'Awaiting transmission trigger'
    },
    logs: [
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        message: `[ROOM CREATED] 4-Digit Code: ${code} | Topology: ${topologyType.toUpperCase()} | Host: ${hostName}`,
        type: 'info'
      }
    ]
  };

  saveLocalRoom(fallbackRoom);
  return { success: true, room: fallbackRoom, code };
}

/**
 * Join an existing multiplayer room using 4-digit code
 */
export async function joinRoomApi({ code, email, name }) {
  const cleanCode = code.toString().trim().toUpperCase();
  const cleanEmail = email.toLowerCase().trim();

  // Try backend first
  try {
    const res = await fetch(getApiUrl('/api/topology-rooms/join'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: cleanCode,
        email: cleanEmail,
        name: name || 'Station Operator'
      })
    });

    if (res.ok) {
      const data = await safeJsonParse(res);
      if (data.success && data.room) {
        saveLocalRoom(data.room);
        return { success: true, room: data.room };
      }
    }
  } catch (err) {
    console.warn('[Backend joinRoom fallback to local sync]', err.message);
  }

  // Local fallback join
  const localRoom = getLocalRoom(cleanCode);
  if (!localRoom) {
    throw new Error(`Room with 4-digit code ${cleanCode} was not found. Please verify the code.`);
  }

  const existingIdx = localRoom.participants.findIndex(p => p.email === cleanEmail);
  if (existingIdx !== -1) {
    localRoom.participants[existingIdx].isOnline = true;
    localRoom.participants[existingIdx].lastPing = new Date().toISOString();
  } else {
    if (localRoom.participants.length >= localRoom.maxParticipants) {
      throw new Error(`Room ${cleanCode} is full (${localRoom.maxParticipants} devices max).`);
    }

    // Auto-assign next free node
    const assignedNodeIds = new Set(localRoom.participants.map(p => p.nodeId));
    const freeNode = localRoom.nodes.find(n => !assignedNodeIds.has(n.id)) || localRoom.nodes[localRoom.participants.length % localRoom.nodes.length];

    localRoom.participants.push({
      email: cleanEmail,
      name: name || `Station ${localRoom.participants.length + 1}`,
      nodeId: freeNode?.id || '',
      isOnline: true,
      lastPing: new Date().toISOString()
    });
  }

  localRoom.logs.push({
    id: Date.now().toString(),
    time: new Date().toLocaleTimeString(),
    message: `[DEVICE CONNECTED] ${name || cleanEmail} joined room ${cleanCode}.`,
    type: 'info'
  });

  saveLocalRoom(localRoom);
  return { success: true, room: localRoom };
}

/**
 * Poll room state
 */
export async function pollRoomApi(code) {
  const cleanCode = code.toString().trim();

  try {
    const res = await fetch(getApiUrl(`/api/topology-rooms/${cleanCode}`));
    if (res.ok) {
      const data = await safeJsonParse(res);
      if (data.success && data.room) {
        saveLocalRoom(data.room);
        return data.room;
      }
    }
  } catch {
    // fallback
  }

  return getLocalRoom(cleanCode);
}

/**
 * Heartbeat ping to keep device green
 */
export async function pingRoomApi(code, email) {
  const cleanCode = code.toString().trim();
  const cleanEmail = email.toLowerCase().trim();

  try {
    await fetch(getApiUrl(`/api/topology-rooms/${cleanCode}/ping`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });
  } catch {
    // local fallback
    const room = getLocalRoom(cleanCode);
    if (room) {
      const p = room.participants.find(part => part.email === cleanEmail);
      if (p) {
        p.isOnline = true;
        p.lastPing = new Date().toISOString();
        saveLocalRoom(room);
      }
    }
  }
}

/**
 * Trigger collaborative simulation / data stream
 */
export async function transmitRoomApi(code, {
  userEmail,
  payloadText,
  sourceNodeId,
  targetNodeId,
  path = [],
  stepMessages = []
}) {
  const cleanCode = code.toString().trim();

  // Try backend first
  try {
    const res = await fetch(getApiUrl(`/api/topology-rooms/${cleanCode}/transmit`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail,
        payloadText,
        sourceNodeId,
        targetNodeId
      })
    });

    if (res.ok) {
      const data = await safeJsonParse(res);
      if (data.success && data.room) {
        saveLocalRoom(data.room);
        return { success: true, room: data.room };
      }
    }
  } catch (err) {
    console.warn('[Backend transmitRoom fallback]', err.message);
  }

  // Local fallback simulation
  const room = getLocalRoom(cleanCode);
  if (!room) return { success: false, error: 'Room not found' };

  room.payloadText = payloadText || room.payloadText;
  room.sourceNodeId = sourceNodeId || room.sourceNodeId;
  room.targetNodeId = targetNodeId || room.targetNodeId;

  const simPath = path.length > 0 ? path : [room.sourceNodeId, room.targetNodeId];

  room.simulation = {
    status: 'running',
    path: simPath,
    currentStepIndex: 0,
    currentHop: {
      from: simPath[0] || '',
      to: simPath[1] || '',
      stepNumber: 1,
      totalSteps: Math.max(1, simPath.length - 1)
    },
    lastAction: `Transmission running across ${simPath.length} hops`,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stepMessages
  };

  room.logs.push({
    id: Date.now().toString(),
    time: new Date().toLocaleTimeString(),
    message: `[DATA TRANSMISSION] Streaming "${room.payloadText}" along path: ${simPath.join(' -> ')}`,
    type: 'transfer'
  });

  saveLocalRoom(room);
  return { success: true, room };
}

/**
 * Advance hop step
 */
export async function stepRoomApi(code, stepIndex) {
  const cleanCode = code.toString().trim();

  try {
    const res = await fetch(getApiUrl(`/api/topology-rooms/${cleanCode}/step`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepIndex })
    });
    if (res.ok) {
      const data = await safeJsonParse(res);
      if (data.success && data.room) {
        saveLocalRoom(data.room);
        return data.room;
      }
    }
  } catch {
    // fallback
  }

  const room = getLocalRoom(cleanCode);
  if (!room || !room.simulation) return null;

  const path = room.simulation.path || [];
  room.simulation.currentStepIndex = stepIndex;

  if (stepIndex >= path.length - 1) {
    room.simulation.status = 'completed';
    room.simulation.lastAction = `Transmission complete. Payload acknowledged at destination.`;
  } else {
    room.simulation.currentHop = {
      from: path[stepIndex],
      to: path[stepIndex + 1],
      stepNumber: stepIndex + 1,
      totalSteps: path.length - 1
    };
    room.simulation.lastAction = `Hop ${stepIndex + 1}: ${path[stepIndex]} -> ${path[stepIndex + 1]}`;
  }

  saveLocalRoom(room);
  return room;
}
