// Page Replacement Algorithms Metadata for HoloCard Showcase Hub

export const PAGE_REPLACEMENT_SECTIONS = {
  ALL: 'all',
  CLASSICAL: 'classical',
  FREQUENCY: 'frequency',
  HARDWARE: 'hardware'
};

export const PAGE_REPLACEMENT_CARDS = {
  fifo: {
    id: 'fifo',
    name: 'First In First Out (FIFO)',
    shortName: 'FIFO',
    section: PAGE_REPLACEMENT_SECTIONS.CLASSICAL,
    category: 'Queue-Based',
    preset: 'bursts',
    foilColor: '#38bdf8',
    iconName: 'Layers',
    timeComplexity: 'O(1)',
    beladysAnomaly: 'Vulnerable (Yes)',
    hardware: 'Software Queue',
    description: 'The simplest page replacement algorithm. Evicts the page that has been in physical memory the longest, regardless of access recency or frequency.',
    specs: [
      { label: 'Time Complexity', value: 'O(1)' },
      { label: 'Belady Anomaly', value: 'Vulnerable' },
      { label: 'Hardware Bits', value: '0 Bits' }
    ]
  },
  optimal: {
    id: 'optimal',
    name: 'Optimal Page Replacement (OPT / MIN)',
    shortName: 'Optimal (OPT)',
    section: PAGE_REPLACEMENT_SECTIONS.CLASSICAL,
    category: 'Theoretical Benchmark',
    preset: 'gold',
    foilColor: '#eab308',
    iconName: 'Sparkles',
    timeComplexity: 'O(N)',
    beladysAnomaly: 'Immune (No)',
    hardware: 'Unrealizable (Future Trace)',
    description: "Belady's theoretical minimum. Replaces the page that will not be accessed for the longest time in the future. Serves as benchmark.",
    specs: [
      { label: 'Fault Rate', value: 'Minimum Possible' },
      { label: 'Belady Anomaly', value: 'Immune' },
      { label: 'Class', value: 'Stack Algorithm' }
    ]
  },
  lru: {
    id: 'lru',
    name: 'Least Recently Used (LRU)',
    shortName: 'LRU',
    section: PAGE_REPLACEMENT_SECTIONS.CLASSICAL,
    category: 'Recency-Based',
    preset: 'stars',
    foilColor: '#00bf63',
    iconName: 'Clock',
    timeComplexity: 'O(1)',
    beladysAnomaly: 'Immune (No)',
    hardware: 'Hardware Timestamp / List',
    description: 'Leverages temporal locality to replace the page that has remained unreferenced for the longest duration of time.',
    specs: [
      { label: 'Time Complexity', value: 'O(1) with DLL' },
      { label: 'Belady Anomaly', value: 'Immune' },
      { label: 'Locality', value: 'Temporal' }
    ]
  },
  mru: {
    id: 'mru',
    name: 'Most Recently Used (MRU)',
    shortName: 'MRU',
    section: PAGE_REPLACEMENT_SECTIONS.CLASSICAL,
    category: 'Recency-Based',
    preset: 'shards',
    foilColor: '#a855f7',
    iconName: 'Repeat',
    timeComplexity: 'O(1)',
    beladysAnomaly: 'Immune (No)',
    hardware: 'Stack Top / Register',
    description: 'Evicts the most recently touched frame. Optimal for cyclic iterations where older pages will be accessed before recently read ones.',
    specs: [
      { label: 'Best Use Case', value: 'Cyclic Scans' },
      { label: 'Time Complexity', value: 'O(1)' },
      { label: 'Cache Pollution', value: 'Resistant' }
    ]
  },
  lfu: {
    id: 'lfu',
    name: 'Least Frequently Used (LFU)',
    shortName: 'LFU',
    section: PAGE_REPLACEMENT_SECTIONS.FREQUENCY,
    category: 'Frequency-Based',
    preset: 'cosmos',
    foilColor: '#06b6d4',
    iconName: 'Activity',
    timeComplexity: 'O(1)',
    beladysAnomaly: 'Vulnerable (Yes)',
    hardware: 'Access Frequency Counter',
    description: 'Evicts the page with the lowest cumulative reference count. Protects heavily accessed pages from being flushed by random accesses.',
    specs: [
      { label: 'Time Complexity', value: 'O(1)' },
      { label: 'Counter Size', value: '32-Bit Counter' },
      { label: 'Tie-Breaker', value: 'FIFO / LRU' }
    ]
  },
  mfu: {
    id: 'mfu',
    name: 'Most Frequently Used (MFU)',
    shortName: 'MFU',
    section: PAGE_REPLACEMENT_SECTIONS.FREQUENCY,
    category: 'Frequency-Based',
    preset: 'glitter',
    foilColor: '#ec4899',
    iconName: 'Zap',
    timeComplexity: 'O(log N)',
    beladysAnomaly: 'Vulnerable (Yes)',
    hardware: 'Access Frequency Counter',
    description: 'Assumes the page with the highest access count has already finished its execution loop and can be safely replaced.',
    specs: [
      { label: 'Time Complexity', value: 'O(log N)' },
      { label: 'Strategy', value: 'Peak Saturation' },
      { label: 'Belady Anomaly', value: 'Vulnerable' }
    ]
  },
  'second-chance': {
    id: 'second-chance',
    name: 'Second Chance Algorithm',
    shortName: 'Second Chance',
    section: PAGE_REPLACEMENT_SECTIONS.HARDWARE,
    category: 'Approximation / Bit-Based',
    preset: 'bursts',
    foilColor: '#10b981',
    iconName: 'RotateCcw',
    timeComplexity: 'O(1) Amortized',
    beladysAnomaly: 'Vulnerable (Yes)',
    hardware: '1 MMU Reference Bit (R)',
    description: 'FIFO queue with a Reference bit. When inspecting the oldest page: if R=0 evict; if R=1 clear R to 0 and push to the queue tail.',
    specs: [
      { label: 'Hardware Bits', value: '1 R-Bit per PTE' },
      { label: 'Amortized Cost', value: 'O(1)' },
      { label: 'Degeneration', value: 'FIFO if all R=1' }
    ]
  },
  clock: {
    id: 'clock',
    name: 'Clock Page Replacement Algorithm',
    shortName: 'Clock',
    section: PAGE_REPLACEMENT_SECTIONS.HARDWARE,
    category: 'Circular Queue Approximation',
    preset: 'rainbow',
    foilColor: '#00bf63',
    iconName: 'Clock',
    timeComplexity: 'O(1) Amortized',
    beladysAnomaly: 'Vulnerable (Yes)',
    hardware: '1 Reference Bit + Hand Pointer',
    description: 'Circular buffer ring with a sweeping clock hand pointer. Sweeps frames, clearing R=0 and evicting the first R=0 victim.',
    specs: [
      { label: 'Data Structure', value: 'Circular Ring Array' },
      { label: 'Pointer Logic', value: 'Modulo Arithmetic' },
      { label: 'Real World', value: 'Linux Page Cache' }
    ]
  },
  'enhanced-second-chance': {
    id: 'enhanced-second-chance',
    name: 'Enhanced Second Chance Algorithm',
    shortName: 'Enhanced 2nd Chance',
    section: PAGE_REPLACEMENT_SECTIONS.HARDWARE,
    category: 'Multi-Bit State Machine',
    preset: 'gold',
    foilColor: '#f59e0b',
    iconName: 'Sliders',
    timeComplexity: 'O(N)',
    beladysAnomaly: 'Vulnerable (Yes)',
    hardware: 'Reference (R) + Dirty (M) Bits',
    description: 'Classifies pages into four (R, M) priority classes: (0,0) -> (0,1) -> (1,0) -> (1,1). Prioritizes clean pages to avoid disk write penalty.',
    specs: [
      { label: 'Classes', value: '4 Priority Classes' },
      { label: 'Disk I/O', value: 'Saves Write-Backs' },
      { label: 'Hardware Bits', value: 'R and M Bits' }
    ]
  },
  nru: {
    id: 'nru',
    name: 'Not Recently Used (NRU)',
    shortName: 'NRU',
    section: PAGE_REPLACEMENT_SECTIONS.HARDWARE,
    category: 'Class-Based Periodic Reset',
    preset: 'shards',
    foilColor: '#8b5cf6',
    iconName: 'Server',
    timeComplexity: 'O(1)',
    beladysAnomaly: 'Vulnerable (Yes)',
    hardware: 'R & M Bits + Timer Interrupt',
    description: 'Hardware timer periodically resets all R bits to 0 every clock tick. Evicts a random frame from the lowest non-empty class.',
    specs: [
      { label: 'Timer Quantum', value: '10ms - 50ms Tick' },
      { label: 'Decay Model', value: 'Periodic R=0 Reset' },
      { label: 'Real World', value: 'Classic UNIX System V' }
    ]
  },
  random: {
    id: 'random',
    name: 'Random Page Replacement',
    shortName: 'Random',
    section: PAGE_REPLACEMENT_SECTIONS.HARDWARE,
    category: 'Probabilistic',
    preset: 'glitter',
    foilColor: '#ef4444',
    iconName: 'HelpCircle',
    timeComplexity: 'O(1)',
    beladysAnomaly: 'Indeterminate',
    hardware: 'PRNG Generator',
    description: 'Selects a victim frame uniformly at random with zero state tracking, counters, or locks. Low overhead with acceptable average latency.',
    specs: [
      { label: 'Memory Overhead', value: '0 Bytes' },
      { label: 'Lock Contention', value: 'Zero Locks' },
      { label: 'Hardware Usage', value: 'ARM TLB Fallback' }
    ]
  },
  aging: {
    id: 'aging',
    name: 'Aging Page Replacement Algorithm',
    shortName: 'Aging',
    section: PAGE_REPLACEMENT_SECTIONS.FREQUENCY,
    category: 'Shift Register Recency',
    preset: 'stars',
    foilColor: '#10b981',
    iconName: 'Binary',
    timeComplexity: 'O(N)',
    beladysAnomaly: 'Immune (No)',
    hardware: '8-Bit Shift Register / Frame',
    description: 'High-resolution software LRU approximation. Each frame has an 8-bit register shifted right on timer ticks with the R-bit prepended.',
    specs: [
      { label: 'Register Size', value: '8 Bits (1 Byte)' },
      { label: 'Resolution', value: '8 Time Quanta' },
      { label: 'Selection', value: 'argmin(AgeRegister)' }
    ]
  }
};
