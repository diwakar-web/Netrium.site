// ==========================================================================
// COMPREHENSIVE NETWORK TOPOLOGY THEORY CURRICULUM
// Detailed architectural specifications, protocol mechanics, mathematics,
// fault analysis, and contemporary industrial applications.
// ==========================================================================

export const TOPOLOGY_THEORY_DATA = {
  star: {
    id: 'star',
    name: 'Star Topology',
    leadSummary:
      'In a Star Topology, every network host is connected via an independent, dedicated point-to-point link directly to a central multiport controller (Switch or Hub). All intra-network traffic traverses this central nexus, which handles frame filtering, address learning, and packet forwarding.',
    signalPhysics: {
      title: 'Physical Architecture & Signal Propagation',
      description:
        'Each station maintains an isolated physical channel terminated with 8P8C (RJ-45) modular connectors over Category 6/6A Unshielded Twisted Pair (UTP) or LC/SC optical fiber. In modern switched deployments, full-duplex operation is standard: separate twisted pairs or fiber strands are dedicated to transmission (TX) and reception (RX), entirely eliminating signal contention at the physical layer.',
      media: 'Cat5e / Cat6 / Cat6A UTP / STP (up to 100m) or Multi-mode/Single-mode Optical Fiber (up to 10km+)',
      duplex: 'Full-Duplex (Switched) or Half-Duplex (Legacy Hub Multiport Repeater)',
      voltage: 'Differential Manchester or PAM-16 multilevel signaling governed by IEEE 802.3 standards'
    },
    protocolMechanics: {
      title: 'Medium Access & Frame Switching Mechanics',
      description:
        'When operating with an intelligent Layer 2 Switch, each port represents an isolated collision domain. The switch maintains a Content Addressable Memory (CAM) table that dynamically binds MAC addresses to physical ingress ports. When an ingress frame arrives, the switch examines the Destination MAC (DMAC): if found in the CAM table, the frame is switched directly to the destination port (microsegmentation). If unknown or broadcast (FF:FF:FF:FF:FF:FF), it is flooded across all ports except the ingress port.',
      algorithmTitle: 'Switch Forwarding Logic (CAM Table Lookup):',
      algorithmCode: `1. Ingress frame received on Port P with SMAC and DMAC.
2. Update CAM Table: CAM[SMAC] = { Port: P, Timestamp: now() }
3. If DMAC is Broadcast / Multicast:
     Flood frame to all ports except P.
   Else If DMAC exists in CAM:
     Forward unicast frame strictly to CAM[DMAC].Port.
   Else:
     Flood frame to all ports except P (Unknown Unicast Flooding).`
    },
    mathematics: {
      title: 'Mathematical Modeling & Complexity Formulations',
      linkFormula: 'L = N',
      portFormula: 'Ports = N (Clients) + N (Central Switch Ports) = 2N',
      diameter: 'O(1) - Maximum 2 hops between any two arbitrary nodes via switch',
      cableCost: 'O(N) - Linear proportional to host distance from central wiring closet',
      notes: 'For N hosts, exact cable segments = N. Failure probability is decoupled across links.'
    },
    faultTolerance: {
      title: 'Fault Isolation & Resilience Profile',
      spof: 'High vulnerability at Central Hub/Switch (Single Point of Failure). If the core switch loses power or backplane fails, the entire local area network collapses.',
      linkFailure: 'Zero impact on other hosts. A severed drop cable or failed client NIC is isolated strictly to that host port without disturbing adjacent links.',
      diagnostics: 'Link pulse signals (Fast Link Pulse / Auto-Negotiation) immediately detect cable disconnections at the switch port LED and trigger SNMP trap alerts.'
    },
    industryUse: {
      standards: 'IEEE 802.3i (10BASE-T), IEEE 802.3u (100BASE-TX), IEEE 802.3ab (1000BASE-T), IEEE 802.3an (10GBASE-T)',
      realWorld: [
        'Modern Enterprise Local Area Networks (LANs) and structured building wiring closets.',
        'Data Center Top-of-Rack (ToR) server access connectivity.',
        'Home and Small Office Wi-Fi access point / router hub configurations.',
        'Storage Area Network (SAN) Fibre Channel fabric switches.'
      ]
    },
    pros: [
      'Fault Isolation: Failure of any individual client cable has zero cascading impact on other nodes.',
      'Simple Centralized Administration: Network administrators can monitor, mirror, or throttle bandwidth from the central switch.',
      'High Aggregate Throughput: Full-duplex microsegmentation eliminates packet collisions across ports.',
      'Effortless Expansion: Adding or decommissioning stations requires only plugging or unplugging a single patch cord.',
      'Compatible with Modern Standards: Universal foundational architecture for 1G/10G/40G/100G Ethernet.'
    ],
    cons: [
      'Single Point of Failure: Complete network paralysis if the central switch or its power supply fails.',
      'High Cable Quantity: Demands dedicated cable runs from every station back to the central rack closet.',
      'Switch Backplane Bottleneck: Total network throughput is bounded by the switching fabric switching capacity (Gbps/Tbps).'
    ],
    specs: {
      topologyType: 'Centralized Switched Star',
      cableFootprint: 'High (Dedicated per host)',
      installationComplexity: 'Moderate (Requires patch panels)',
      faultTolerance: '75% (Hub SPOF, but link-isolated)',
      typicalSpan: '100m per segment (UTP)',
      collisionDomains: 'N (1 per switch port in Full-Duplex)'
    }
  },

  bus: {
    id: 'bus',
    name: 'Bus Topology',
    leadSummary:
      'A Bus Topology consists of a single linear shared transmission medium (the trunk or backbone cable) to which all participating stations connect via tap connectors or drop cables. Because all nodes share one continuous physical conductor, transmissions are inherently broadcast and half-duplex.',
    signalPhysics: {
      title: 'Physical Architecture & Signal Propagation',
      description:
        'Historically constructed using 50Ω RG-58 coaxial cable (10BASE2 Thinnet) or RG-8 (10BASE5 Thicknet). Electrical signals propagate bidirectionally along the trunk line away from the transmitting station at approximately 0.66 to 0.77 times the speed of light. To prevent destructive signal reflection (echo bounce) when waves reach the cable ends, both physical terminations must be capped with 50-ohm non-inductive terminating resistors that dissipate signal energy as heat.',
      media: '50-Ohm Coaxial Cable (Thinnet RG-58 / Thicknet RG-8) or Multi-Drop Twisted Pair (RS-485 / CAN)',
      duplex: 'Half-Duplex (Only one station may transmit at any instant)',
      voltage: 'Baseband Manchester Encoding; signal reflections occur if impedance Z₀ ≠ 50Ω'
    },
    protocolMechanics: {
      title: 'Medium Access & Collision Detection (CSMA/CD)',
      description:
        'Access to the shared bus is mediated by 1-Persistent Carrier Sense Multiple Access with Collision Detection (CSMA/CD). Before transmitting, a station senses the line voltage. If idle, it transmits immediately. If busy, it waits until idle. If two stations transmit simultaneously within the collision window (slot time: 51.2 µs for 10 Mbps), voltage levels exceed nominal thresholds (-1.5V to -2.0V), triggering a collision. Both stations immediately transmit a 32-bit jam signal and initiate Binary Exponential Backoff.',
      algorithmTitle: 'Truncated Binary Exponential Backoff Algorithm:',
      algorithmCode: `1. Detect collision; abort transmission and broadcast 32-bit JAM signal.
2. Increment collision counter: k = min(attempt_count, 10).
3. Select random integer: r in range [0, 2^k - 1].
4. Wait backoff time: T = r * SlotTime (51.2 microseconds for 10 Mbps).
5. If attempt_count >= 16:
     Report transmission failure / drop packet.
   Else:
     Re-sense line and re-attempt transmission.`
    },
    mathematics: {
      title: 'Mathematical Modeling & Complexity Formulations',
      linkFormula: 'L = 1 Trunk Line + N Drop Taps',
      portFormula: 'Ports = N (Single T-Connector / Transceiver per host)',
      diameter: 'O(N) - Signal traverses full cable length to reach farthest node',
      cableCost: 'O(1) to O(N) - Minimal cable requirements compared to Star',
      notes: 'Maximum network segment length is strictly constrained by propagation delay to preserve collision detection (5-4-3 rule in 10BASE5).'
    },
    faultTolerance: {
      title: 'Fault Isolation & Resilience Profile',
      spof: 'Extremely vulnerable along the entire trunk. Any physical severing, loose BNC connector, or damaged terminator breaks the impedance loop, causing 100% signal reflection that halts all network transmissions.',
      linkFailure: 'Failure of a single station does not affect the bus; however, a malfunctioning station that continuously transmits (a "babbling idiot") jams the shared medium.',
      diagnostics: 'Requires specialized Time-Domain Reflectometers (TDR) to locate distance to impedance discontinuities or breaks.'
    },
    industryUse: {
      standards: 'IEEE 802.3 10BASE2/10BASE5, ISO 11898 (CAN Bus), MIL-STD-1553 (Avionics), EIA/TIA-485 (RS-485 Modbus)',
      realWorld: [
        'Automotive Controller Area Network (CAN Bus) linking engine ECU, ABS, airbags, and dashboard.',
        'Avionics Databuses (MIL-STD-1553) used in commercial and defense aircraft flight control.',
        'Industrial Automation & Robotics (Fieldbus, Modbus-RTU, Profibus multi-drop loops).',
        'Substation Supervisory Control and Data Acquisition (SCADA) telemetry systems.'
      ]
    },
    pros: [
      'Minimal Cable Footprint: Requires significantly less physical cable than star or mesh topologies.',
      'Cost-Effective for Linear Setups: Inexpensive hardware for small or vehicle-embedded applications.',
      'Passive Infrastructure: No powered switches or repeaters required for basic segments.',
      'Easy Node Attachment: Nodes tap directly into the trunk cable via BNC T-connectors.'
    ],
    cons: [
      'Critical Single Point of Failure: A break anywhere on the trunk disables communication for all nodes.',
      'Collision Bottlenecks: Heavy traffic creates frequent collisions, rapidly degrading throughput.',
      'Difficult Troubleshooting: Identifying which tap or terminator is loose requires testing the entire line.',
      'Distance Limitations: Cable attenuation and attenuation limit total segment span without repeaters.'
    ],
    specs: {
      topologyType: 'Linear Shared Bus',
      cableFootprint: 'Minimal (Single continuous line)',
      installationComplexity: 'Low (Small scale) / High (Troubleshooting)',
      faultTolerance: '35% (Entire bus fails if cable severed)',
      typicalSpan: '185m (10BASE2) / 500m (10BASE5)',
      collisionDomains: '1 (Shared across all nodes)'
    }
  },

  ring: {
    id: 'ring',
    name: 'Ring Topology',
    leadSummary:
      'In a Ring Topology, every network device is connected in a point-to-point loop to exactly two neighboring nodes: its immediate upstream and downstream peer. Data frames circulate cyclically around the ring in a predetermined direction, with each station acting as an active repeater that regenerates the signal.',
    signalPhysics: {
      title: 'Physical Architecture & Signal Propagation',
      description:
        'Transmissions are strictly unidirectional (or counter-rotating bidirectional in dual-ring systems such as FDDI and SONET). Each node receives the electrical or optical bitstream from its upstream neighbor into a shift register buffer, inspects the header, and retransmits the bits onto the downstream cable segment with restored voltage and timing characteristics.',
      media: 'IBM Type 1 Shielded Twisted Pair (STP), UTP, or Dual Counter-Rotating Optical Fiber (FDDI / SONET)',
      duplex: 'Simplex per strand (Loop circulates clockwise; secondary loop counter-clockwise)',
      voltage: 'Differential Manchester (IEEE 802.5) or 4B/5B with NRZI optical encoding (FDDI)'
    },
    protocolMechanics: {
      title: 'Medium Access & Token Passing Mechanics',
      description:
        'Access to the medium is deterministic and collision-free, governed by a circulating 3-byte control frame called the Token. When no node has data to transmit, the token circles continuously in an "Idle" state. A station wishing to transmit captures the token, inverts a single bit to convert it into a "Start-of-Frame" delimiter, appends its payload, and transmits the frame downstream.',
      algorithmTitle: 'Token Ring Transmission Sequence (IEEE 802.5):',
      algorithmCode: `1. Station monitors incoming bitstream until Idle Token is captured.
2. Invert Token bit to Frame Marker; append Destination, Payload, and FCS.
3. Transmit frame onto downstream link.
4. Downstream nodes examine Destination Address:
     If match: copy frame to local buffer and set Address-Recognized bits.
     Always retransmit frame downstream.
5. Frame completes full ring circuit back to Originating Station.
6. Originator strips the frame from the ring (Frame Stripping) and releases a new Idle Token.`
    },
    mathematics: {
      title: 'Mathematical Modeling & Complexity Formulations',
      linkFormula: 'L = N',
      portFormula: 'Ports = 2 per node (1 Receiver Port RX + 1 Transmitter Port TX)',
      diameter: 'O(N) - In worst case, frame traverses N - 1 hops before delivery',
      cableCost: 'O(N) - Minimal loop cable length',
      notes: 'Maximum Token Rotation Time (TTRT) provides bounded, deterministic latency guarantees for real-time traffic.'
    },
    faultTolerance: {
      title: 'Fault Isolation & Resilience Profile',
      spof: 'In single-ring topologies, any severed cable or powered-off station breaks the loop and halts communication. To mitigate this, enterprise rings implement Multistation Access Units (MAU) with automatic bypass relays, or Dual Counter-Rotating Rings that self-heal (Wrap Around).',
      linkFailure: 'Dual ring architectures automatically loop the primary ring back along the secondary ring on both sides of a cable sever, preserving continuous connectivity.',
      diagnostics: 'When a station detects loss of incoming signal, it broadcasts continuous "Beacon Frames" upstream, allowing management to pinpoint the exact broken link within milliseconds.'
    },
    industryUse: {
      standards: 'IEEE 802.5 (Token Ring), ANSI X3T9.5 (FDDI), ITU-T G.707 (SONET / SDH Self-Healing Rings), IEEE 802.17 (Resilient Packet Ring)',
      realWorld: [
        'Telecommunication Metropolitan Optical Backbones (SONET/SDH bidirectional line-switched rings).',
        'Campus Fiber Distributed Data Interface (FDDI) high-reliability backbones.',
        'High-speed railway signaling and wayside interlocking networks.',
        'Industrial real-time deterministic factory fieldbuses (Interbus, Profinet Ring Redundancy).'
      ]
    },
    pros: [
      'Deterministic Latency: Eliminates packet collisions completely; latency is predictable even under 100% saturation.',
      'Equal Bandwidth Access: Every node receives an orderly, fair turn to transmit via token rotation.',
      'Active Signal Regeneration: Every station acts as a digital repeater, enabling long overall loop distances.',
      'Self-Healing Capability: Dual-ring configurations automatically wrap around severed cables in under 50ms.'
    ],
    cons: [
      'Single-Ring Brittleness: Failure of any single node or link can disable a simple ring network.',
      'Latency on Large Rings: Every frame must traverse intermediate nodes, adding cumulative hop delay.',
      'Complex Reconfiguration: Physically adding or removing a station momentarily breaks the transmission loop.'
    ],
    specs: {
      topologyType: 'Circular Token-Passing Ring',
      cableFootprint: 'Moderate (Continuous closed loop)',
      installationComplexity: 'Moderate (MAU/Dual Fiber needed)',
      faultTolerance: '45% (Single Ring) / 95% (Dual Self-Healing)',
      typicalSpan: 'Up to 100km total ring circumference (FDDI)',
      collisionDomains: '0 (Deterministic collision-free medium)'
    }
  },

  mesh: {
    id: 'mesh',
    name: 'Mesh Topology',
    leadSummary:
      'In a Full Mesh Topology, every participating device has a dedicated point-to-point connection to every other device in the network. A Partial Mesh provides multiple redundant connections between critical nodes while peripheral nodes connect to fewer peers.',
    signalPhysics: {
      title: 'Physical Architecture & Signal Propagation',
      description:
        'A full mesh architecture guarantees that between any source node A and destination node B, there exists an exclusive, dedicated physical transmission conduit. Because paths are completely isolated, no traffic between nodes C and D can interfere with or monitor conversations between A and B.',
      media: 'High-Density Optical Fiber Trunks, Coaxial RF cables, or Wireless Directional Microwave / mmWave links',
      duplex: 'Full-Duplex point-to-point links across all connections',
      voltage: 'Independent optical or electrical signaling per interface port'
    },
    protocolMechanics: {
      title: 'Routing Protocols & Multipath Redundancy',
      description:
        'Because mesh topologies introduce numerous loops and alternate paths, packet forwarding requires dynamic routing protocols (e.g. OSPF, IS-IS, or BGP) at Layer 3, or Shortest Path Bridging (IEEE 802.1aq) / TRILL at Layer 2. Routers calculate link cost matrices using Dijkstra’s Shortest Path First algorithm. Equal-Cost Multi-Path (ECMP) allows load balancing across multiple parallel links simultaneously.',
      algorithmTitle: 'Dijkstra Shortest Path & Link-State Routing:',
      algorithmCode: `1. Each node monitors link states to its directly connected neighbors.
2. Broadcast Link-State Advertisements (LSAs) across the entire mesh.
3. Construct complete topological Link-State Database (LSDB).
4. Execute Dijkstra's Algorithm:
     Initialize dist[source] = 0, dist[v] = infinity for all other v.
     Select unvisited node u with smallest dist[u].
     For each neighbor v of u:
       new_dist = dist[u] + cost(u, v)
       if new_dist < dist[v]: dist[v] = new_dist
5. Populate routing table with optimal next-hop interfaces.`
    },
    mathematics: {
      title: 'Mathematical Modeling & Complexity Formulations',
      linkFormula: 'L = [N * (N - 1)] / 2 (Full Mesh)',
      portFormula: 'Ports per device = N - 1; Total network ports = N * (N - 1)',
      diameter: 'O(1) in Full Mesh - Exactly 1 hop direct link between any pair',
      cableCost: 'O(N²) - Quadratic explosion as host count grows',
      notes: 'For 5 nodes = 10 links; For 20 nodes = 190 links; For 100 nodes = 4,950 links. This quadratic growth makes full mesh practical only for small core networks.'
    },
    faultTolerance: {
      title: 'Fault Isolation & Resilience Profile',
      spof: 'Zero Single Point of Failure. Mesh provides the highest fault tolerance possible in computer networking. If any link is cut, routing protocols immediately reroute traffic across redundant alternate paths within sub-second convergence times.',
      linkFailure: 'Link failures cause zero service disruption. Even if multiple links fail simultaneously, network connectivity remains intact as long as any path remains.',
      diagnostics: 'Bi-directional Forwarding Detection (BFD) and SNMP link monitoring detect link degradation and trigger failover in under 10 milliseconds.'
    },
    industryUse: {
      standards: 'IEEE 802.1aq (Shortest Path Bridging), IETF RFC 2328 (OSPFv2), IETF RFC 4271 (BGP-4), IEEE 802.11s (Wi-Fi Mesh)',
      realWorld: [
        'Internet Service Provider (ISP) Tier-1 Core Transit Backbones.',
        'Mission-critical financial high-frequency trading networks.',
        'Nuclear power plant and defense command-and-control infrastructure.',
        'Wireless Mesh Networks (Zigbee, Thread, Z-Wave IoT sensor grids).'
      ]
    },
    pros: [
      'Unmatched Fault Tolerance: Multiple redundant paths prevent any single line severance from breaking connectivity.',
      'Zero Bottlenecks: Dedicated links carry their own data; no shared line traffic contention.',
      'Absolute Privacy and Security: Point-to-point links ensure data reaches only the target device without eavesdropping.',
      'Seamless Maintenance: Individual links can be taken down for upgrades without interrupting network operations.'
    ],
    cons: [
      'Astronomical Cost: Quadratic link scaling (N*(N-1)/2) makes physical cabling extremely expensive.',
      'High Port Density Requirement: Every device requires N-1 physical network interface cards and I/O ports.',
      'Complex Configuration & Administration: Demands sophisticated routing protocols to manage alternate paths.'
    ],
    specs: {
      topologyType: 'Fully Interconnected Mesh',
      cableFootprint: 'Extremely High (O(N²) quadratic scaling)',
      installationComplexity: 'Very High (Dense patch bays)',
      faultTolerance: '99.999% ("Five Nines" redundancy)',
      typicalSpan: 'Campus / Metropolitan / Global Core',
      collisionDomains: 'N*(N-1)/2 (Dedicated full-duplex links)'
    }
  },

  tree: {
    id: 'tree',
    name: 'Tree Topology',
    leadSummary:
      'A Tree Topology (hierarchical topology) organizes network nodes into an inverted hierarchy branching downward from a single Root Hub or Core Switch through Intermediate Distribution Hubs to End Leaf Stations. It integrates elements of Star and Bus architectures for structured enterprise scaling.',
    signalPhysics: {
      title: 'Physical Architecture & Signal Propagation',
      description:
        'Cabling is structured in tiers: high-bandwidth optical trunks connect the Core root to Distribution switches, which connect via twisted pair drop cables to Access-layer leaf hosts. The physical topology mimics a directed acyclic graph where each child node possesses exactly one upstream parent node.',
      media: 'Single-mode optical fiber backbones between tiers; Cat6/Cat6A twisted pair to desktop leaf nodes',
      duplex: 'Full-duplex link aggregation (LACP IEEE 802.3ad) along inter-tier trunks',
      voltage: 'Standard Ethernet physical signaling over copper and optical transceivers'
    },
    protocolMechanics: {
      title: 'Hierarchical Routing & Departmental Segmentation',
      description:
        'The architecture adheres to the Cisco 3-Layer Hierarchical Model: Core Layer (high-speed transport), Distribution Layer (policy enforcement, ACLs, routing between subnets), and Access Layer (workgroup connectivity, PoE, port security). Virtual Local Area Networks (VLANs) map logically to the physical branches, and 802.1Q trunking carries multiple VLANs over backbone links.',
      algorithmTitle: 'Spanning Tree Protocol (STP / IEEE 802.1D) Root Election:',
      algorithmCode: `1. All switches broadcast Bridge Protocol Data Units (BPDUs).
2. Lowest Bridge ID (Priority + MAC) is elected as Root Bridge.
3. Each non-root switch determines its Root Port (lowest Path Cost to Root).
4. On each network segment, elect a Designated Port.
5. All other redundant ports transition to Blocking State to prevent loops.
6. If an active link fails, blocked ports transition to Forwarding State.`
    },
    mathematics: {
      title: 'Mathematical Modeling & Complexity Formulations',
      linkFormula: 'L = N - 1 (Exact tree definition with N nodes and no loops)',
      portFormula: 'Ports = Upstream parent link + K downstream child links',
      diameter: 'O(log N) for balanced trees - Traverses up to root and down to leaf',
      cableCost: 'O(N) - Highly efficient structured wiring footprint',
      notes: 'Subtree isolation limits broadcast domains and simplifies IP subnet allocation.'
    },
    faultTolerance: {
      title: 'Fault Isolation & Resilience Profile',
      spof: 'Failure of the Root Hub severs communication between distinct major branches. However, failure of a leaf node or access switch isolates only that specific branch without affecting neighboring branches.',
      linkFailure: 'Modern tree designs deploy redundant dual-homed uplinks with Spanning Tree Protocol (STP) or Virtual Switching System (VSS) to eliminate root single points of failure.',
      diagnostics: 'Branch-level network isolation simplifies troubleshooting: faults are localized to specific distribution closets.'
    },
    industryUse: {
      standards: 'IEEE 802.1D (STP), IEEE 802.1w (RSTP), IEEE 802.1Q (VLAN Trunking), IEEE 802.3ad (Link Aggregation)',
      realWorld: [
        'Corporate Campus Enterprise Networks (Cisco 3-tier Core-Distribution-Access hierarchy).',
        'Hybrid Fiber-Coaxial (HFC) Cable Television distribution networks.',
        'Internet Domain Name System (DNS) global hierarchical resolution tree.',
        'University and hospital multi-building network infrastructures.'
      ]
    },
    pros: [
      'Modular Scalability: New departments or workgroups can be attached as new sub-branches without redesigning the core.',
      'Departmental Isolation: Network policies, security firewalls, and QoS rules can be enforced per branch.',
      'Hierarchical Fault Localization: Easy to pinpoint and isolate cable issues to a specific floor or building.',
      'Structured Cabling Alignment: Matches the physical architecture of multi-story corporate facilities.'
    ],
    cons: [
      'Root Vulnerability: Failure of the central root switch severs communications between separate branches.',
      'Backbone Trunk Bottlenecks: Traffic between different branches must funnel through the upper-tier links.',
      'Complex Configuration: Requires extensive Layer 2/Layer 3 configuration (VLANs, STP, inter-VLAN routing).'
    ],
    specs: {
      topologyType: 'Hierarchical Tree',
      cableFootprint: 'Moderate to High (Structured tiered cabling)',
      installationComplexity: 'High (Requires multi-tier design)',
      faultTolerance: '70% (Root vulnerable unless dual-homed)',
      typicalSpan: 'Enterprise Campus / Multi-building',
      collisionDomains: 'N (Microsegmented per access port)'
    }
  },

  hybrid: {
    id: 'hybrid',
    name: 'Hybrid Topology',
    leadSummary:
      'A Hybrid Topology is the integration of two or more distinct network topologies (such as Star-Ring, Star-Bus, or Spine-Leaf Mesh) into a unified enterprise network architecture. It enables organizations to leverage the optimal strengths of each individual topology across diverse operating environments.',
    signalPhysics: {
      title: 'Physical Architecture & Signal Propagation',
      description:
        'A hybrid architecture combines heterogeneous physical media and signaling protocols. For example, departmental offices operate switched Star topologies over copper twisted pair, while high-reliability campus backbones connect these star clusters using a self-healing optical Ring (FDDI/SONET) or high-throughput Mesh fabric.',
      media: 'Heterogeneous: Cat6A Copper, Single-mode Long-haul Optical Fiber, mmWave Wireless, and Coax',
      duplex: 'Protocol-dependent across different network boundary zones',
      voltage: 'Mediated across boundaries by multilayer switches, media converters, and edge routers'
    },
    protocolMechanics: {
      title: 'Multi-Protocol Interconnection & Boundary Bridging',
      description:
        'Traffic traversing topology boundaries passes through Multilayer Switches, Routers, or Border Gateways that translate frame formats, manage distinct MTU sizes, and redistribute routing protocols (e.g. OSPF to BGP). In modern cloud data centers, a hybrid Spine-Leaf topology provides non-blocking, deterministic latency across thousands of compute nodes.',
      algorithmTitle: 'Spine-Leaf Non-Blocking Clos Fabric Forwarding:',
      algorithmCode: `1. Every Leaf switch connects directly to every Spine switch.
2. End hosts connect exclusively to Leaf switches.
3. Ingress packet arrives at Leaf L1 addressed to host on Leaf L2.
4. Leaf L1 hashes packet 5-tuple (SIP, DIP, Sport, Dport, Protocol).
5. Select Spine switch S_k using Equal-Cost Multi-Path (ECMP):
     k = Hash(5-tuple) % NumberOfSpines
6. Forward packet: L1 -> S_k -> L2.
7. Guarantees deterministic 2-hop latency between any servers in the datacenter.`
    },
    mathematics: {
      title: 'Mathematical Modeling & Complexity Formulations',
      linkFormula: 'Compound Formula: L = Sum(L_stars) + L_backbone',
      portFormula: 'Variable based on boundary gateway interfaces and port density',
      diameter: 'Bounded by backbone diameter + 2 (access hop to edge)',
      cableCost: 'Optimized - High redundancy where required, economical at leaf tiers',
      notes: 'Maximizes architectural balance between performance, reliability, and budgetary capital expenditure.'
    },
    faultTolerance: {
      title: 'Fault Isolation & Resilience Profile',
      spof: 'Compartmentalized. Because topologies are segmented by bridges and routers, a catastrophic failure in one segment (e.g. a severed bus trunk) is contained strictly to that segment and does not disrupt the neighboring star clusters.',
      linkFailure: 'Dual-homed border routers and dynamic routing protocols provide automatic sub-second failover between topology domains.',
      diagnostics: 'SNMP, NetFlow, and sFlow collectors monitor inter-zone traffic patterns and alert operators to cross-segment anomalies.'
    },
    industryUse: {
      standards: 'IEEE 802.1Q, IETF RFC 7938 (BGP in Data Centers), ITU-T G.8032 (Ethernet Ring Protection Switching)',
      realWorld: [
        'Modern Hyperscale Cloud Data Centers (Spine-Leaf hybrid fabric in AWS, Azure, Google Cloud).',
        'Large University and Corporate Multi-Facility Campuses (Star departments linked via Ring backbone).',
        'Smart City municipal monitoring networks (Mesh wireless sensors linking into Star fiber concentrators).',
        'Automated fulfillment centers (Warehouse robotics Wi-Fi mesh linked to wired core servers).'
      ]
    },
    pros: [
      'Maximum Flexibility: Topologies can be tailored to the exact requirements of each specific departmental zone.',
      'High Scalability: Network size can be expanded incrementally without rebuilding existing infrastructure.',
      'Robust Fault Containment: Issues in one zone do not cascade across the entire corporate network.',
      'Optimized Cost-Performance: Concentrates expensive high-redundancy links only where mission-critical.'
    ],
    cons: [
      'High Architectural Complexity: Demands advanced network engineering expertise to design and manage.',
      'Expensive Boundary Equipment: Requires high-capacity multilayer switches, routers, and gateway bridges.',
      'Complex Troubleshooting: Pinpointing performance bottlenecks across multi-protocol boundaries requires specialized tools.'
    ],
    specs: {
      topologyType: 'Multi-Architecture Hybrid (e.g. Star-Ring / Spine-Leaf)',
      cableFootprint: 'High (Optimized heterogeneous cabling)',
      installationComplexity: 'Very High (Multi-protocol configuration)',
      faultTolerance: '90-95% (Segmented fault containment)',
      typicalSpan: 'Campus / Enterprise / Global Cloud',
      collisionDomains: 'Microsegmented per access port'
    }
  }
};
