// CDN Architectural Modules & Cards metadata using HoloCard reactbits presets

export const CDN_CARDS = {
  'edge-cache': {
    id: 'edge-cache',
    name: 'Dynamic Edge Caching',
    subtitle: 'Point-of-Presence (POP) Cache Memory',
    category: 'Caching Architecture',
    preset: 'bursts',
    foilColor: '#00bf63',
    iconName: 'Server',
    description: 'High-speed SSD and in-memory key-value caching layer running at distributed edge POPs, providing sub-15ms response times on cache hits.',
    stats: '15 Global POPs • LRU / LFU Eviction • Gzip / Brotli',
    specs: [
      { label: 'Cache TTL', value: '3600s' },
      { label: 'Hit Ratio', value: '98.4%' },
      { label: 'RAM / Node', value: '128 GB' }
    ]
  },
  'anycast-dns': {
    id: 'anycast-dns',
    name: 'Anycast DNS Gateway',
    subtitle: 'BGP Anycast Routing Architecture',
    category: 'DNS & Traffic Routing',
    preset: 'cosmos',
    foilColor: '#38bdf8',
    iconName: 'Globe',
    description: 'BGP Anycast DNS IP advertisement that directs requesting clients directly to the topologically nearest Point of Presence in ~4ms.',
    stats: 'Global IP Anycast • DNSSEC Protected • Instant Failover',
    specs: [
      { label: 'Lookup Time', value: '4ms' },
      { label: 'BGP AS', value: 'AS64512' },
      { label: 'Query Rate', value: '500k req/s' }
    ]
  },
  'geo-routing': {
    id: 'geo-routing',
    name: 'Multi-Factor Geo Router',
    subtitle: 'Scored Telemetry Optimization Engine',
    category: 'Traffic Optimization',
    preset: 'shards',
    foilColor: '#a855f7',
    iconName: 'Navigation',
    description: 'Dynamic decision engine evaluating physical Haversine distance, hop count, current CPU load capacity, and network link health in real time.',
    stats: 'Weighted Scoring • Congestion Avoidance • Multipath',
    specs: [
      { label: 'Evaluation Interval', value: '50ms' },
      { label: 'Factors', value: '7 Active Rules' },
      { label: 'Accuracy', value: '99.9%' }
    ]
  },
  'origin-shield': {
    id: 'origin-shield',
    name: 'Origin Shield Warehouse',
    subtitle: 'Central Authoritative Source Server',
    category: 'Origin Architecture',
    preset: 'gold',
    foilColor: '#f59e0b',
    iconName: 'Shield',
    description: 'Central authoritative backend server repository in San Francisco managing persistent data storage, cache invalidation, and content replication.',
    stats: 'Cold Storage Vault • Auto Invalidation • Rate Limiting',
    specs: [
      { label: 'Primary Site', value: 'San Francisco' },
      { label: 'Throughput', value: '100 Gbps' },
      { label: 'Redundancy', value: 'N+2 Redundant' }
    ]
  },
  'chaos-engineering': {
    id: 'chaos-engineering',
    name: 'Chaos Outage Injector',
    subtitle: 'Telemetry Storm & Overload Tester',
    category: 'Resilience Testing',
    preset: 'glitter',
    foilColor: '#ef4444',
    iconName: 'Flame',
    description: 'Fault-injection testing module capable of triggering localized atmospheric weather storms (+120ms latency) and 100% CPU queue locks.',
    stats: 'Weather Storms • CPU Overloads • Traffic Surges',
    specs: [
      { label: 'Storm Penalty', value: '+120ms' },
      { label: 'Overload Load', value: '100%' },
      { label: 'Recovery Time', value: 'Instant' }
    ]
  },
  'edge-compute': {
    id: 'edge-compute',
    name: 'Edge Compute Vandalizer',
    subtitle: 'Dynamic Payload Ingestion & Transform',
    category: 'Edge Functions',
    preset: 'rainbow',
    foilColor: '#10b981',
    iconName: 'Cpu',
    description: 'Serverless edge compute workers allowing live payload publishing, header modification, metadata enrichment, and regional geo-tagging.',
    stats: 'Zero Cold Start • WASM Runtime • Live Header Rewrites',
    specs: [
      { label: 'Execution Time', value: '1.2ms' },
      { label: 'Memory Limit', value: '128 MB' },
      { label: 'Runtime', value: 'V8 Isolate' }
    ]
  }
};
