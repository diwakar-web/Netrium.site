// Pure Algorithmic Simulation Engine for all 12 Page Replacement Algorithms
// Standardized for Netrium Virtual Memory Simulator

export function parseReferenceString(refStr) {
  if (!refStr) return [];
  if (Array.isArray(refStr)) return refStr.map(String).map(s => s.trim()).filter(Boolean);
  return refStr
    .split(/[\s,]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

export function simulatePageReplacement(algorithmId, referenceList, frameCount = 3) {
  const pages = parseReferenceString(referenceList);
  const totalCapacity = Math.max(1, Math.min(16, frameCount));
  const steps = [];

  let hits = 0;
  let faults = 0;

  // Frame internal slots: array of { page, loadedAt, lastAccessedAt, freq, refBit, dirtyBit, age }
  let frames = [];
  let clockHand = 0; // for clock & second chance

  // Pseudo-random seed for deterministic reproduction in random replacement
  let prngSeed = 42;
  const pseudoRandom = () => {
    prngSeed = (prngSeed * 9301 + 49297) % 233280;
    return prngSeed / 233280;
  };

  pages.forEach((page, stepIdx) => {
    // Determine if page is already resident in frames (HIT)
    const existingIdx = frames.findIndex(f => f.page === page);
    const isHit = existingIdx !== -1;

    let victimPage = null;
    let victimIdx = -1;
    let actionLog = '';

    // Handle Aging step updates across all frames
    if (algorithmId === 'aging') {
      frames.forEach(f => {
        f.age = (f.age >> 1) & 0xFF;
      });
    }

    // Handle NRU periodic timer tick (every 5 references, clear all R bits)
    if (algorithmId === 'nru' && stepIdx > 0 && stepIdx % 5 === 0) {
      frames.forEach(f => { f.refBit = 0; });
    }

    if (isHit) {
      hits++;
      const frame = frames[existingIdx];
      frame.lastAccessedAt = stepIdx;
      frame.freq = (frame.freq || 0) + 1;
      frame.refBit = 1;
      // Mark dirty on occasional writes (e.g. pages ending in even digits)
      if (parseInt(page, 10) % 2 === 0) {
        frame.dirtyBit = 1;
      }
      if (algorithmId === 'aging') {
        frame.age = (frame.age | 128) & 0xFF;
      }
      actionLog = `Page ${page} found in Frame ${existingIdx} [HIT]. Reference and recency state refreshed.`;
    } else {
      faults++;

      // Check if there is still free physical capacity
      if (frames.length < totalCapacity) {
        const newFrame = {
          page,
          loadedAt: stepIdx,
          lastAccessedAt: stepIdx,
          freq: 1,
          refBit: 1,
          dirtyBit: parseInt(page, 10) % 2 === 0 ? 1 : 0,
          age: 128
        };
        frames.push(newFrame);
        victimIdx = frames.length - 1;
        actionLog = `Page ${page} not present [PAGE FAULT]. Allocated empty Frame ${victimIdx}.`;
      } else {
        // Eviction needed! Select victim according to the algorithm
        switch (algorithmId) {
          case 'fifo': {
            // Oldest loaded frame
            victimIdx = 0;
            let oldestLoad = frames[0].loadedAt;
            for (let i = 1; i < frames.length; i++) {
              if (frames[i].loadedAt < oldestLoad) {
                oldestLoad = frames[i].loadedAt;
                victimIdx = i;
              }
            }
            actionLog = `Page ${page} caused FAULT. Oldest loaded Frame ${victimIdx} (Page ${frames[victimIdx].page}) evicted via FIFO.`;
            break;
          }

          case 'optimal': {
            // Find page that won't be used for the longest time in the future
            let farthestFutureDist = -1;
            victimIdx = 0;

            for (let i = 0; i < frames.length; i++) {
              const framePage = frames[i].page;
              let nextUse = Infinity;

              for (let f = stepIdx + 1; f < pages.length; f++) {
                if (pages[f] === framePage) {
                  nextUse = f;
                  break;
                }
              }

              if (nextUse === Infinity) {
                victimIdx = i;
                farthestFutureDist = Infinity;
                break; // Can't do worse than never used again
              } else if (nextUse > farthestFutureDist) {
                farthestFutureDist = nextUse;
                victimIdx = i;
              }
            }

            const futureDesc = farthestFutureDist === Infinity ? 'never used again' : `next used at step ${farthestFutureDist}`;
            actionLog = `Page ${page} caused FAULT. Optimal evicted Frame ${victimIdx} (Page ${frames[victimIdx].page}, ${futureDesc}).`;
            break;
          }

          case 'lru': {
            // Smallest lastAccessedAt
            victimIdx = 0;
            let leastRecent = frames[0].lastAccessedAt;
            for (let i = 1; i < frames.length; i++) {
              if (frames[i].lastAccessedAt < leastRecent) {
                leastRecent = frames[i].lastAccessedAt;
                victimIdx = i;
              }
            }
            actionLog = `Page ${page} caused FAULT. Least Recently Used Frame ${victimIdx} (Page ${frames[victimIdx].page}, idle since step ${leastRecent}) evicted.`;
            break;
          }

          case 'mru': {
            // Highest lastAccessedAt
            victimIdx = 0;
            let mostRecent = frames[0].lastAccessedAt;
            for (let i = 1; i < frames.length; i++) {
              if (frames[i].lastAccessedAt > mostRecent) {
                mostRecent = frames[i].lastAccessedAt;
                victimIdx = i;
              }
            }
            actionLog = `Page ${page} caused FAULT. Most Recently Used Frame ${victimIdx} (Page ${frames[victimIdx].page}, used at step ${mostRecent}) evicted for cyclic scan.`;
            break;
          }

          case 'lfu': {
            // Lowest frequency; tie-break with oldest loadedAt
            victimIdx = 0;
            let minFreq = frames[0].freq;
            let oldestLoad = frames[0].loadedAt;

            for (let i = 1; i < frames.length; i++) {
              if (frames[i].freq < minFreq) {
                minFreq = frames[i].freq;
                oldestLoad = frames[i].loadedAt;
                victimIdx = i;
              } else if (frames[i].freq === minFreq && frames[i].loadedAt < oldestLoad) {
                oldestLoad = frames[i].loadedAt;
                victimIdx = i;
              }
            }
            actionLog = `Page ${page} caused FAULT. Least Frequently Used Frame ${victimIdx} (Page ${frames[victimIdx].page}, accessed ${minFreq} time${minFreq > 1 ? 's' : ''}) evicted.`;
            break;
          }

          case 'mfu': {
            // Highest frequency; tie-break with oldest loadedAt
            victimIdx = 0;
            let maxFreq = frames[0].freq;
            let oldestLoad = frames[0].loadedAt;

            for (let i = 1; i < frames.length; i++) {
              if (frames[i].freq > maxFreq) {
                maxFreq = frames[i].freq;
                oldestLoad = frames[i].loadedAt;
                victimIdx = i;
              } else if (frames[i].freq === maxFreq && frames[i].loadedAt < oldestLoad) {
                oldestLoad = frames[i].loadedAt;
                victimIdx = i;
              }
            }
            actionLog = `Page ${page} caused FAULT. Most Frequently Used Frame ${victimIdx} (Page ${frames[victimIdx].page}, count = ${maxFreq}) evicted.`;
            break;
          }

          case 'second-chance': {
            // Queue circular check: if refBit=0 evict; if refBit=1 clear refBit and advance
            let found = false;
            let passes = 0;
            while (!found && passes < frames.length * 2) {
              const cand = clockHand % frames.length;
              if (frames[cand].refBit === 0) {
                victimIdx = cand;
                clockHand = (cand + 1) % frames.length;
                found = true;
              } else {
                frames[cand].refBit = 0;
                clockHand = (cand + 1) % frames.length;
              }
              passes++;
            }
            if (!found) {
              victimIdx = 0;
            }
            actionLog = `Page ${page} caused FAULT. Second Chance selected Frame ${victimIdx} (Page ${frames[victimIdx].page}) after rotating active bits.`;
            break;
          }

          case 'clock': {
            // Circular array with advancing clock hand
            let found = false;
            let attempts = 0;
            while (!found && attempts < frames.length * 2) {
              const current = clockHand % frames.length;
              if (frames[current].refBit === 0) {
                victimIdx = current;
                clockHand = (current + 1) % frames.length;
                found = true;
              } else {
                frames[current].refBit = 0;
                clockHand = (current + 1) % frames.length;
              }
              attempts++;
            }
            if (!found) {
              victimIdx = clockHand % frames.length;
              clockHand = (victimIdx + 1) % frames.length;
            }
            actionLog = `Page ${page} caused FAULT. Clock hand stopped at Frame ${victimIdx} (Page ${frames[victimIdx].page}) with R=0. Hand advanced to Frame ${clockHand}.`;
            break;
          }

          case 'enhanced-second-chance': {
            // Four classes: (0,0) -> (0,1) -> (1,0) -> (1,1)
            // Pass 1: find (0,0) without changing R
            let candidate = -1;
            for (let i = 0; i < frames.length; i++) {
              const idx = (clockHand + i) % frames.length;
              if (frames[idx].refBit === 0 && frames[idx].dirtyBit === 0) {
                candidate = idx;
                clockHand = (idx + 1) % frames.length;
                break;
              }
            }

            // Pass 2: find (0,1) while setting R=0 on traversed frames
            if (candidate === -1) {
              for (let i = 0; i < frames.length; i++) {
                const idx = (clockHand + i) % frames.length;
                if (frames[idx].refBit === 0 && frames[idx].dirtyBit === 1) {
                  candidate = idx;
                  clockHand = (idx + 1) % frames.length;
                  break;
                }
                frames[idx].refBit = 0;
              }
            }

            // Pass 3: repeat pass 1 (find 0,0 now that R bits were cleared)
            if (candidate === -1) {
              for (let i = 0; i < frames.length; i++) {
                const idx = (clockHand + i) % frames.length;
                if (frames[idx].refBit === 0 && frames[idx].dirtyBit === 0) {
                  candidate = idx;
                  clockHand = (idx + 1) % frames.length;
                  break;
                }
              }
            }

            // Pass 4: fallback to (0,1)
            if (candidate === -1) {
              candidate = clockHand % frames.length;
              clockHand = (candidate + 1) % frames.length;
            }

            victimIdx = candidate;
            const r = frames[victimIdx].refBit;
            const m = frames[victimIdx].dirtyBit;
            actionLog = `Page ${page} caused FAULT. Enhanced Second Chance evicted Frame ${victimIdx} (Page ${frames[victimIdx].page}, Class (${r},${m})).`;
            break;
          }

          case 'nru': {
            // Group into 4 classes based on (R, M)
            const classes = [[], [], [], []];
            frames.forEach((f, idx) => {
              const classIdx = 2 * (f.refBit || 0) + (f.dirtyBit || 0);
              classes[classIdx].push(idx);
            });

            // Pick first non-empty class
            let chosenClass = 0;
            for (let c = 0; c < 4; c++) {
              if (classes[c].length > 0) {
                chosenClass = c;
                break;
              }
            }
            const candidates = classes[chosenClass];
            const randOffset = Math.floor(pseudoRandom() * candidates.length);
            victimIdx = candidates[randOffset];

            actionLog = `Page ${page} caused FAULT. NRU selected Frame ${victimIdx} (Page ${frames[victimIdx].page}) from lowest Class ${chosenClass} (R=${frames[victimIdx].refBit}, M=${frames[victimIdx].dirtyBit}).`;
            break;
          }

          case 'random': {
            // Pick pseudo-random frame
            victimIdx = Math.floor(pseudoRandom() * frames.length);
            actionLog = `Page ${page} caused FAULT. Random replacement uniformly evicted Frame ${victimIdx} (Page ${frames[victimIdx].page}).`;
            break;
          }

          case 'aging': {
            // Frame with smallest age register value
            victimIdx = 0;
            let lowestAge = frames[0].age ?? 255;
            for (let i = 1; i < frames.length; i++) {
              const curAge = frames[i].age ?? 255;
              if (curAge < lowestAge) {
                lowestAge = curAge;
                victimIdx = i;
              }
            }
            actionLog = `Page ${page} caused FAULT. Aging evicted Frame ${victimIdx} (Page ${frames[victimIdx].page}, age = 0x${lowestAge.toString(16).padStart(2, '0')}).`;
            break;
          }

          default: {
            victimIdx = 0;
            actionLog = `Page ${page} caused FAULT. Default evicted Frame 0.`;
          }
        }

        // Record victim and replace with new page
        victimPage = frames[victimIdx].page;
        frames[victimIdx] = {
          page,
          loadedAt: stepIdx,
          lastAccessedAt: stepIdx,
          freq: 1,
          refBit: 1,
          dirtyBit: parseInt(page, 10) % 2 === 0 ? 1 : 0,
          age: 128
        };
      }
    }

    const currentTotal = stepIdx + 1;
    const hitRatio = Number(((hits / currentTotal) * 100).toFixed(1));
    const faultRatio = Number(((faults / currentTotal) * 100).toFixed(1));

    // Deep clone snapshot of current frame slots padded to totalCapacity
    const frameSnapshots = [];
    for (let c = 0; c < totalCapacity; c++) {
      if (c < frames.length) {
        frameSnapshots.push({
          slotIndex: c,
          page: frames[c].page,
          refBit: frames[c].refBit,
          dirtyBit: frames[c].dirtyBit,
          freq: frames[c].freq,
          age: frames[c].age,
          ageBin: (frames[c].age || 0).toString(2).padStart(8, '0'),
          isVictim: !isHit && c === victimIdx && victimPage !== null,
          isHit: isHit && c === existingIdx,
          isClockHand: (algorithmId === 'clock' || algorithmId === 'second-chance') && c === (clockHand % totalCapacity)
        });
      } else {
        frameSnapshots.push({
          slotIndex: c,
          page: null,
          refBit: 0,
          dirtyBit: 0,
          freq: 0,
          age: 0,
          ageBin: '00000000',
          isVictim: false,
          isHit: false,
          isClockHand: (algorithmId === 'clock' || algorithmId === 'second-chance') && c === (clockHand % totalCapacity)
        });
      }
    }

    steps.push({
      stepIndex: stepIdx,
      page,
      frames: frameSnapshots,
      isHit,
      victimPage,
      victimIdx,
      clockHand: clockHand % totalCapacity,
      totalHits: hits,
      totalFaults: faults,
      hitRatio,
      faultRatio,
      log: actionLog
    });
  });

  return {
    algorithmId,
    pages,
    frameCount: totalCapacity,
    totalReferences: pages.length,
    totalHits: hits,
    totalFaults: faults,
    finalHitRatio: pages.length > 0 ? Number(((hits / pages.length) * 100).toFixed(1)) : 0,
    finalFaultRatio: pages.length > 0 ? Number(((faults / pages.length) * 100).toFixed(1)) : 0,
    steps
  };
}
