// DSA In-Depth Theory, Complexities, and Multi-language Code Implementations

export const DSA_THEORY_DATA = {
  'binary-search': {
    title: 'Binary Search Algorithm',
    overview: 'Binary Search is an optimal search algorithm that finds the position of a target value within a sorted array. Binary search compares the target value to the middle element of the array. If they are not equal, the half in which the target cannot lie is eliminated and the search continues on the remaining half, until the target is found or remaining search space is empty.',
    complexity: {
      bestTime: 'O(1) (Target is at midpoint)',
      averageTime: 'O(log n)',
      worstTime: 'O(log n)',
      spaceComplexity: 'O(1) (Iterative) / O(log n) (Recursive call stack)'
    },
    keyPoints: [
      'Strict Requirement: Input array must be sorted in non-decreasing order.',
      'Logarithmic Efficiency: Halves the search boundary at every iteration step.',
      'Prevents Integer Overflow: Midpoint calculation uses low + (high - low) / 2.',
      'Optimal for static databases with frequent read/lookup queries.'
    ],
    code: {
      javascript: `function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);

    if (arr[mid] === target) {
      return mid; // Target found
    } else if (arr[mid] < target) {
      low = mid + 1; // Discard left half
    } else {
      high = mid - 1; // Discard right half
    }
  }
  return -1; // Target not found
}`,
      python: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = low + (high - low) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1`,
      cpp: `#include <vector>

int binarySearch(const std::vector<int>& arr, int target) {
    int low = 0;
    int high = static_cast<int>(arr.size()) - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
      java: `public class BinarySearch {
    public static int search(int[] arr, int target) {
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }
}`
    }
  },

  'linear-search': {
    title: 'Linear Search Algorithm',
    overview: 'Linear Search is the most intuitive searching technique. It sequentially checks every element in a list until a match is found or all elements have been examined. It does not require the list to be sorted and works across arbitrary unsorted data structures.',
    complexity: {
      bestTime: 'O(1) (First element is target)',
      averageTime: 'O(n)',
      worstTime: 'O(n) (Target is at end or absent)',
      spaceComplexity: 'O(1) (Auxiliary memory)'
    },
    keyPoints: [
      'Universal Applicability: Operates on unsorted and non-contiguous collections.',
      'Zero Pre-processing: Requires no expensive sorting overhead.',
      'Optimal for small datasets (< 100 elements) due to cache locality.'
    ],
    code: {
      javascript: `function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}`,
      python: `def linear_search(arr, target):
    for i, val in enumerate(arr):
        if val == target:
            return i
    return -1`,
      cpp: `int linearSearch(const std::vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); ++i) {
        if (arr[i] == target) return i;
    }
    return -1;
}`,
      java: `public class LinearSearch {
    public static int search(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) return i;
        }
        return -1;
    }
}`
    }
  },

  'jump-search': {
    title: 'Jump Search Algorithm',
    overview: 'Jump Search works on sorted arrays by jumping ahead by fixed block steps of size m = √n. Once an interval is found where arr[k] < target <= arr[k + m], it runs a linear search within that block to find the exact target position.',
    complexity: {
      bestTime: 'O(1)',
      averageTime: 'O(√n)',
      worstTime: 'O(√n)',
      spaceComplexity: 'O(1)'
    },
    keyPoints: [
      'Intermediate Alternative: Slower than Binary Search (O(log n)) but faster than Linear Search (O(n)).',
      'Optimal Jump Block Size: m = √n minimizes total comparisons.',
      'Useful in systems where jumping backward is expensive (e.g. tape drives or linked skip lists).'
    ],
    code: {
      javascript: `function jumpSearch(arr, target) {
  const n = arr.length;
  let step = Math.floor(Math.sqrt(n));
  let prev = 0;

  while (arr[Math.min(step, n) - 1] < target) {
    prev = step;
    step += Math.floor(Math.sqrt(n));
    if (prev >= n) return -1;
  }

  while (arr[prev] < target) {
    prev++;
    if (prev === Math.min(step, n)) return -1;
  }

  if (arr[prev] === target) return prev;
  return -1;
}`,
      python: `import math

def jump_search(arr, target):
    n = len(arr)
    step = int(math.sqrt(n))
    prev = 0
    
    while arr[min(step, n) - 1] < target:
        prev = step
        step += int(math.sqrt(n))
        if prev >= n:
            return -1
            
    while arr[prev] < target:
        prev += 1
        if prev == min(step, n):
            return -1
            
    if arr[prev] == target:
        return prev
    return -1`,
      cpp: `#include <cmath>
#include <vector>
#include <algorithm>

int jumpSearch(const std::vector<int>& arr, int target) {
    int n = arr.size();
    int step = std::sqrt(n);
    int prev = 0;

    while (arr[std::min(step, n) - 1] < target) {
        prev = step;
        step += std::sqrt(n);
        if (prev >= n) return -1;
    }

    while (arr[prev] < target) {
        prev++;
        if (prev == std::min(step, n)) return -1;
    }

    if (arr[prev] == target) return prev;
    return -1;
}`,
      java: `public class JumpSearch {
    public static int search(int[] arr, int target) {
        int n = arr.length;
        int step = (int) Math.floor(Math.sqrt(n));
        int prev = 0;

        while (arr[Math.min(step, n) - 1] < target) {
            prev = step;
            step += (int) Math.floor(Math.sqrt(n));
            if (prev >= n) return -1;
        }

        while (arr[prev] < target) {
            prev++;
            if (prev == Math.min(step, n)) return -1;
        }

        if (arr[prev] == target) return prev;
        return -1;
    }
}`
    }
  },

  'bubble-sort': {
    title: 'Bubble Sort Algorithm',
    overview: 'Bubble Sort is an elementary comparison algorithm that repeatedly iterates through a list, compares adjacent items, and swaps them if they are out of order. The pass through the list is repeated until no swaps are needed, which indicates that the list is fully sorted.',
    complexity: {
      bestTime: 'O(n) (Already sorted with swapped flag optimization)',
      averageTime: 'O(n²)',
      worstTime: 'O(n²) (Reverse sorted)',
      spaceComplexity: 'O(1) (In-place sorting)'
    },
    keyPoints: [
      'Stable Sort: Preserves relative ordering of elements with identical keys.',
      'In-Place: Uses O(1) auxiliary memory space.',
      'Bubbling Effect: The largest element always sinks to its correct position at the end of each pass.'
    ],
    code: {
      javascript: `function bubbleSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
      }
    }
    if (!swapped) break; // Optimized early exit
  }
  return a;
}`,
      python: `def bubble_sort(arr):
    a = arr.copy()
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break
    return a`,
      cpp: `void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; ++i) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; ++j) {
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
      java: `public class BubbleSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int tmp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = tmp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
}`
    }
  },

  'quick-sort': {
    title: 'Quick Sort Algorithm',
    overview: 'Quick Sort is a highly efficient divide-and-conquer sorting algorithm. It selects a "pivot" element from the array and partitions the other elements into two sub-arrays, according to whether they are less than or greater than the pivot. The sub-arrays are then sorted recursively.',
    complexity: {
      bestTime: 'O(n log n)',
      averageTime: 'O(n log n)',
      worstTime: 'O(n²) (Occurs with poor pivot choices like always picking min/max)',
      spaceComplexity: 'O(log n) (Recursive call stack memory)'
    },
    keyPoints: [
      'In-Place Performance: Cache friendly and widely adopted in standard programming libraries.',
      'Pivot Selection: Randomized or Median-of-Three pivot selection mitigates the O(n²) worst case.',
      'Unstable Sort: May alter relative order of equivalent elements.'
    ],
    code: {
      javascript: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
      python: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[-1]
    left = [x for x in arr[:-1] if x <= pivot]
    right = [x for x in arr[:-1] if x > pivot]
    return quick_sort(left) + [pivot] + quick_sort(right)`,
      cpp: `int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; ++j) {
        if (arr[j] < pivot) {
            ++i;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
      java: `public class QuickSort {
    public static void sort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            sort(arr, low, pi - 1);
            sort(arr, pi + 1, high);
        }
    }
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int t = arr[i]; arr[i] = arr[j]; arr[j] = t;
            }
        }
        int t = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = t;
        return i + 1;
    }
}`
    }
  },

  'merge-sort': {
    title: 'Merge Sort Algorithm',
    overview: 'Merge Sort is a guaranteed O(n log n) divide-and-conquer algorithm. It continually divides the unsorted list into n sublists, each containing one element (a list of one element is considered sorted), then repeatedly merges sublists to produce new sorted sublists until there is only one sublist remaining.',
    complexity: {
      bestTime: 'O(n log n)',
      averageTime: 'O(n log n)',
      worstTime: 'O(n log n) (Guaranteed upper bound)',
      spaceComplexity: 'O(n) (Requires auxiliary array buffer)'
    },
    keyPoints: [
      'Stable Sort: Preserves initial index sequence of duplicate values.',
      'Predictable Runtime: Never degrades to O(n²) regardless of input distribution.',
      'Ideal for linked lists and massive datasets stored on external storage media.'
    ],
    code: {
      javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}`,
      python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    return merged + left[i:] + right[j:]`,
      cpp: `void merge(std::vector<int>& arr, int l, int m, int r) {
    std::vector<int> left(arr.begin() + l, arr.begin() + m + 1);
    std::vector<int> right(arr.begin() + m + 1, arr.begin() + r + 1);
    int i = 0, j = 0, k = l;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}`,
      java: `public class MergeSort {
    public static void sort(int[] arr, int l, int r) {
        if (l < r) {
            int m = l + (r - l) / 2;
            sort(arr, l, m);
            sort(arr, m + 1, r);
            merge(arr, l, m, r);
        }
    }
    private static void merge(int[] arr, int l, int m, int r) {
        int[] L = java.util.Arrays.copyOfRange(arr, l, m + 1);
        int[] R = java.util.Arrays.copyOfRange(arr, m + 1, r + 1);
        int i = 0, j = 0, k = l;
        while (i < L.length && j < R.length) {
            if (L[i] <= R[j]) arr[k++] = L[i++];
            else arr[k++] = R[j++];
        }
        while (i < L.length) arr[k++] = L[i++];
        while (j < R.length) arr[k++] = R[j++];
    }
}`
    }
  },

  'insertion-sort': {
    title: 'Insertion Sort Algorithm',
    overview: 'Insertion Sort is an intuitive, stable comparison sorting algorithm that builds the final sorted array one item at a time. It iterates through an input array, consumes one element from the unsorted region, locates its proper place within the sorted prefix, and shifts larger elements to the right to accommodate insertion.',
    complexity: {
      bestTime: 'O(n) (Already sorted - single comparison per element)',
      averageTime: 'O(n²)',
      worstTime: 'O(n²) (Reverse sorted - maximum shift operations)',
      spaceComplexity: 'O(1) (Strictly in-place auxiliary memory)'
    },
    keyPoints: [
      'Adaptive & Online: Capable of sorting incoming continuous data streams in real time.',
      'Optimal for Small Datasets: Minimal constant overhead and exceptional CPU cache locality.',
      'Stable Sorting: Preserves initial relative sequence of duplicate elements.'
    ],
    code: {
      javascript: `function insertionSort(arr) {
  const a = [...arr];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
  }
  return a;
}`,
      python: `def insertion_sort(arr):
    a = arr.copy()
    for i in range(1, len(a)):
        key = a[i]
        j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a`,
      cpp: `#include <vector>

void insertionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
      java: `public class InsertionSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }
}`
    }
  },

  'selection-sort': {
    title: 'Selection Sort Algorithm',
    overview: 'Selection Sort is an in-place comparison algorithm that partitions the array into a sorted prefix and an unsorted suffix. In each iteration, it performs a linear sweep across the unsorted region to isolate the minimum element, and executes a single swap to position it at the end of the sorted prefix.',
    complexity: {
      bestTime: 'O(n²) (Always performs n(n-1)/2 comparisons)',
      averageTime: 'O(n²)',
      worstTime: 'O(n²)',
      spaceComplexity: 'O(1) (Strictly in-place)'
    },
    keyPoints: [
      'Minimal Write Operations: Executes at most O(n) swaps, ideal when memory write cycles cause physical wear (e.g. Flash).',
      'Deterministic Comparison Bounds: Comparison count is strictly invariant to initial array permutations.',
      'Unstable In-Place: Standard swap operations can invert duplicate elements across distant indices.'
    ],
    code: {
      javascript: `function selectionSort(arr) {
  const a = [...arr];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (a[j] < a[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
    }
  }
  return a;
}`,
      python: `def selection_sort(arr):
    a = arr.copy()
    n = len(a)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if a[j] < a[min_idx]:
                min_idx = j
        if min_idx != i:
            a[i], a[min_idx] = a[min_idx], a[i]
    return a`,
      cpp: `#include <vector>
#include <algorithm>

void selectionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx != i) std::swap(arr[i], arr[minIdx]);
    }
}`,
      java: `public class SelectionSort {
    public static void sort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            if (minIdx != i) {
                int temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
            }
        }
    }
}`
    }
  },

  'binary-search-tree': {
    title: 'Binary Search Tree (BST)',
    overview: 'A Binary Search Tree is a node-based binary tree data structure which has the following properties: the left subtree of a node contains only nodes with keys lesser than the node’s key; the right subtree contains only nodes with keys greater than the node’s key; and both left and right subtrees must also be binary search trees.',
    complexity: {
      bestTime: 'O(log n) (Balanced search / insertion)',
      averageTime: 'O(log n)',
      worstTime: 'O(n) (Skewed tree degenerate linked list)',
      spaceComplexity: 'O(n) (Total node memory storage)'
    },
    keyPoints: [
      'In-Order Traversal: Visiting Left -> Root -> Right yields all keys in sorted ascending order.',
      'Self-Balancing Trees: AVL Trees and Red-Black Trees prevent the O(n) skewed tree degeneration.',
      'Dynamic Resizing: Accommodates insertions and deletions without memory reallocations.'
    ],
    code: {
      javascript: `class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() { this.root = null; }

  insert(val) {
    const newNode = new TreeNode(val);
    if (!this.root) { this.root = newNode; return; }
    let curr = this.root;
    while (true) {
      if (val < curr.val) {
        if (!curr.left) { curr.left = newNode; break; }
        curr = curr.left;
      } else {
        if (!curr.right) { curr.right = newNode; break; }
        curr = curr.right;
      }
    }
  }
}`,
      python: `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None
        
    def insert(self, val):
        if not self.root:
            self.root = TreeNode(val)
            return
        curr = self.root
        while True:
            if val < curr.val:
                if not curr.left:
                    curr.left = TreeNode(val); break
                curr = curr.left
            else:
                if not curr.right:
                    curr.right = TreeNode(val); break
                curr = curr.right`,
      cpp: `struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

TreeNode* insert(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    if (val < root->val) root->left = insert(root->left, val);
    else root->right = insert(root->right, val);
    return root;
}`,
      java: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

public class BST {
    TreeNode root;
    public void insert(int val) {
        root = insertRec(root, val);
    }
    private TreeNode insertRec(TreeNode root, int val) {
        if (root == null) return new TreeNode(val);
        if (val < root.val) root.left = insertRec(root.left, val);
        else root.right = insertRec(root.right, val);
        return root;
    }
}`
    }
  },

  'stack-lifo': {
    title: 'Stack (Last-In First-Out)',
    overview: 'A Stack is a linear data structure following the LIFO (Last In First Out) principle. The last element inserted onto the stack is the first one to be removed. All operations occur at a single end termed the Top of the stack.',
    complexity: {
      bestTime: 'O(1) Push / Pop / Peek',
      averageTime: 'O(1)',
      worstTime: 'O(1)',
      spaceComplexity: 'O(n)'
    },
    keyPoints: [
      'Call Stack Management: Powers function call execution frames and recursion tracking.',
      'Expression Parsing: Evaluates infix, postfix, prefix arithmetic and syntax parenthesis matching.',
      'Backtracking: Enables Undo (Ctrl+Z) history and graph Depth-First Search.'
    ],
    code: {
      javascript: `class Stack {
  constructor() { this.items = []; }
  push(element) { this.items.push(element); }
  pop() { return this.items.pop(); }
  peek() { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}`,
      python: `class Stack:
    def __init__(self):
        self.items = []
    def push(self, item):
        self.items.append(item)
    def pop(self):
        return self.items.pop() if not self.is_empty() else None
    def peek(self):
        return self.items[-1] if not self.is_empty() else None
    def is_empty(self):
        return len(self.items) == 0`,
      cpp: `#include <vector>
template <typename T>
class Stack {
private:
    std::vector<T> elements;
public:
    void push(const T& val) { elements.push_back(val); }
    void pop() { elements.pop_back(); }
    T top() const { return elements.back(); }
    bool empty() const { return elements.empty(); }
};`,
      java: `import java.util.ArrayList;

public class CustomStack<T> {
    private ArrayList<T> list = new ArrayList<>();
    public void push(T val) { list.add(val); }
    public T pop() { return list.remove(list.size() - 1); }
    public T peek() { return list.get(list.size() - 1); }
    public boolean isEmpty() { return list.isEmpty(); }
}`
    }
  },

  'queue-fifo': {
    title: 'Queue (First-In First-Out)',
    overview: 'A Queue is a linear collection following the FIFO (First In First Out) discipline. Elements are enqueued at the back (Rear) and dequeued from the front (Head), mirroring real-world waiting lines and process buffers.',
    complexity: {
      bestTime: 'O(1) Enqueue / Dequeue',
      averageTime: 'O(1)',
      worstTime: 'O(1)',
      spaceComplexity: 'O(n)'
    },
    keyPoints: [
      'Breadth-First Search (BFS): Essential queue structure for level-by-level graph traversal.',
      'Operating System Scheduling: Manages printer spool queues, CPU ready queues, and IO task pipelines.',
      'Message Streaming: Underpins event loops, microservice message brokers, and socket buffers.'
    ],
    code: {
      javascript: `class Queue {
  constructor() { this.items = []; }
  enqueue(element) { this.items.push(element); }
  dequeue() { return this.items.shift(); }
  front() { return this.items[0]; }
  isEmpty() { return this.items.length === 0; }
}`,
      python: `from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()
    def enqueue(self, val):
        self.items.append(val)
    def dequeue(self):
        return self.items.popleft() if not self.is_empty() else None
    def is_empty(self):
        return len(self.items) == 0`,
      cpp: `#include <deque>
template <typename T>
class Queue {
private:
    std::deque<T> dq;
public:
    void enqueue(const T& val) { dq.push_back(val); }
    void dequeue() { dq.pop_front(); }
    T front() const { return dq.front(); }
    bool empty() const { return dq.empty(); }
};`,
      java: `import java.util.LinkedList;

public class CustomQueue<T> {
    private LinkedList<T> list = new LinkedList<>();
    public void enqueue(T val) { list.addLast(val); }
    public T dequeue() { return list.removeFirst(); }
    public T front() { return list.getFirst(); }
    public boolean isEmpty() { return list.isEmpty(); }
}`
    }
  },

  'linked-list': {
    title: 'Linked List (Singly & Doubly)',
    overview: 'A Linked List is a linear data structure where elements are not stored at contiguous memory locations. Instead, elements are represented as independent nodes containing a data payload and one or two pointer addresses pointing to adjacent nodes.',
    complexity: {
      bestTime: 'O(1) Insertion at Head/Tail',
      averageTime: 'O(n) Arbitrary access/search',
      worstTime: 'O(n)',
      spaceComplexity: 'O(n)'
    },
    keyPoints: [
      'Dynamic Sizing: Allocates heap memory on demand without pre-allocated capacity thresholds.',
      'Zero Shift Deletion: Removing an element requires only pointer rewiring, avoiding O(n) shifts.',
      'Foundation for complex structures like adjacency lists, LRU cache memory, and hash chaining.'
    ],
    code: {
      javascript: `class Node {
  constructor(val) {
    this.val = val;
    this.next = null;
  }
}

class LinkedList {
  constructor() { this.head = null; }
  insertHead(val) {
    const node = new Node(val);
    node.next = this.head;
    this.head = node;
  }
}`,
      python: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None
    def insert_head(self, val):
        node = Node(val)
        node.next = self.head
        self.head = node`,
      cpp: `struct Node {
    int val;
    Node* next;
    Node(int x) : val(x), next(nullptr) {}
};

class LinkedList {
public:
    Node* head = nullptr;
    void insertHead(int val) {
        Node* node = new Node(val);
        node->next = head;
        head = node;
    }
};`,
      java: `class Node {
    int val; Node next;
    Node(int val) { this.val = val; }
}

public class LinkedList {
    Node head;
    public void insertHead(int val) {
        Node node = new Node(val);
        node.next = head;
        head = node;
    }
}`
    }
  },

  'graph-traversal': {
    title: 'Graph Traversals (BFS & DFS)',
    overview: 'A Graph is a non-linear data structure consisting of vertices (V) and edges (E). Traversal visits every vertex systematically. Breadth-First Search (BFS) explores neighboring vertices level-by-level using a FIFO Queue, whereas Depth-First Search (DFS) plunges down along each branch as deep as possible before backtracking using a LIFO Stack.',
    complexity: {
      bestTime: 'O(V + E)',
      averageTime: 'O(V + E)',
      worstTime: 'O(V + E)',
      spaceComplexity: 'O(V) (Visited set + Queue/Recursion Stack)'
    },
    keyPoints: [
      'BFS Guarantees Shortest Path in unweighted graphs.',
      'DFS is ideal for topological sorting, maze solving, and cycle detection.',
      'Representations: Adjacency Lists (memory efficient O(V + E)) vs Adjacency Matrix (O(1) edge lookup).'
    ],
    code: {
      javascript: `function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];

  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}`,
      python: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order`,
      cpp: `#include <vector>
#include <queue>
#include <unordered_set>

std::vector<int> bfs(const std::vector<std::vector<int>>& adj, int start) {
    std::unordered_set<int> visited;
    std::queue<int> q;
    std::vector<int> order;

    visited.insert(start);
    q.push(start);

    while (!q.empty()) {
        int node = q.front(); q.pop();
        order.push_back(node);
        for (int neighbor : adj[node]) {
            if (visited.find(neighbor) == visited.end()) {
                visited.insert(neighbor);
                q.push(neighbor);
            }
        }
    }
    return order;
}`,
      java: `import java.util.*;

public class GraphBFS {
    public static List<Integer> bfs(Map<Integer, List<Integer>> adj, int start) {
        Set<Integer> visited = new HashSet<>();
        Queue<Integer> q = new LinkedList<>();
        List<Integer> order = new ArrayList<>();

        visited.add(start);
        q.offer(start);

        while (!q.isEmpty()) {
            int node = q.poll();
            order.add(node);
            for (int neighbor : adj.getOrDefault(node, Collections.emptyList())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    q.offer(neighbor);
                }
            }
        }
        return order;
    }
}`
    }
  },

  'heap-structure': {
    title: 'Binary Heap (Min-Heap / Max-Heap)',
    overview: 'A Binary Heap is a complete binary tree that satisfies the Heap Order property: in a Min-Heap, the key of every parent node is less than or equal to the keys of its children; in a Max-Heap, the parent key is greater than or equal to its children. Due to complete tree completeness, it is stored compactly as a single contiguous array without explicit child pointers, using fast arithmetic indexing: Parent(i) = floor((i - 1) / 2), Left(i) = 2i + 1, Right(i) = 2i + 2.',
    complexity: {
      bestTime: 'O(1) (Peek root element / Get-Min / Get-Max)',
      averageTime: 'O(log n) (Insert / Extract-Root / Priority updates)',
      worstTime: 'O(log n) (Sift operations traverse tree height)',
      spaceComplexity: 'O(n) (Contiguous sequential array representation)'
    },
    keyPoints: [
      'Zero Pointer Overhead: Tree structure is fully implicitly encoded via compact index arithmetic.',
      'Priority Queue Engine: Fundamental building block for Dijkstra shortest path, Prim MST, and OS task scheduling.',
      'Bottom-Up Build Heap: Can construct a valid heap from arbitrary arrays in linear O(n) time via Floyd sift-down method.'
    ],
    code: {
      javascript: `class MinHeap {
  constructor() {
    this.heap = [];
  }
  parent(i) { return Math.floor((i - 1) / 2); }
  left(i) { return 2 * i + 1; }
  right(i) { return 2 * i + 2; }

  insert(val) {
    this.heap.push(val);
    let i = this.heap.length - 1;
    while (i > 0 && this.heap[this.parent(i)] > this.heap[i]) {
      [this.heap[i], this.heap[this.parent(i)]] = [this.heap[this.parent(i)], this.heap[i]];
      i = this.parent(i);
    }
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.siftDown(0);
    return min;
  }

  siftDown(i) {
    let smallest = i;
    const l = this.left(i), r = this.right(i), n = this.heap.length;
    if (l < n && this.heap[l] < this.heap[smallest]) smallest = l;
    if (r < n && this.heap[r] < this.heap[smallest]) smallest = r;
    if (smallest !== i) {
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      this.siftDown(smallest);
    }
  }
}`,
      python: `class MinHeap:
    def __init__(self):
        self.heap = []

    def parent(self, i): return (i - 1) // 2
    def left(self, i): return 2 * i + 1
    def right(self, i): return 2 * i + 2

    def insert(self, val):
        self.heap.append(val)
        i = len(self.heap) - 1
        while i > 0 and self.heap[self.parent(i)] > self.heap[i]:
            self.heap[i], self.heap[self.parent(i)] = self.heap[self.parent(i)], self.heap[i]
            i = self.parent(i)

    def extract_min(self):
        if not self.heap: return None
        if len(self.heap) == 1: return self.heap.pop()
        root = self.heap[0]
        self.heap[0] = self.heap.pop()
        self._sift_down(0)
        return root

    def _sift_down(self, i):
        smallest = i
        l, r, n = self.left(i), self.right(i), len(self.heap)
        if l < n and self.heap[l] < self.heap[smallest]: smallest = l
        if r < n and self.heap[r] < self.heap[smallest]: smallest = r
        if smallest != i:
            self.heap[i], self.heap[smallest] = self.heap[smallest], self.heap[i]
            self._sift_down(smallest)`,
      cpp: `#include <vector>
#include <algorithm>

class MinHeap {
    std::vector<int> heap;
    int parent(int i) { return (i - 1) / 2; }
    int left(int i) { return 2 * i + 1; }
    int right(int i) { return 2 * i + 2; }

    void siftDown(int i) {
        int smallest = i;
        int l = left(i), r = right(i), n = heap.size();
        if (l < n && heap[l] < heap[smallest]) smallest = l;
        if (r < n && heap[r] < heap[smallest]) smallest = r;
        if (smallest != i) {
            std::swap(heap[i], heap[smallest]);
            siftDown(smallest);
        }
    }
public:
    void insert(int val) {
        heap.push_back(val);
        int i = heap.size() - 1;
        while (i > 0 && heap[parent(i)] > heap[i]) {
            std::swap(heap[i], heap[parent(i)]);
            i = parent(i);
        }
    }
    int extractMin() {
        if (heap.empty()) return -1;
        int root = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        if (!heap.empty()) siftDown(0);
        return root;
    }
};`,
      java: `import java.util.*;

public class MinHeap {
    private List<Integer> heap = new ArrayList<>();
    private int parent(int i) { return (i - 1) / 2; }
    private int left(int i) { return 2 * i + 1; }
    private int right(int i) { return 2 * i + 2; }

    public void insert(int val) {
        heap.add(val);
        int i = heap.size() - 1;
        while (i > 0 && heap.get(parent(i)) > heap.get(i)) {
            Collections.swap(heap, i, parent(i));
            i = parent(i);
        }
    }

    public int extractMin() {
        if (heap.isEmpty()) return -1;
        int min = heap.get(0);
        int last = heap.remove(heap.size() - 1);
        if (!heap.isEmpty()) {
            heap.set(0, last);
            siftDown(0);
        }
        return min;
    }

    private void siftDown(int i) {
        int smallest = i, l = left(i), r = right(i), n = heap.size();
        if (l < n && heap.get(l) < heap.get(smallest)) smallest = l;
        if (r < n && heap.get(r) < heap.get(smallest)) smallest = r;
        if (smallest != i) {
            Collections.swap(heap, i, smallest);
            siftDown(smallest);
        }
    }
}`
    }
  }
};
