// Routing Algorithms Architectural Curriculum & Theories Specification
// Standardized for Netrium Computer Networks Laboratory

export const ROUTING_ALGORITHMS = [
  {
    id: 'static',
    name: 'Static Routing',
    shortName: 'Static',
    category: 'Manual Configuration',
    complexity: 'O(1) Route Lookup',
    adminDistance: 1,
    standard: 'RFC 1812 (IPv4 Router Requirements)',
    metricType: 'Administrative Preference (Metric = 0)',
    leadSummary: 'Manual configuration of network paths by a network administrator. Routes do not automatically adapt to network topology changes or link failures, providing absolute control at the cost of zero self-healing capability.',
    concept: 'In static routing, every path to a remote destination network must be explicitly entered into each router table. Because routers exchange zero routing protocol packets, static routing introduces zero CPU overhead and zero bandwidth consumption, but requires manual intervention during fiber cuts.',
    signalPhysics: {
      title: 'Static Prefix Matching & Next-Hop Binding',
      description: 'The router matches destination IP against configured prefix table and forwards directly out the egress interface.',
      facts: [
        { label: 'Administrative Distance', val: '1 (Higher priority than all dynamic protocols)' },
        { label: 'Bandwidth Overhead', val: '0 kbps (Zero protocol packets transmitted)' },
        { label: 'Fault Tolerance', val: 'None without Floating Static / IP SLA tracking' },
        { label: 'Convergence Time', val: 'Infinite (Requires human administrator intervention)' }
      ]
    },
    mathematics: {
      title: 'Longest Prefix Match (LPM) Lookup',
      formula: 'NextHop = RouteTable[ LongestMatchingPrefix(DestinationIP) ]',
      description: 'Routing lookup performs a bitwise AND between destination IP and subnet mask, picking the entry with the highest mask length.'
    },
    pros: [
      'Zero CPU, memory, and bandwidth protocol overhead on routing hardware',
      'Absolute deterministic path control for security-sensitive traffic',
      'Immune to rogue routing protocol advertisement injection attacks'
    ],
    cons: [
      'Does not self-heal or reroute around broken links automatically',
      'Administrative overhead scales quadratically O(N²) as network grows',
      'Configuration errors easily result in routing black holes or persistent loops'
    ],
    industryDeployment: 'Stub networks, customer-to-ISP edge handoffs, out-of-band management networks, and secure defense gateways.'
  },
  {
    id: 'default',
    name: 'Default Routing (Gateway of Last Resort)',
    shortName: 'Default Route',
    category: 'Gateway of Last Resort',
    complexity: 'O(1)',
    adminDistance: 1,
    standard: 'RFC 1812 / RFC 791 (IPv4 0.0.0.0/0)',
    metricType: 'Default Forwarder',
    leadSummary: 'Directs all packets with destination addresses that do not match any explicit entry in the routing table to a designated next-hop gateway (Gateway of Last Resort 0.0.0.0/0).',
    concept: 'Default routing prevents routing tables from exploding in size by consolidating all non-local Internet traffic toward an upstream transit provider. Instead of storing 900,000+ global BGP routes, edge routers forward unknown prefixes to their upstream provider router.',
    signalPhysics: {
      title: 'Wildcard Mask Matching (0.0.0.0/0)',
      description: 'Matches all destination IPs (mask length /0 matches 0 bits). Tested last after all specific subnet masks fail to match.',
      facts: [
        { label: 'CIDR Prefix', val: '0.0.0.0/0 (IPv4) or ::/0 (IPv6)' },
        { label: 'Table Footprint', val: '1 Single Route Entry' },
        { label: 'Hierarchy Position', val: 'Gateway of Last Resort' },
        { label: 'Lookup Priority', val: 'Lowest priority (Lowest prefix length)' }
      ]
    },
    mathematics: {
      title: 'Fallback Forwarding Rule',
      formula: 'Forwarding(IP) = (IP & 0.0.0.0 == 0.0.0.0) → GatewayOfLastResort',
      description: 'Because the bitwise AND of any 32-bit IPv4 address with 0.0.0.0 always equals 0.0.0.0, the rule universally matches any packet.'
    },
    pros: [
      'Reduces router memory footprint from hundreds of thousands of routes to 1 entry',
      'Ideal for stub networks and branch offices with only a single upstream ISP link',
      'Minimizes route lookup latency in hardware forwarding tables (TCAM)'
    ],
    cons: [
      'Traffic can be sent to dead-end gateways if upstream provider link fails',
      'Cannot perform intelligent multi-path traffic balancing across multiple ISPs',
      'Creates persistent routing loops if two adjacent routers point default routes to each other'
    ],
    industryDeployment: 'Consumer home routers (Wi-Fi access points), enterprise branch office customer premises equipment (CPE).'
  },
  {
    id: 'flooding',
    name: 'Flooding Algorithm',
    shortName: 'Flooding',
    category: 'Heuristic Broadcast',
    complexity: 'O(E)',
    adminDistance: 'N/A',
    standard: 'Broadcast / Multicast Foundation',
    metricType: 'Hop Count / TTL Exhaustion',
    leadSummary: 'Every incoming packet is replicated and transmitted onto every outgoing link except the one it arrived on. Guarantees delivery along the fastest physical path, but generates massive network duplication without hop-count limits.',
    concept: 'Controlled flooding uses a Time-To-Live (TTL) or hop counter decremented at each node, combined with a sequence number cache to discard duplicate packets already seen. It requires zero routing table knowledge and serves as the emergency dissemination mechanism for military command and OSPF LSA distribution.',
    signalPhysics: {
      title: 'Omnidirectional Packet Dispersion',
      description: 'Packets fan out across all adjacent interfaces in parallel. The earliest copy to arrive at the destination naturally traversed the shortest path.',
      facts: [
        { label: 'Path Finding', val: 'Guaranteed to find optimal shortest latency path' },
        { label: 'Control Overhead', val: 'Severe broadcast storm risk if unconstrained' },
        { label: 'State Tracking', val: 'Sequence number cache per source node' },
        { label: 'Loop Prevention', val: 'Hop-count TTL + Duplicate Sequence Filter' }
      ]
    },
    mathematics: {
      title: 'Packet Duplication Exponential Factor',
      formula: 'Duplications ≈ d · (d - 1)^{TTL - 1}   (where d = node degree)',
      description: 'Without duplicate packet filtering, packet volume grows exponentially with hop count, leading to catastrophic broadcast storms.'
    },
    pros: [
      'Extremely robust: delivers packets even if massive topology failures occur',
      'Always finds the lowest-latency path because the first packet arrival wins',
      'Requires zero routing tables or discovery protocol state'
    ],
    cons: [
      'Generates overwhelming duplicate traffic, consuming massive link bandwidth',
      'Can cause network broadcast storms and switch CPU saturation',
      'Nodes must maintain sequence number history tables to discard duplicate packets'
    ],
    industryDeployment: 'OSPF Link-State Advertisement (LSA) flooding, peer-to-peer gossip protocols (Bitcoin, BitTorrent), ad-hoc sensor networks (WSN).'
  },
  {
    id: 'random',
    name: 'Random Routing',
    shortName: 'Random Routing',
    category: 'Probabilistic',
    complexity: 'O(1)',
    adminDistance: 'N/A',
    standard: 'Probabilistic Forwarding',
    metricType: 'Random Interface Selection',
    leadSummary: 'When a packet arrives at an intermediate node, the outgoing link is selected at random from among all candidate links (optionally excluding the arrival link).',
    concept: 'Random routing eliminates the need to compute shortest paths or maintain distributed state tables. While inefficient for latency-sensitive traffic, it distributes load across all available network links and provides strong security against traffic analysis eavesdropping.',
    signalPhysics: {
      title: 'Stochastic Forwarding Dispersion',
      description: 'A uniform pseudo-random number generator selects the egress interface index, spreading network load evenly across meshed topology links.',
      facts: [
        { label: 'Forwarding Logic', val: 'Uniform or weighted random selection' },
        { label: 'Table State', val: 'None (Zero routing table footprint)' },
        { label: 'Traffic Analysis Defense', val: 'Outstanding (Unpredictable packet paths)' },
        { label: 'Hop Count Variance', val: 'Very high (Packets can wander)' }
      ]
    },
    mathematics: {
      title: 'Forwarding Probability Distribution',
      formula: 'P(Interface_i) = Bandwidth_i / ∑ Bandwidth_j',
      description: 'Packets are probabilistically distributed proportionally to interface capacity.'
    },
    pros: [
      'Zero routing table storage overhead and zero protocol exchange messages',
      'Highly resistant to traffic analysis and surveillance eavesdropping',
      'Naturally balances traffic across all available redundant mesh links'
    ],
    cons: [
      'Packets can take highly suboptimal, meandering paths to destinations',
      'Significantly increases average latency and packet reordering at destination',
      'Requires hop-limit TTL to prevent orphaned packets from wandering forever'
    ],
    industryDeployment: 'Military low-probability-of-intercept networks, decentralized anonymity mixes, and opportunistic delay-tolerant networks (DTN).'
  },
  {
    id: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    shortName: 'Bellman-Ford',
    category: 'Distance Vector Foundation',
    complexity: 'O(V · E)',
    adminDistance: 'Algorithm Basis',
    standard: 'Dynamic Programming Shortest Path',
    metricType: 'Additive Link Cost Relaxation',
    leadSummary: 'Computes shortest paths from a single source vertex to all other vertices in a weighted digraph. Unlike Dijkstra, Bellman-Ford can handle graphs with negative edge weights and detect negative-weight cycles.',
    concept: 'Bellman-Ford repeatedly relaxes all edges across |V| - 1 iterations. In distributed routing, each router shares its distance vector (a list of known destinations and costs) with its immediate neighbors. Iterative exchanges converge to the globally optimal routing table.',
    signalPhysics: {
      title: 'Iterative Distance Vector Relaxation',
      description: 'Every node repeatedly exchanges its vector D with direct neighbors. If neighbor v offers a lower cost to destination d, node u updates D[u, d] = cost(u, v) + D[v, d].',
      facts: [
        { label: 'Iterations to Converge', val: '|V| - 1 relaxation rounds' },
        { label: 'Negative Weights', val: 'Supported (Detects negative cycles)' },
        { label: 'Exchange Scope', val: 'Direct neighbors only (Local view)' },
        { label: 'Basis of', val: 'Routing Information Protocol (RIP)' }
      ]
    },
    mathematics: {
      title: 'Bellman-Ford Relaxation Equation',
      formula: 'D_x(y) = min_v { c(x, v) + D_v(y) }   ∀ neighbors v of x',
      description: 'A node x estimates its minimum distance to y by minimizing the sum of the direct link cost to neighbor v plus neighbor v distance estimate to y.'
    },
    pros: [
      'Capable of handling negative edge costs and detecting negative-weight loops',
      'Distributed implementation requires nodes to communicate only with direct neighbors',
      'Simple, elegant dynamic programming structure with well-understood mathematics'
    ],
    cons: [
      'Slow convergence time on large topologies (O(V·E) complexity)',
      'Vulnerable to the Count-to-Infinity problem when link costs increase',
      'Routing loops can persist temporarily during link state transitions'
    ],
    industryDeployment: 'Theoretical foundation of Distance Vector routing protocols (RIP, Cisco IGRP), distributed graph analysis.'
  },
  {
    id: 'rip',
    name: 'Routing Information Protocol (RIPv1 / RIPv2 / RIPng)',
    shortName: 'RIP',
    category: 'Distance Vector Protocol',
    complexity: 'O(V · E)',
    adminDistance: 120,
    standard: 'RFC 1058 (RIPv1) / RFC 2453 (RIPv2) / RFC 2080 (RIPng)',
    metricType: 'Hop Count (Maximum 15 Hops)',
    leadSummary: 'A classic interior gateway distance vector protocol. Uses hop count as its sole metric, with a maximum allowable hop count of 15 (16 represents infinity/unreachable). Broadcasts or multicasts its complete routing table every 30 seconds.',
    concept: 'RIP is exceptionally easy to configure and maintain in small, homogeneous networks. To mitigate the Count-to-Infinity problem, RIP implements Split Horizon, Poison Reverse, and Holddown Timers. However, because it ignores link bandwidth (treating 10 Gbps fiber the same as a 56 kbps line), it is obsolete in modern enterprise backbones.',
    signalPhysics: {
      title: 'Periodic 30-Second Table Broadcasts',
      description: 'Routers advertise their full table via UDP port 520 (multicast 224.0.0.9). Routes expire if no update is received within 180 seconds (Dead Timer).',
      facts: [
        { label: 'Metric Metric', val: 'Hop Count only (1 to 15 hops)' },
        { label: 'Infinity Ceiling', val: '16 Hops = Unreachable' },
        { label: 'Update Interval', val: 'Periodic every 30 seconds' },
        { label: 'Loop Prevention', val: 'Split Horizon & Poison Reverse' }
      ]
    },
    mathematics: {
      title: 'Hop Count Increment Rule',
      formula: 'Metric(Destination) = min( HopCount_received + 1, 16 )',
      description: 'Any route with metric >= 16 is discarded as unreachable, bounding the Count-to-Infinity duration to 16 iterations.'
    },
    pros: [
      'Extremely simple configuration with virtually zero tuning required',
      'Universally supported by virtually every legacy router, switch, and Unix server',
      'Low CPU and memory demands on constrained embedded hardware'
    ],
    cons: [
      'Hop count completely ignores bandwidth: prefers slow 1-hop dialup over fast 2-hop fiber',
      'Strict maximum distance of 15 hops limits network diameter severely',
      'Slow convergence (can take minutes to recover from broken links)'
    ],
    industryDeployment: 'Small office / home office (SOHO) networks, legacy campus access switches, embedded IoT hubs.'
  },
  {
    id: 'eigrp',
    name: 'Enhanced Interior Gateway Routing Protocol (EIGRP)',
    shortName: 'EIGRP',
    category: 'Advanced Distance Vector / Hybrid',
    complexity: 'O(log V)',
    adminDistance: 90,
    standard: 'Cisco Proprietary / RFC 7868 (Informational Open EIGRP)',
    metricType: 'Composite: 256 * (10^7 / MinBW + SumDelay)',
    leadSummary: 'Cisco high-performance hybrid routing protocol powered by the Diffusing Update Algorithm (DUAL). Combines the fast convergence and loop-freedom of link-state protocols with the low overhead of distance-vector protocols.',
    concept: 'EIGRP maintains neighbor relationships via Hello packets (Protocol 88, multicast 224.0.0.10). It calculates a Feasible Successor (a pre-computed backup loop-free route): if the primary Successor fails, the backup route is installed immediately with sub-second zero-downtime convergence.',
    signalPhysics: {
      title: 'DUAL Finite State Machine & Feasible Successor',
      description: 'Calculates Reported Distance (RD) and Feasible Distance (FD). If neighbor RD < current FD (Feasibility Condition), neighbor is guaranteed loop-free backup.',
      facts: [
        { label: 'Convergence Time', val: 'Sub-second (Instantaneous via Feasible Successor)' },
        { label: 'Administrative Distance', val: '90 (Internal), 170 (External)' },
        { label: 'Transport Protocol', val: 'RTP (Reliable Transport Protocol, IP proto 88)' },
        { label: 'Update Mechanism', val: 'Partial, bounded updates (Zero periodic broadcast)' }
      ]
    },
    mathematics: {
      title: 'EIGRP Composite Metric Formula',
      formula: 'Metric = 256 · [ (10^7 / MinBandwidth_kbps) + (SumDelay_µs / 10) ]',
      description: 'Accounts for both the bottleneck bandwidth along the entire path and the cumulative propagation delay.'
    },
    pros: [
      'Sub-second, instant convergence when a Feasible Successor exists',
      'Sends only partial, bounded updates when changes occur (zero periodic flooding)',
      'Supports unequal-cost load balancing (variance multiplier)'
    ],
    cons: [
      'Historically Cisco-proprietary, reducing multi-vendor interoperability',
      'More complex state machine (DUAL Active/Passive transitions) than simple protocols',
      'Can enter stuck-in-active (SIA) state if query packets are lost during deep recalculations'
    ],
    industryDeployment: 'Large Cisco enterprise corporate backbones, banking networks, and regional campus WANs.'
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Shortest Path Algorithm (SPF)",
    shortName: "Dijkstra's SPF",
    category: 'Link-State Foundation',
    complexity: 'O((V + E) log V) with Min-Heap',
    adminDistance: 'Algorithm Basis',
    standard: 'Edsger W. Dijkstra (1959)',
    metricType: 'Shortest Path Tree (SPT) Cost Minimization',
    leadSummary: 'Finds the shortest paths between nodes in a graph with non-negative edge costs. Serves as the mathematical engine powering all modern Link-State routing protocols including OSPF and IS-IS.',
    concept: 'Every router maintains a complete, identical map of the entire network topology. Dijkstra algorithm constructs a Shortest Path Tree (SPT) with the local router as the root. It iteratively extracts the unvisited node with the smallest tentative distance and relaxes its neighbors.',
    signalPhysics: {
      title: 'Priority Queue Min-Heap Relaxation',
      description: 'Maintains Tentative (unvisited) and Confirmed (visited) sets. At each step, the cheapest tentative node is moved to confirmed and its outbound links are evaluated.',
      facts: [
        { label: 'Graph Requirement', val: 'Complete global topology database (LSDB)' },
        { label: 'Edge Weights', val: 'Must be non-negative (cost ≥ 0)' },
        { label: 'Tree Output', val: 'Spanning tree of minimum cost paths to all destinations' },
        { label: 'Loop Freedom', val: 'Mathematically guaranteed at steady state' }
      ]
    },
    mathematics: {
      title: 'Tentative Distance Relaxation',
      formula: 'if (dist[u] + cost(u, v) < dist[v]) { dist[v] = dist[u] + cost(u, v); prev[v] = u; }',
      description: 'Relaxes neighbor node v if traversing through confirmed node u yields a strictly lower cumulative path metric.'
    },
    pros: [
      'Guarantees optimal, mathematically shortest paths to all destinations',
      'Fast convergence with zero routing loops at steady state',
      'Local computation eliminates reliance on second-hand distance rumors'
    ],
    cons: [
      'Requires substantial CPU and memory to store full topology and run Dijkstra',
      'All routers in an area must process topology changes, requiring hierarchical segmentation',
      'Sensitive to rapid link flapping which triggers frequent SPF recalculation spikes'
    ],
    industryDeployment: 'Algorithmic foundation of OSPF, IS-IS, GPS satellite navigation, and cloud SDN traffic engineering.'
  },
  {
    id: 'ospf',
    name: 'Open Shortest Path First (OSPFv2 / OSPFv3)',
    shortName: 'OSPF',
    category: 'Link-State Protocol',
    complexity: 'O((V + E) log V)',
    adminDistance: 110,
    standard: 'RFC 2328 (OSPFv2 for IPv4) / RFC 5340 (OSPFv3 for IPv6)',
    metricType: 'Cost = ReferenceBandwidth / InterfaceBandwidth (Default Ref = 100 Mbps)',
    leadSummary: 'The industry-standard interior gateway protocol (IGP) for enterprise networks. Routers establish neighbor relationships using Hello packets, flood Link-State Advertisements (LSAs), build a synchronized link-state database (LSDB), and execute Dijkstra algorithm.',
    concept: 'OSPF divides large networks into hierarchical areas connected to a central Area 0 (Backbone Area). On broadcast networks (Ethernet), it elects a Designated Router (DR) and Backup Designated Router (BDR) to reduce LSA flooding adjacency pairs from O(N²) to O(N).',
    signalPhysics: {
      title: 'LSA Flooding & Hierarchical Area 0 Backbone',
      description: 'Communicates via IP Protocol 89 (multicast 224.0.0.5 AllSPFRouters and 224.0.0.6 AllDRouters). Hellos verify bidirectional link health every 10 seconds.',
      facts: [
        { label: 'Administrative Distance', val: '110 (Universal open standard)' },
        { label: 'Hierarchy Architecture', val: 'Two-tier: Area 0 Backbone + Non-backbone areas' },
        { label: 'Convergence Time', val: 'Seconds to sub-seconds with BFD (Bidirectional Forwarding)' },
        { label: 'Broadcast Optimization', val: 'Designated Router (DR) & Backup DR (BDR)' }
      ]
    },
    mathematics: {
      title: 'OSPF Cost Metric Formula',
      formula: 'Cost = ReferenceBandwidth / InterfaceBandwidth   (e.g., 100 Mbps / 1 Gbps = 1)',
      description: 'Higher bandwidth links produce lower integer costs. Cost is summed cumulatively along the end-to-end path.'
    },
    pros: [
      'True open vendor-neutral standard supported by all networking hardware manufacturers',
      'Fast convergence and complete immunity to distance vector routing loops',
      'Scales to massive enterprise networks through multi-area route summarization'
    ],
    cons: [
      'High memory usage to store complete link-state database (LSDB)',
      'SPF computation consumes CPU cycles on large networks during topology flaps',
      'Complex design rules: all non-backbone areas must directly connect to Area 0'
    ],
    industryDeployment: 'Default standard for enterprise campus backbones, government networks, and data center intra-AS routing.'
  },
  {
    id: 'isis',
    name: 'Intermediate System to Intermediate System (IS-IS)',
    shortName: 'IS-IS',
    category: 'Link-State Protocol',
    complexity: 'O((V + E) log V)',
    adminDistance: 115,
    standard: 'ISO/IEC 10589 / RFC 1195 (Integrated / Dual IS-IS)',
    metricType: 'Configurable Metric (Default 10 per link, Wide Metric up to 2^24)',
    leadSummary: 'A robust, highly scalable link-state interior routing protocol designed by ISO and adapted for IP. Operates directly on Layer 2 Data Link frames (avoiding IP stack dependencies), making it the gold standard for global Tier-1 Internet Service Providers.',
    concept: 'IS-IS classifies routers as Level 1 (Intra-area) or Level 2 (Inter-area backbone). Unlike OSPF where area boundaries reside inside routers (Area Border Routers), in IS-IS entire routers belong to areas and boundaries fall along link interfaces. Its extensible Type-Length-Value (TLV) payload format allows seamless addition of new features like IPv6 and Segment Routing without protocol rewrites.',
    signalPhysics: {
      title: 'Layer 2 Encapsulation & TLV Extensibility',
      description: 'IS-IS frames are encapsulated directly inside 802.3 Ethernet frames without IP headers. If the IP stack crashes or is attacked, IS-IS continues routing.',
      facts: [
        { label: 'Transport Layer', val: 'Direct Layer 2 Data Link (No IP/UDP dependency)' },
        { label: 'Administrative Distance', val: '115' },
        { label: 'Area Levels', val: 'Level 1 (Station/Intra) and Level 2 (Backbone/Inter)' },
        { label: 'Payload Architecture', val: 'Type-Length-Value (TLV) extensible structure' }
      ]
    },
    mathematics: {
      title: 'Wide Metric Accumulation',
      formula: 'PathMetric = ∑ LinkCost_i   (Wide metrics support 24-bit link costs up to 16,777,215)',
      description: 'Supports high-granularity link metrics required for multi-terabit optical transoceanic fiber links.'
    },
    pros: [
      'Runs directly on Layer 2, making it immune to IP-layer spoofing and denial-of-service',
      'Superior scalability compared to OSPF; can support tens of thousands of routers in a single area',
      'Extensible TLV structure allows effortless adoption of IPv6, MPLS-TE, and Segment Routing (SRv6)'
    ],
    cons: [
      'Less commonly understood by enterprise engineers compared to OSPF',
      'Layer 2 encapsulation makes packet inspection with simple IP sniffers more complex',
      'Requires configuring ISO Network Service Access Point (NSAP) addresses'
    ],
    industryDeployment: 'Tier-1 Internet Service Providers (AT&T, Lumen, Telia, NTT), massive cloud hyperscaler backbones (Google, AWS, Meta), and 5G carrier backhauls.'
  }
];
