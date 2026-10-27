import express from 'express';
import TopologyRoom from '../models/TopologyRoom.js';
import SavedLab from '../models/SavedLab.js';
import { calculateTopologyPath } from '../utils/topologyRouter.js';

const router = express.Router();

const NODE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Generate a unique 4-digit numeric room code (e.g. "4819")
 */
async function generateUniqueRoomCode() {
  for (let attempts = 0; attempts < 25; attempts++) {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const existing = await TopologyRoom.findOne({ code });
    if (!existing) return code;
  }
  return (Math.floor(1000 + Math.random() * 9000)).toString();
}

/**
 * POST /api/topology-rooms/create
 * Creates a collaborative multi-device simulation room with a 4-digit code
 */
router.post('/create', async (req, res) => {
  try {
    const {
      topologyType = 'ring',
      maxParticipants = 4,
      hostEmail,
      hostName = 'Host Lead'
    } = req.body;

    if (!hostEmail) {
      return res.status(400).json({
        success: false,
        message: 'Host email is required to create a simulation room.'
      });
    }

    const numNodes = Math.min(Math.max(parseInt(maxParticipants, 10) || 4, 2), 8);
    const code = await generateUniqueRoomCode();

    // Generate node objects for the room
    const nodes = [];
    for (let i = 0; i < numNodes; i++) {
      const label = NODE_LABELS[i];
      const isHub = (topologyType === 'star' || topologyType === 'hybrid') && i === 0;
      const isRoot = topologyType === 'tree' && i === 0;

      nodes.push({
        id: `node-${label.toLowerCase()}`,
        label,
        name: `Station ${label}`,
        status: 'online',
        role: isHub ? 'hub' : isRoot ? 'root' : 'node'
      });
    }

    // Host is assigned to Node A by default
    const participants = [
      {
        email: hostEmail.toLowerCase().trim(),
        name: hostName.trim() || 'Host Lead',
        nodeId: nodes[0].id,
        isOnline: true,
        lastPing: new Date()
      }
    ];

    const sourceNodeId = nodes[0].id;
    const targetNodeId = nodes[Math.min(2, nodes.length - 1)].id;

    const initialLogs = [
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString(),
        message: `[ROOM CREATED] Code: ${code} | Topology: ${topologyType.toUpperCase()} | Capacity: ${numNodes} stations | Host: ${hostEmail}`,
        type: 'info'
      },
      {
        id: (Date.now() + 1).toString(),
        time: new Date().toLocaleTimeString(),
        message: `Station ${nodes[0].label} assigned to host (${hostEmail}). Waiting for remaining ${numNodes - 1} devices to join.`,
        type: 'info'
      }
    ];

    const newRoom = new TopologyRoom({
      code,
      topologyType,
      hostEmail: hostEmail.toLowerCase().trim(),
      hostName: hostName.trim(),
      maxParticipants: numNodes,
      participants,
      nodes,
      sourceNodeId,
      targetNodeId,
      payloadText: 'Hello Netrium',
      logs: initialLogs,
      simulation: {
        status: 'idle',
        path: [],
        currentStepIndex: 0,
        lastAction: 'Waiting for participants to join and host to run simulation.'
      }
    });

    await newRoom.save();

    res.status(201).json({
      success: true,
      message: `Room created successfully with 4-digit code: ${code}`,
      room: newRoom
    });
  } catch (err) {
    console.error('[Create Room Error]', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error while creating room.'
    });
  }
});

/**
 * POST /api/topology-rooms/join
 * Joins a room using 4-digit code. Limits participants strictly to maxParticipants.
 */
