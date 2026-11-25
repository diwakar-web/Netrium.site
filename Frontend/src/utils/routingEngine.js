// Pure Algorithmic Routing Engine for all 10 Routing Protocols
// Standardized for Netrium Computer Networks Laboratory

export const DEFAULT_ROUTERS = [
  { id: 'R1', name: 'Router 1 (West Border)', ip: '10.0.1.1', x: 80, y: 160, role: 'Border Gateway', area: 'Area 0' },
  { id: 'R2', name: 'Router 2 (Core Transit Alpha)', ip: '10.0.2.1', x: 260, y: 70, role: 'Core Backbone', area: 'Area 0' },
  { id: 'R3', name: 'Router 3 (Core Transit Beta)', ip: '10.0.3.1', x: 260, y: 250, role: 'Core Backbone', area: 'Area 0' },
  { id: 'R4', name: 'Router 4 (Aggregation East)', ip: '10.0.4.1', x: 440, y: 70, role: 'Aggregation', area: 'Area 1' },
  { id: 'R5', name: 'Router 5 (DC Distribution)', ip: '10.0.5.1', x: 440, y: 250, role: 'Distribution', area: 'Area 1' },
  { id: 'R6', name: 'Router 6 (Cloud Interconnect)', ip: '10.0.6.1', x: 620, y: 160, role: 'Cloud Edge', area: 'Area 1' }
];

export const DEFAULT_LINKS = [
  { id: 'R1-R2', source: 'R1', target: 'R2', cost: 10, bandwidth: 1000, delay: 2, status: 'active', subnet: '10.1.2.0/30' },
  { id: 'R1-R3', source: 'R1', target: 'R3', cost: 15, bandwidth: 100, delay: 12, status: 'active', subnet: '10.1.3.0/30' },
  { id: 'R2-R3', source: 'R2', target: 'R3', cost: 5, bandwidth: 10000, delay: 1, status: 'active', subnet: '10.2.3.0/30' },
  { id: 'R2-R4', source: 'R2', target: 'R4', cost: 20, bandwidth: 1000, delay: 5, status: 'active', subnet: '10.2.4.0/30' },
  { id: 'R3-R5', source: 'R3', target: 'R5', cost: 25, bandwidth: 100, delay: 18, status: 'active', subnet: '10.3.5.0/30' },
  { id: 'R4-R5', source: 'R4', target: 'R5', cost: 10, bandwidth: 1000, delay: 3, status: 'active', subnet: '10.4.5.0/30' },
  { id: 'R4-R6', source: 'R4', target: 'R6', cost: 10, bandwidth: 1000, delay: 4, status: 'active', subnet: '10.4.6.0/30' },
  { id: 'R5-R6', source: 'R5', target: 'R6', cost: 15, bandwidth: 1000, delay: 6, status: 'active', subnet: '10.5.6.0/30' }
];

// Helper: Calculate protocol-specific link cost/metric
export function getLinkMetric(algorithmId, link) {
  if (link.status === 'severed') return Infinity;

  switch (algorithmId) {
    case 'rip':
      return 1; // 1 hop per link
    case 'ospf':
      // Cost = 100 Mbps / Bandwidth (minimum cost 1)
      return Math.max(1, Math.round(100 / (link.bandwidth >= 100 ? link.bandwidth / 100 : 0.1)));
    case 'eigrp':
      // 256 * (10^7 / BW + Delay * 10)
      return Math.round(256 * (10000 / link.bandwidth + link.delay * 10));
    case 'static':
    case 'default':
    case 'bellman-ford':
    case 'dijkstra':
    case 'isis':
    case 'flooding':
    case 'random':
    default:
      return link.cost;
  }
}

