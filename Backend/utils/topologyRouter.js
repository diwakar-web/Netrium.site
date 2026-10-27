/**
 * Computes network path traversal based on topology architecture and active node states
 */
export function calculateTopologyPath({
  topologyType = 'ring',
  nodes = [],
  sourceNodeId,
  targetNodeId,
  payloadText = 'Hello Netrium'
}) {
  const nodeMap = new Map();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const sourceNode = nodeMap.get(sourceNodeId);
  const targetNode = nodeMap.get(targetNodeId);

  if (!sourceNode || !targetNode) {
    return {
      success: false,
      error: 'Invalid source or destination node specified.',
      path: [],
      pathLabels: [],
      stepMessages: [],
      logs: []
    };
  }

  if (sourceNode.status === 'offline') {
    return {
      success: false,
      error: `Sender Node ${sourceNode.label} is DOWN (Offline). Inactive nodes cannot transmit data.`,
      path: [sourceNode.id],
      pathLabels: [sourceNode.label],
      stepMessages: [],
      logs: [
        {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          message: `[ERROR] Transmission aborted: Source Node ${sourceNode.label} is offline.`,
          type: 'error',
          atNode: sourceNode.id
        }
      ]
    };
  }

  if (targetNode.status === 'offline') {
    return {
      success: false,
      error: `Destination Node ${targetNode.label} is DOWN (Offline). Packet cannot be acknowledged.`,
      path: [sourceNode.id],
      pathLabels: [sourceNode.label],
      stepMessages: [],
      logs: [
        {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          message: `[ERROR] Transmission aborted: Target Node ${targetNode.label} is offline.`,
          type: 'error',
          atNode: targetNode.id
        }
      ]
    };
  }

  if (sourceNodeId === targetNodeId) {
    return {
      success: true,
      path: [sourceNodeId],
      pathLabels: [sourceNode.label],
      stepMessages: [
        {
          nodeId: sourceNodeId,
          label: sourceNode.label,
          message: `Loopback test: Node ${sourceNode.label} received '${payloadText}' on local loopback interface 127.0.0.1`,
          role: 'loopback'
        }
      ],
      logs: [
        {
          id: Date.now().toString(),
          time: new Date().toLocaleTimeString(),
          message: `[LOOPBACK] Node ${sourceNode.label} pinged local loopback interface with payload "${payloadText}"`,
          type: 'info'
        }
      ]
    };
  }

  let path = [];

  switch (topologyType) {
    case 'ring': {
      // Ordered ring list
      const nList = [...nodes];
      const srcIdx = nList.findIndex(n => n.id === sourceNodeId);
      const dstIdx = nList.findIndex(n => n.id === targetNodeId);

      // Traversal clockwise along active nodes
      const candidatePath = [nList[srcIdx].id];
      let curr = srcIdx;
      let reached = false;
      let hops = 0;
      const maxHops = nList.length * 2;

      while (!reached && hops < maxHops) {
        curr = (curr + 1) % nList.length;
        hops++;
        const candidate = nList[curr];
        if (candidate.status === 'online') {
          candidatePath.push(candidate.id);
          if (candidate.id === targetNodeId) {
            reached = true;
          }
        }
      }

      if (reached) {
        path = candidatePath;
      } else {
        path = [sourceNodeId];
      }
      break;
    }

    case 'star': {
      // Find central switch/hub
      const hub = nodes.find(n => n.role === 'hub') || nodes[0];
      if (hub.status === 'offline') {
        return {
          success: false,
          error: `Central Hub Node ${hub.label} is DOWN (Offline). Star switch fabric disconnected.`,
          path: [sourceNode.id],
          pathLabels: [sourceNode.label],
          stepMessages: [],
          logs: [
            {
              id: Date.now().toString(),
              time: new Date().toLocaleTimeString(),
              message: `[STAR FAILURE] Transmission failed: Central Hub Node ${hub.label} is offline (Single Point of Failure).`,
              type: 'error'
            }
          ]
        };
      }

      if (sourceNodeId === hub.id) {
        path = [hub.id, targetNodeId];
      } else if (targetNodeId === hub.id) {
        path = [sourceNodeId, hub.id];
      } else {
        path = [sourceNodeId, hub.id, targetNodeId];
      }
      break;
    }

    case 'bus': {
      // Linear bus
      const nList = [...nodes];
      const srcIdx = nList.findIndex(n => n.id === sourceNodeId);
      const dstIdx = nList.findIndex(n => n.id === targetNodeId);
      const stepDir = srcIdx < dstIdx ? 1 : -1;

      path = [];
      for (let i = srcIdx; ; i += stepDir) {
        const n = nList[i];
        if (n.status === 'online') {
          path.push(n.id);
        }
        if (i === dstIdx) break;
      }
      break;
    }

    case 'mesh': {
      // Mesh: Direct link if both online
      path = [sourceNodeId, targetNodeId];
      break;
    }

    case 'tree': {
      const root = nodes.find(n => n.role === 'root') || nodes[0];
      if (root.status === 'offline') {
        return {
          success: false,
          error: `Root Switch Node ${root.label} is DOWN. Inter-branch routing severed.`,
          path: [sourceNode.id],
          pathLabels: [sourceNode.label],
          stepMessages: [],
          logs: [
            {
              id: Date.now().toString(),
              time: new Date().toLocaleTimeString(),
              message: `[TREE FAILURE] Root Switch Node ${root.label} is offline. Routing hierarchy unreachable.`,
              type: 'error'
            }
          ]
        };
      }
      if (sourceNodeId === root.id) {
        path = [root.id, targetNodeId];
      } else if (targetNodeId === root.id) {
        path = [sourceNodeId, root.id];
      } else {
        path = [sourceNodeId, root.id, targetNodeId];
      }
      break;
    }

    case 'hybrid':
    default: {
      const bridge = nodes.find(n => n.role === 'hub') || nodes[0];
      if (sourceNodeId === bridge.id || targetNodeId === bridge.id) {
        path = [sourceNodeId, targetNodeId];
      } else {
        path = [sourceNodeId, bridge.id, targetNodeId];
      }
      break;
    }
  }

  const pathLabels = path.map(id => nodeMap.get(id)?.label || id);
  const logs = [];
  const stepMessages = [];
  const timestamp = new Date().toLocaleTimeString();

  // Create step-by-step logs and per-node message display
  logs.push({
    id: Date.now().toString() + '-0',
    time: timestamp,
    message: `[SESSION START] Simulation initiated across ${path.length} hops. Traversal path: ${pathLabels.join(' -> ')}`,
    type: 'info'
  });

  for (let i = 0; i < path.length; i++) {
    const currId = path[i];
    const currNode = nodeMap.get(currId);
    const currLabel = currNode?.label || currId;

    if (i === 0) {
      // Source node
      const nextId = path[i + 1];
      const nextNode = nodeMap.get(nextId);
      const nextLabel = nextNode?.label || nextId;

      logs.push({
        id: `${Date.now()}-${i}-send`,
        time: timestamp,
        message: `Station ${currLabel} sent "${payloadText}" to Station ${nextLabel}`,
        type: 'transfer',
        fromNode: currId,
        toNode: nextId
      });

      stepMessages.push({
        nodeId: currId,
        label: currLabel,
        role: 'sender',
        displayText: `"${payloadText}" is transferred to Node ${nextLabel}`,
        summary: `Transmitted payload to Node ${nextLabel}`
      });
    } else if (i === path.length - 1) {
      // Final destination node
      const prevId = path[i - 1];
      const prevNode = nodeMap.get(prevId);
      const prevLabel = prevNode?.label || prevId;

      logs.push({
        id: `${Date.now()}-${i}-recv`,
        time: timestamp,
        message: `Station ${currLabel} received "${payloadText}" from Station ${prevLabel} [DESTINATION REACHED]`,
        type: 'success',
        fromNode: prevId,
        toNode: currId,
        atNode: currId
      });

      stepMessages.push({
        nodeId: currId,
        label: currLabel,
        role: 'receiver',
        displayText: `"${payloadText}" received from Node ${prevLabel}`,
        summary: `Target reached! Acknowledged "${payloadText}" from Node ${prevLabel}`
      });
    } else {
      // Intermediate relay node
      const prevId = path[i - 1];
      const prevNode = nodeMap.get(prevId);
      const prevLabel = prevNode?.label || prevId;

      const nextId = path[i + 1];
      const nextNode = nodeMap.get(nextId);
      const nextLabel = nextNode?.label || nextId;

      logs.push({
        id: `${Date.now()}-${i}-recv`,
        time: timestamp,
        message: `Station ${currLabel} received "${payloadText}" from Station ${prevLabel}`,
        type: 'receive',
        fromNode: prevId,
        atNode: currId
      });

      logs.push({
        id: `${Date.now()}-${i}-fwd`,
        time: timestamp,
        message: `Station ${currLabel} forwarded "${payloadText}" to Station ${nextLabel}`,
        type: 'transfer',
        fromNode: currId,
        toNode: nextId
      });

      stepMessages.push({
        nodeId: currId,
        label: currLabel,
        role: 'relay',
        displayText: `"${payloadText}" received from Node ${prevLabel} \u2192 "${payloadText}" is transferred to Node ${nextLabel}`,
        summary: `Relaying payload from Node ${prevLabel} to Node ${nextLabel}`
      });
    }
  }

  // Also include idle/bypassed nodes in stepMessages so their devices display proper status
  nodes.forEach(n => {
    if (!path.includes(n.id)) {
      stepMessages.push({
        nodeId: n.id,
        label: n.label,
        role: n.status === 'offline' ? 'offline' : 'idle',
        displayText: n.status === 'offline' 
          ? `Station Offline \u2014 Bypassed in topology traversal`
          : `Station Idle \u2014 Listening on shared broadcast medium`,
        summary: n.status === 'offline' ? 'Station Offline' : 'Station Idle'
      });
    }
  });

  return {
    success: true,
    path,
    pathLabels,
    stepMessages,
    logs
  };
}