router.post('/join', async (req, res) => {
  try {
    const { code, email, name = 'Researcher' } = req.body;

    if (!code || !email) {
      return res.status(400).json({
        success: false,
        message: 'Both 4-digit room code and user email are required to join.'
      });
    }

    const cleanCode = code.toString().trim();
    const cleanEmail = email.toLowerCase().trim();

    const room = await TopologyRoom.findOne({ code: cleanCode });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: `Simulation room with code "${cleanCode}" was not found. Please double-check the code.`
      });
    }

    // Check if user is already a participant
    const existingIdx = room.participants.findIndex(p => p.email === cleanEmail);

    if (existingIdx !== -1) {
      // Re-joining or refreshing presence
      room.participants[existingIdx].isOnline = true;
      room.participants[existingIdx].lastPing = new Date();
      if (name) room.participants[existingIdx].name = name;
      await room.save();

      return res.status(200).json({
        success: true,
        message: `Reconnected to room ${cleanCode}.`,
        room
      });
    }

    // Check capacity constraint requested by user:
    // "on creating lab, the user should be asked how many nodes are required and only let that number of people join room"
    if (room.participants.length >= room.maxParticipants) {
      return res.status(403).json({
        success: false,
        message: `Room ${cleanCode} is full. Exactly ${room.maxParticipants} participants are required for this lab and all slots are occupied.`
      });
    }

    // Find first node not currently assigned to any participant
    const assignedNodeIds = new Set(room.participants.map(p => p.nodeId).filter(Boolean));
    const availableNode = room.nodes.find(n => !assignedNodeIds.has(n.id)) || room.nodes[room.participants.length];

    const newParticipant = {
      email: cleanEmail,
      name: name || 'Station Operator',
      nodeId: availableNode ? availableNode.id : '',
      isOnline: true,
      lastPing: new Date()
    };

    room.participants.push(newParticipant);

    const nodeLabel = availableNode ? availableNode.label : 'Observer';
    room.logs.push({
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      message: `[JOIN] ${cleanEmail} joined room as Station ${nodeLabel}. (${room.participants.length}/${room.maxParticipants} connected)`,
      type: 'info'
    });

    await room.save();

    res.status(200).json({
      success: true,
      message: `Joined room ${cleanCode} as Station ${nodeLabel}!`,
      room
    });
  } catch (err) {
    console.error('[Join Room Error]', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error while joining room.'
    });
  }
});

/**
 * GET /api/topology-rooms/:code
 * Get current room status, heartbeat presence, and active simulation state
 */
router.get('/:code', async (req, res) => {
  try {
    const cleanCode = req.params.code.toString().trim();
    const room = await TopologyRoom.findOne({ code: cleanCode });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Simulation room not found.'
      });
    }

    // Check participant liveness (offline if last ping > 16s)
    let modified = false;
    const now = Date.now();
    room.participants.forEach(p => {
      const pingAge = now - new Date(p.lastPing).getTime();
      const shouldBeOnline = pingAge < 16000;
      if (p.isOnline !== shouldBeOnline) {
        p.isOnline = shouldBeOnline;
        modified = true;
      }
    });

    if (modified) {
      await room.save();
    }

    res.status(200).json({
      success: true,
      room
    });
  } catch (err) {
    console.error('[Get Room Error]', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }
});

/**
 * POST /api/topology-rooms/:code/ping
 * Heartbeat to maintain green live dot status
 */
