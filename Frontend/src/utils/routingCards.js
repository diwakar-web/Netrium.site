// Routing Protocols Metadata for HoloCard Showcase Hub

export const ROUTING_SECTIONS = {
  ALL: 'all',
  DISTANCE_VECTOR: 'distance_vector',
  LINK_STATE: 'link_state',
  STATIC_HEURISTIC: 'static_heuristic'
};

export const ROUTING_CARDS = {
  static: {
    id: 'static',
    name: 'Static Routing',
    shortName: 'Static Routing',
    section: ROUTING_SECTIONS.STATIC_HEURISTIC,
    category: 'Manual Configuration',
    preset: 'bursts',
    foilColor: '#38bdf8',
    iconName: 'Shield',
    adminDistance: 1,
    standard: 'RFC 1812',
    description: 'Manual prefix configuration by network administrator. Delivers deterministic path control and zero protocol CPU/bandwidth overhead.',
    specs: [
      { label: 'Admin Distance', value: '1' },
      { label: 'Protocol Traffic', value: '0 kbps' },
      { label: 'Convergence', value: 'Manual' }
    ]
  },
  default: {
    id: 'default',
    name: 'Default Routing (0.0.0.0/0)',
    shortName: 'Default Route',
    section: ROUTING_SECTIONS.STATIC_HEURISTIC,
    category: 'Gateway of Last Resort',
    preset: 'gold',
    foilColor: '#f59e0b',
    iconName: 'Server',
    adminDistance: 1,
    standard: 'RFC 1812 / RFC 791',
    description: 'Consolidates all non-local Internet traffic to a Gateway of Last Resort. Prevents routing table bloat in stub and edge networks.',
    specs: [
      { label: 'Prefix Mask', value: '0.0.0.0/0' },
      { label: 'Table Size', value: '1 Route Entry' },
      { label: 'Admin Distance', value: '1' }
    ]
  },
  flooding: {
    id: 'flooding',
    name: 'Flooding Algorithm',
    shortName: 'Flooding',
    section: ROUTING_SECTIONS.STATIC_HEURISTIC,
    category: 'Heuristic Broadcast',
    preset: 'glitter',
    foilColor: '#ec4899',
    iconName: 'Radio',
    adminDistance: 'N/A',
    standard: 'Broadcast / Multicast',
    description: 'Replicates incoming packets out all egress interfaces. Guarantees finding the fastest path with zero routing table state.',
    specs: [
      { label: 'Delivery Guarantee', value: 'Optimal Latency' },
      { label: 'Loop Prevention', value: 'TTL + Seq Cache' },
      { label: 'Overhead', value: 'High Broadcast' }
    ]
  },
  random: {
    id: 'random',
    name: 'Random Routing',
    shortName: 'Random Routing',
    section: ROUTING_SECTIONS.STATIC_HEURISTIC,
    category: 'Probabilistic Forwarding',
    preset: 'shards',
    foilColor: '#a855f7',
    iconName: 'GitFork',
    adminDistance: 'N/A',
    standard: 'Probabilistic Forwarding',
    description: 'Forwards packets out randomly chosen interfaces. Eliminates route tables and provides strong defense against traffic analysis.',
    specs: [
      { label: 'Table Memory', value: '0 Bytes' },
      { label: 'Load Balance', value: 'Uniform' },
      { label: 'Security', value: 'Anti-Snooping' }
    ]
  },
  'bellman-ford': {
    id: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    shortName: 'Bellman-Ford',
    section: ROUTING_SECTIONS.DISTANCE_VECTOR,
    category: 'Distance Vector Foundation',
    preset: 'stars',
    foilColor: '#00bf63',
    iconName: 'Activity',
    adminDistance: 'Algorithm Basis',
    standard: 'Dynamic Programming',
    description: 'Shortest path computation over |V|-1 iterative relaxations. Solves networks with negative edge weights and detects negative cycles.',
    specs: [
      { label: 'Iterations', value: '|V| - 1 Rounds' },
      { label: 'Negative Weights', value: 'Supported' },
      { label: 'Complexity', value: 'O(V · E)' }
    ]
  },
  rip: {
    id: 'rip',
    name: 'Routing Information Protocol (RIP)',
    shortName: 'RIPv2',
    section: ROUTING_SECTIONS.DISTANCE_VECTOR,
    category: 'Distance Vector Protocol',
    preset: 'cosmos',
    foilColor: '#06b6d4',
    iconName: 'Repeat',
    adminDistance: 120,
    standard: 'RFC 1058 / RFC 2453',
    description: 'Classic interior gateway protocol using hop count metric (max 15 hops, 16=infinity). Multicasts full tables every 30 seconds via UDP 520.',
    specs: [
      { label: 'Metric', value: 'Hop Count (1-15)' },
      { label: 'Admin Distance', value: '120' },
      { label: 'Update Interval', value: '30s Broadcast' }
    ]
  },
  eigrp: {
    id: 'eigrp',
    name: 'Enhanced Interior Gateway Routing (EIGRP)',
    shortName: 'EIGRP',
    section: ROUTING_SECTIONS.DISTANCE_VECTOR,
    category: 'Advanced Distance Vector / Hybrid',
    preset: 'gold',
    foilColor: '#eab308',
    iconName: 'Zap',
    adminDistance: 90,
    standard: 'Cisco / RFC 7868',
    description: 'High-performance hybrid protocol powered by DUAL algorithm. Feasible Successor enables instantaneous zero-downtime convergence.',
    specs: [
      { label: 'Convergence', value: 'Sub-second (Instant)' },
      { label: 'Admin Distance', value: '90 (Internal)' },
      { label: 'Metric Type', value: 'Composite BW/Delay' }
    ]
  },
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's Shortest Path Algorithm (SPF)",
    shortName: "Dijkstra's SPF",
    section: ROUTING_SECTIONS.LINK_STATE,
    category: 'Link-State Foundation',
    preset: 'rainbow',
    foilColor: '#10b981',
    iconName: 'Cpu',
    adminDistance: 'Algorithm Basis',
    standard: 'Dijkstra (1959)',
    description: 'Constructs a Shortest Path Tree (SPT) from synchronized link-state topology maps using priority-queue tentative distance relaxation.',
    specs: [
      { label: 'Complexity', value: 'O((V+E) log V)' },
      { label: 'Loop Freedom', value: 'Guaranteed' },
      { label: 'Engine of', value: 'OSPF & IS-IS' }
    ]
  },
  ospf: {
    id: 'ospf',
    name: 'Open Shortest Path First (OSPF)',
    shortName: 'OSPFv2 / OSPFv3',
    section: ROUTING_SECTIONS.LINK_STATE,
    category: 'Link-State Protocol',
    preset: 'stars',
    foilColor: '#00bf63',
    iconName: 'Network',
    adminDistance: 110,
    standard: 'RFC 2328 / RFC 5340',
    description: 'Enterprise standard IGP. Floods LSAs, builds identical link-state database (LSDB), and runs Dijkstra SPF over hierarchical Area 0 backbones.',
    specs: [
      { label: 'Admin Distance', value: '110' },
      { label: 'Hierarchy', value: 'Area 0 Backbone' },
      { label: 'Optimization', value: 'DR / BDR Election' }
    ]
  },
  isis: {
    id: 'isis',
    name: 'Intermediate System to Intermediate System (IS-IS)',
    shortName: 'IS-IS',
    section: ROUTING_SECTIONS.LINK_STATE,
    category: 'Carrier Link-State Protocol',
    preset: 'glitter',
    foilColor: '#38bdf8',
    iconName: 'Layers',
    adminDistance: 115,
    standard: 'ISO/IEC 10589 / RFC 1195',
    description: 'Gold standard for Tier-1 ISP backbones. Encapsulates directly in Layer 2 frames with extensible TLVs, immune to IP stack crashes.',
    specs: [
      { label: 'Transport', value: 'Layer 2 Direct' },
      { label: 'Admin Distance', value: '115' },
      { label: 'Deployment', value: 'Tier-1 ISPs & Telco' }
    ]
  }
};
