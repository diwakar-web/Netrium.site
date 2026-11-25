// Page Replacement Algorithms Architectural Curriculum & Theories Specification
// Standardized for Netrium Operating Systems Laboratory

export const PAGE_REPLACEMENT_ALGORITHMS = [
  {
    id: 'fifo',
    name: 'First In First Out (FIFO)',
    shortName: 'FIFO',
    category: 'Queue-Based',
    complexity: 'O(1)',
    hardwareNeeded: 'Simple FIFO Queue / Pointer',
    beladysAnomaly: true,
    leadSummary: 'The simplest page replacement algorithm. The operating system maintains a queue of all pages in memory, with the oldest page at the front. When a page must be replaced, the page at the front of the queue is selected.',
    concept: 'FIFO replaces the page that has been in memory the longest, regardless of how often or recently it has been accessed. Because it ignores page access frequency and locality of reference, it frequently evicts heavily used shared library or kernel pages.',
    signalPhysics: {
      title: 'Queue Mechanics & Eviction Mechanics',
      description: 'Maintains an order-of-arrival list. When physical frame capacity is exhausted, the tail pointer advances, discarding the oldest loaded frame.',
      facts: [
        { label: 'Time Complexity', val: 'O(1) per reference' },
        { label: 'Space Overhead', val: 'Queue pointers (1 per frame)' },
        { label: 'Hardware Support', val: 'None required (Software queue)' },
        { label: "Belady's Anomaly", val: 'VULNERABLE (Faults increase with more frames)' }
      ]
    },
    mathematics: {
      title: "Belady's Anomaly Formalism",
      formula: "∃ S, m1 < m2 : Faults(FIFO, S, m1) < Faults(FIFO, S, m2)",
      description: "Laszlo Belady proved in 1969 that for FIFO, increasing physical page frames can paradoxically increase the total number of page faults. For the reference string '1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5', 3 frames yield 9 faults while 4 frames yield 10 faults."
    },
    pros: [
      'Extremely simple to implement with minimal computational overhead',
      'Requires zero hardware assistance (no MMU reference bits needed)',
      'Deterministic queue ordering with constant O(1) eviction time'
    ],
    cons: [
      "Suffers from Belady's Anomaly where more RAM produces more faults",
      'Disregards temporal and spatial locality completely',
      'Frequently evicts heavily-used initialization loops or core runtime pages'
    ],
    osDeployment: 'Early operating systems; used today in simple embedded microcontrollers and fixed FIFO ring buffers where memory locality is uniform.'
  },
  {
    id: 'optimal',
    name: 'Optimal Page Replacement (OPT / MIN)',
    shortName: 'Optimal (OPT)',
    category: 'Theoretical Benchmark',
    complexity: 'O(N)',
    hardwareNeeded: 'Unrealizable (Requires Omniscient Future Knowledge)',
    beladysAnomaly: false,
    leadSummary: 'The theoretical gold standard devised by Laszlo Belady. Replaces the page that will not be used for the longest period of time in the future. Serves as the benchmark against which all real-world algorithms are measured.',
    concept: 'Optimal replacement achieves the lowest possible page-fault rate for any given reference string. However, because it requires future knowledge of memory references, it cannot be implemented in general-purpose operating systems, but is simulated offline for comparative performance analysis.',
    signalPhysics: {
      title: 'Future Distance Scan & Stack Property',
      description: 'Scans forward along the future reference trace. The frame holding the page with the maximum distance to its next occurrence is chosen as the victim.',
      facts: [
        { label: 'Page Fault Rate', val: 'Strict Mathematical Minimum' },
        { label: 'Class Type', val: 'Stack Algorithm (M(n) ⊆ M(n+1))' },
        { label: 'Realizability', val: 'Offline analysis only' },
        { label: "Belady's Anomaly", val: 'IMMUNE (Proven by stack property)' }
      ]
    },
    mathematics: {
      title: 'Future Distance Maximization',
      formula: 'Victim = argmax_{p ∈ Frames} ( NextUseTime(p) - CurrentTime )',
      description: 'For each page p currently in physical memory, calculate Δt until p is requested again. If a page is never referenced again, Δt = ∞ and it is immediately selected for eviction.'
    },
    pros: [
      'Guarantees the lowest possible number of page faults for any given reference trace',
      "Mathematically immune to Belady's Anomaly as a proven Stack Algorithm",
      'Provides the baseline efficiency metric against which practical heuristics are evaluated'
    ],
    cons: [
      'Impossible to implement in real-time operating systems without future lookahead',
      'High computational overhead in offline simulators scanning future arrays',
      'Only applicable for trace replay and compiler-guided prefetching research'
    ],
    osDeployment: 'Offline benchmarking suites, cache replacement simulation benchmarks, and trace replay profiling in OS research.'
  },
  {
    id: 'lru',
    name: 'Least Recently Used (LRU)',
    shortName: 'LRU',
    category: 'Recency-Based',
    complexity: 'O(1) with Doubly Linked List',
    hardwareNeeded: 'Hardware Counter / Stack Register or MMU Access Bit',
    beladysAnomaly: false,
    leadSummary: 'Approximates Optimal by leveraging the Principle of Locality: pages that have been heavily used in the recent past are very likely to be used again in the near future. Evicts the page that has remained unreferenced for the longest time.',
    concept: 'LRU associates with each page the timestamp of its last access. When a victim is required, the page with the smallest timestamp (oldest reference) is chosen. Belongs to the class of Stack Algorithms, guaranteeing freedom from Belady Anomaly.',
    signalPhysics: {
      title: 'Temporal Locality & Doubly-Linked Hash Map',
      description: 'Physical frames are maintained in recency order. On every memory hit, the page node is detached and spliced to the head of the list in O(1) time.',
      facts: [
        { label: 'Hit Performance', val: 'Outstanding for typical program workloads' },
        { label: 'Implementation', val: 'Hash Map + Doubly Linked List' },
        { label: 'Stack Property', val: 'Yes (Set of n frames ⊆ Set of n+1 frames)' },
        { label: "Belady's Anomaly", val: 'IMMUNE' }
      ]
    },
    mathematics: {
      title: 'Recency Timestamp Minimization',
      formula: 'Victim = argmin_{p ∈ Frames} ( LastAccessTimestamp(p) )',
      description: 'Because program execution loops and stack calls demonstrate high temporal locality, the age of last reference inversely correlates with the probability of imminent access.'
    },
    pros: [
      "Immune to Belady's Anomaly due to the mathematical stack property",
      'Excellent hit ratio closely tracking optimal for desktop and compiler workloads',
      'Naturally adapts to shifting phases of execution'
    ],
    cons: [
      'True LRU requires hardware timer updates on every memory read/write',
      'High hardware complexity or locking contention on multi-core SMP systems',
      'Performs poorly on large sequential scans that flush the working set (cache pollution)'
    ],
    osDeployment: 'Database buffer managers (PostgreSQL shared buffers), hardware CPU L1/L2 caches, Web browsers, and approximated via Clock in Linux/Windows.'
  },
  {
    id: 'mru',
    name: 'Most Recently Used (MRU)',
    shortName: 'MRU',
    category: 'Recency-Based',
    complexity: 'O(1)',
    hardwareNeeded: 'Recency Timestamp or Stack Top',
    beladysAnomaly: false,
    leadSummary: 'Replaces the page that was accessed most recently. While counter-intuitive for general computing, MRU is optimal for large cyclic scans where older items will be looped back to before newly scanned items.',
    concept: 'MRU prioritizes retaining older items when accessing data sequentially in a loop larger than the cache size. In cyclic access patterns (e.g., table scans across huge relations), evicting the most recently touched block preserves the blocks about to be reached next in the scan loop.',
    signalPhysics: {
      title: 'Cyclic Scan Adaptation',
      description: 'When memory footprint exceeds cache capacity in a repeated loop, MRU retains the start of the loop instead of constantly thrashing.',
      facts: [
        { label: 'Best Use Case', val: 'Large sequential iterations (Full Table Scans)' },
        { label: 'Eviction Target', val: 'Most recently accessed frame' },
        { label: 'Overhead', val: 'O(1) with recency pointers' },
        { label: "Belady's Anomaly", val: 'Immune in stack configurations' }
      ]
    },
    mathematics: {
      title: 'Recency Timestamp Maximization',
      formula: 'Victim = argmax_{p ∈ Frames} ( LastAccessTimestamp(p) )',
      description: 'When loop length L > Cache size C, LRU produces 0% hit rate because needed items are always evicted just before access. MRU yields (C-1)/L hit rate.'
    },
    pros: [
      'Prevents total cache thrashing during repetitive sequential table scans',
      'Provides superior throughput for large media streaming and database batch queries',
      'Simple pointer adjustment to the most recently touched frame'
    ],
    cons: [
      'Very poor hit ratios for standard applications with localized temporal loops',
      'Evicts active working set pages if applied globally to interactive programs',
      'Specialized algorithm requiring workload classification'
    ],
    osDeployment: 'Database management systems (Oracle, SQL Server buffer pool scan directives), big data map-reduce streaming readers.'
  },
  {
    id: 'lfu',
    name: 'Least Frequently Used (LFU)',
    shortName: 'LFU',
    category: 'Frequency-Based',
    complexity: 'O(1) with Frequency Bucket Doubly Linked Lists',
    hardwareNeeded: 'Software Reference Counter per Frame',
    beladysAnomaly: true,
    leadSummary: 'Maintains an access counter for each page. Replaces the page with the smallest access count. The intuition is that an actively used page will accumulate a high reference count.',
    concept: 'LFU tracks cumulative page utility over time. However, a major problem arises when a page is heavily used during the initialization phase of a program but never needed again: its high count prevents it from being evicted, leading to cache pollution.',
    signalPhysics: {
      title: 'Frequency Counter Accumulator',
      description: 'Each page maintains a 32-bit counter incremented on every memory reference. Eviction searches for min(Counter).',
      facts: [
        { label: 'Counter Overhead', val: 'Integer counter per page table entry' },
        { label: 'Vulnerability', val: 'Historical baggage (Old initialization pages linger)' },
        { label: 'Tie Breaking', val: 'FIFO or LRU among identical counts' },
        { label: "Belady's Anomaly", val: 'VULNERABLE' }
      ]
    },
    mathematics: {
      title: 'Access Count Minimization',
      formula: 'Victim = argmin_{p ∈ Frames} ( AccessCount(p) )',
      description: 'Assumes stationary access probabilities where past frequency predicts future demand.'
    },
    pros: [
      'Effectively protects long-term frequently accessed shared libraries and hot data',
      'Resistant to temporary one-off random accesses that would evict LRU items',
      'Clear semantic interpretation of page popularity'
    ],
    cons: [
      'Suffers from frequency saturation: initial setup pages never leave memory',
      'Newly loaded pages have count = 1 and are immediately evicted on the next fault',
      'Requires aging or periodic decay mechanisms to stay responsive to phase changes'
    ],
    osDeployment: 'Content Delivery Networks (CDN edge caching), Redis LFU eviction policy, and web proxy servers.'
  },
  {
    id: 'mfu',
    name: 'Most Frequently Used (MFU)',
    shortName: 'MFU',
    category: 'Frequency-Based',
    complexity: 'O(log N) or O(1) with frequency buckets',
    hardwareNeeded: 'Access Frequency Counter',
    beladysAnomaly: true,
    leadSummary: 'Based on the reasoning that the page with the smallest count was probably just brought into memory and has not yet had a chance to be used. Evicts the page with the highest reference count.',
    concept: 'MFU assumes that a page with a very high reference count has already served its purpose (e.g., finished an intensive nested compute loop) and can be safely evicted to make room for newer pages that need to build their working sets.',
    signalPhysics: {
      title: 'Inverted Frequency Eviction',
      description: 'Tracks memory reference frequencies and discards saturated pages to give new incoming pages opportunity to execute.',
      facts: [
        { label: 'Philosophy', val: 'High count indicates completed work' },
        { label: 'Counter Type', val: 'Monotonically increasing reference register' },
        { label: 'Stability', val: 'Low for general purpose workloads' },
        { label: "Belady's Anomaly", val: 'VULNERABLE' }
      ]
    },
    mathematics: {
      title: 'Access Count Maximization',
      formula: 'Victim = argmax_{p ∈ Frames} ( AccessCount(p) )',
      description: 'Evaluates the hypothesis that peak reference count represents finished execution loops.'
    },
    pros: [
      'Gives freshly loaded pages adequate time to accumulate references before eviction',
      'Avoids premature discarding of newly paged-in subroutine blocks',
      'Complements batch processing where loops terminate after heavy bursts'
    ],
    cons: [
      'Fails severely when hot loops continue executing indefinitely',
      'Frequently evicts the core kernel scheduler or frequently called subroutines',
      'Rarely deployed standalone in general purpose operating systems'
    ],
    osDeployment: 'Specialized transactional processing workloads with batch loop terminations.'
  },
  {
    id: 'second-chance',
    name: 'Second Chance Algorithm (FIFO with Reference Bit)',
    shortName: 'Second Chance',
    category: 'Approximation / Bit-Based',
    complexity: 'O(1) amortized',
    hardwareNeeded: '1 MMU Reference Bit (R-bit) per Frame',
    beladysAnomaly: true,
    leadSummary: 'A practical, hardware-friendly modification of FIFO. Each frame has a Reference bit. When choosing a victim, it inspects the oldest page: if R=0, it evicts it; if R=1, it clears R to 0, gives it a second chance, and moves it to the back of the queue.',
    concept: 'Second Chance avoids evicting actively used pages that happen to be old. It combines the low overhead of FIFO with an approximation of LRU recency by consulting the hardware reference bit set by the MMU on memory reads.',
    signalPhysics: {
      title: 'Reference Bit Clearing & Queue Rotation',
      description: 'When examining the FIFO front: if R=0, page is evicted; if R=1, R is cleared to 0 and page timestamp is refreshed to current time.',
      facts: [
        { label: 'Hardware Requirement', val: 'Single MMU Reference Bit (R-bit)' },
        { label: 'Worst-Case Behavior', val: 'Degenerates to pure FIFO if all R=1' },
        { label: 'Amortized Cost', val: 'O(1) frame lookup' },
        { label: "Belady's Anomaly", val: 'VULNERABLE (Inherited from FIFO basis)' }
      ]
    },
    mathematics: {
      title: 'Second Chance Decision Rule',
      formula: 'Action(p) = { Evict(p) if R(p) == 0;  R(p) ← 0, RotateToBack(p) if R(p) == 1 }',
      description: 'Guarantees that any page referenced during the current traversal revolution survives at least one complete cycle through physical memory.'
    },
    pros: [
      'Tremendously more effective than pure FIFO by preserving active pages',
      'Low hardware requirement: requires only a single reference bit in the page table',
      'Simple queue rotation with negligible computational overhead'
    ],
    cons: [
      'Can degenerate to basic FIFO if all pages are referenced (clears all bits and evicts oldest)',
      "Still theoretically vulnerable to Belady's Anomaly in specific pathological cases",
      'Queue modification requires pointer updates that can bottleneck shared queues'
    ],
    osDeployment: 'BSD Unix virtual memory subsystem, early Solaris OS, and foundational virtual memory teaching architectures.'
  },
  {
    id: 'clock',
    name: 'Clock Page Replacement Algorithm',
    shortName: 'Clock',
    category: 'Circular Queue Approximation',
    complexity: 'O(1) amortized',
    hardwareNeeded: '1 Reference Bit + Circular Pointer (Clock Hand)',
    beladysAnomaly: true,
    leadSummary: 'An efficient circular-list implementation of Second Chance. Rather than moving pages to the back of a physical queue, a circular buffer is used with a single advancing clock hand pointer, minimizing pointer shuffling overhead.',
    concept: 'The clock hand points to the oldest frame. On a page fault, the hand advances: if the current frame has R=0, it is chosen as the victim and replaced; if R=1, the bit is cleared to 0 and the hand advances to the next frame until an R=0 frame is found.',
    signalPhysics: {
      title: 'Circular Hand Sweep & Bit Inversion',
      description: 'Operates as a circular ring buffer. The clock hand sweeps forward. Any frame referenced since the last sweep survives with R cleared to 0.',
      facts: [
        { label: 'Data Structure', val: 'Fixed-size circular array ring' },
        { label: 'Pointer Movement', val: 'Modulo arithmetic (hand = (hand + 1) % frames)' },
        { label: 'Memory Allocation', val: 'Zero node allocation; in-place array updates' },
        { label: 'Amortized Search', val: 'At most 2 full revolutions to find victim' }
      ]
    },
    mathematics: {
      title: 'Clock Sweep Algorithm',
      formula: 'while (R[hand] == 1) { R[hand] = 0; hand = (hand + 1) % TotalFrames; } Evict(hand);',
      description: 'Every frame with R=1 is given a grace period. If it is referenced before the clock hand sweeps around again, its R bit is re-asserted by hardware.'
    },
    pros: [
      'Zero node memory allocations or linked-list pointer adjustments on eviction',
      'High cache efficiency with sequential array memory access for clock hand sweep',
      'Extremely close approximation to LRU with minimal CPU cycles'
    ],
    cons: [
      'Does not distinguish between clean pages and dirty (modified) pages needing disk writes',
      'Can degrade if memory pressure causes the clock hand to spin continuously',
      'May evict heavily written pages that impose expensive disk flush penalties'
    ],
    osDeployment: 'Linux kernel page cache eviction basis, Windows NT memory manager standby list, macOS Mach VM.'
  },
  {
    id: 'enhanced-second-chance',
    name: 'Enhanced Second Chance Algorithm',
    shortName: 'Enhanced Second Chance',
    category: 'Multi-Bit State Machine',
    complexity: 'O(N)',
    hardwareNeeded: 'Reference Bit (R) + Modified/Dirty Bit (M)',
    beladysAnomaly: true,
    leadSummary: 'Expands the Second Chance / Clock algorithm by considering both the Reference bit (R) and the Modified/Dirty bit (M) as an ordered pair (R, M). Categorizes all frames into four priority classes to minimize expensive disk write-backs.',
    concept: 'Writing a modified page to disk takes orders of magnitude longer than simply discarding a clean, unmodified page. Enhanced Second Chance divides pages into four classes: (0,0) best victim, (0,1) unreferenced but dirty, (1,0) referenced but clean, and (1,1) worst victim. It sweeps memory to find the lowest non-empty class.',
    signalPhysics: {
      title: 'Four Priority Classes (R, M)',
      description: 'Class 0: (0, 0) neither recently used nor modified.\nClass 1: (0, 1) not recently used, but modified (needs disk write).\nClass 2: (1, 0) recently used, but clean.\nClass 3: (1, 1) recently used and modified.',
      facts: [
        { label: 'Priority Order', val: '(0,0) → (0,1) → (1,0) → (1,1)' },
        { label: 'I/O Optimization', val: 'Prefers evicting clean pages to avoid disk write penalty' },
        { label: 'Hardware Bits', val: 'R bit (read/write access) + M bit (write/dirty access)' },
        { label: 'Passes', val: 'Up to 4 passes over circular buffer' }
      ]
    },
    mathematics: {
      title: 'Priority Class Function',
      formula: 'Class(p) = 2 · R(p) + M(p) ∈ {0, 1, 2, 3}',
      description: 'Algorithm scans for Class 0. If none found, scans for Class 1 while setting R=0 on inspected frames. Repeats until a victim is identified.'
    },
    pros: [
      'Drastically reduces secondary storage write operations by favoring clean pages',
      'Balances recency of access with the physical cost of I/O latency',
      'Highly realistic model matching production virtual memory controllers'
    ],
    cons: [
      'May require multiple passes through the frame table, increasing fault latency',
      'Complexity of state transitions with both R and M hardware bits',
      'Dirty pages may linger in memory longer than clean pages, biasing memory retention'
    ],
    osDeployment: 'Apple macOS XNU kernel, Windows Server memory manager page list prioritization, and modern hypervisors.'
  },
  {
    id: 'nru',
    name: 'Not Recently Used (NRU)',
    shortName: 'NRU',
    category: 'Class-Based Periodic Reset',
    complexity: 'O(1) random select within lowest class',
    hardwareNeeded: 'Reference Bit (R) + Dirty Bit (M) + Periodic Timer Interrupt',
    beladysAnomaly: true,
    leadSummary: 'Classifies pages into four classes using Reference and Dirty bits. A periodic hardware timer interrupt (e.g. Every 20ms) clears all Reference bits to 0, ensuring that only pages accessed within the most recent timer quantum are considered referenced.',
    concept: 'NRU is a coarse-grained approximation of LRU. Because R bits are wiped periodically, pages that were referenced long ago lose their R bit, preventing stale pages from monopolizing memory. On a page fault, NRU picks a random page from the lowest non-empty class.',
    signalPhysics: {
      title: 'Periodic Timer Epoch & Class Eviction',
      description: 'Timer fires every clock tick, resetting R=0 across all PTEs. The dirty bit M remains intact to indicate necessary swap writes.',
      facts: [
        { label: 'Timer Quantum', val: 'Typically 10ms - 50ms clock tick' },
        { label: 'Class 0', val: '(0,0) Clean, unreferenced in current epoch' },
        { label: 'Class 1', val: '(0,1) Dirty, unreferenced in current epoch' },
        { label: 'Class Selection', val: 'Random frame chosen from lowest non-empty class' }
      ]
    },
    mathematics: {
      title: 'Periodic Decay Operator',
      formula: '∀ p ∈ Memory : R(p) ← 0   (Executed on each TimerInterrupt)',
      description: 'Delineates recent history into discrete epochs, distinguishing recent memory touches from historical activity.'
    },
    pros: [
      'Very easy to understand and quick to implement with low overhead',
      'Periodic timer clearing prevents historical reference stagnation',
      'Adequately discriminates between clean and dirty pages'
    ],
    cons: [
      'Coarse granularity: all pages referenced in the last 20ms look identical',
      'Random selection within a class can evict the wrong page',
      'Performance sensitive to the chosen timer interrupt frequency'
    ],
    osDeployment: 'Classic UNIX System V, Minix 3 microkernel, and educational operating system kernels.'
  },
  {
    id: 'random',
    name: 'Random Page Replacement',
    shortName: 'Random',
    category: 'Probabilistic',
    complexity: 'O(1)',
    hardwareNeeded: 'Pseudo-Random Number Generator (PRNG)',
    beladysAnomaly: false,
    leadSummary: 'Selects a victim frame completely at random from physical memory using a pseudo-random number generator. Requires zero state tracking, counters, or access bits.',
    concept: 'Random replacement assumes that the overhead of tracking page references and maintaining data structures exceeds the marginal performance gain of sophisticated heuristics in certain constrained environments. Remarkably, its average-case performance is often acceptable.',
    signalPhysics: {
      title: 'Uniform Probability Eviction',
      description: 'On a page fault, generates an integer index uniformly distributed over [0, Frames - 1].',
      facts: [
        { label: 'Selection Mechanism', val: 'Uniform pseudo-random generator' },
        { label: 'State Tracking', val: 'None (Zero bits per frame)' },
        { label: 'Overhead', val: 'PRNG invocation only (~2 CPU cycles)' },
        { label: "Belady's Anomaly", val: 'Statistically indeterminate' }
      ]
    },
    mathematics: {
      title: 'Uniform Distribution Eviction',
      formula: 'P(Victim = i) = 1 / TotalFrames,   ∀ i ∈ [0, TotalFrames - 1]',
      description: 'Every allocated physical memory frame has an identical mathematical probability of being evicted on every page fault.'
    },
    pros: [
      'Zero hardware requirements and zero memory state overhead',
      'Cannot be defeated by adversarial worst-case deterministic reference patterns',
      'Constant O(1) execution time with zero lock contention across CPU cores'
    ],
    cons: [
      'Can randomly evict the most critical kernel page or the page about to be accessed next',
      'Non-deterministic behavior makes system debugging and latency profiling difficult',
      'High page fault variance compared to locality-aware algorithms'
    ],
    osDeployment: 'ARM processor Translation Lookaside Buffer (TLB) hardware replacement, Intel CPU cache eviction fallback, and ultra-lightweight RTOS.'
  },
  {
    id: 'aging',
    name: 'Aging Page Replacement Algorithm',
    shortName: 'Aging',
    category: 'Shift Register Recency',
    complexity: 'O(N)',
    hardwareNeeded: '8-bit Software/Hardware Shift Register + Timer Tick',
    beladysAnomaly: false,
    leadSummary: 'A high-fidelity software approximation of LRU. Each page maintains an 8-bit counter (shift register). At regular timer intervals, each register is shifted right by 1 bit, and the current Reference bit is shifted into the most significant bit (MSB).',
    concept: 'Aging provides a fine-grained historical record of page accesses over the last 8 time intervals. A page referenced in the most recent interval has an MSB of 1 (value >= 128), while a page not accessed has an MSB of 0. On a page fault, the page with the smallest counter value is evicted.',
    signalPhysics: {
      title: '8-Bit Shift Register Dynamics',
      description: 'On timer interrupt: Age = (Age >> 1) | (R << 7), then R is cleared to 0. The smallest binary value represents the least recently used frame.',
      facts: [
        { label: 'Register Size', val: 'Typically 8 bits (tracks 8 time quanta)' },
        { label: 'Shift Direction', val: 'Logical Shift Right (LSR)' },
        { label: 'Resolution', val: 'High recency discrimination over time windows' },
        { label: 'Eviction Selection', val: 'argmin(AgeRegister)' }
      ]
    },
    mathematics: {
      title: 'Shift Register Recency Equation',
      formula: 'Age_t = ⌊ Age_{t-1} / 2 ⌋ + 128 · R_t',
      description: 'Exponentially decaying weighted average: access at time t-k contributes 2^(-k) to the current page age score.'
    },
    pros: [
      'Provides significantly higher recency resolution than standard Clock or Second Chance',
      'Gracefully forgets old access bursts as bits shift out of the 8-bit register',
      'Closely tracks true LRU performance without requiring expensive hardware timestamps'
    ],
    cons: [
      'Requires updating shift registers for all in-memory pages on every timer tick',
      'Cannot distinguish between accesses that occurred within the same timer interval',
      'Limited historical window (typically 8 time ticks before older references are lost)'
    ],
    osDeployment: 'Linux kernel active/inactive list page balancing, modern hypervisor memory ballooning drivers, and BSD page out daemon.'
  }
];