router.post('/:code/ping', async (req, res) => {
  try {
    const cleanCode = req.params.code.toString().trim();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const room = await TopologyRoom.findOne({ code: cleanCode });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const participant = room.participants.find(p => p.email === cleanEmail);
    if (participant) {
      participant.isOnline = true;
      participant.lastPing = new Date();
      await room.save();
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/topology-rooms/:code/assign
 * Room owner assigns device roles and sets source and destination nodes
 */
router.post('/:code/assign', async (req, res) => {
  try {
    const cleanCode = req.params.code.toString().trim();
    const { hostEmail, assignments = [], sourceNodeId, targetNodeId, payloadText } = req.body;

    const room = await TopologyRoom.findOne({ code: cleanCode });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (cleanEmail(hostEmail) !== cleanEmail(room.hostEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Only the room creator / host can configure device roles.'
      });
    }

    // Apply assignments
    assignments.forEach(asgn => {
      const p = room.participants.find(part => cleanEmail(part.email) === cleanEmail(asgn.email));
      if (p) {
        p.nodeId = asgn.nodeId || '';
      }
    });

    if (sourceNodeId) room.sourceNodeId = sourceNodeId;
    if (targetNodeId) room.targetNodeId = targetNodeId;
    if (payloadText !== undefined) room.payloadText = payloadText;

    const srcNode = room.nodes.find(n => n.id === room.sourceNodeId);
    const tgtNode = room.nodes.find(n => n.id === room.targetNodeId);

    room.logs.push({
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      message: `[CONFIG] Roles updated. Source: Station ${srcNode?.label || 'A'} | Destination: Station ${tgtNode?.label || 'C'}`,
      type: 'info'
    });

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Node assignments and route configuration updated.',
      room
    });
  } catch (err) {
    console.error('[Assign Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/topology-rooms/:code/toggle-node
 * Room owner toggles a node between online and offline
 */
router.post('/:code/toggle-node', async (req, res) => {
  try {
    const cleanCode = req.params.code.toString().trim();
    const { hostEmail, nodeId, status } = req.body;

    const room = await TopologyRoom.findOne({ code: cleanCode });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (cleanEmail(hostEmail) !== cleanEmail(room.hostEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Only the room creator / host can toggle hardware health.'
      });
    }

    const targetNode = room.nodes.find(n => n.id === nodeId);
    if (!targetNode) {
      return res.status(404).json({ success: false, message: 'Node not found in room.' });
    }

    targetNode.status = status || (targetNode.status === 'online' ? 'offline' : 'online');

    room.logs.push({
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      message: `[FAULT INJECTION] Station ${targetNode.label} toggled to ${targetNode.status.toUpperCase()}.`,
      type: targetNode.status === 'online' ? 'success' : 'warning',
      atNode: targetNode.id
    });

    await room.save();

    res.status(200).json({
      success: true,
      message: `Station ${targetNode.label} is now ${targetNode.status}.`,
      room
    });
  } catch (err) {
    console.error('[Toggle Node Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/topology-rooms/:code/transmit
 * Triggers multi-device transmission across the topology
 */
router.post('/:code/transmit', async (req, res) => {
  try {
    const cleanCode = req.params.code.toString().trim();
    const { userEmail, payloadText, sourceNodeId, targetNodeId } = req.body;

    const room = await TopologyRoom.findOne({ code: cleanCode });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const payload = payloadText || room.payloadText || 'Hello Netrium';
    const srcId = sourceNodeId || room.sourceNodeId;
    const tgtId = targetNodeId || room.targetNodeId;

    room.payloadText = payload;
    room.sourceNodeId = srcId;
    room.targetNodeId = tgtId;

    // Calculate traversal path and per-node messages
    const result = calculateTopologyPath({
      topologyType: room.topologyType,
      nodes: room.nodes,
      sourceNodeId: srcId,
      targetNodeId: tgtId,
      payloadText: payload
    });

    if (!result.success) {
      room.simulation.status = 'idle';
      room.simulation.path = result.path || [srcId];
      room.simulation.stepMessages = result.stepMessages || [];
      room.simulation.lastAction = result.error;
      room.logs.push(...result.logs);
      await room.save();

      return res.status(400).json({
        success: false,
        message: result.error,
        room
      });
    }

    // Set active simulation
    room.simulation.status = 'running';
    room.simulation.path = result.path;
    room.simulation.currentStepIndex = 0;
    room.simulation.stepMessages = result.stepMessages;
    room.simulation.startedAt = new Date();
    room.simulation.updatedAt = new Date();
    room.simulation.currentHop = result.path.length > 1 ? {
      from: result.path[0],
      to: result.path[1],
      stepNumber: 1,
      totalSteps: result.path.length - 1
    } : { from: '', to: '', stepNumber: 0, totalSteps: 0 };

    room.simulation.lastAction = `Simulation running: ${result.pathLabels.join(' -> ')}`;

    // Append logs
    room.logs.push(...result.logs);

    await room.save();

    res.status(200).json({
      success: true,
      message: 'Simulation initiated across all devices.',
      room,
      result
    });
  } catch (err) {
    console.error('[Transmit Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/topology-rooms/:code/step
 * Advances the active hop step
 */
router.post('/:code/step', async (req, res) => {
  try {
    const cleanCode = req.params.code.toString().trim();
    const { stepIndex } = req.body;

    const room = await TopologyRoom.findOne({ code: cleanCode });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const path = room.simulation.path || [];
    const newIdx = typeof stepIndex === 'number' ? stepIndex : (room.simulation.currentStepIndex + 1);

    room.simulation.currentStepIndex = newIdx;
    room.simulation.updatedAt = new Date();

    if (newIdx >= path.length - 1) {
      room.simulation.status = 'completed';
      room.simulation.lastAction = 'Simulation completed. Data arrived at target destination.';
    } else {
      room.simulation.currentHop = {
        from: path[newIdx],
        to: path[newIdx + 1],
        stepNumber: newIdx + 1,
        totalSteps: path.length - 1
      };
    }

    await room.save();

    res.status(200).json({
      success: true,
      room
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/topology-rooms/:code/save
 * Saves the current collaborative lab into MongoDB
 */
router.post('/:code/save', async (req, res) => {
  try {
    const cleanCode = req.params.code.toString().trim();
    const { userEmail, userName, title, notes } = req.body;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'User email is required to save lab.' });
    }

    const room = await TopologyRoom.findOne({ code: cleanCode });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const nodeMap = new Map();
    room.nodes.forEach(n => nodeMap.set(n.id, n));

    const pathLabels = (room.simulation.path || []).map(id => nodeMap.get(id)?.label || id);
    const srcNode = nodeMap.get(room.sourceNodeId);
    const tgtNode = nodeMap.get(room.targetNodeId);

    const savedLab = new SavedLab({
      userEmail: cleanEmail(userEmail),
      userName: userName || 'Researcher',
      roomCode: room.code,
      topologyType: room.topologyType,
      title: title || `${room.topologyType.toUpperCase()} Multi-Device Collaborative Lab (${room.code})`,
      maxParticipants: room.maxParticipants,
      participants: room.participants.map(p => ({
        email: p.email,
        name: p.name,
        nodeId: p.nodeId,
        nodeLabel: nodeMap.get(p.nodeId)?.label || ''
      })),
      nodes: room.nodes,
      sourceNodeId: room.sourceNodeId,
      targetNodeId: room.targetNodeId,
      sourceLabel: srcNode?.label || 'A',
      targetLabel: tgtNode?.label || 'C',
      payloadText: room.payloadText,
      traversalPath: room.simulation.path,
      pathLabels,
      stepMessages: room.simulation.stepMessages,
      logs: room.logs,
      notes: notes || `Collaborative session with ${room.participants.length} connected devices.`
    });

    await savedLab.save();

    room.logs.push({
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      message: `[LAB SAVED] Session saved to "My Labs" for ${cleanEmail(userEmail)}.`,
      type: 'success'
    });
    await room.save();

    res.status(201).json({
      success: true,
      message: 'Lab successfully saved to your My Labs portfolio!',
      savedLab
    });
  } catch (err) {
    console.error('[Save Lab Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/topology-rooms/user/labs
 * Retrieve all saved labs for a specific user
 */
router.get('/user/labs', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email query parameter is required.' });
    }

    const labs = await SavedLab.find({ userEmail: cleanEmail(email) }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: labs.length,
      labs
    });
  } catch (err) {
    console.error('[Get Saved Labs Error]', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/topology-rooms/user/labs/:id
 * Remove a saved lab by ID
 */
router.delete('/user/labs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.query;

    const query = { _id: id };
    if (email) query.userEmail = cleanEmail(email);

    const deleted = await SavedLab.findOneAndDelete(query);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Saved lab not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Lab record deleted successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function cleanEmail(email) {
  return (email || '').toString().toLowerCase().trim();
}

export default router;