// Compute global routing tables for all routers under given algorithm
export function computeAllRoutingTables(algorithmId, routers = DEFAULT_ROUTERS, links = DEFAULT_LINKS, severedLinkIds = []) {
  const tables = {};

  // Build adjacency graph
  const adj = {};
  routers.forEach(r => { adj[r.id] = []; });

  links.forEach(l => {
    const isSevered = severedLinkIds.includes(l.id) || l.status === 'severed';
    if (!isSevered) {
      const metric = getLinkMetric(algorithmId, l);
      adj[l.source].push({ neighbor: l.target, metric, delay: l.delay, linkId: l.id, subnet: l.subnet });
      adj[l.target].push({ neighbor: l.source, metric, delay: l.delay, linkId: l.id, subnet: l.subnet });
    }
  });

  // Calculate shortest path tree for each source router
  routers.forEach(src => {
    const dist = {};
    const prev = {};
    const nextHop = {};
    const egressLink = {};

    routers.forEach(r => {
      dist[r.id] = Infinity;
      prev[r.id] = null;
      nextHop[r.id] = null;
    });

    dist[src.id] = 0;

    // Dijkstra SPF computation
    const unvisited = new Set(routers.map(r => r.id));

    while (unvisited.size > 0) {
      let u = null;
      unvisited.forEach(node => {
        if (u === null || dist[node] < dist[u]) {
          u = node;
        }
      });

      if (dist[u] === Infinity) break;
      unvisited.delete(u);

      adj[u].forEach(edge => {
        const v = edge.neighbor;
        if (unvisited.has(v)) {
          const alt = dist[u] + edge.metric;
          if (alt < dist[v]) {
            dist[v] = alt;
            prev[v] = u;
          }
        }
      });
    }

    // Trace back next hops from source
    routers.forEach(dst => {
      if (dst.id !== src.id && dist[dst.id] !== Infinity) {
        let curr = dst.id;
        while (prev[curr] && prev[curr] !== src.id) {
          curr = prev[curr];
        }
        nextHop[dst.id] = curr;
        const matchingLink = links.find(l =>
          (l.source === src.id && l.target === curr) || (l.target === src.id && l.source === curr)
        );
        egressLink[dst.id] = matchingLink?.id || 'eth0';
      }
    });

    // Format routing table entries
    const tableEntries = [];

    // Protocol-specific administrative distance
    let ad = 110;
    if (algorithmId === 'static' || algorithmId === 'default') ad = 1;
    else if (algorithmId === 'rip') ad = 120;
    else if (algorithmId === 'eigrp') ad = 90;
    else if (algorithmId === 'isis') ad = 115;

    routers.forEach(dst => {
      if (dst.id === src.id) {
        tableEntries.push({
          destination: `${dst.ip.split('.').slice(0, 3).join('.')}.0/24`,
          prefix: dst.ip,
          routerId: dst.id,
          nextHop: 'Directly Connected',
          metric: 0,
          ad: 0,
          interface: 'Loopback0',
          protocol: 'Direct'
        });
      } else if (dist[dst.id] !== Infinity) {
        // Handle Default Routing: aggregate non-local destinations to 0.0.0.0/0
        if (algorithmId === 'default' && dst.id !== 'R2' && dst.id !== 'R3') {
          // Represented as default route
        } else {
          tableEntries.push({
            destination: `${dst.ip.split('.').slice(0, 3).join('.')}.0/24`,
            prefix: dst.ip,
            routerId: dst.id,
            nextHop: nextHop[dst.id] ? routers.find(r => r.id === nextHop[dst.id])?.ip || nextHop[dst.id] : 'Gateway',
            nextHopId: nextHop[dst.id],
            metric: dist[dst.id],
            ad,
            interface: egressLink[dst.id] || 'Gi0/1',
            protocol: algorithmId.toUpperCase()
          });
        }
      } else {
        tableEntries.push({
          destination: `${dst.ip.split('.').slice(0, 3).join('.')}.0/24`,
          prefix: dst.ip,
          routerId: dst.id,
          nextHop: 'Unreachable (Drop)',
          nextHopId: null,
          metric: algorithmId === 'rip' ? 16 : Infinity,
          ad,
          interface: 'Null0',
          protocol: algorithmId.toUpperCase()
        });
      }
    });

    // For Default Routing, add 0.0.0.0/0
    if (algorithmId === 'default') {
      tableEntries.push({
        destination: '0.0.0.0/0',
        prefix: 'Default Gateway',
        routerId: 'Internet',
        nextHop: '10.0.2.1 (R2 Backbone)',
        nextHopId: 'R2',
        metric: 1,
        ad: 1,
        interface: 'Gi0/0',
        protocol: 'STATIC*'
      });
    }

    tables[src.id] = tableEntries;
  });

  return tables;
}

// Trace packet forwarding from Source to Destination
export function tracePacketForwarding(sourceId, destId, routingTables, links = DEFAULT_LINKS) {
  if (sourceId === destId) {
    return {
      hops: [sourceId],
      totalLatency: 0.1,
      totalCost: 0,
      delivered: true,
      log: `Packet destination is local to ${sourceId}. Instant loopback delivery.`
    };
  }

  const hops = [sourceId];
  let current = sourceId;
  let totalLatency = 0;
  let totalCost = 0;
  const visited = new Set([sourceId]);
  let delivered = false;

  for (let i = 0; i < 10; i++) {
    const table = routingTables[current] || [];
    const entry = table.find(e => e.routerId === destId || (e.destination === '0.0.0.0/0' && !table.some(x => x.routerId === destId)));

    if (!entry || !entry.nextHopId || entry.nextHop === 'Unreachable (Drop)') {
      return {
        hops,
        totalLatency,
        totalCost,
        delivered: false,
        log: `Packet dropped at ${current}: No valid route to destination ${destId}.`
      };
    }

    const next = entry.nextHopId;
    const link = links.find(l =>
      (l.source === current && l.target === next) || (l.target === current && l.source === next)
    );

    if (link) {
      totalLatency += link.delay;
      totalCost += entry.metric;
    }

    hops.push(next);
    if (next === destId) {
      delivered = true;
      break;
    }

    if (visited.has(next)) {
      return {
        hops,
        totalLatency,
        totalCost,
        delivered: false,
        isLoop: true,
        log: `Routing Loop Detected! Packet cycled back to ${next}.`
      };
    }

    visited.add(next);
    current = next;
  }

  return {
    hops,
    totalLatency: Math.round(totalLatency * 10) / 10,
    totalCost,
    delivered,
    log: delivered
      ? `Packet successfully delivered along path: ${hops.join(' \u2192 ')} in ${totalLatency}ms.`
      : `Packet failed delivery after 10 hops.`
  };
}
