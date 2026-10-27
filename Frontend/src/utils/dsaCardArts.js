// DSA Modules metadata using HoloCard reactbits presets
// Split into 2 distinct sections:
// Section 1: ALGORITHMS (SEARCHING & SORTING)
// Section 2: DATA STRUCTURES

export const DSA_SECTIONS = {
  ALGORITHMS: 'algorithms',
  DATA_STRUCTURES: 'data_structures'
};

export const DSA_CARDS = {
  // ==========================================
  // SECTION 1: SEARCHING ALGORITHMS
  // ==========================================
  'binary-search': {
    id: 'binary-search',
    name: 'Binary Search',
    section: DSA_SECTIONS.ALGORITHMS,
    subCategory: 'Searching',
    preset: 'stars',
    foilColor: '#00bf63',
    iconName: 'Search',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Divide-and-conquer search algorithm repeatedly halving the search space in a sorted array by comparing against the midpoint.',
    stats: 'Best: O(1) • Worst: O(log n) • Prerequisite: Sorted Array',
    specs: [
      { label: 'Time Complexity', value: 'O(log n)' },
      { label: 'Space Complexity', value: 'O(1)' },
      { label: 'Method', value: 'Divide & Conquer' }
    ]
  },
  'linear-search': {
    id: 'linear-search',
    name: 'Linear Search',
    section: DSA_SECTIONS.ALGORITHMS,
    subCategory: 'Searching',
    preset: 'bursts',
    foilColor: '#38bdf8',
    iconName: 'ArrowRight',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Sequential search inspecting each element one by one from index 0 until the matching target is located or end of array is reached.',
    stats: 'Best: O(1) • Worst: O(n) • No Ordering Required',
    specs: [
      { label: 'Time Complexity', value: 'O(n)' },
      { label: 'Space Complexity', value: 'O(1)' },
      { label: 'Method', value: 'Sequential Scan' }
    ]
  },
  'jump-search': {
    id: 'jump-search',
    name: 'Jump Search',
    section: DSA_SECTIONS.ALGORITHMS,
    subCategory: 'Searching',
    preset: 'shards',
    foilColor: '#a855f7',
    iconName: 'Zap',
    timeComplexity: 'O(√n)',
    spaceComplexity: 'O(1)',
    description: 'Block jumping search algorithm skipping ahead by fixed steps of size √n, then performing backward linear scan once target is bounded.',
    stats: 'Best: O(1) • Worst: O(√n) • Optimal Jump: √n',
    specs: [
      { label: 'Time Complexity', value: 'O(√n)' },
      { label: 'Space Complexity', value: 'O(1)' },
      { label: 'Method', value: 'Block Stepping' }
    ]
  },

  // ==========================================
  // SECTION 1: SORTING ALGORITHMS
  // ==========================================
  'bubble-sort': {
    id: 'bubble-sort',
    name: 'Bubble Sort',
    section: DSA_SECTIONS.ALGORITHMS,
    subCategory: 'Sorting',
    preset: 'rainbow',
    foilColor: '#f59e0b',
    iconName: 'Repeat',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Comparison-based sorting repeatedly stepping through the list, swapping adjacent elements if they are in wrong numerical order.',
    stats: 'Best: O(n) • Worst: O(n²) • Stable • In-Place',
    specs: [
      { label: 'Time Complexity', value: 'O(n²)' },
      { label: 'Space Complexity', value: 'O(1)' },
      { label: 'Type', value: 'Comparison / Swap' }
    ]
  },
  'quick-sort': {
    id: 'quick-sort',
    name: 'Quick Sort',
    section: DSA_SECTIONS.ALGORITHMS,
    subCategory: 'Sorting',
    preset: 'glitter',
    foilColor: '#00bf63',
    iconName: 'GitCommit',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    description: 'Highly efficient partition exchange sort picking a pivot element and recursively partitioning the array into sub-arrays.',
    stats: 'Best: O(n log n) • Worst: O(n²) • Unstable • Divide & Conquer',
    specs: [
      { label: 'Time Complexity', value: 'O(n log n)' },
      { label: 'Space Complexity', value: 'O(log n)' },
      { label: 'Method', value: 'Pivot Partition' }
    ]
  },
  'merge-sort': {
    id: 'merge-sort',
    name: 'Merge Sort',
    section: DSA_SECTIONS.ALGORITHMS,
    subCategory: 'Sorting',
    preset: 'cosmos',
    foilColor: '#38bdf8',
    iconName: 'GitBranch',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    description: 'Stable divide-and-conquer sorting algorithm splitting the array into halves, recursively sorting them, and merging back in linear time.',
    stats: 'Guaranteed: O(n log n) • Stable • External Memory Friendly',
    specs: [
      { label: 'Time Complexity', value: 'O(n log n)' },
      { label: 'Space Complexity', value: 'O(n)' },
      { label: 'Method', value: 'Split & Merge' }
    ]
  },
  'insertion-sort': {
    id: 'insertion-sort',
    name: 'Insertion Sort',
    section: DSA_SECTIONS.ALGORITHMS,
    subCategory: 'Sorting',
    preset: 'gold',
    foilColor: '#eab308',
    iconName: 'Layers',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'Iterative sorting building a sorted subarray one element at a time by shifting elements greater than current key to the right.',
    stats: 'Best: O(n) • Worst: O(n²) • Excellent for Small Data',
    specs: [
      { label: 'Time Complexity', value: 'O(n²)' },
      { label: 'Space Complexity', value: 'O(1)' },
      { label: 'Adaptive', value: 'Yes (O(n) on sorted)' }
    ]
  },
  'selection-sort': {
    id: 'selection-sort',
    name: 'Selection Sort',
    section: DSA_SECTIONS.ALGORITHMS,
    subCategory: 'Sorting',
    preset: 'swirl',
    foilColor: '#ec4899',
    iconName: 'Sliders',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    description: 'In-place comparison sort dividing the list into sorted and unsorted segments, repeatedly finding the minimum element in unsorted portion.',
    stats: 'Always O(n²) • Minimizes Swaps (Max n swaps) • In-Place',
    specs: [
      { label: 'Time Complexity', value: 'O(n²)' },
      { label: 'Space Complexity', value: 'O(1)' },
      { label: 'Swaps Count', value: 'O(n) Swaps' }
    ]
  },

  // ==========================================
  // SECTION 2: DATA STRUCTURES
  // ==========================================
  'binary-search-tree': {
    id: 'binary-search-tree',
    name: 'Binary Search Tree',
    section: DSA_SECTIONS.DATA_STRUCTURES,
    subCategory: 'Trees',
    preset: 'stars',
    foilColor: '#00bf63',
    iconName: 'Network',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(n)',
    description: 'Hierarchical node tree where each node has at most two children, maintaining the invariant that left < root < right.',
    stats: 'Lookup: O(log n) • Insert: O(log n) • In-order traversal produces sorted output',
    specs: [
      { label: 'Search / Insert', value: 'O(log n)' },
      { label: 'Traversal', value: 'In/Pre/Post' },
      { label: 'Balance Factor', value: 'AVL / Red-Black' }
    ]
  },
  'linked-list': {
    id: 'linked-list',
    name: 'Linked List (Singly & Doubly)',
    section: DSA_SECTIONS.DATA_STRUCTURES,
    subCategory: 'Linear Structures',
    preset: 'cosmos',
    foilColor: '#38bdf8',
    iconName: 'Share2',
    timeComplexity: 'O(1) Insert',
    spaceComplexity: 'O(n)',
    description: 'Linear data collection of data elements called nodes, each pointing to the next (and previous) node in memory via heap pointers.',
    stats: 'Head Insert: O(1) • Search: O(n) • Dynamic memory allocation',
    specs: [
      { label: 'Insert at Head', value: 'O(1)' },
      { label: 'Access by Index', value: 'O(n)' },
      { label: 'Memory', value: 'Non-contiguous' }
    ]
  },
  'stack-lifo': {
    id: 'stack-lifo',
    name: 'Stack (LIFO)',
    section: DSA_SECTIONS.DATA_STRUCTURES,
    subCategory: 'Linear Structures',
    preset: 'bursts',
    foilColor: '#f59e0b',
    iconName: 'Layers',
    timeComplexity: 'O(1) Push/Pop',
    spaceComplexity: 'O(n)',
    description: 'Last-In First-Out (LIFO) abstract data type supporting constant time Push, Pop, and Peek operations, foundational for call stacks.',
    stats: 'Push: O(1) • Pop: O(1) • Peek: O(1) • Call Stacks & Undo History',
    specs: [
      { label: 'Discipline', value: 'LIFO' },
      { label: 'Top Operations', value: 'O(1)' },
      { label: 'Use Case', value: 'DFS & Recursion' }
    ]
  },
  'queue-fifo': {
    id: 'queue-fifo',
    name: 'Queue (FIFO)',
    section: DSA_SECTIONS.DATA_STRUCTURES,
    subCategory: 'Linear Structures',
    preset: 'shards',
    foilColor: '#8b5cf6',
    iconName: 'ArrowRight',
    timeComplexity: 'O(1) Enqueue',
    spaceComplexity: 'O(n)',
    description: 'First-In First-Out (FIFO) pipeline where elements enter at the rear (Enqueue) and leave from the front (Dequeue), used in buffering.',
    stats: 'Enqueue: O(1) • Dequeue: O(1) • BFS Traversal & Job Schedulers',
    specs: [
      { label: 'Discipline', value: 'FIFO' },
      { label: 'Operations', value: 'O(1)' },
      { label: 'Use Case', value: 'BFS & Message Queues' }
    ]
  },
  'heap-structure': {
    id: 'heap-structure',
    name: 'Min & Max Binary Heap',
    section: DSA_SECTIONS.DATA_STRUCTURES,
    subCategory: 'Heaps & Priority',
    preset: 'gold',
    foilColor: '#eab308',
    iconName: 'Cpu',
    timeComplexity: 'O(log n) Insert',
    spaceComplexity: 'O(n)',
    description: 'Complete binary tree satisfying the heap property where parent node key is always smaller (Min-Heap) or larger (Max-Heap) than child keys.',
    stats: 'Peek Min/Max: O(1) • Extract: O(log n) • Powers Priority Queues',
    specs: [
      { label: 'Get Min/Max', value: 'O(1)' },
      { label: 'Extract Root', value: 'O(log n)' },
      { label: 'Use Case', value: "Dijkstra's Algo" }
    ]
  },
  'graph-traversal': {
    id: 'graph-traversal',
    name: 'Graph (BFS & DFS)',
    section: DSA_SECTIONS.DATA_STRUCTURES,
    subCategory: 'Graphs & Networks',
    preset: 'glitter',
    foilColor: '#00bf63',
    iconName: 'Grid',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    description: 'Non-linear network structure of vertices connected by edges, explored via Breadth-First Search (Queue) and Depth-First Search (Stack).',
    stats: 'Traversal: O(V + E) • Shortest Path (BFS) • Cycle Detection (DFS)',
    specs: [
      { label: 'Complexity', value: 'O(V + E)' },
      { label: 'Representations', value: 'Adjacency Matrix/List' },
      { label: 'Use Case', value: 'Social Networks & Routing' }
    ]
  }
};
