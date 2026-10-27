import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Copy,
  Check,
  FileText,
  Activity,
  Code2,
  Sliders,
  Plus,
  Trash2,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Cpu,
  Video,
  MousePointer,
  AlertTriangle,
  ShieldCheck,
  Database,
  Terminal,
  Eye
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { DSA_CARDS, DSA_SECTIONS } from '../utils/dsaCardArts';
import { DSA_THEORY_DATA } from '../utils/dsaTheoryData';
import './DsaLabPage.css';

export default function DsaLabPage() {
  const { dsaId } = useParams();
  const navigate = useNavigate();

  // Scroll to absolute top on mount or module change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [dsaId]);

  // Validate module or fallback to binary-search
  const currentKey = DSA_CARDS[dsaId] ? dsaId : 'binary-search';
  const cardData = DSA_CARDS[currentKey];
  const theoryData = DSA_THEORY_DATA[currentKey] || DSA_THEORY_DATA['binary-search'];

  // Tabs: ONLY 2 SECTIONS ('theories' & 'functional') - Practical tab removed as requested
  const [activeTab, setActiveTab] = useState('theories');

  // Execution Mode: 'manual' (Step-by-step on every click) | 'video' (Auto 3s timer)
  const [execMode, setExecMode] = useState('manual');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoCountdown, setVideoCountdown] = useState(3);
  const [videoProgress, setVideoProgress] = useState(0);

  // Multi-language code tab state
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [copied, setCopied] = useState(false);

  // Diagnostics Logs (strictly no emojis)
  const [terminalLogs, setTerminalLogs] = useState([
    `[INIT] Algorithm module "${cardData.name}" loaded into memory.`,
    `[STATUS] Ready for interactive functional execution.`
  ]);

  // ========================================================
  // SIMULATION STATE: SORTING
  // ========================================================
  const defaultArray = [45, 12, 88, 32, 67, 21, 94, 50];
  const [customInput, setCustomInput] = useState('45, 12, 88, 32, 67, 21, 94, 50');
  const [sortBars, setSortBars] = useState([...defaultArray]);
  const [sortStep, setSortStep] = useState(0);
  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);

  // Precomputed sorting steps for smooth playback & comic dialogues (NO EMOJIS)
  const [sortingSteps, setSortingSteps] = useState([]);

  useEffect(() => {
    const a = [...sortBars];
    const n = a.length;
    const steps = [];
    let compCount = 0;
    let swapCount = 0;

    steps.push({
      bars: [...a],
      active: [],
      comicAction: 'INITIALIZE',
      comicSound: 'READY!',
      comicText: `Array initialized with ${n} elements. Ready for ${cardData.name} step traversal. Click Next Step or enable Video Mode!`,
      comicPos: 50,
      comps: 0,
      swaps: 0
    });

    if (currentKey === 'bubble-sort') {
      for (let i = 0; i < n - 1; i++) {
        let swappedInPass = false;
        for (let j = 0; j < n - i - 1; j++) {
          compCount++;
          const posPercent = Math.min(90, Math.max(10, ((j + 0.5) / n) * 100));

          if (a[j] > a[j + 1]) {
            swapCount++;
            const leftVal = a[j];
            const rightVal = a[j + 1];
            const tmp = a[j];
            a[j] = a[j + 1];
            a[j + 1] = tmp;
            swappedInPass = true;

            steps.push({
              bars: [...a],
              active: [j, j + 1],
              swapped: true,
              comicAction: 'ACTION: SWAP',
              comicSound: 'POW!',
              comicText: `Inversion detected: element [${leftVal}] at index ${j} is greater than [${rightVal}] at index ${j + 1}. Swapping them to bubble the larger value to the right.`,
              comicPos: posPercent,
              comps: compCount,
              swaps: swapCount
            });
          } else {
            steps.push({
              bars: [...a],
              active: [j, j + 1],
              swapped: false,
              comicAction: 'EVALUATE: COMPARE',
              comicSound: 'CHECK!',
              comicText: `Comparing [${a[j]}] and [${a[j + 1]}]. Since ${a[j]} <= ${a[j + 1]}, order invariant holds. Advancing without swap.`,
              comicPos: posPercent,
              comps: compCount,
              swaps: swapCount
            });
          }
        }
        if (!swappedInPass) {
          steps.push({
            bars: [...a],
            active: [],
            comicAction: 'STATUS: OPTIMIZED',
            comicSound: 'EARLY EXIT!',
            comicText: `Zero swaps occurred in this pass. Array is fully sorted; triggering early exit in O(N) linear time.`,
            comicPos: 50,
            comps: compCount,
            swaps: swapCount
          });
          break;
        }
      }
    } else if (currentKey === 'selection-sort') {
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
          compCount++;
          const posPercent = Math.min(90, Math.max(10, (j / n) * 100));
          if (a[j] < a[minIdx]) {
            minIdx = j;
            steps.push({
              bars: [...a],
              active: [i, j],
              comicAction: 'SCAN: CANDIDATE',
              comicSound: 'AHA!',
              comicText: `Found smaller minimum candidate [${a[j]}] at index ${j}. Recording candidate index.`,
              comicPos: posPercent,
              comps: compCount,
              swaps: swapCount
            });
          }
        }
        if (minIdx !== i) {
          swapCount++;
          const tmp = a[i];
          a[i] = a[minIdx];
          a[minIdx] = tmp;
          steps.push({
            bars: [...a],
            active: [i, minIdx],
            swapped: true,
            comicAction: 'ACTION: PLACE MIN',
            comicSound: 'SWAP!',
            comicText: `Placing identified minimum [${a[i]}] into permanent sorted slot index ${i}.`,
            comicPos: Math.min(90, Math.max(10, (i / n) * 100)),
            comps: compCount,
            swaps: swapCount
          });
        }
      }
    } else if (currentKey === 'insertion-sort') {
      for (let i = 1; i < n; i++) {
        let key = a[i];
        let j = i - 1;
        steps.push({
          bars: [...a],
          active: [i],
          comicAction: 'KEY: EXTRACT',
          comicSound: 'SELECT!',
          comicText: `Selected key value [${key}] from index ${i}. Scanning sorted left prefix for insertion target.`,
          comicPos: Math.min(90, Math.max(10, (i / n) * 100)),
          comps: compCount,
          swaps: swapCount
        });

        while (j >= 0 && a[j] > key) {
          compCount++;
          swapCount++;
          a[j + 1] = a[j];
          steps.push({
            bars: [...a],
            active: [j, j + 1],
            swapped: true,
            comicAction: 'ACTION: SHIFT',
            comicSound: 'SLIDE!',
            comicText: `Element [${a[j]}] is greater than key [${key}]. Shifting rightward into slot ${j + 1}.`,
            comicPos: Math.min(90, Math.max(10, (j / n) * 100)),
            comps: compCount,
            swaps: swapCount
          });
          j = j - 1;
        }
        a[j + 1] = key;
        steps.push({
          bars: [...a],
          active: [j + 1],
          comicAction: 'ACTION: INSERT',
          comicSound: 'DROP!',
          comicText: `Insertion boundary verified. Dropping key [${key}] into slot ${j + 1}.`,
          comicPos: Math.min(90, Math.max(10, ((j + 1) / n) * 100)),
          comps: compCount,
          swaps: swapCount
        });
      }
    } else {
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          compCount++;
          if (a[j] > a[j + 1]) {
            swapCount++;
            const tmp = a[j];
            a[j] = a[j + 1];
            a[j + 1] = tmp;
            steps.push({
              bars: [...a],
              active: [j, j + 1],
              swapped: true,
              comicAction: 'ACTION: PARTITION',
              comicSound: 'SWAP!',
              comicText: `Partitioning elements [${a[j + 1]}] and [${a[j]}] across boundary.`,
              comicPos: Math.min(90, Math.max(10, (j / n) * 100)),
              comps: compCount,
              swaps: swapCount
            });
          }
        }
      }
    }

    steps.push({
      bars: [...a],
      active: [],
      comicAction: 'STATUS: SORTED',
      comicSound: 'DONE!',
      comicText: `Execution complete. Total comparisons: ${compCount}, swaps: ${swapCount}. Array satisfies ascending order invariant.`,
      comicPos: 50,
      comps: compCount,
      swaps: swapCount
    });

    setSortingSteps(steps);
    setSortStep(0);
    setComparisons(0);
    setSwaps(0);
  }, [sortBars, currentKey]);

  // VIDEO MODE TIMER: AUTO-ADVANCE EVERY 3 SECONDS
  useEffect(() => {
    let timer;
    if (execMode === 'video' && videoPlaying && sortingSteps.length > 0) {
      const stepDuration = 3000;
      let elapsedInStep = 0;

      timer = setInterval(() => {
        elapsedInStep += 100;
        const progress = Math.min(100, (elapsedInStep / stepDuration) * 100);
        setVideoProgress(progress);

        const remainingSeconds = Math.ceil((stepDuration - elapsedInStep) / 1000);
        setVideoCountdown(Math.max(1, remainingSeconds));

        if (elapsedInStep >= stepDuration) {
          elapsedInStep = 0;
          setVideoProgress(0);
          setVideoCountdown(3);

          setSortStep((prev) => {
            if (prev >= sortingSteps.length - 1) {
              setVideoPlaying(false);
              return prev;
            }
            const next = prev + 1;
            const curr = sortingSteps[next];
            if (curr) {
              setComparisons(curr.comps);
              setSwaps(curr.swaps);
            }
            return next;
          });
        }
      }, 100);
    } else {
      setVideoProgress(0);
      setVideoCountdown(3);
    }

    return () => clearInterval(timer);
  }, [execMode, videoPlaying, sortingSteps]);

  // Manual Step Forward
  const handleStepForward = () => {
    if (sortStep < sortingSteps.length - 1) {
      const next = sortStep + 1;
      setSortStep(next);
      const curr = sortingSteps[next];
      if (curr) {
        setComparisons(curr.comps);
        setSwaps(curr.swaps);
      }
    }
  };

  const handleStepBack = () => {
    if (sortStep > 0) {
      const prev = sortStep - 1;
      setSortStep(prev);
      const curr = sortingSteps[prev];
      if (curr) {
        setComparisons(curr.comps);
        setSwaps(curr.swaps);
      }
    }
  };

  const handleResetSort = () => {
    setVideoPlaying(false);
    setSortStep(0);
    setComparisons(0);
    setSwaps(0);
    setVideoProgress(0);
    setVideoCountdown(3);
  };

  const handleApplyCustomArray = () => {
    const parsed = customInput
      .split(',')
      .map(x => parseInt(x.trim(), 10))
      .filter(x => !isNaN(x) && x > 0 && x <= 100);

    if (parsed.length >= 3 && parsed.length <= 14) {
      setSortBars(parsed);
      handleResetSort();
    }
  };

  // ========================================================
  // SIMULATION STATE: SEARCHING
  // ========================================================
  const searchArray = [12, 21, 32, 45, 50, 67, 88, 94];
  const [searchTarget, setSearchTarget] = useState(67);
  const [searchLow, setSearchLow] = useState(0);
  const [searchHigh, setSearchHigh] = useState(searchArray.length - 1);
  const [searchMid, setSearchMid] = useState(Math.floor((0 + searchArray.length - 1) / 2));
  const [searchComic, setSearchComic] = useState({
    action: 'SEARCH: STANDBY',
    sound: 'READY!',
    text: `Array is sorted in ascending order. Target is ${searchTarget}. Click Next Search Step to begin binary subdivision.`,
    pos: 50
  });

  const handleRunSearchStep = () => {
    if (searchLow > searchHigh) {
      setSearchComic({
        action: 'TARGET: NOT FOUND',
        sound: 'MISS!',
        text: `Interval boundary depleted (Low > High). Target ${searchTarget} does not exist in array.`,
        pos: 50
      });
      return;
    }

    const mid = Math.floor((searchLow + searchHigh) / 2);
    setSearchMid(mid);
    const midVal = searchArray[mid];
    const posPercent = Math.min(90, Math.max(10, (mid / searchArray.length) * 100));

    if (midVal === searchTarget) {
      setSearchComic({
        action: 'TARGET: FOUND',
        sound: 'MATCH!',
        text: `Target match confirmed! Element ${searchTarget} located at index ${mid} in logarithmic time.`,
        pos: posPercent
      });
    } else if (midVal < searchTarget) {
      setSearchLow(mid + 1);
      setSearchComic({
        action: 'INTERVAL: HALVE LEFT',
        sound: 'DISCARD!',
        text: `Array[${mid}] (${midVal}) < Target (${searchTarget}). Discarding left half; updating low boundary to ${mid + 1}.`,
        pos: posPercent
      });
    } else {
      setSearchHigh(mid - 1);
      setSearchComic({
        action: 'INTERVAL: HALVE RIGHT',
        sound: 'DISCARD!',
        text: `Array[${mid}] (${midVal}) > Target (${searchTarget}). Discarding right half; updating high boundary to ${mid - 1}.`,
        pos: posPercent
      });
    }
  };

  const handleResetSearch = () => {
    setSearchLow(0);
    setSearchHigh(searchArray.length - 1);
    setSearchMid(Math.floor((0 + searchArray.length - 1) / 2));
    setSearchComic({
      action: 'SEARCH: RESET',
      sound: 'STANDBY!',
      text: `Search interval reset to bounds [0 ... ${searchArray.length - 1}].`,
      pos: 50
    });
  };

  // ========================================================
  // SIMULATION STATE: BST
  // ========================================================
  const [bstNodes, setBstNodes] = useState([
    { val: 50, x: 250, y: 40 },
    { val: 30, x: 140, y: 110 },
    { val: 70, x: 360, y: 110 },
    { val: 20, x: 90, y: 180 },
    { val: 40, x: 190, y: 180 },
    { val: 60, x: 310, y: 180 },
    { val: 85, x: 410, y: 180 }
  ]);
  const [bstInputVal, setBstInputVal] = useState(55);
  const [activeBstNode, setActiveBstNode] = useState(null);
  const [bstComic, setBstComic] = useState({
    action: 'TREE: INVARIANT',
    sound: 'BST READY',
    text: 'Binary Search Tree property: Left subtree keys < Parent key < Right subtree keys.',
    pos: 50
  });

  const handleBstInsert = () => {
    if (!bstInputVal || bstNodes.some(n => n.val === bstInputVal)) return;
    const newNode = {
      val: bstInputVal,
      x: bstInputVal < 50 ? (bstInputVal < 30 ? 60 : 220) : (bstInputVal < 70 ? 280 : 440),
      y: 250
    };
    setBstNodes(prev => [...prev, newNode]);
    setActiveBstNode(newNode.val);
    setBstComic({
      action: 'TREE: NODE INSERTED',
      sound: 'LINKED!',
      text: `Key [${newNode.val}] inserted into binary search tree hierarchy obeying branch ordering rules.`,
      pos: Math.min(90, Math.max(10, (newNode.x / 500) * 100))
    });
    setBstInputVal(prev => prev + 7);
  };

  const initialBstNodes = [
    { val: 50, x: 250, y: 40 },
    { val: 30, x: 140, y: 110 },
    { val: 70, x: 360, y: 110 },
    { val: 20, x: 90, y: 180 },
    { val: 40, x: 190, y: 180 },
    { val: 60, x: 310, y: 180 },
    { val: 85, x: 410, y: 180 }
  ];

  const handleBstTraverse = () => {
    const sorted = [...bstNodes].sort((a, b) => a.val - b.val);
    setBstComic({
      action: 'TRAVERSAL: IN-ORDER',
      sound: 'SORTED!',
      text: `In-Order traversal yields sorted sequence: [${sorted.map(n => n.val).join(', ')}].`,
      pos: 50
    });
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < sorted.length) {
        setActiveBstNode(sorted[idx].val);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 600);
  };

  const handleBstPreOrder = () => {
    const order = [50, 30, 20, 40, 70, 60, 85].filter(v => bstNodes.some(n => n.val === v));
    setBstComic({
      action: 'TRAVERSAL: PRE-ORDER',
      sound: 'ROOT-FIRST!',
      text: `Pre-Order traversal (Root -> Left -> Right): [${order.join(', ')}].`,
      pos: 50
    });
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < order.length) {
        setActiveBstNode(order[idx]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 550);
  };

  const handleBstPostOrder = () => {
    const order = [20, 40, 30, 60, 85, 70, 50].filter(v => bstNodes.some(n => n.val === v));
    setBstComic({
      action: 'TRAVERSAL: POST-ORDER',
      sound: 'LEAF-FIRST!',
      text: `Post-Order traversal (Left -> Right -> Root): [${order.join(', ')}].`,
      pos: 50
    });
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < order.length) {
        setActiveBstNode(order[idx]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 550);
  };

  const handleBstReset = () => {
    setBstNodes(initialBstNodes);
    setActiveBstNode(null);
    setBstComic({
      action: 'TREE: RESET',
      sound: 'RESTORED',
      text: 'BST restored to 7-node balanced baseline.',
      pos: 50
    });
  };

  // ========================================================
  // SIMULATION STATE: LINKED LIST (SINGLY & DOUBLY)
  // ========================================================
  const [llNodes, setLlNodes] = useState([
    { id: 1, val: 16, addr: '0x10A' },
    { id: 2, val: 32, addr: '0x118' },
    { id: 3, val: 64, addr: '0x124' },
    { id: 4, val: 128, addr: '0x130' }
  ]);
  const [llInputVal, setLlInputVal] = useState(256);
  const [activeLlId, setActiveLlId] = useState(null);

  const handleLlInsertHead = () => {
    if (!llInputVal) return;
    const newAddr = `0x${(0x100 + Math.floor(Math.random() * 200)).toString(16).toUpperCase()}`;
    const newNode = { id: Date.now(), val: llInputVal, addr: newAddr };
    setLlNodes(prev => [newNode, ...prev]);
    setActiveLlId(newNode.id);
    setDsComic({
      action: 'ACTION: INSERT HEAD',
      sound: 'O(1) TIME',
      text: `Allocated node [${llInputVal}] at address ${newAddr}. Repointed HEAD in constant O(1) time.`
    });
    setLlInputVal(prev => prev + 16);
  };

  const handleLlInsertTail = () => {
    if (!llInputVal) return;
    const newAddr = `0x${(0x100 + Math.floor(Math.random() * 200)).toString(16).toUpperCase()}`;
    const newNode = { id: Date.now(), val: llInputVal, addr: newAddr };
    setLlNodes(prev => [...prev, newNode]);
    setActiveLlId(newNode.id);
    setDsComic({
      action: 'ACTION: INSERT TAIL',
      sound: 'LINKED!',
      text: `Appended node [${llInputVal}] at ${newAddr} to chain tail. Preceding node next pointer updated.`
    });
    setLlInputVal(prev => prev + 16);
  };

  const handleLlDeleteHead = () => {
    if (llNodes.length === 0) return;
    const deleted = llNodes[0];
    setLlNodes(prev => prev.slice(1));
    setDsComic({
      action: 'ACTION: DELETE HEAD',
      sound: 'DEALLOCATED',
      text: `Deallocated head node [${deleted.val}] at ${deleted.addr}. HEAD pointer advanced to next node.`
    });
  };

  const handleLlTraverse = () => {
    if (llNodes.length === 0) return;
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < llNodes.length) {
        setActiveLlId(llNodes[idx].id);
        setDsComic({
          action: 'TRAVERSAL: STEP',
          sound: `NODE_${idx}`,
          text: `Dereferencing pointer: Visiting node [${llNodes[idx].val}] located at address ${llNodes[idx].addr}.`
        });
        idx++;
      } else {
        clearInterval(interval);
        setActiveLlId(null);
      }
    }, 600);
  };

  // ========================================================
  // SIMULATION STATE: BINARY HEAP (MIN & MAX HEAP)
  // ========================================================
  const [heapArray, setHeapArray] = useState([95, 75, 60, 45, 30, 20, 15]);
  const [heapInputVal, setHeapInputVal] = useState(80);
  const [isMaxHeap, setIsMaxHeap] = useState(true);

  const handleInsertHeap = () => {
    if (!heapInputVal) return;
    const arr = [...heapArray, heapInputVal];
    let i = arr.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      const condition = isMaxHeap ? arr[i] > arr[parent] : arr[i] < arr[parent];
      if (condition) {
        const tmp = arr[i];
        arr[i] = arr[parent];
        arr[parent] = tmp;
        i = parent;
      } else {
        break;
      }
    }
    setHeapArray(arr);
    setDsComic({
      action: `ACTION: INSERT (${isMaxHeap ? 'MAX-HEAP' : 'MIN-HEAP'})`,
      sound: 'SIFT-UP!',
      text: `Inserted key [${heapInputVal}]. Sifted up through tree hierarchy preserving heap property in O(log n).`
    });
    setHeapInputVal(prev => prev + 5);
  };

  const handleExtractRoot = () => {
    if (heapArray.length === 0) return;
    const root = heapArray[0];
    if (heapArray.length === 1) {
      setHeapArray([]);
      return;
    }
    const arr = [...heapArray];
    arr[0] = arr.pop();
    let i = 0;
    const n = arr.length;
    while (true) {
      let candidate = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && (isMaxHeap ? arr[left] > arr[candidate] : arr[left] < arr[candidate])) {
        candidate = left;
      }
      if (right < n && (isMaxHeap ? arr[right] > arr[candidate] : arr[right] < arr[candidate])) {
        candidate = right;
      }
      if (candidate !== i) {
        const tmp = arr[i];
        arr[i] = arr[candidate];
        arr[candidate] = tmp;
        i = candidate;
      } else {
        break;
      }
    }
    setHeapArray(arr);
    setDsComic({
      action: 'ACTION: EXTRACT ROOT',
      sound: 'EXTRACTED!',
      text: `Extracted ${isMaxHeap ? 'maximum' : 'minimum'} root [${root}]. Swapped with leaf and sifted down in O(log n).`
    });
  };

  // ========================================================
  // SIMULATION STATE: GRAPH TRAVERSAL (BFS & DFS)
  // ========================================================
  const graphAdjacency = {
    A: ['B', 'C'],
    B: ['A', 'D', 'E'],
    C: ['A', 'F'],
    D: ['B'],
    E: ['B', 'F'],
    F: ['C', 'E']
  };
  const [visitedGraphNodes, setVisitedGraphNodes] = useState([]);
  const [activeGraphNode, setActiveGraphNode] = useState(null);

  const handleRunBfs = () => {
    const visited = [];
    const queue = ['A'];
    const seen = new Set(['A']);
    while (queue.length > 0) {
      const curr = queue.shift();
      visited.push(curr);
      (graphAdjacency[curr] || []).forEach(nbr => {
        if (!seen.has(nbr)) {
          seen.add(nbr);
          queue.push(nbr);
        }
      });
    }
    setDsComic({
      action: 'TRAVERSAL: BFS (QUEUE-BASED)',
      sound: 'BREADTH-FIRST',
      text: `BFS explores neighbors layer-by-layer: ${visited.join(' -> ')} using FIFO queue.`
    });
    setVisitedGraphNodes([]);
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < visited.length) {
        const node = visited[idx];
        setActiveGraphNode(node);
        setVisitedGraphNodes(prev => [...prev, node]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 600);
  };

  const handleRunDfs = () => {
    const visited = [];
    const seen = new Set();
    const dfs = (u) => {
      seen.add(u);
      visited.push(u);
      (graphAdjacency[u] || []).forEach(v => {
        if (!seen.has(v)) dfs(v);
      });
    };
    dfs('A');
    setDsComic({
      action: 'TRAVERSAL: DFS (STACK-BASED)',
      sound: 'DEPTH-FIRST',
      text: `DFS explores deep branches first: ${visited.join(' -> ')} using recursive call stack.`
    });
    setVisitedGraphNodes([]);
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < visited.length) {
        const node = visited[idx];
        setActiveGraphNode(node);
        setVisitedGraphNodes(prev => [...prev, node]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 600);
  };

  const handleResetGraph = () => {
    setVisitedGraphNodes([]);
    setActiveGraphNode(null);
    setDsComic({
      action: 'GRAPH: RESET',
      sound: 'READY',
      text: 'Graph traversal state cleared. Choose BFS or DFS to begin search.'
    });
  };

  // ========================================================
  // SIMULATION STATE: STACK (LIFO) & QUEUE (FIFO) - IMPROVED
  // ========================================================
  const [stackItems, setStackItems] = useState([100, 110, 120, 130, 140, 150]);
  const [stackInput, setStackInput] = useState(160);
  const maxStackSlots = 8;

  const [queueItems, setQueueItems] = useState(['Req-1', 'Req-2', 'Req-3', 'Req-4']);
  const [queueInput, setQueueInput] = useState('Req-5');

  const [dsComic, setDsComic] = useState({
    action: 'DATA STRUCTURE: ONLINE',
    sound: 'READY',
    text: 'Memory pipeline active. Perform push/pop or enqueue/dequeue operations to observe state transitions.'
  });

  const handlePushStack = () => {
    if (!stackInput) return;
    if (stackItems.length >= maxStackSlots) {
      setDsComic({
        action: 'ERROR: STACK OVERFLOW',
        sound: 'OVERFLOW!',
        text: `Stack capacity limit reached (${maxStackSlots} slots). Cannot push without popping first.`
      });
      return;
    }
    const val = stackInput;
    setStackItems(prev => [...prev, val]);
    setDsComic({
      action: 'ACTION: PUSH (LIFO)',
      sound: 'PUSH!',
      text: `Pushed element [${val}] onto TOP of stack. In LIFO semantics, this element will be the FIRST one popped.`
    });
    setStackInput(prev => prev + 10);
  };

  const handlePopStack = () => {
    if (stackItems.length === 0) {
      setDsComic({
        action: 'ERROR: STACK UNDERFLOW',
        sound: 'UNDERFLOW!',
        text: 'Stack is empty. Cannot perform pop operation.'
      });
      return;
    }
    const popped = stackItems[stackItems.length - 1];
    setStackItems(prev => prev.slice(0, -1));
    setDsComic({
      action: 'ACTION: POP (LIFO)',
      sound: 'POP!',
      text: `Popped top element [${popped}] from stack in O(1) constant time. New top element is now exposed.`
    });
  };

  const handlePeekStack = () => {
    if (stackItems.length === 0) return;
    const top = stackItems[stackItems.length - 1];
    setDsComic({
      action: 'ACTION: PEEK (LIFO)',
      sound: 'PEEK!',
      text: `Peeked at current TOP element [${top}]. Value inspected without mutating stack memory.`
    });
  };

  const handleClearStack = () => {
    setStackItems([]);
    setDsComic({
      action: 'ACTION: CLEAR STACK',
      sound: 'RESET!',
      text: 'Stack memory reset. All registers cleared to 0.'
    });
  };

  const handleEnqueue = () => {
    if (!queueInput.trim()) return;
    if (queueItems.length >= 7) {
      setDsComic({
        action: 'ERROR: QUEUE FULL',
        sound: 'FULL!',
        text: 'Queue capacity reached. Dequeue an element from front before adding new entries.'
      });
      return;
    }
    const token = queueInput;
    setQueueItems(prev => [...prev, token]);
    setDsComic({
      action: 'ACTION: ENQUEUE (FIFO)',
      sound: 'ENQUEUE!',
      text: `Appended token [${token}] to the TAIL of the queue conduit. Enforced First-In, First-Out sequence.`
    });
    const nextNum = parseInt(queueInput.replace('Req-', '') || '0', 10) + 1;
    setQueueInput(`Req-${nextNum}`);
  };

  const handleDequeue = () => {
    if (queueItems.length === 0) {
      setDsComic({
        action: 'ERROR: QUEUE EMPTY',
        sound: 'EMPTY!',
        text: 'Queue is empty. No elements available for dequeue.'
      });
      return;
    }
    const dequeued = queueItems[0];
    setQueueItems(prev => prev.slice(1));
    setDsComic({
      action: 'ACTION: DEQUEUE (FIFO)',
      sound: 'SERVED!',
      text: `Dequeued token [${dequeued}] from the HEAD of the line in O(1) constant time.`
    });
  };

  const handleCopyCode = () => {
    const snippet = theoryData.code?.[selectedLang] || '';
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSortingAlgo = ['bubble-sort', 'quick-sort', 'merge-sort', 'insertion-sort', 'selection-sort'].includes(currentKey);
  const isSearchingAlgo = ['binary-search', 'linear-search', 'jump-search'].includes(currentKey);
  const isTree = currentKey === 'binary-search-tree';
  const isStack = currentKey === 'stack-lifo';
  const isQueue = currentKey === 'queue-fifo';
  const isLinkedList = currentKey === 'linked-list';
  const isHeap = currentKey === 'heap-structure';
  const isGraph = currentKey === 'graph-traversal';

  const currentStepData = sortingSteps[sortStep] || sortingSteps[0] || {};
  const currentDisplayBars = currentStepData.bars || sortBars;
  const activeBarIndices = currentStepData.active || [];

  return (
    <div className="dsalab-viewport">
      {/* Top Navigation */}
      <Navbar onOpenFacility={(facilityId) => {
        if (facilityId === 'multi-mesh') navigate('/topologies');
        else if (facilityId === 'packet-trace' || facilityId === 'cdn') navigate('/cdn');
        else if (facilityId !== 'dsa-algo' && facilityId !== 'dsa') navigate('/');
      }} />

      <main className="dsalab-main-container">
        {/* Breadcrumb Navigation */}
        <div className="dsalab-breadcrumb-row">
          <button 
            type="button" 
            className="dsalab-back-pill"
            onClick={() => navigate('/dsa')}
            aria-label="Back to DSA Catalog"
          >
            <ArrowLeft size={14} />
            <span>Back to DSA Catalog</span>
          </button>
          <span className="dsalab-sep">/</span>
          <span className="dsalab-crumb-active">{cardData.name}</span>
        </div>

        {/* SUBHEADER TABS - ONLY 2 SECTIONS (PRACTICAL REMOVED) */}
        <nav className="topolab-subheader-tabs dsalab-subheader-dock">
          <div className="topolab-tabs-container">
            <div className="topolab-tabs-dock">
              <button
                type="button"
                className={`topolab-tab-btn ${activeTab === 'theories' ? 'active' : ''}`}
                onClick={() => setActiveTab('theories')}
              >
                <FileText size={15} />
                <span>Theories & Specs</span>
                <span className="tab-pill-badge">CURRICULUM</span>
              </button>

              <button
                type="button"
                className={`topolab-tab-btn ${activeTab === 'functional' ? 'active' : ''}`}
                onClick={() => setActiveTab('functional')}
              >
                <Cpu size={15} />
                <span>Functional Model</span>
                <span className="tab-pill-badge live-pulse">INTERACTIVE</span>
              </button>
            </div>

            <div className="topolab-subheader-meta">
              <span className="meta-dot live" />
              <span className="meta-label">ALGORITHM CORE ONLINE · {cardData.name.toUpperCase()}</span>
            </div>
          </div>
        </nav>

        {/* ========================================================
            TAB 1: THEORIES & SPECS (EXPANDED LONG THEORY CURRICULUM)
            ======================================================== */}
        {activeTab === 'theories' && (
          <div className="topolab-theory-layout">
            <div className="theory-main-column">
              {/* Concept & Architectural Overview */}
              <div className="theory-concept-card">
                <div className="theory-badge-row">
                  <span className="theory-tag cyan">{cardData.subCategory} Module</span>
                  <span className="theory-tag green">Time: {cardData.timeComplexity}</span>
                  <span className="theory-tag purple">Space: {cardData.spaceComplexity}</span>
                </div>
                <h2 className="theory-title">{theoryData.title}</h2>
                <p className="theory-body-p">{theoryData.overview}</p>
              </div>

              {/* Mathematical Invariants */}
              <div className="theory-concept-card">
                <h3 className="theory-section-title">
                  <ShieldCheck size={18} className="text-emerald-400" />
                  <span>Mathematical Invariants & Algorithmic Foundation</span>
                </h3>
                <p className="theory-body-p">
                  Every execution cycle maintains strict invariant state guarantees. At any iteration step <em>k</em>, the algorithm preserves ordering partitions and structural consistency:
                </p>
                <div className="math-proof-box">
                  {currentKey === 'linear-search' && `Recurrence Relation: T(N) = T(N-1) + O(1)\nSequential Invariant: At step i, target is absent from prefix A[0...i-1]. If A[i] == target, terminates with index i.\nTraversal Bound: At most N comparisons.`}
                  {currentKey === 'binary-search' && `Recurrence Relation: T(N) = T(N/2) + O(1)\nInvariant: If target in A[0...N-1], then target in A[low...high] across all steps.\nSearch Space Bound: k <= ceil(log2(N)) iterations.`}
                  {currentKey === 'jump-search' && `Recurrence Relation: T(N) = (N/m) + m comparisons\nOptimal Step Size: m = sqrt(N)\nTotal Complexity: O(sqrt(N)) jump phases followed by linear scan across block.`}
                  {currentKey === 'bubble-sort' && `Recurrence Relation: T(N) = T(N-1) + O(N) = O(N^2)\nInvariant: After pass i, subarray A[N-i...N-1] contains the i largest elements in strictly sorted order.`}
                  {currentKey === 'selection-sort' && `Recurrence Relation: T(N) = (N-1) + (N-2) + ... + 1 = N(N-1)/2 = O(N^2)\nInvariant: Subarray A[0...i-1] is sorted and contains elements <= any element in A[i...N-1].`}
                  {currentKey === 'insertion-sort' && `Recurrence Relation (Worst): T(N) = O(N^2), Best: T(N) = O(N)\nInvariant: At step i, prefix A[0...i-1] consists of original elements sorted relative to one another.`}
                  {currentKey === 'merge-sort' && `Divide & Conquer Recurrence: T(N) = 2T(N/2) + O(N) = O(N log N)\nMerge Invariant: Merging two sorted subarrays A[l...m] and A[m+1...r] yields sorted sequence in O(N).`}
                  {currentKey === 'quick-sort' && `Master Recurrence: T(N) = 2T(N/2) + O(N) [Average], T(N) = T(N-1) + O(N) [Worst]\nPartition Invariant: For pivot index p, A[left...p-1] <= A[p] <= A[p+1...right].`}
                  {currentKey === 'binary-search-tree' && `BST Property: For all node u in Left(v) => Key(u) < Key(v), and for all node w in Right(v) => Key(w) > Key(v).\nHeight Bound: Balanced O(log N) vs Degenerate Linked List O(N).`}
                  {currentKey === 'heap-structure' && `Heap Invariant: In Min-Heap, Key(Parent(i)) <= Key(i) for all i > 0. In Max-Heap, Key(Parent(i)) >= Key(i).\nTree Height Bound: h = floor(log2(N)), guaranteeing O(log N) sift operations.`}
                  {currentKey === 'linked-list' && `Pointer Chain Invariant: Head pointer references initial node. For all node k, node.next points to node k+1 or NULL. Invariant: Non-contiguous heap memory with O(1) head insertion.`}
                  {currentKey === 'graph-traversal' && `Traversal Bounds: BFS uses FIFO queue exploring radius levels in O(V + E); DFS uses recursion stack exploring deepest unvisited paths in O(V + E).\nGraph Invariant: Every reachable vertex is enqueued/visited exactly once.`}
                  {['stack-lifo', 'queue-fifo'].includes(currentKey) && `Abstract Data Type Invariant: Stack enforces Last-In-First-Out (LIFO) pointer semantics at O(1); Queue enforces First-In-First-Out (FIFO) head/tail pointers at O(1).`}
                </div>
              </div>

              {/* 4-Phase Working Mechanics */}
              <div className="theory-concept-card">
                <h3 className="theory-section-title">
                  <Layers size={18} className="text-cyan-400" />
                  <span>Phase-by-Phase Algorithmic Mechanics</span>
                </h3>

                <div className="theory-phase-card">
                  <div className="theory-phase-header">
                    <span className="phase-number-chip">PHASE 1</span>
                    <span className="phase-title">Input Validation & Boundary Initialization</span>
                  </div>
                  <p className="phase-desc">
                    Memory registers allocate pointer indices or buffer boundaries. In search modules, <code>low = 0</code> and <code>high = N - 1</code>; in sorting modules, loop counters establish outer invariant bounds.
                  </p>
                </div>

                <div className="theory-phase-card">
                  <div className="theory-phase-header">
                    <span className="phase-number-chip">PHASE 2</span>
                    <span className="phase-title">Comparative Inspection & Predicate Evaluation</span>
                  </div>
                  <p className="phase-desc">
                    Values at targeted pointer locations are dereferenced and evaluated against target comparison predicates.
                  </p>
                </div>

                <div className="theory-phase-card">
                  <div className="theory-phase-header">
                    <span className="phase-number-chip">PHASE 3</span>
                    <span className="phase-title">State Mutation (Swap, Inversion, or Pointer Shift)</span>
                  </div>
                  <p className="phase-desc">
                    If comparison predicates indicate ordering violation, in-place elements are swapped or search intervals are halved.
                  </p>
                </div>

                <div className="theory-phase-card">
                  <div className="theory-phase-header">
                    <span className="phase-number-chip">PHASE 4</span>
                    <span className="phase-title">Convergence & Terminal Termination</span>
                  </div>
                  <p className="phase-desc">
                    Outer loop bounds converge, yielding guaranteed sorted order or constant-time target index verification.
                  </p>
                </div>
              </div>

              {/* Edge Cases */}
              <div className="theory-concept-card">
                <h3 className="theory-section-title">
                  <AlertTriangle size={18} className="text-amber-400" />
                  <span>Failure Modes & Edge Cases</span>
                </h3>
                <ul className="theory-bullet-list">
                  {theoryData.keyPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                  <li><strong>Cache Locality:</strong> Arrays provide continuous spatial locality in L1/L2 caches; pointer structures induce dereference overhead.</li>
                  <li><strong>Integer Overflow Prevention:</strong> Midpoint calculations must use <code>low + (high - low) / 2</code> rather than <code>(low + high) / 2</code>.</li>
                </ul>
              </div>

              {/* Multi-Language Source Code */}
              <div className="theory-concept-card">
                <div className="code-lang-selector">
                  <div className="flex items-center gap-2">
                    <Code2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Verified Implementation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {['javascript', 'python', 'cpp', 'java'].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        className={`lang-pill-btn ${selectedLang === lang ? 'active' : ''}`}
                        onClick={() => setSelectedLang(lang)}
                      >
                        {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="code-copy-btn"
                      onClick={handleCopyCode}
                    >
                      {copied ? <Check size={12} className="copied-check" /> : <Copy size={12} />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>
                <div className="code-viewer-panel">
                  <pre className="code-pre">{theoryData.code?.[selectedLang] || '// Implementation ready.'}</pre>
                </div>
              </div>
            </div>

            {/* Sidebar Complexity Matrix */}
            <div className="theory-sidebar-column">
              <div className="theory-complexity-card">
                <h3 className="theory-sidebar-heading">Asymptotic Complexity Matrix</h3>
                <div className="complexity-table">
                  <div className="complexity-row">
                    <span className="tbl-label">Best Time:</span>
                    <span className="tbl-val green">{theoryData.complexity.bestTime}</span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">Average Time:</span>
                    <span className="tbl-val cyan">{theoryData.complexity.averageTime}</span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">Worst Time:</span>
                    <span className="tbl-val orange">{theoryData.complexity.worstTime}</span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">Space Complexity:</span>
                    <span className="tbl-val purple">{theoryData.complexity.spaceComplexity}</span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">Stability:</span>
                    <span className="tbl-val green">{currentKey.includes('sort') && !['quick-sort', 'selection-sort'].includes(currentKey) ? 'Stable' : 'Unstable / In-Place'}</span>
                  </div>
                </div>
              </div>

              <div className="theory-complexity-card">
                <h3 className="theory-sidebar-heading">Production Systems Deployments</h3>
                <ul className="theory-bullet-list">
                  <li><strong>Linux Kernel:</strong> CFS Scheduler uses Red-Black BSTs; page caching relies on binary search tables.</li>
                  <li><strong>V8 JavaScript Engine:</strong> Array.prototype.sort utilizes hybrid TimSort.</li>
                  <li><strong>Databases:</strong> B-Tree indices in PostgreSQL and MySQL rely on binary search within disk pages.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: FUNCTIONAL MODEL (IMPROVED - ZERO EMOJIS)
            ======================================================== */}
        {activeTab === 'functional' && (
          <div className="dsalab-sim-stage">
            {/* Execution Mode Toolbar */}
            <div className="execution-mode-toolbar">
              <div className="execution-mode-toggle">
                <button
                  type="button"
                  className={`mode-toggle-btn ${execMode === 'manual' ? 'active' : ''}`}
                  onClick={() => {
                    setExecMode('manual');
                    setVideoPlaying(false);
                  }}
                >
                  <MousePointer size={14} />
                  <span>Click Mode (Step-by-Step)</span>
                </button>
                <button
                  type="button"
                  className={`mode-toggle-btn ${execMode === 'video' ? 'active' : ''}`}
                  onClick={() => setExecMode('video')}
                >
                  <Video size={14} />
                  <span>Video Mode (3s Auto-Play)</span>
                </button>
              </div>

              {execMode === 'video' && (
                <div className="video-mode-telemetry">
                  <button
                    type="button"
                    className="sim-play-pill-btn"
                    onClick={() => setVideoPlaying(!videoPlaying)}
                  >
                    {videoPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span>{videoPlaying ? 'Pause Video' : 'Start Video Playback'}</span>
                  </button>
                  <div className="video-countdown-chip">
                    <Video size={12} />
                    <span>Next step in: <strong>{videoCountdown}s</strong></span>
                  </div>
                  <div className="video-progress-track">
                    <div className="video-progress-fill" style={{ width: `${videoProgress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* 1. SORTING SIMULATOR */}
            {isSortingAlgo && (
              <div className="dsalab-sim-card">
                <div className="sim-control-toolbar">
                  <div className="toolbar-left">
                    {execMode === 'manual' && (
                      <>
                        <button
                          type="button"
                          className="sim-icon-btn"
                          onClick={handleResetSort}
                          title="Reset to Start"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          type="button"
                          className="sim-icon-btn"
                          onClick={handleStepBack}
                          disabled={sortStep === 0}
                          title="Previous Step"
                        >
                          <SkipBack size={14} />
                        </button>
                        <button
                          type="button"
                          className="sim-play-pill-btn"
                          onClick={handleStepForward}
                          disabled={sortStep >= sortingSteps.length - 1}
                        >
                          <SkipForward size={14} />
                          <span>Next Step (Click)</span>
                        </button>
                      </>
                    )}

                    <div className="sim-step-scrubber">
                      <input
                        type="range"
                        min="0"
                        max={Math.max(0, sortingSteps.length - 1)}
                        value={sortStep}
                        onChange={(e) => {
                          const idx = parseInt(e.target.value, 10);
                          setSortStep(idx);
                          if (sortingSteps[idx]) {
                            setComparisons(sortingSteps[idx].comps);
                            setSwaps(sortingSteps[idx].swaps);
                          }
                        }}
                        className="scrubber-range"
                      />
                      <span className="scrubber-count">
                        Step {sortStep + 1} / {sortingSteps.length}
                      </span>
                    </div>
                  </div>

                  <div className="toolbar-right">
                    <div className="telemetry-badge">
                      <span className="tel-label">Comparisons:</span>
                      <span className="tel-val green">{comparisons}</span>
                    </div>
                    <div className="telemetry-badge">
                      <span className="tel-label">Swaps:</span>
                      <span className="tel-val cyan">{swaps}</span>
                    </div>
                  </div>
                </div>

                {/* COMIC SPEECH BUBBLE (STRICTLY NO EMOJIS) */}
                <div className="comic-speech-container">
                  <div 
                    className="comic-speech-bubble"
                    style={{
                      left: `clamp(160px, ${currentStepData.comicPos || 50}%, calc(100% - 160px))`
                    }}
                  >
                    <div className="comic-bubble-header">
                      <div className="flex items-center gap-2">
                        <span className="comic-action-badge">{currentStepData.comicAction || 'STEP'}</span>
                        <span className="comic-sfx">{currentStepData.comicSound || 'READY'}</span>
                      </div>
                      <span className="comic-step-count">Step {sortStep + 1} of {sortingSteps.length}</span>
                    </div>
                    <p className="comic-speech-text">{currentStepData.comicText || 'Observing memory state...'}</p>
                    <div className="comic-bubble-tail" />
                  </div>
                </div>

                {/* Array Bars */}
                <div className="sorting-bars-canvas">
                  {currentDisplayBars.map((val, idx) => {
                    const isActive = activeBarIndices.includes(idx);
                    const isSorted = sortStep === sortingSteps.length - 1;
                    return (
                      <div key={idx} className="bar-wrapper">
                        <div
                          className={`array-bar ${isActive ? 'active-bar' : ''} ${isSorted ? 'sorted-bar' : ''}`}
                          style={{
                            height: `${Math.max(20, (val / 100) * 220)}px`,
                            background: isSorted
                              ? '#00bf63'
                              : isActive
                              ? currentStepData.swapped ? '#ef4444' : '#38bdf8'
                              : '#1e293b'
                          }}
                        >
                          <span className="bar-val-label">{val}</span>
                        </div>
                        <span className="bar-idx-label">[{idx}]</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. SEARCHING SIMULATOR */}
            {isSearchingAlgo && (
              <div className="dsalab-sim-card">
                <div className="sim-control-toolbar">
                  <div className="toolbar-left">
                    <input
                      type="number"
                      value={searchTarget}
                      onChange={(e) => setSearchTarget(parseInt(e.target.value, 10) || 0)}
                      className="sim-number-input"
                      placeholder="Target"
                    />
                    <button
                      type="button"
                      className="sim-play-pill-btn"
                      onClick={handleRunSearchStep}
                    >
                      <Search size={14} />
                      <span>Next Search Step</span>
                    </button>
                    <button
                      type="button"
                      className="sim-icon-btn"
                      onClick={handleResetSearch}
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                  <div className="toolbar-right">
                    <div className="telemetry-badge">
                      <span className="tel-label">Low:</span>
                      <span className="tel-val cyan">[{searchLow}]</span>
                    </div>
                    <div className="telemetry-badge">
                      <span className="tel-label">Mid:</span>
                      <span className="tel-val green">[{searchMid}]</span>
                    </div>
                    <div className="telemetry-badge">
                      <span className="tel-label">High:</span>
                      <span className="tel-val orange">[{searchHigh}]</span>
                    </div>
                  </div>
                </div>

                {/* COMIC BUBBLE SEARCH (NO EMOJIS) */}
                <div className="comic-speech-container">
                  <div 
                    className="comic-speech-bubble"
                    style={{
                      left: `clamp(160px, ${searchComic.pos || 50}%, calc(100% - 160px))`
                    }}
                  >
                    <div className="comic-bubble-header">
                      <span className="comic-action-badge">{searchComic.action}</span>
                      <span className="comic-sfx">{searchComic.sound}</span>
                    </div>
                    <p className="comic-speech-text">{searchComic.text}</p>
                    <div className="comic-bubble-tail" />
                  </div>
                </div>

                <div className="search-grid-canvas">
                  {searchArray.map((val, idx) => {
                    const isMid = idx === searchMid;
                    const inRange = idx >= searchLow && idx <= searchHigh;
                    const isTarget = val === searchTarget && isMid;

                    return (
                      <div
                        key={idx}
                        className={`search-cell ${inRange ? 'in-range' : 'out-of-range'} ${isMid ? 'mid-cell' : ''} ${isTarget ? 'target-match' : ''}`}
                      >
                        <div className="cell-pointer-indicator">
                          {idx === searchLow && <span className="ptr-pill low">L</span>}
                          {idx === searchMid && <span className="ptr-pill mid">M</span>}
                          {idx === searchHigh && <span className="ptr-pill high">H</span>}
                        </div>
                        <span className="cell-num">{val}</span>
                        <span className="cell-idx">idx: {idx}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. IMPROVED BINARY SEARCH TREE (BST) VISUALIZER */}
            {isTree && (
              <div className="dsalab-sim-card">
                <div className="sim-control-toolbar">
                  <div className="toolbar-left">
                    <input
                      type="number"
                      value={bstInputVal}
                      onChange={(e) => setBstInputVal(parseInt(e.target.value, 10) || 0)}
                      className="sim-number-input"
                    />
                    <button
                      type="button"
                      className="sim-play-pill-btn"
                      onClick={handleBstInsert}
                    >
                      <Plus size={14} />
                      <span>Insert Node</span>
                    </button>
                    <button
                      type="button"
                      className="sim-icon-btn text-cyan-400"
                      onClick={handleBstTraverse}
                      title="Run In-Order Traversal"
                    >
                      <Layers size={14} />
                      <span className="text-xs">In-Order</span>
                    </button>
                    <button
                      type="button"
                      className="sim-icon-btn text-emerald-400"
                      onClick={handleBstPreOrder}
                      title="Run Pre-Order Traversal"
                    >
                      <Layers size={14} />
                      <span className="text-xs">Pre-Order</span>
                    </button>
                    <button
                      type="button"
                      className="sim-icon-btn text-purple-400"
                      onClick={handleBstPostOrder}
                      title="Run Post-Order Traversal"
                    >
                      <Layers size={14} />
                      <span className="text-xs">Post-Order</span>
                    </button>
                    <button
                      type="button"
                      className="sim-icon-btn text-slate-400"
                      onClick={handleBstReset}
                      title="Reset BST"
                    >
                      <RotateCcw size={14} />
                      <span className="text-xs">Reset</span>
                    </button>
                  </div>
                  <div className="toolbar-right">
                    <div className="telemetry-badge">
                      <span className="tel-label">Nodes:</span>
                      <span className="tel-val green">{bstNodes.length}</span>
                    </div>
                    <div className="telemetry-badge">
                      <span className="tel-label">Height:</span>
                      <span className="tel-val cyan">3 Levels</span>
                    </div>
                  </div>
                </div>

                {/* COMIC BUBBLE TREE (NO EMOJIS) */}
                <div className="comic-speech-container">
                  <div 
                    className="comic-speech-bubble"
                    style={{ left: `clamp(160px, ${bstComic.pos || 50}%, calc(100% - 160px))` }}
                  >
                    <div className="comic-bubble-header">
                      <span className="comic-action-badge">{bstComic.action}</span>
                      <span className="comic-sfx">{bstComic.sound}</span>
                    </div>
                    <p className="comic-speech-text">{bstComic.text}</p>
                    <div className="comic-bubble-tail" />
                  </div>
                </div>

                {/* Tree Metrics Bar */}
                <div className="stack-metrics-bar mb-3">
                  <span>STRUCTURE: RECURSIVE HIERARCHICAL BST</span>
                  <span>ROOT: [50]</span>
                  <span>INVARIANT: LEFT &lt; ROOT &lt; RIGHT</span>
                </div>

                <div className="bst-svg-stage">
                  <svg width="100%" height="320" viewBox="0 0 500 320">
                    <defs>
                      <filter id="bstGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <linearGradient id="treeBranchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00bf63" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>

                    {/* Tree Branch Connections */}
                    <line x1="250" y1="40" x2="140" y2="110" stroke="url(#treeBranchGrad)" strokeWidth="2" strokeDasharray="3,3" />
                    <line x1="250" y1="40" x2="360" y2="110" stroke="url(#treeBranchGrad)" strokeWidth="2" strokeDasharray="3,3" />
                    <line x1="140" y1="110" x2="90" y2="180" stroke="url(#treeBranchGrad)" strokeWidth="2" strokeDasharray="3,3" />
                    <line x1="140" y1="110" x2="190" y2="180" stroke="url(#treeBranchGrad)" strokeWidth="2" strokeDasharray="3,3" />
                    <line x1="360" y1="110" x2="310" y2="180" stroke="url(#treeBranchGrad)" strokeWidth="2" strokeDasharray="3,3" />
                    <line x1="360" y1="110" x2="410" y2="180" stroke="url(#treeBranchGrad)" strokeWidth="2" strokeDasharray="3,3" />

                    {bstNodes.map((n, i) => {
                      const isActive = activeBstNode === n.val;
                      return (
                        <g key={i}>
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={isActive ? 22 : 18}
                            fill={isActive ? '#00bf63' : '#080d16'}
                            stroke={isActive ? '#86efac' : '#38bdf8'}
                            strokeWidth={isActive ? '3' : '2'}
                            filter={isActive ? 'url(#bstGlow)' : undefined}
                            style={{ transition: 'all 0.3s ease' }}
                          />
                          <text
                            x={n.x}
                            y={n.y + 5}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="11.5"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            {n.val}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {/* 4. IMPROVED STACK (LIFO) VISUALIZER */}
            {isStack && (
              <div className="dsalab-sim-card">
                <div className="sim-control-toolbar">
                  <div className="toolbar-left">
                    <input
                      type="number"
                      value={stackInput}
                      onChange={(e) => setStackInput(parseInt(e.target.value, 10) || 0)}
                      className="sim-number-input"
                    />
                    <button type="button" className="sim-play-pill-btn" onClick={handlePushStack}>
                      <Plus size={14} />
                      <span>Push (LIFO)</span>
                    </button>
                    <button type="button" className="sim-icon-btn text-rose-400" onClick={handlePopStack} title="Pop Top Element">
                      <Trash2 size={14} />
                      <span>Pop</span>
                    </button>
                    <button type="button" className="sim-icon-btn text-cyan-400" onClick={handlePeekStack} title="Inspect Top">
                      <Eye size={14} />
                      <span>Peek</span>
                    </button>
                    <button type="button" className="sim-icon-btn text-slate-400" onClick={handleClearStack} title="Clear Stack">
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                  </div>
                  <div className="toolbar-right">
                    <div className="telemetry-badge">
                      <span className="tel-label">Items:</span>
                      <span className="tel-val green">{stackItems.length} / {maxStackSlots}</span>
                    </div>
                    <div className="telemetry-badge">
                      <span className="tel-label">Top Offset:</span>
                      <span className="tel-val cyan">0x7FFE{(stackItems.length * 8).toString(16).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* COMIC BUBBLE STACK (NO EMOJIS) */}
                <div className="comic-speech-container">
                  <div className="comic-speech-bubble" style={{ left: '50%' }}>
                    <div className="comic-bubble-header">
                      <span className="comic-action-badge">{dsComic.action}</span>
                      <span className="comic-sfx">{dsComic.sound}</span>
                    </div>
                    <p className="comic-speech-text">{dsComic.text}</p>
                    <div className="comic-bubble-tail" />
                  </div>
                </div>

                {/* HIGH-TECH STACK CHUTE & MEMORY RACK */}
                <div className="stack-visualizer-stage">
                  <div className="stack-metrics-bar">
                    <span>STRUCTURE: VERTICAL LIFO MEMORY RACK</span>
                    <span>ACTIVE REGISTER: {stackItems.length > 0 ? `[VAL: ${stackItems[stackItems.length - 1]}]` : '[EMPTY]'}</span>
                    <span>ACCESS: CONSTANT O(1)</span>
                  </div>

                  <div className="stack-chassis">
                    {/* Left Address Ruler */}
                    <div className="stack-address-ruler">
                      {Array.from({ length: maxStackSlots }).map((_, i) => (
                        <div key={i} className={`addr-tick ${i === stackItems.length - 1 ? 'active-tick' : ''}`}>
                          <span>0x7FFE{(i * 8).toString(16).padStart(2, '0').toUpperCase()}</span>
                        </div>
                      ))}
                    </div>

                    {/* Central Tube with Memory Plates */}
                    <div>
                      <div className="stack-column-tube">
                        {/* Render active stack items */}
                        {stackItems.map((val, idx) => {
                          const isTop = idx === stackItems.length - 1;
                          return (
                            <div key={idx} className={`stack-plate-item ${isTop ? 'top-plate' : ''}`}>
                              <span className="text-xs text-slate-400 font-mono">[{idx}]</span>
                              <span className="text-base font-bold text-white tracking-wider">{val}</span>
                              <span className="text-xs text-slate-500 font-mono">SLOT_{idx}</span>
                              {isTop && (
                                <div className="plate-pointer-flag">
                                  <span>TOP (ESP)</span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Render empty placeholders if stack is below max capacity */}
                        {Array.from({ length: maxStackSlots - stackItems.length }).map((_, emptyIdx) => (
                          <div key={`empty-${emptyIdx}`} className="stack-empty-slot">
                            <span>EMPTY REGISTER</span>
                          </div>
                        ))}
                      </div>

                      {/* Stack Base Pedestal */}
                      <div className="stack-base-pedestal" />
                      <div className="text-center font-mono text-[10px] text-slate-500 pt-1 tracking-wider">
                        STACK MEMORY BOUNDARY (BASE)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. IMPROVED QUEUE (FIFO) VISUALIZER */}
            {isQueue && (
              <div className="dsalab-sim-card">
                <div className="sim-control-toolbar">
                  <div className="toolbar-left">
                    <input
                      type="text"
                      value={queueInput}
                      onChange={(e) => setQueueInput(e.target.value)}
                      className="sim-number-input"
                    />
                    <button type="button" className="sim-play-pill-btn" onClick={handleEnqueue}>
                      <Plus size={14} />
                      <span>Enqueue (FIFO)</span>
                    </button>
                    <button type="button" className="sim-icon-btn text-rose-400" onClick={handleDequeue} title="Dequeue Front Element">
                      <Trash2 size={14} />
                      <span>Dequeue</span>
                    </button>
                    <button type="button" className="sim-icon-btn text-slate-400" onClick={() => setQueueItems([])} title="Clear Queue">
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                  </div>
                  <div className="toolbar-right">
                    <div className="telemetry-badge">
                      <span className="tel-label">Items in Queue:</span>
                      <span className="tel-val cyan">{queueItems.length}</span>
                    </div>
                    <div className="telemetry-badge">
                      <span className="tel-label">Invariant:</span>
                      <span className="tel-val green">First-In First-Out</span>
                    </div>
                  </div>
                </div>

                {/* COMIC BUBBLE QUEUE (NO EMOJIS) */}
                <div className="comic-speech-container">
                  <div className="comic-speech-bubble" style={{ left: '50%' }}>
                    <div className="comic-bubble-header">
                      <span className="comic-action-badge">{dsComic.action}</span>
                      <span className="comic-sfx">{dsComic.sound}</span>
                    </div>
                    <p className="comic-speech-text">{dsComic.text}</p>
                    <div className="comic-bubble-tail" />
                  </div>
                </div>

                {/* HIGH-TECH HORIZONTAL QUEUE CONDUIT */}
                <div className="queue-visualizer-stage">
                  <div className="stack-metrics-bar">
                    <span>STRUCTURE: HORIZONTAL FIFO CONDUIT</span>
                    <span>HEAD (EGRESS): {queueItems[0] || '[EMPTY]'}</span>
                    <span>TAIL (INGRESS): {queueItems[queueItems.length - 1] || '[EMPTY]'}</span>
                  </div>

                  <div className="flex items-center gap-3 w-full max-w-[880px]">
                    <span className="queue-port-label head">HEAD (DEQUEUE EXIT)</span>
                    
                    <div className="queue-conduit-tube">
                      {queueItems.length === 0 ? (
                        <div className="flex items-center justify-center w-full h-full text-xs font-mono text-slate-500 tracking-wider">
                          QUEUE IS CURRENTLY EMPTY
                        </div>
                      ) : (
                        queueItems.map((token, idx) => {
                          const isHead = idx === 0;
                          return (
                            <div key={idx} className={`queue-capsule ${isHead ? 'front-capsule' : ''}`}>
                              <span className="queue-capsule-tag">{isHead ? 'NEXT SERVED' : `POS_${idx}`}</span>
                              <span className="text-white font-bold">{token}</span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <span className="queue-port-label tail">TAIL (ENQUEUE ENTRY)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. IMPROVED LINKED LIST (SINGLY & DOUBLY) VISUALIZER */}
            {isLinkedList && (
              <div className="dsalab-sim-card">
                <div className="sim-control-toolbar">
                  <div className="toolbar-left">
                    <input
                      type="number"
                      value={llInputVal}
                      onChange={(e) => setLlInputVal(parseInt(e.target.value, 10) || 0)}
                      className="sim-number-input"
                    />
                    <button type="button" className="sim-play-pill-btn" onClick={handleLlInsertHead}>
                      <Plus size={14} />
                      <span>Insert Head (O(1))</span>
                    </button>
                    <button type="button" className="sim-play-pill-btn" onClick={handleLlInsertTail}>
                      <Plus size={14} />
                      <span>Insert Tail</span>
                    </button>
                    <button type="button" className="sim-icon-btn text-rose-400" onClick={handleLlDeleteHead} title="Delete Head Node">
                      <Trash2 size={14} />
                      <span>Delete Head</span>
                    </button>
                    <button type="button" className="sim-icon-btn text-cyan-400" onClick={handleLlTraverse} title="Traverse Chain">
                      <ArrowRight size={14} />
                      <span>Traverse</span>
                    </button>
                  </div>
                  <div className="toolbar-right">
                    <div className="telemetry-badge">
                      <span className="tel-label">Node Count:</span>
                      <span className="tel-val cyan">{llNodes.length}</span>
                    </div>
                    <div className="telemetry-badge">
                      <span className="tel-label">Head Address:</span>
                      <span className="tel-val green">{llNodes[0]?.addr || '0x0 (NULL)'}</span>
                    </div>
                  </div>
                </div>

                {/* COMIC BUBBLE (NO EMOJIS) */}
                <div className="comic-speech-container">
                  <div className="comic-speech-bubble" style={{ left: '50%' }}>
                    <div className="comic-bubble-header">
                      <span className="comic-action-badge">{dsComic.action}</span>
                      <span className="comic-sfx">{dsComic.sound}</span>
                    </div>
                    <p className="comic-speech-text">{dsComic.text}</p>
                    <div className="comic-bubble-tail" />
                  </div>
                </div>

                {/* LINKED LIST CONDUIT STAGE */}
                <div className="linked-list-stage">
                  <div className="stack-metrics-bar">
                    <span>STRUCTURE: HEAP POINTER MEMORY CHAIN</span>
                    <span>HEAD: {llNodes[0]?.addr || 'NULL'}</span>
                    <span>DISCIPLINE: NON-CONTIGUOUS ALLOCATION</span>
                  </div>

                  <div className="ll-chain-container">
                    <div className="ll-head-pointer-flag">
                      <span>HEAD</span>
                      <ArrowRight size={14} className="text-emerald-400" />
                    </div>

                    {llNodes.length === 0 ? (
                      <div className="text-slate-500 font-mono text-xs py-8">LINKED LIST IS EMPTY (HEAD = NULL)</div>
                    ) : (
                      llNodes.map((node, idx) => {
                        const isNodeActive = activeLlId === node.id;
                        const isLast = idx === llNodes.length - 1;
                        return (
                          <div key={node.id} className="flex items-center gap-2">
                            <div className={`ll-node-box ${isNodeActive ? 'active-node' : ''}`}>
                              <div className="ll-node-header">
                                <span className="ll-addr-label">{node.addr}</span>
                                <span className="ll-idx-label">NODE_{idx}</span>
                              </div>
                              <div className="ll-node-body">
                                <div className="ll-cell data-cell">
                                  <span className="ll-cell-title">DATA</span>
                                  <span className="ll-cell-val">{node.val}</span>
                                </div>
                                <div className="ll-cell next-cell">
                                  <span className="ll-cell-title">NEXT</span>
                                  <span className="ll-cell-ptr">{isLast ? '0x0' : llNodes[idx + 1]?.addr}</span>
                                </div>
                              </div>
                            </div>

                            {/* Pointer Arrow */}
                            <div className="ll-pointer-arrow">
                              <span className="arrow-line" />
                              <ArrowRight size={14} className="text-cyan-400" />
                            </div>
                          </div>
                        );
                      })
                    )}

                    <div className="ll-null-terminal">
                      <span>NULL (0x0)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. IMPROVED MIN & MAX BINARY HEAP VISUALIZER */}
            {isHeap && (
              <div className="dsalab-sim-card">
                <div className="sim-control-toolbar">
                  <div className="toolbar-left">
                    <input
                      type="number"
                      value={heapInputVal}
                      onChange={(e) => setHeapInputVal(parseInt(e.target.value, 10) || 0)}
                      className="sim-number-input"
                    />
                    <button type="button" className="sim-play-pill-btn" onClick={handleInsertHeap}>
                      <Plus size={14} />
                      <span>Insert Key</span>
                    </button>
                    <button type="button" className="sim-icon-btn text-rose-400" onClick={handleExtractRoot} title="Extract Root (Max/Min)">
                      <Trash2 size={14} />
                      <span>Extract Root</span>
                    </button>
                    <button
                      type="button"
                      className="sim-icon-btn text-cyan-400"
                      onClick={() => setIsMaxHeap(!isMaxHeap)}
                      title="Toggle Min / Max Heap"
                    >
                      <Sliders size={14} />
                      <span>{isMaxHeap ? 'Mode: MAX-HEAP' : 'Mode: MIN-HEAP'}</span>
                    </button>
                    <button
                      type="button"
                      className="sim-icon-btn text-slate-400"
                      onClick={() => setHeapArray([95, 75, 60, 45, 30, 20, 15])}
                      title="Reset Heap"
                    >
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                  </div>
                  <div className="toolbar-right">
                    <div className="telemetry-badge">
                      <span className="tel-label">Root:</span>
                      <span className="tel-val green">{heapArray[0] ?? 'EMPTY'}</span>
                    </div>
                    <div className="telemetry-badge">
                      <span className="tel-label">Heap Size:</span>
                      <span className="tel-val cyan">{heapArray.length}</span>
                    </div>
                  </div>
                </div>

                {/* COMIC BUBBLE (NO EMOJIS) */}
                <div className="comic-speech-container">
                  <div className="comic-speech-bubble" style={{ left: '50%' }}>
                    <div className="comic-bubble-header">
                      <span className="comic-action-badge">{dsComic.action}</span>
                      <span className="comic-sfx">{dsComic.sound}</span>
                    </div>
                    <p className="comic-speech-text">{dsComic.text}</p>
                    <div className="comic-bubble-tail" />
                  </div>
                </div>

                {/* HEAP STAGE: ARRAY VIEW */}
                <div className="heap-visualizer-stage">
                  <div className="stack-metrics-bar">
                    <span>STRUCTURE: COMPLETE BINARY HEAP ({isMaxHeap ? 'MAX-HEAP' : 'MIN-HEAP'})</span>
                    <span>ROOT: [{heapArray[0] ?? 'EMPTY'}]</span>
                    <span>INVARIANT: PARENT {isMaxHeap ? '>=' : '<='} CHILDREN</span>
                  </div>

                  <div className="heap-array-section">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3 block text-center">
                      Physical Array Layout: Parent(i) = Math.floor((i-1)/2) | Left(i) = 2i+1 | Right(i) = 2i+2
                    </span>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {heapArray.map((val, idx) => (
                        <div key={idx} className={`heap-array-cell ${idx === 0 ? 'root-cell' : ''}`}>
                          <span className="heap-cell-idx">[{idx}]</span>
                          <span className="heap-cell-val">{val}</span>
                          <span className="heap-cell-role">{idx === 0 ? 'ROOT' : `P:${Math.floor((idx - 1) / 2)}`}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. IMPROVED GRAPH (BFS & DFS) TRAVERSAL VISUALIZER */}
            {isGraph && (
              <div className="dsalab-sim-card">
                <div className="sim-control-toolbar">
                  <div className="toolbar-left">
                    <button type="button" className="sim-play-pill-btn" onClick={handleRunBfs}>
                      <Layers size={14} />
                      <span>Run BFS (Queue Layer Scan)</span>
                    </button>
                    <button type="button" className="sim-play-pill-btn text-emerald-400" onClick={handleRunDfs}>
                      <Activity size={14} />
                      <span>Run DFS (Stack Deep Scan)</span>
                    </button>
                    <button type="button" className="sim-icon-btn text-slate-400" onClick={handleResetGraph} title="Reset Graph">
                      <RotateCcw size={14} />
                      <span>Reset</span>
                    </button>
                  </div>
                  <div className="toolbar-right">
                    <div className="telemetry-badge">
                      <span className="tel-label">Visited:</span>
                      <span className="tel-val green">[{visitedGraphNodes.join(', ')}]</span>
                    </div>
                    <div className="telemetry-badge">
                      <span className="tel-label">Vertices:</span>
                      <span className="tel-val cyan">6 Nodes</span>
                    </div>
                  </div>
                </div>

                {/* COMIC BUBBLE (NO EMOJIS) */}
                <div className="comic-speech-container">
                  <div className="comic-speech-bubble" style={{ left: '50%' }}>
                    <div className="comic-bubble-header">
                      <span className="comic-action-badge">{dsComic.action}</span>
                      <span className="comic-sfx">{dsComic.sound}</span>
                    </div>
                    <p className="comic-speech-text">{dsComic.text}</p>
                    <div className="comic-bubble-tail" />
                  </div>
                </div>

                {/* GRAPH SVG STAGE */}
                <div className="graph-visualizer-stage">
                  <div className="stack-metrics-bar">
                    <span>STRUCTURE: UNWEIGHTED NETWORK GRAPH</span>
                    <span>START VERTEX: [A]</span>
                    <span>ALGORITHM: BFS (QUEUE) vs DFS (STACK)</span>
                  </div>

                  <div className="graph-svg-container">
                    <svg width="100%" height="320" viewBox="0 0 540 320">
                      <defs>
                        <filter id="graphGlow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Edges */}
                      <line x1="120" y1="80" x2="270" y2="60" stroke="#334155" strokeWidth="2" />
                      <line x1="120" y1="80" x2="160" y2="220" stroke="#334155" strokeWidth="2" />
                      <line x1="270" y1="60" x2="420" y2="90" stroke="#334155" strokeWidth="2" />
                      <line x1="270" y1="60" x2="310" y2="230" stroke="#334155" strokeWidth="2" />
                      <line x1="160" y1="220" x2="310" y2="230" stroke="#334155" strokeWidth="2" />
                      <line x1="420" y1="90" x2="450" y2="230" stroke="#334155" strokeWidth="2" />
                      <line x1="310" y1="230" x2="450" y2="230" stroke="#334155" strokeWidth="2" />

                      {/* Vertices */}
                      {[
                        { id: 'A', x: 120, y: 80 },
                        { id: 'B', x: 270, y: 60 },
                        { id: 'C', x: 160, y: 220 },
                        { id: 'D', x: 420, y: 90 },
                        { id: 'E', x: 310, y: 230 },
                        { id: 'F', x: 450, y: 230 }
                      ].map((v) => {
                        const isVisited = visitedGraphNodes.includes(v.id);
                        const isActive = activeGraphNode === v.id;
                        return (
                          <g key={v.id}>
                            <circle
                              cx={v.x}
                              cy={v.y}
                              r={isActive ? 24 : 20}
                              fill={isActive ? '#00bf63' : isVisited ? '#0284c7' : '#080d16'}
                              stroke={isActive ? '#86efac' : isVisited ? '#38bdf8' : '#475569'}
                              strokeWidth={isActive ? '3' : '2'}
                              filter={isActive ? 'url(#graphGlow)' : undefined}
                              style={{ transition: 'all 0.3s ease' }}
                            />
                            <text
                              x={v.x}
                              y={v.y + 5}
                              textAnchor="middle"
                              fill="#ffffff"
                              fontSize="13"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {v.id}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
