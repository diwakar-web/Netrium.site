import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  ArrowRight, 
  Server, 
  Globe, 
  Navigation, 
  Shield, 
  Flame, 
  Cpu, 
  CloudRain, 
  Trash2, 
  ChevronDown, 
  Activity, 
  HelpCircle, 
  Maximize2, 
  Minimize2, 
  X,
  Radio,
  Zap,
  Layers,
  MapPin,
  CheckSquare,
  Square,
  Sparkles,
  ArrowUpRight,
  FileText,
  Sliders,
  Code2,
  Copy,
  Check,
  AlertTriangle,
  Terminal,
  Database,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertCircle,
  Wifi,
  RefreshCw,
  Laptop,
  Smartphone,
  Compass,
  Crosshair,
  Users,
  Share2,
  Send
} from 'lucide-react';
import Navbar from '../components/Navbar';
import HoloCard from '../components/HoloCard';
import CdnMap from '../components/CdnMap';
import { CDN_CARDS } from '../utils/cdnCardArts';
import { servers, clients, simulateRequest, getHaversineDistance } from '../utils/cdnEngine';
import { useAuth } from '../context/AuthContext';
import '../components/MultiplayerTopologyLab.css';
import {
  createRoomApi,
  joinRoomApi,
  pollRoomApi,
  pingRoomApi,
  subscribeToRoomBroadcast,
  transmitRoomApi,
  stepRoomApi
} from '../utils/multiplayerRoomManager';
import './CdnPage.css';

const ICON_MAP = {
  Server,
  Globe,
  Navigation,
  Shield,
  Flame,
  Cpu
};

export default function CdnPage() {
  const navigate = useNavigate();

  // Scroll to absolute top on page mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Standardized 3-Section Tab: 'theories' (Curriculum) | 'functional' (Interactive) | 'chaos' (Chaos Lab)
  const [activeTab, setActiveTab] = useState('theories');

  // Multi-Language Edge Worker Code Tab in Theories
  const [selectedLang, setSelectedLang] = useState('javascript');
  const [copied, setCopied] = useState(false);

  // CDN Configuration States
  const [cdnEnabled, setCdnEnabled] = useState(true);
  const [activeFactors, setActiveFactors] = useState({
    geographic: true,
    latency: true,
    load: true,
    health: true,
    caching: true,
    routing: false,
    dns: false
  });

  const activeFactorsCount = Object.values(activeFactors).filter(Boolean).length;

  // UI Panels Expand states
  const [showRulesDropdown, setShowRulesDropdown] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(true);
  const [isDossierExpanded, setIsDossierExpanded] = useState(true);
  const [isLogsExpanded, setIsLogsExpanded] = useState(true);
  const [isMapMaximized, setIsMapMaximized] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRulesDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Client Selection
  const [selectedClient, setSelectedClient] = useState('srinagar');

  // Chaos States: Weather storm & Overload
  const [weather, setWeather] = useState(
    Object.keys(servers).reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );
  const [overload, setOverload] = useState(
    Object.keys(servers).filter(k => k !== 'origin').reduce((acc, key) => ({ ...acc, [key]: false }), {})
  );
  const [originOverloaded, setOriginOverloaded] = useState(false);
  const [loadFluctuations, setLoadFluctuations] = useState(
    Object.keys(servers).filter(k => k !== 'origin').reduce((acc, key) => ({ ...acc, [key]: 0 }), {})
  );
  const [customChaosPop, setCustomChaosPop] = useState('mumbai');

  // Payload Cache State
  const [inputText, setInputText] = useState('');
  const [activeContentId, setActiveContentId] = useState('doc_default');
  const [globalCache, setGlobalCache] = useState(
    Object.keys(servers).reduce((acc, key) => ({ ...acc, [key]: { doc_default: 'Netrium Verified Secure Payload Data' } }), {})
  );

  // Simulation Results & Progress
  const [simResults, setSimResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [inspectNodeId, setInspectNodeId] = useState('mumbai');
  const [highlightOnlyActive, setHighlightOnlyActive] = useState(false);

  // Diagnostics Logs
  const [logs, setLogs] = useState([
    'SYS: Netrium Distributed Edge Telemetry Engine online.',
    'SYS: Global POP Anycast DNS table verified across 16 edge regions.',
    'READY: Ready for edge packet simulation traversal.'
  ]);

  // ==========================================
  // MULTI-DEVICE & GEOLOCATION CDN ENGINE
  // ==========================================
  const { user, isAuthenticated } = useAuth();
  const roomHostName = user?.name || 'Local Machine (Room Host)';
  
  // Collaborative 4-Digit Room State
  const [cdnRoom, setCdnRoom] = useState(null);
  const [cdnRoomCode, setCdnRoomCode] = useState('');
  const [isCdnHost, setIsCdnHost] = useState(false);
  const [cdnLobbyTab, setCdnLobbyTab] = useState('create'); // 'create' | 'join'
  const [cdnReqNodes, setCdnReqNodes] = useState(4);
  const [cdnJoinCodeInput, setCdnJoinCodeInput] = useState('');
  const [cdnIsSubmitting, setCdnIsSubmitting] = useState(false);
  const [cdnLobbyError, setCdnLobbyError] = useState('');
  const [cdnCopiedCode, setCdnCopiedCode] = useState(false);

  // Room Creation Handlers
  const handleCreateCdnRoom = async (e) => {
    e?.preventDefault();
    setCdnIsSubmitting(true);
    setCdnLobbyError('');
    try {
      const result = await createRoomApi({
        topologyType: 'cdn',
        maxParticipants: cdnReqNodes,
        hostEmail: user?.email || 'origin-host@netrium.site',
        hostName: user?.name || 'Primary Origin Host',
        nodes: [
          { id: 'node-origin', label: 'O', name: `Origin Server (${user?.name || 'Host'})`, status: 'online', role: 'origin' },
          { id: 'node-edge', label: 'E', name: `Edge POP (${servers[selectedEdgeKey]?.name || 'Tokyo POP'})`, status: 'online', role: 'edge' },
          { id: 'node-client', label: 'C', name: 'Client Consumer Device', status: 'online', role: 'client' },
          { id: 'node-backup', label: 'B', name: 'Secondary POP (Frankfurt)', status: 'online', role: 'edge' }
        ],
        sourceNodeId: 'node-client',
        targetNodeId: 'node-origin',
        payloadText: selectedAsset
      });
      setCdnRoom(result.room);
      setCdnRoomCode(result.code);
      setIsCdnHost(true);
      setMyDeviceCdnRole('origin');
      addCdnPracticalLog(`[ROOM CREATED] 4-digit code ${result.code}. Designated as Primary Origin Server.`, 'success');
    } catch (err) {
      setCdnLobbyError(err.message || 'Failed to create room.');
    } finally {
      setCdnIsSubmitting(false);
    }
  };

  const handleJoinCdnRoom = async (e) => {
    e?.preventDefault();
    const clean = cdnJoinCodeInput.trim().toUpperCase();
    if (clean.length !== 4) {
      setCdnLobbyError('Please enter a valid 4-digit numeric code.');
      return;
    }
    setCdnIsSubmitting(true);
    setCdnLobbyError('');
    try {
      const result = await joinRoomApi({
        code: clean,
        email: user?.email || `client-${Date.now()}@netrium.site`,
        name: user?.name || 'Participant Device'
      });
      setCdnRoom(result.room);
      setCdnRoomCode(result.room.code);
      const isHostCheck = (result.room.hostEmail || '').toLowerCase() === (user?.email || '').toLowerCase();
      setIsCdnHost(isHostCheck);
      setMyDeviceCdnRole(isHostCheck ? 'origin' : 'client');
      addCdnPracticalLog(`[DEVICE CONNECTED] Joined CDN room ${clean} as ${isHostCheck ? 'Primary Origin Server' : 'Client Consumer'}.`, 'success');
    } catch (err) {
      setCdnLobbyError(err.message || 'Room not found. Please verify the code.');
    } finally {
      setCdnIsSubmitting(false);
    }
  };

  const handleCopyCdnRoomCode = () => {
    if (!cdnRoomCode) return;
    navigator.clipboard.writeText(cdnRoomCode);
    setCdnCopiedCode(true);
    setTimeout(() => setCdnCopiedCode(false), 2500);
  };

  const handleLeaveCdnRoom = () => {
    if (window.confirm('Are you sure you want to leave this CDN simulation room?')) {
      setCdnRoom(null);
      setCdnRoomCode('');
      setIsCdnHost(false);
    }
  };

  // Sync Room Updates across devices
  useEffect(() => {
    if (!cdnRoomCode) return;
    const unsub = subscribeToRoomBroadcast(cdnRoomCode, (updatedRoom) => {
      setCdnRoom(updatedRoom);
    });
    const pollTimer = setInterval(async () => {
      const r = await pollRoomApi(cdnRoomCode);
      if (r) setCdnRoom(r);
    }, 1200);
    const pingTimer = setInterval(() => {
      pingRoomApi(cdnRoomCode, user?.email || 'user@netrium.site');
    }, 3800);
    return () => {
      unsub();
      clearInterval(pollTimer);
      clearInterval(pingTimer);
    };
  }, [cdnRoomCode, user?.email]);

  // Real-Time Physical Device Geolocation State
  const [userGeo, setUserGeo] = useState({
    lat: 19.0760,
    lon: 72.8777,
    name: 'Mumbai (MH)',
    accuracy: 'GPS Optimal (±12m)',
    isDetecting: false,
    rawCity: 'Mumbai'
  });
  const [geoError, setGeoError] = useState('');

  // Multi-Device Server & Client Assignment
  const [selectedEdgeKey, setSelectedEdgeKey] = useState('tokyo');
  const [selectedAsset, setSelectedAsset] = useState('video_4k.mp4');
  const [forceCacheMiss, setForceCacheMiss] = useState(false);
  const [myDeviceCdnRole, setMyDeviceCdnRole] = useState('client'); // 'client' | 'origin' | 'edge'

  // Multi-hop Live Data Transfer Execution
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStep, setTransferStep] = useState(0); // 0: idle, 1: client->edge, 2: edge eval, 3: edge->origin, 4: origin->edge, 5: edge->client, 6: delivered
  const [lastTransferResult, setLastTransferResult] = useState(null);
  const [cdnPracticalLogs, setCdnPracticalLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), type: 'info', text: 'CDN Multi-Device Session initialized. Room Creator assigned as Primary Origin Server.' },
    { id: 2, time: new Date().toLocaleTimeString(), type: 'info', text: 'Device Geolocation system online. Ready to acquire live physical coordinates.' }
  ]);

  const addCdnPracticalLog = (text, type = 'info') => {
    setCdnPracticalLogs(prev => [
      { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), type, text },
      ...prev.slice(0, 40)
    ]);
  };

  // Live GPS Acquisition
  const handleDetectLiveGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation API not supported by browser.');
      addCdnPracticalLog('Geolocation API not supported by browser. Falling back to Mumbai regional coordinate.', 'warning');
      return;
    }
    setUserGeo(prev => ({ ...prev, isDetecting: true }));
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserGeo({
          lat: Number(latitude.toFixed(4)),
          lon: Number(longitude.toFixed(4)),
          name: `Live Device GPS (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
          accuracy: `±${Math.round(accuracy)}m`,
          isDetecting: false,
          rawCity: 'Live Device GPS'
        });
        addCdnPracticalLog(`Acquired live physical device coordinates: ${latitude.toFixed(4)}°, ${longitude.toFixed(4)}° (Accuracy ±${Math.round(accuracy)}m). Updated SVG world matrix position.`, 'success');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setUserGeo(prev => ({ ...prev, isDetecting: false }));
        setGeoError('GPS permission not granted; staying on regional coordinate.');
        addCdnPracticalLog('GPS permission not granted; staying on regional coordinates.', 'warning');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Handle Preset Geolocation selection
  const handleSelectPresetGeo = (cityKey) => {
    const preset = clients[cityKey];
    if (preset) {
      setUserGeo({
        lat: preset.lat,
        lon: preset.lon,
        name: preset.name.replace('Client in ', ''),
        accuracy: 'Regional Static Anchor',
        isDetecting: false,
        rawCity: preset.name
      });
      addCdnPracticalLog(`Manually set device location to ${preset.name} [${preset.lat}°, ${preset.lon}°]`, 'info');
    }
  };

  // Purge Edge Cache
  const handlePurgeSelectedEdgeCache = () => {
    setGlobalCache(prev => ({
      ...prev,
      [selectedEdgeKey]: {}
    }));
    addCdnPracticalLog(`Purged L1 SSD cache at Edge POP "${servers[selectedEdgeKey]?.name || selectedEdgeKey}". Next request will force origin fetch.`, 'warning');
  };

  // Run Multi-Hop Data Transfer
  const executeCdnDataTransfer = () => {
    if (isTransferring) return;
    setIsTransferring(true);
    setTransferStep(1);

    const edge = servers[selectedEdgeKey] || servers.tokyo;
    const origin = servers.origin;
    const isMiss = forceCacheMiss || !globalCache[selectedEdgeKey]?.[selectedAsset];
    const clientToEdgeDist = getHaversineDistance(userGeo.lat, userGeo.lon, edge.lat, edge.lon);
    const edgeToOriginDist = getHaversineDistance(edge.lat, edge.lon, origin.lat, origin.lon);

    addCdnPracticalLog(`[HOP 1] Client Device (${userGeo.name}) -> Edge POP (${edge.name}): HTTP/3 GET /media/${selectedAsset}`, 'transfer');

    setTimeout(() => {
      setTransferStep(2); // Edge eval
      addCdnPracticalLog(`[EDGE CACHE EVAL] ${edge.name} inspecting local cache: ${isMiss ? 'MISS (Object not in memory)' : 'HIT (Serving cached bytes directly)'}`, isMiss ? 'warning' : 'success');

      if (isMiss) {
        setTimeout(() => {
          setTransferStep(3); // Edge -> Origin
          addCdnPracticalLog(`[HOP 2 - ORIGIN FETCH] ${edge.name} -> Central Origin (${roomHostName}): Traversing ${edgeToOriginDist}km backbone to fetch master object...`, 'transfer');

          setTimeout(() => {
            setTransferStep(4); // Origin -> Edge
            setGlobalCache(prev => ({
              ...prev,
              [selectedEdgeKey]: {
                ...(prev[selectedEdgeKey] || {}),
                [selectedAsset]: 'Asset binary stream cache warmed'
              }
            }));
            addCdnPracticalLog(`[ORIGIN DISPATCH] Origin Server (${roomHostName}) streamed 4.2MB binary. Edge ${edge.name} cached object (TTL=300s).`, 'success');

            setTimeout(() => {
              setTransferStep(5); // Edge -> Client
              addCdnPracticalLog(`[HOP 3 - FINAL DELIVERY] Edge ${edge.name} -> Client Device: Streaming data payload down to client...`, 'transfer');

              setTimeout(() => {
                setTransferStep(6);
                setIsTransferring(false);
                const totalLatency = Math.round((clientToEdgeDist / 120) + (edgeToOriginDist / 100) + edge.baseLatency + 24);
                setLastTransferResult({
                  asset: selectedAsset,
                  cacheStatus: 'MISS -> POPULATED',
                  totalLatency,
                  edgeName: edge.name,
                  originName: `Central Origin (${roomHostName})`,
                  hops: 3,
                  clientToEdgeDist,
                  edgeToOriginDist
                });
                addCdnPracticalLog(`[DELIVERED] Complete! Asset "${selectedAsset}" delivered to Client Device in ${totalLatency}ms. Status: 200 OK (Origin Miss -> Populated).`, 'success');
              }, 700);
            }, 700);
          }, 700);
        }, 700);
      } else {
        setTimeout(() => {
          setTransferStep(5); // Edge -> Client
          addCdnPracticalLog(`[HOP 2 - IMMEDIATE HIT] Edge ${edge.name} streaming cached bytes directly to Client Device (Zero Origin Load!)...`, 'transfer');

          setTimeout(() => {
            setTransferStep(6);
            setIsTransferring(false);
            const totalLatency = Math.round((clientToEdgeDist / 140) + 12);
            setLastTransferResult({
              asset: selectedAsset,
              cacheStatus: 'HIT (EDGE L1)',
              totalLatency,
              edgeName: edge.name,
              originName: 'Shielded (0% Origin Load)',
              hops: 1,
              clientToEdgeDist,
              edgeToOriginDist: 0
            });
            addCdnPracticalLog(`[DELIVERED] Complete! Asset "${selectedAsset}" delivered from Edge Cache in ${totalLatency}ms. Status: 200 OK (Cache HIT - 0% origin load).`, 'success');
          }, 600);
        }, 600);
      }
    }, 700);
  };

  // Periodic random CPU load fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const flucs = {};
      Object.keys(servers).filter(k => k !== 'origin').forEach(k => {
        flucs[k] = Math.floor(Math.random() * 14) - 7;
      });
      setLoadFluctuations(flucs);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 45)]);
  };

  const clearLogs = () => {
    setLogs(['[SYSTEM] Telemetry log stream cleared.']);
  };

  // Publish custom payload to origin
  const handlePublish = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newId = `doc_${Date.now().toString().slice(-6)}`;
    const cleanText = inputText.substring(0, 60);

    setActiveContentId(newId);
    setGlobalCache(prev => {
      const updated = { ...prev };
      updated.origin = { ...prev.origin, [newId]: cleanText };
      return updated;
    });

    addLog(`PAYLOAD: Published '${newId}' to Central Origin (${cleanText}).`);
    setInputText('');
  };

  // Purge edge node cache databases
  const handleClearEdgeCaches = () => {
    setGlobalCache(prev => {
      const reset = { origin: { ...prev.origin } };
      Object.keys(servers).forEach(id => {
        if (id !== 'origin') {
          reset[id] = {};
        }
      });
      return reset;
    });
    addLog('CACHE: Purged all edge node replica cache databases.');
  };

  // Run the routing simulation with smooth packet traversal animation
  const handleRunRequest = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimProgress(0);

    const serverStates = {
      cdnEnabled,
      weather,
      overload,
      originOverloaded,
      loadFluctuations
    };

    const result = simulateRequest(
      selectedClient,
      activeFactors,
      serverStates,
      activeContentId,
      globalCache
    );

    // Set results immediately so map knows target server and path for packet flight
    setSimResults(result);

    let startTime = null;
    const duration = 1400; // Smooth 1.4s packet flight animation

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setSimProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSimulating(false);

        // Sync edge caches on cache miss when caching factor is active
        setGlobalCache(prev => {
          const nextCache = { ...prev };
          Object.keys(servers).forEach(id => {
            if (id !== 'origin' && result.selectedServerId === id && cdnEnabled && activeFactors.caching) {
              nextCache[id] = {
                ...nextCache[id],
                [activeContentId]: prev.origin[activeContentId]
              };
            }
          });
          return nextCache;
        });

        // Push simulation diagnostics logs
        if (result.logs && Array.isArray(result.logs)) {
          result.logs.forEach(log => addLog(log));
        }
      }
    };

    requestAnimationFrame(animate);
  };

  const handleRunSimulation = handleRunRequest;

  // Full Global Simulation across all 40+ clients
  const handleRunAllSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimProgress(0);
    addLog('SWEEP: Launching global Anycast traffic sweep across all 40+ clients...');

    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      setSimProgress(progress);
      if (progress >= 100) clearInterval(progressInterval);
    }, 50);

    setTimeout(() => {
      setIsSimulating(false);
      setSimProgress(100);
      addLog('SWEEP COMPLETE: 40+ edge endpoints reached. Average global latency: 28.4ms (94.2% Cache Hit ratio).');
    }, 1100);
  };

  // Chaos controls
  const toggleWeather = (serverId) => {
    setWeather(prev => {
      const next = !prev[serverId];
      addLog(`CHAOS: Storm conditions ${next ? 'INJECTED' : 'RESOLVED'} at ${servers[serverId]?.name || serverId}.`);
      return { ...prev, [serverId]: next };
    });
  };

  const toggleOverload = (serverId) => {
    if (serverId === 'origin') {
      setOriginOverloaded(prev => {
        const next = !prev;
        addLog(`CHAOS: Central Origin Overload ${next ? 'FORCED TO 100% CPU' : 'RESTORED TO NORMAL'}.`);
        return next;
      });
      return;
    }
    setOverload(prev => {
      const next = !prev[serverId];
      addLog(`CHAOS: Hardware CPU Overload ${next ? 'TRIGGERED (95% CPU)' : 'CLEARED'} at ${servers[serverId]?.name || serverId}.`);
      return { ...prev, [serverId]: next };
    });
  };

  const purgeCache = (serverId) => {
    setGlobalCache(prev => {
      const updated = { ...prev };
      if (serverId === 'all') {
        Object.keys(updated).forEach(k => {
          if (k !== 'origin') updated[k] = {};
        });
        addLog('PURGE: Global edge cache flushed across all 16 POP regions.');
      } else {
        updated[serverId] = {};
        addLog(`PURGE: Flushed cache store at ${servers[serverId]?.name}.`);
      }
      return updated;
    });
  };

  const handleResetAllChaos = () => {
    setWeather(Object.keys(servers).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
    setOverload(Object.keys(servers).filter(k => k !== 'origin').reduce((acc, key) => ({ ...acc, [key]: false }), {}));
    setOriginOverloaded(false);
    addLog('CHAOS RESOLVED: All synthetic faults, storms, and CPU overloads cleared. Grid restored to nominal.');
  };

  const activeFaultsCount = 
    (originOverloaded ? 1 : 0) + 
    Object.values(weather).filter(Boolean).length + 
    Object.values(overload).filter(Boolean).length;

  // Multi-Language Code Snippets for Theories Section
  const EDGE_CODE_SNIPPETS = {
    javascript: `// Netrium Anycast Edge Router - Cloudflare Worker / V8 Isolate
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;

    // 1. Check High-Speed Edge RAM / L1 SSD Cache
    let response = await cache.match(cacheKey);
    if (response) {
      const headers = new Headers(response.headers);
      headers.set('X-Netrium-Cache', 'HIT');
      headers.set('X-Edge-POP', request.cf?.colo || 'BOM');
      return new Response(response.body, { ...response, headers });
    }

    // 2. Cache MISS: Fetch from Central Origin Shield over Tier-1 Backbone
    const originResponse = await fetch(\`https://origin.netrium.site\${url.pathname}\`, {
      headers: request.headers
    });

    // 3. Clone and store in Edge Cache with Stale-While-Revalidate TTL
    response = new Response(originResponse.body, originResponse);
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=60');
    response.headers.set('X-Netrium-Cache', 'MISS');
    ctx.waitUntil(cache.put(cacheKey, response.clone()));

    return response;
  }
};`,
    python: `# Netrium Compute@Edge Python Handler (Fastly / Varnish Architecture)
from fastly import Request, Response, Cache

def main(request):
    client_ip = request.headers.get("Fastly-Client-IP")
    cache_key = request.url

    # Check Local POP Cache Buffer
    cached_asset = Cache.lookup(cache_key)
    if cached_asset.is_hit():
        return Response(cached_asset.body, headers={
            "X-Netrium-Cache": "HIT",
            "X-POP-Location": "Mumbai-1",
            "Content-Type": "application/json"
        })

    # Forward to San Francisco Central Origin Shield
    origin_resp = Request.fetch("https://origin.netrium.site", request)
    Cache.insert(cache_key, origin_resp.body, ttl=3600)
    
    return origin_resp`,
    cpp: `// Netrium Ultra-Low Latency Kernel Proxy Handler (eBPF / XDP C++)
#include <linux/bpf.h>
#include <bpf/bpf_helpers.h>

SEC("xdp_cdn_filter")
int xdp_anycast_router(struct xdp_md *ctx) {
    void *data = (void *)(long)ctx->data;
    void *data_end = (void *)(long)ctx->data_end;

    // Zero-copy Line-Rate Packet Inspection at 100 Gbps
    struct ethhdr *eth = data;
    if ((void *)(eth + 1) > data_end) return XDP_PASS;

    // Redirect to nearest local POP core socket based on BGP hash
    __u32 pop_index = bpf_get_prandom_u32() % 16;
    return XDP_TX;
}`,
    java: `// Netrium Enterprise Edge Proxy Server
public class EdgeReverseProxy {
    private final CacheManager l1Cache = new DistributedL1Cache();

    public HttpResponse handleClientGet(HttpRequest req) {
        String assetUri = req.getUri();
        byte[] payload = l1Cache.get(assetUri);

        if (payload != null) {
            return HttpResponse.ok(payload)
                .withHeader("X-Netrium-Status", "HIT")
                .withHeader("X-Latency-Score", "12ms");
        }

        byte[] originBytes = HttpBackend.fetchFromOrigin(assetUri);
        l1Cache.put(assetUri, originBytes, Duration.ofHours(2));
        return HttpResponse.ok(originBytes).withHeader("X-Netrium-Status", "MISS");
    }
}`
  };

  const handleCopyCode = () => {
    const snippet = EDGE_CODE_SNIPPETS[selectedLang] || '';
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeInspectServer = servers[inspectNodeId] || servers.mumbai;
  const isInspectOrigin = inspectNodeId === 'origin';
  const inspectWeather = weather[inspectNodeId];
  const inspectOverload = isInspectOrigin ? originOverloaded : overload[inspectNodeId];
  const inspectFluct = isInspectOrigin ? 0 : (loadFluctuations[inspectNodeId] || 0);
  const inspectTotalCpu = Math.max(8, Math.min(100, (activeInspectServer.baseLoad || 30) + inspectFluct + (inspectOverload ? 60 : 0)));

  return (
    <div className="cdn-viewport">
      {/* Persistent Navigation Bar */}
      <Navbar onOpenFacility={(facilityId) => {
        if (facilityId === 'multi-mesh') navigate('/topologies');
        else if (facilityId === 'dsa-algo' || facilityId === 'dsa') navigate('/dsa');
        else if (facilityId !== 'packet-trace' && facilityId !== 'cdn') navigate('/');
      }} />

      <main className="cdn-main-container">
        {/* Navigation Breadcrumb Row */}
        <div className="cdn-breadcrumb-row">
          <button 
            type="button" 
            className="cdn-back-pill"
            onClick={() => navigate('/')}
            aria-label="Back to Terminal Hub"
          >
            <ArrowLeft size={14} />
            <span>Back to Terminal Hub</span>
          </button>
          <span className="cdn-sep">/</span>
          <span className="cdn-crumb-active">Global Content Delivery Network</span>
        </div>

        {/* STANDARDIZED 3-SECTION SUBHEADER DOCK (EXACTLY MATCHING USER'S IMAGE) */}
        <nav className="topolab-subheader-tabs cdn-subheader-dock">
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

              <button
                type="button"
                className={`topolab-tab-btn ${activeTab === 'chaos' ? 'active' : ''}`}
                onClick={() => setActiveTab('chaos')}
              >
                <Sliders size={15} />
                <span>Practical Oriented</span>
                <span className="tab-pill-badge">CHAOS LAB</span>
              </button>
            </div>

            <div className="topolab-subheader-meta">
              <span className="meta-dot live" />
              <span className="meta-label">EDGE MESH ONLINE · 16 POPS · 40+ CLIENTS</span>
            </div>
          </div>
        </nav>

        {/* ========================================================
            TAB 1: THEORIES & SPECS (CURRICULUM & LONG THEORY)
            ======================================================== */}
        {activeTab === 'theories' && (
          <div className="topolab-theory-layout">
            <div className="theory-main-column">
              {/* Core Concept Overview */}
              <div className="theory-concept-card">
                <div className="theory-badge-row">
                  <span className="theory-tag cyan">Distributed Infrastructure</span>
                  <span className="theory-tag green">Latency: ~4ms Anycast</span>
                  <span className="theory-tag purple">Availability: 99.999%</span>
                </div>
                <h2 className="theory-title">Content Delivery Network (CDN) & Edge Computing Architecture</h2>
                <p className="theory-body-p">
                  A Content Delivery Network (CDN) is a geographically distributed network of proxy servers and data centers. The primary goal is to provide high availability and maximum performance by distributing service spatially relative to end-users. In traditional client-server architecture, client requests travel thousands of kilometers to reach a centralized origin data center, suffering from packet loss, jitter, and Round Trip Time (RTT) degradation dictated by the speed of light in optical fiber (~200,000 km/s).
                </p>
                <p className="theory-body-p">
                  Netrium's CDN simulation deploys 16 edge Points of Presence (POPs) paired with an Origin Shield in San Francisco. By terminating TCP handshakes and TLS 1.3 sessions at the closest edge node, client latency is decoupled from origin distance.
                </p>
              </div>

              {/* Mathematical Physics & Latency Formulation */}
              <div className="theory-concept-card">
                <h3 className="theory-section-title">
                  <Activity size={18} className="text-emerald-400" />
                  <span>Mathematical Physics & Spherical Latency Formulations</span>
                </h3>
                <p className="theory-body-p">
                  Total network latency experienced by a requesting client is governed by four additive delay factors:
                </p>
                <div className="math-proof-box">
                  {`Total Latency = 2 × (T_propagation + T_transmission + T_queuing + T_processing)

1. Haversine Great-Circle Spherical Distance:
   d = 2r × arcsin( √( sin²(Δφ/2) + cos(φ₁)cos(φ₂)sin²(Δλ/2) ) )
   where r = 6,371 km (Earth mean radius), φ = latitude, λ = longitude.

2. Propagation Delay in Optical Fiber:
   T_prop = d / (c / n) ≈ d / (200,000 km/s) ≈ 5 μs per km

3. Multi-Factor Anycast Scoring Equation:
   Score = w₁·Distance(km) + w₂·RTT(ms) + w₃·CPU_Queue(%) + w₄·PacketLoss(%) - w₅·CachePresence`}
                </div>
              </div>

              {/* 4-Phase Working Mechanics */}
              <div className="theory-concept-card">
                <h3 className="theory-section-title">
                  <Layers size={18} className="text-cyan-400" />
                  <span>Phase-by-Phase Working Mechanics</span>
                </h3>

                <div className="theory-phase-card">
                  <div className="theory-phase-header">
                    <span className="phase-number-chip">PHASE 1</span>
                    <span className="phase-title">Anycast BGP Route Announcement & DNS Resolution</span>
                  </div>
                  <p className="phase-desc">
                    All 16 edge POPs advertise the exact same IP prefix via Border Gateway Protocol (BGP). The client's local ISP router routes packets to the topologically closest POP along the shortest AS-Path in ~4ms.
                  </p>
                </div>

                <div className="theory-phase-card">
                  <div className="theory-phase-header">
                    <span className="phase-number-chip">PHASE 2</span>
                    <span className="phase-title">Local TCP Handshake & TLS 1.3 Edge Termination</span>
                  </div>
                  <p className="phase-desc">
                    The 3-way TCP handshake (SYN, SYN-ACK, ACK) and cryptographic TLS key exchange terminate locally at the Edge POP rather than crossing continental undersea cables, slashing connection setup from 280ms down to &lt; 15ms.
                  </p>
                </div>

                <div className="theory-phase-card">
                  <div className="theory-phase-header">
                    <span className="phase-number-chip">PHASE 3</span>
                    <span className="phase-title">L1 Memory / L2 SSD Cache Key Verification</span>
                  </div>
                  <p className="phase-desc">
                    The edge proxy hashes the URI and evaluates HTTP cache headers (<code>Cache-Control: public, s-maxage=86400, stale-while-revalidate</code>). If present, a <strong>Cache HIT (200)</strong> streams immediately from edge RAM.
                  </p>
                </div>

                <div className="theory-phase-card">
                  <div className="theory-phase-header">
                    <span className="phase-number-chip">PHASE 4</span>
                    <span className="phase-title">Origin Shielding & Tier-1 Backhaul Fetching</span>
                  </div>
                  <p className="phase-desc">
                    On a <strong>Cache MISS</strong>, the edge POP initiates a persistent multiplexed HTTP/2 or HTTP/3 stream across private dedicated backhaul fiber to the San Francisco Origin, caches the asset locally, and fulfills the request.
                  </p>
                </div>
              </div>

              {/* Edge Worker Multi-Language Source Code */}
              <div className="theory-concept-card">
                <div className="code-lang-selector">
                  <div className="flex items-center gap-2">
                    <Code2 size={16} className="text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Edge Worker Implementation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {['javascript', 'python', 'cpp', 'java'].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        className={`lang-pill-btn ${selectedLang === lang ? 'active' : ''}`}
                        onClick={() => setSelectedLang(lang)}
                      >
                        {lang === 'cpp' ? 'C++ (eBPF)' : lang.toUpperCase()}
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
                  <pre className="code-pre">{EDGE_CODE_SNIPPETS[selectedLang] || '// Code ready.'}</pre>
                </div>
              </div>

              {/* 6 Holographic Architecture Cards Showcase */}
              <div className="theory-concept-card">
                <h3 className="theory-section-title">
                  <Sparkles size={18} className="text-amber-400" />
                  <span>CDN Architectural Subsystems & Topology Standards</span>
                </h3>
                <div className="cdn-modules-grid mt-4">
                  {Object.values(CDN_CARDS).map((card) => {
                    const CardIcon = ICON_MAP[card.iconName] || ICON_MAP[card.icon] || Server;
                    return (
                      <div key={card.id} className="cdn-holo-wrapper">
                        <HoloCard
                          preset={card.preset}
                          foilColor={card.foilColor}
                          width={320}
                          ratio={1.35}
                          radius={16}
                          intensity={0.9}
                          edgeSparkle={0.85}
                          glare={0.6}
                          hoverScale={1.04}
                        >
                          <div className="dsa-holo-emblem" style={{ color: card.foilColor }}>
                            <div 
                              className="dsa-emblem-icon-ring"
                              style={{ borderColor: `${card.foilColor}40`, boxShadow: `0 0 20px ${card.foilColor}25` }}
                            >
                              <CardIcon size={32} strokeWidth={2} />
                            </div>
                            <span className="dsa-holo-label">{card.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono mt-1 text-center">{card.subtitle}</span>
                          </div>
                        </HoloCard>
                        <div className="cdn-card-detail-bar">
                          <p className="cdn-card-body-desc">{card.description}</p>
                          <div className="cdn-card-chips-row">
                            {card.specs?.map((spec, sIdx) => (
                              <span key={sIdx} className="cdn-tech-chip">
                                <strong>{spec.label}:</strong> {spec.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar Asymptotic Edge Telemetry */}
            <div className="theory-sidebar-column">
              <div className="theory-complexity-card">
                <h3 className="theory-sidebar-heading">Global Mesh Benchmarks</h3>
                <div className="complexity-table">
                  <div className="complexity-row">
                    <span className="tbl-label">Active Edge POPs:</span>
                    <span className="tbl-val green">16 Global Regions</span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">Target Latency:</span>
                    <span className="tbl-val green">&lt; 15 ms (Local Edge)</span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">Origin Offload Target:</span>
                    <span className="tbl-val cyan">95.4% Cache Hits</span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">Direct-to-Origin Penalty:</span>
                    <span className="tbl-val orange">280 - 450 ms</span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">DDoS Mitigation:</span>
                    <span className="tbl-val purple">Line Rate (100 Gbps)</span>
                  </div>
                </div>
              </div>

              <div className="theory-complexity-card">
                <h3 className="theory-sidebar-heading">Production Systems Reference</h3>
                <ul className="theory-bullet-list">
                  <li><strong>Cloudflare:</strong> Runs 330+ city Anycast edge nodes with V8 Isolate workers.</li>
                  <li><strong>Fastly:</strong> Lucet WASM runtime with 100-microsecond cold starts.</li>
                  <li><strong>Akamai:</strong> Origin Shielding tier with over 365,000 edge servers in 135 countries.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: FUNCTIONAL MODEL (COMPLETE CDN BY DN ARCHITECTURE)
            ======================================================== */}
        {activeTab === 'functional' && (
          <div className="cdn-interactive-stage">
            <div className="cdn-dashboard-grid">
              
              {/* Left Panel: Cells 01, 03, 04 Stacked */}
              <div className={`cdn-left-col ${isMapMaximized ? 'fade-out-bg' : ''}`}>
                
                {/* Cell 01: Routing & Replication Config */}
                <section 
                  className={`cdn-glass-panel ${!isConfigExpanded ? 'cursor-pointer hover:border-slate-500' : ''}`}
                  onClick={!isConfigExpanded ? () => setIsConfigExpanded(true) : undefined}
                >
                  <h2 
                    onClick={(e) => {
                      if (isConfigExpanded) {
                        e.stopPropagation();
                        setIsConfigExpanded(false);
                      }
                    }}
                    className="cdn-panel-header"
                  >
                    <div className="cdn-panel-title">
                      <span className="cdn-panel-num">01</span>
                      <span>Routing & Replication Config</span>
                    </div>
                    <ChevronDown size={14} className={`cdn-chevron ${isConfigExpanded ? 'open' : ''}`} />
                  </h2>

                  {isConfigExpanded && (
                    <div className="cdn-panel-content">
                      {/* Row 1: CDN switch & Client Dropdown */}
                      <div className="cdn-form-two-col">
                        {/* CDN Switch */}
                        <div className="cdn-switch-widget">
                          <div>
                            <div className="cdn-micro-label">CDN STATUS</div>
                            <div className={`cdn-status-title ${cdnEnabled ? 'green' : 'dim'}`}>
                              {cdnEnabled ? 'ACTIVE' : 'BYPASSED'}
                            </div>
                          </div>
                          <label className="cdn-toggle-switch">
                            <input 
                              type="checkbox" 
                              checked={cdnEnabled}
                              onChange={(e) => setCdnEnabled(e.target.checked)}
                            />
                            <span className="cdn-toggle-slider" />
                          </label>
                        </div>

                        {/* Client Select Menu */}
                        <div className="cdn-field-widget">
                          <label htmlFor="client-select" className="cdn-micro-label">CLIENT LOCATION</label>
                          <select 
                            id="client-select"
                            value={selectedClient}
                            onChange={(e) => {
                              setSelectedClient(e.target.value);
                              addLog(`CLIENT: Traversal traffic source set to Client in ${e.target.value.toUpperCase()}`);
                            }}
                            className="cdn-select"
                          >
                            {Object.keys(clients).map(id => (
                              <option key={id} value={id}>{clients[id].name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Collapsible Routing rules */}
                      <div className="cdn-rules-dropdown-widget" ref={dropdownRef}>
                        <div className="cdn-micro-label">ROUTING DECISION METRICS</div>
                        <button 
                          type="button" 
                          onClick={() => setShowRulesDropdown(!showRulesDropdown)}
                          className="cdn-dropdown-btn"
                        >
                          <span>Configure Scored Metrics ({activeFactorsCount} active)</span>
                          <ChevronDown size={12} className={`transform transition-transform ${showRulesDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showRulesDropdown && (
                          <div className="cdn-dropdown-menu shadow-2xl z-50">
                            <div className="cdn-dropdown-menu-hint">
                              SELECT CRITERIA FOR ROUTING
                            </div>
                            <div className="cdn-checkbox-scroll">
                              {Object.keys(activeFactors).map((key) => (
                                <label key={key} className="cdn-checkbox-item">
                                  <input 
                                    type="checkbox" 
                                    checked={activeFactors[key]}
                                    onChange={(e) => {
                                      setActiveFactors(prev => ({ ...prev, [key]: e.target.checked }));
                                      addLog(`CONFIG: Active factor "${key.toUpperCase()}" set to ${e.target.checked}`);
                                    }}
                                  />
                                  <span className="cdn-checkmark" />
                                  <span className="capitalize">{key.charAt(0).toUpperCase() + key.slice(1)} Routing</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Badges container */}
                        <div className="cdn-badges-row">
                          {Object.keys(activeFactors).filter(k => activeFactors[k]).map(k => (
                            <span key={k} className="cdn-badge">{k.toUpperCase()}</span>
                          ))}
                          {activeFactorsCount === 0 && (
                            <span className="text-[10px] text-slate-500 italic">No rules active (Closest-geographic defaults)</span>
                          )}
                        </div>
                      </div>

                      {/* Row 3: Edge replication injector */}
                      <div className="cdn-replication-section">
                        <div className="cdn-micro-label">EDGE REPLICATION & VANDALIZER</div>
                        <form onSubmit={handlePublish} className="cdn-replication-form">
                          <input 
                            type="text" 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="cdn-replication-input"
                            placeholder="Publish payload message..."
                          />
                          <button type="submit" className="cdn-sub-action-btn">
                            Publish
                          </button>
                        </form>
                        <button 
                          type="button"
                          onClick={handleClearEdgeCaches}
                          className="cdn-danger-btn"
                        >
                          <Trash2 size={11} />
                          <span>PURGE REPLICAS CACHE DATABASES</span>
                        </button>
                      </div>
                    </div>
                  )}
                </section>

                {/* Cell 03: Node Dossier & Inspector */}
                <section 
                  className={`cdn-glass-panel ${!isDossierExpanded ? 'cursor-pointer hover:border-slate-500' : ''}`}
                  onClick={!isDossierExpanded ? () => setIsDossierExpanded(true) : undefined}
                >
                  <h2 
                    onClick={(e) => {
                      if (isDossierExpanded) {
                        e.stopPropagation();
                        setIsDossierExpanded(false);
                      }
                    }}
                    className="cdn-panel-header"
                  >
                    <div className="cdn-panel-title">
                      <span className="cdn-panel-num">03</span>
                      <span>Cluster Node Telemetry Dossier</span>
                    </div>
                    <ChevronDown size={14} className={`cdn-chevron ${isDossierExpanded ? 'open' : ''}`} />
                  </h2>

                  {isDossierExpanded && (() => {
                    if (!inspectNodeId || !servers[inspectNodeId]) {
                      return (
                        <div className="cdn-panel-content items-center text-center py-6">
                          <div className="text-xs text-slate-500 font-mono italic">
                            No node selected. Click a server on the map or select from below:
                          </div>
                          <select 
                            value="" 
                            onChange={(e) => setInspectNodeId(e.target.value)}
                            className="cdn-select mt-3 max-w-[280px]"
                          >
                            <option value="" disabled>Select a node...</option>
                            {Object.keys(servers).map(id => (
                              <option key={id} value={id}>{servers[id].name}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }

                    const node = servers[inspectNodeId];
                    const isOrigin = inspectNodeId === 'origin';
                    const hasWeather = weather[inspectNodeId];
                    const isOver = isOrigin ? originOverloaded : overload[inspectNodeId];
                    const cacheList = Object.keys(globalCache[inspectNodeId] || {});
                    const nodeLoad = isOver ? 100 : (node.baseLoad + (loadFluctuations[inspectNodeId] || 0));
                    const nodeHealth = Math.max(10, 100 - (hasWeather ? 40 : 0) - (isOver ? 30 : 0));

                    return (
                      <div className="cdn-panel-content">
                        {/* Node selection dropdown containing real-time loads */}
                        <div className="cdn-field-widget">
                          <div className="cdn-micro-label">SELECT NODE TO INSPECT</div>
                          <select 
                            value={inspectNodeId} 
                            onChange={(e) => setInspectNodeId(e.target.value)}
                            className="cdn-select"
                          >
                            {Object.keys(servers).map(id => {
                              const s = servers[id];
                              const sIsOrig = id === 'origin';
                              const sHasWeather = weather[id] || false;
                              const sIsOver = sIsOrig ? originOverloaded : overload[id] || false;
                              const sLoad = sIsOver ? 100 : (s.baseLoad + (loadFluctuations[id] || 0));
                              const sHealth = Math.max(10, 100 - (sHasWeather ? 40 : 0) - (sIsOver ? 30 : 0));
                              return (
                                <option key={id} value={id}>
                                  {s.name} - Health: {sHealth}% | CPU: {sLoad}% {sIsOrig ? ' (Origin)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>

                        {/* Live load & health readout meters */}
                        <div className="cdn-meters-grid">
                          <div className="cdn-meter-box">
                            <div className="cdn-meter-meta">
                              <span>CPU LOAD CAPACITY</span>
                              <strong className={nodeLoad > 80 ? 'text-rose-400' : 'text-emerald-400'}>
                                {nodeLoad}% {isOver && '(OVERLOAD)'}
                              </strong>
                            </div>
                            <div className="cdn-meter-track">
                              <div className={`cdn-meter-bar ${nodeLoad > 80 ? 'danger' : 'green'}`} style={{ width: `${Math.min(100, nodeLoad)}%` }} />
                            </div>
                          </div>
                          <div className="cdn-meter-box">
                            <div className="cdn-meter-meta">
                              <span>NODE HEALTH</span>
                              <strong className={nodeHealth < 50 ? 'text-rose-400' : 'text-cyan-400'}>
                                {nodeHealth}%
                              </strong>
                            </div>
                            <div className="cdn-meter-track">
                              <div className={`cdn-meter-bar ${nodeHealth < 50 ? 'danger' : 'cyan'}`} style={{ width: `${Math.min(100, nodeHealth)}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Local edge cache objects */}
                        <div className="cdn-cache-objects-box">
                          <div className="cdn-cache-header">
                            <span>LOCAL POP CACHE STORAGE ({cacheList.length} OBJECTS)</span>
                          </div>
                          <div className="cdn-cache-scroll">
                            {cacheList.length === 0 ? (
                              <div className="cdn-cache-empty">Cache database empty. Run simulation traffic.</div>
                            ) : (
                              <div className="cdn-cache-items-list">
                                {Object.entries(globalCache[inspectNodeId] || {}).map(([key, val]) => (
                                  <div key={key} className="cdn-cache-entry">
                                    <div className="flex justify-between items-center text-[10px]">
                                      <span className="text-slate-500 font-mono font-bold">KEY:</span>
                                      <span className="text-emerald-400 font-mono font-bold">{key}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] mt-1">
                                      <span className="text-slate-500 font-mono font-bold">VAL:</span>
                                      <span className="text-slate-300 font-mono truncate max-w-[75%]">"{val}"</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Toggle controls */}
                        <div className="cdn-fault-actions-row">
                          <button 
                            type="button"
                            onClick={() => toggleWeather(inspectNodeId)}
                            className={`cdn-fault-btn ${hasWeather ? 'active-weather' : ''}`}
                          >
                            <CloudRain size={13} />
                            <span>{hasWeather ? 'Clear Weather' : 'Inject Storm'}</span>
                          </button>

                          <button 
                            type="button"
                            onClick={() => toggleOverload(inspectNodeId)}
                            className={`cdn-fault-btn ${isOver ? 'active-overload' : ''}`}
                          >
                            <Flame size={13} />
                            <span>{isOver ? 'Cool Down' : 'Force Overload'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </section>

                {/* Cell 04: Diagnostics, Analytics & Logs */}
                <section 
                  className={`cdn-glass-panel ${!isLogsExpanded ? 'cursor-pointer hover:border-slate-500' : ''}`}
                  onClick={!isLogsExpanded ? () => setIsLogsExpanded(true) : undefined}
                >
                  <h2 
                    onClick={(e) => {
                      if (isLogsExpanded) {
                        e.stopPropagation();
                        setIsLogsExpanded(false);
                      }
                    }}
                    className="cdn-panel-header"
                  >
                    <div className="cdn-panel-title">
                      <span className="cdn-panel-num">04</span>
                      <span>Metrics & Diagnostics Logs</span>
                    </div>
                    <ChevronDown size={14} className={`cdn-chevron ${isLogsExpanded ? 'open' : ''}`} />
                  </h2>

                  {isLogsExpanded && (
                    <div className="cdn-panel-content">
                      {/* Readouts Row */}
                      <div className="cdn-form-two-col">
                        {/* Payload Readout */}
                        <div className="cdn-readout-card">
                          <div className="cdn-micro-label">CLIENT PAYLOAD READOUT</div>
                          {simResults ? (
                            <div className="cdn-readout-val-col">
                              <span className="text-white font-mono font-bold truncate">
                                {simResults.contentReceived}
                              </span>
                              <span className="cdn-modifier-pill">{simResults.contentModifier}</span>
                            </div>
                          ) : (
                            <div className="cdn-readout-empty">No active payload.</div>
                          )}
                        </div>

                        {/* Ping breakdown */}
                        <div className="cdn-readout-card">
                          <div className="cdn-micro-label">LATENCY OVERVIEW</div>
                          {simResults ? (
                            <div className="cdn-latency-grid">
                              <div className="cdn-latency-tile">
                                <span className="lbl">DNS</span>
                                <span className="val">{simResults.dnsLatency}ms</span>
                              </div>
                              <div className="cdn-latency-tile">
                                <span className="lbl">FETCH</span>
                                <span className="val">{simResults.edgeLatency}ms</span>
                              </div>
                              <div className="cdn-latency-tile highlight">
                                <span className="lbl">TOTAL</span>
                                <span className="val">{simResults.latency}ms</span>
                              </div>
                            </div>
                          ) : (
                            <div className="cdn-readout-empty">No active request.</div>
                          )}
                        </div>
                      </div>

                      {/* Diagnostics log console */}
                      <div className="cdn-log-console-box">
                        <div className="cdn-console-header">
                          <span className="cdn-micro-label">DIAGNOSTICS LOG CONSOLE</span>
                          <button 
                            type="button"
                            onClick={clearLogs}
                            className="cdn-console-clear-btn"
                          >
                            CLEAR
                          </button>
                        </div>
                        <div className="cdn-console-feed">
                          {logs.map((log, idx) => (
                            <div key={idx} className="cdn-console-line">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {/* Right Panel: Cell 02 Interactive World Map Viewer */}
              <div className={`cdn-right-col ${isMapMaximized ? 'map-card-maximized' : ''}`}>
                <section className="cdn-glass-panel cdn-map-card-panel">
                  {/* Map viewport */}
                  <div className="cdn-map-stage-wrapper">
                    <CdnMap
                      servers={servers}
                      clients={clients}
                      selectedClient={selectedClient}
                      cdnEnabled={cdnEnabled}
                      weather={weather}
                      overload={overload}
                      originOverloaded={originOverloaded}
                      loadFluctuations={loadFluctuations}
                      simResults={simResults}
                      simProgress={simProgress}
                      isSimulating={isSimulating}
                      inspectNodeId={inspectNodeId}
                      setInspectNodeId={(id) => {
                        setInspectNodeId(id);
                        setIsDossierExpanded(true);
                      }}
                      highlightOnlyActive={highlightOnlyActive}
                      setHighlightOnlyActive={setHighlightOnlyActive}
                      isMapMaximized={isMapMaximized}
                      setIsMapMaximized={setIsMapMaximized}
                    />
                  </div>

                  {/* Trigger Request button bar */}
                  {!isMapMaximized && (
                    <div className="cdn-action-cta-bar">
                      <button 
                        type="button"
                        onClick={handleRunRequest}
                        disabled={isSimulating}
                        className="cdn-primary-simulate-btn"
                      >
                        <Activity size={16} className={isSimulating ? 'animate-spin' : ''} />
                        <span>{isSimulating ? 'TRANSMITTING DATA PACKETS...' : 'SIMULATE EDGE REQUEST TRAFFIC'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRunAllSimulation}
                        disabled={isSimulating}
                        className="cdn-secondary-sweep-btn"
                        title="Run 40+ client global sweep"
                      >
                        <Globe size={15} />
                        <span>Global Sweep</span>
                      </button>
                    </div>
                  )}
                </section>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: PRACTICAL ORIENTED (CHAOS LAB)
            ======================================================== */}
        {/* ========================================================
            TAB 3: PRACTICAL ORIENTED (CHAOS LAB)
            CONTROLS ON LEFT (DESKTOP) / ON TOP (MOBILE)
            CHARTS, DIAGNOSTICS & TELEMETRY STREAM ON RIGHT (DESKTOP)
            ======================================================== */}
        {activeTab === 'chaos' && !cdnRoom && (
          <div className="net-multiplayer-lobby">
            <div className="lobby-hero-card">
              <div className="lobby-pill-row">
                <span className="lobby-mode-pill">
                  <Radio size={12} className="live-spin" />
                  <span>4-Digit Multiplayer Room Lobby</span>
                </span>
                <span className="lobby-topo-badge">GLOBAL ANYCAST CDN</span>
              </div>
              <h2 className="lobby-title">Multi-Device CDN Edge & Origin Cluster Lab</h2>
              <p className="lobby-subtitle">
                Connect multiple physical or emulated devices into a shared Edge CDN topology using a 4-digit numeric code. The user who creates the room serves as the Authoritative Primary Origin Server, while other devices connect as CDN Edge POPs and Client Consumers with live geolocation mapping and data streaming.
              </p>

              <div className="lobby-tabs-switcher">
                <button
                  type="button"
                  className={`lobby-tab-btn ${cdnLobbyTab === 'create' ? 'active' : ''}`}
                  onClick={() => { setCdnLobbyTab('create'); setCdnLobbyError(''); }}
                >
                  <Sparkles size={14} />
                  <span>Create Simulation Room</span>
                </button>
                <button
                  type="button"
                  className={`lobby-tab-btn ${cdnLobbyTab === 'join' ? 'active' : ''}`}
                  onClick={() => { setCdnLobbyTab('join'); setCdnLobbyError(''); }}
                >
                  <Radio size={14} />
                  <span>Join with 4-Digit Code</span>
                </button>
              </div>

              {cdnLobbyError && (
                <div className="lobby-alert-error">
                  <AlertTriangle size={15} />
                  <span>{cdnLobbyError}</span>
                </div>
              )}

              {cdnLobbyTab === 'create' && (
                <form onSubmit={handleCreateCdnRoom} className="lobby-form-pane">
                  <div className="lobby-field-group">
                    <label className="lobby-label">
                      <Sliders size={14} />
                      <span>How many devices / stations in this CDN cluster?</span>
                    </label>
                    <div className="node-count-selector">
                      {[2, 3, 4, 5, 6].map(num => (
                        <button
                          key={num}
                          type="button"
                          className={`node-count-btn ${cdnReqNodes === num ? 'active' : ''}`}
                          onClick={() => setCdnReqNodes(num)}
                        >
                          <span className="count-num">{num}</span>
                          <span className="count-label">Devices</span>
                        </button>
                      ))}
                    </div>
                    <p className="field-hint">
                      Exactly {cdnReqNodes} participants will form this cluster. You will be designated as the <strong>Authoritative Primary Origin Server</strong>.
                    </p>
                  </div>

                  <div className="lobby-summary-box">
                    <div className="summary-row">
                      <span>Architecture:</span>
                      <strong>Global Anycast CDN Mesh</strong>
                    </div>
                    <div className="summary-row">
                      <span>Capacity Limit:</span>
                      <strong>{cdnReqNodes} Connected Devices</strong>
                    </div>
                    <div className="summary-row">
                      <span>Primary Origin Server:</span>
                      <strong className="text-rose-400">{user?.name || 'Local Machine'} (This Device / Room Creator)</strong>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="lobby-action-submit-btn"
                    disabled={cdnIsSubmitting}
                  >
                    <Sparkles size={16} />
                    <span>{cdnIsSubmitting ? 'Generating 4-Digit Room...' : 'Create CDN Simulation Room'}</span>
                  </button>
                </form>
              )}

              {cdnLobbyTab === 'join' && (
                <form onSubmit={handleJoinCdnRoom} className="lobby-form-pane">
                  <div className="lobby-field-group">
                    <label className="lobby-label">
                      <Radio size={14} />
                      <span>Enter 4-Digit Room Code</span>
                    </label>
                    <div className="room-code-input-wrapper">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 4819"
                        value={cdnJoinCodeInput}
                        onChange={(e) => setCdnJoinCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                        className="room-code-large-input"
                        autoFocus
                      />
                    </div>
                    <p className="field-hint">
                      Ask the CDN room owner for their 4-digit code. You will automatically receive an Edge POP or Client Consumer station role upon joining.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="lobby-action-submit-btn"
                    disabled={cdnIsSubmitting || cdnJoinCodeInput.trim().length !== 4}
                  >
                    <Users size={16} />
                    <span>{cdnIsSubmitting ? 'Connecting...' : 'Join CDN Lab Room'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE MULTI-DEVICE CDN ARENA */}
        {activeTab === 'chaos' && cdnRoom && (
          <div className="net-multiplayer-arena">

            {/* ARENA HEADER BAR */}
            <header className="arena-header-bar">
              <div className="arena-header-left">
                <div className="arena-code-card">
                  <span className="code-label">4-DIGIT ROOM CODE</span>
                  <div className="code-display-row">
                    <span className="code-digits">{cdnRoom.code}</span>
                    <button
                      type="button"
                      className="code-copy-btn"
                      onClick={handleCopyCdnRoomCode}
                      title="Copy 4-digit code to invite other devices"
                    >
                      {cdnCopiedCode ? <Check size={14} className="copied-icon" /> : <Copy size={14} />}
                      <span>{cdnCopiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>

                <div className="arena-topo-meta">
                  <span className="topo-tag">GLOBAL ANYCAST CDN</span>
                  <div className="capacity-pill">
                    <Users size={13} />
                    <span>
                      {cdnRoom.participants.length} / {cdnRoom.maxParticipants} Devices Connected
                    </span>
                  </div>
                </div>
              </div>

              <div className="arena-header-actions">
                <button
                  type="button"
                  className="arena-leave-btn"
                  onClick={handleLeaveCdnRoom}
                >
                  <span>Exit Room</span>
                </button>
              </div>
            </header>

            {/* CONNECTED DEVICES ROSTER */}
            <section className="arena-roster-section">
              <div className="roster-header">
                <div className="roster-title-wrap">
                  <Radio size={14} className="live-spin" />
                  <h3 className="roster-title">Connected Devices & Assigned CDN Roles</h3>
                </div>
                <span className="roster-sub">
                  Heartbeat synchronized &bull; Room Creator is Primary Origin Server &bull; Green = Online
                </span>
              </div>

              <div className="roster-cards-grid">
                {cdnRoom.participants.map((p, idx) => {
                  const isMe = (p.email || '').toLowerCase().trim() === (user?.email || '').toLowerCase().trim();
                  const isHostUser = (p.email || '').toLowerCase().trim() === (cdnRoom.hostEmail || '').toLowerCase().trim();

                  return (
                    <div
                      key={p.email || idx}
                      className={`roster-participant-card ${isMe ? 'is-my-device' : ''} ${p.isOnline ? 'online' : 'offline'}`}
                    >
                      <div className="roster-card-header">
                        <div className="live-status-dot-wrap">
                          <span className={`live-status-dot ${p.isOnline ? 'green' : 'red'}`} />
                          <span className="live-status-label">{p.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                        </div>
                        {isHostUser && <span className="host-badge">HOST / ORIGIN SERVER</span>}
                        {isMe && <span className="me-badge">THIS DEVICE</span>}
                      </div>

                      <div className="roster-user-info">
                        <span className="roster-email" title={p.email}>{p.email}</span>
                        <span className="roster-name">{p.name || 'Station Node'}</span>
                      </div>

                      <div className="roster-station-role">
                        <div
                          className="assigned-node-pill"
                          style={{
                            borderColor: isHostUser ? '#f43f5e' : idx === 1 ? '#06b6d4' : '#10b981'
                          }}
                        >
                          <span
                            className="node-letter-badge"
                            style={{
                              background: isHostUser ? '#f43f5e' : idx === 1 ? '#06b6d4' : '#10b981'
                            }}
                          >
                            {isHostUser ? 'O' : idx === 1 ? 'E' : 'C'}
                          </span>
                          <span className="node-role-name">
                            {isHostUser
                              ? 'Primary Origin Server'
                              : idx === 1
                              ? `Edge POP (${servers[selectedEdgeKey]?.name.split(' ')[0]})`
                              : 'Client Consumer'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {Array.from({ length: Math.max(0, cdnRoom.maxParticipants - cdnRoom.participants.length) }).map((_, slotIdx) => (
                  <div key={`empty-${slotIdx}`} className="roster-empty-slot">
                    <span className="empty-slot-plus">+</span>
                    <span className="empty-slot-text">Waiting for device to join...</span>
                    <span className="empty-slot-hint">Code: {cdnRoom.code}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* TWO COLUMN VIEW: CONTROLS LEFT (DESKTOP) / TOP (MOBILE), STAGE RIGHT */}
            <div className="topolab-practical-orientation-view cdn-practical-orientation">
            {/* ==================================================== */}
            {/* LEFT COLUMN: MULTI-DEVICE, GEOLOCATION & CONTROLS    */}
            {/* ==================================================== */}
            <div className="practical-controls-col">
              
              {/* 1. Multi-Device Collaborative CDN Room Hub */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-cyan-400" />
                    <h3 className="chaos-card-title">Multi-Device CDN Session</h3>
                  </div>
                  <span className="chaos-header-badge">ROOM {cdnRoomCode}</span>
                </div>
                <p className="chaos-card-desc">
                  Collaborative CDN network architecture. The user who creates the room serves as the Authoritative Primary Origin Server.
                </p>

                <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Primary Origin Server:</span>
                    <strong className="text-rose-400 font-mono font-bold flex items-center gap-1">
                      <Server size={12} /> {roomHostName} (Room Creator)
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Your Device Role:</span>
                    <span className="text-emerald-400 font-bold uppercase">{myDeviceCdnRole === 'client' ? 'Client Consumer' : myDeviceCdnRole === 'edge' ? 'CDN Edge POP' : 'Origin Server'}</span>
                  </div>
                </div>

                <div className="control-group">
                  <label className="control-label">Emulate Device Perspective:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      className={`hub-filter-pill text-xs justify-center py-1.5 ${myDeviceCdnRole === 'client' ? 'active' : ''}`}
                      onClick={() => {
                        setMyDeviceCdnRole('client');
                        addCdnPracticalLog('Switched local device perspective to Client Consumer.', 'info');
                      }}
                    >
                      <Smartphone size={13} />
                      <span>Client</span>
                    </button>
                    <button
                      type="button"
                      className={`hub-filter-pill text-xs justify-center py-1.5 ${myDeviceCdnRole === 'edge' ? 'active' : ''}`}
                      onClick={() => {
                        setMyDeviceCdnRole('edge');
                        addCdnPracticalLog(`Switched local device perspective to Edge Cache POP (${servers[selectedEdgeKey]?.name}).`, 'info');
                      }}
                    >
                      <Layers size={13} />
                      <span>Edge POP</span>
                    </button>
                    <button
                      type="button"
                      className={`hub-filter-pill text-xs justify-center py-1.5 ${myDeviceCdnRole === 'origin' ? 'active' : ''}`}
                      onClick={() => {
                        setMyDeviceCdnRole('origin');
                        addCdnPracticalLog('Switched local device perspective to Primary Origin Server.', 'info');
                      }}
                    >
                      <Database size={13} />
                      <span>Origin</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Device Geolocation Positioning System */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Compass size={18} className="text-emerald-400" />
                    <h3 className="chaos-card-title">Real-Time Geolocation</h3>
                  </div>
                  <span className="chaos-header-badge">GPS SENSOR</span>
                </div>
                <p className="chaos-card-desc">
                  Acquire your physical device GPS coordinates or assign regional coordinates to position your client device on the live network matrix:
                </p>

                <button
                  type="button"
                  className="w-full py-2.5 px-3 bg-emerald-500/15 border border-emerald-500/35 hover:bg-emerald-500/25 text-emerald-400 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                  onClick={handleDetectLiveGeolocation}
                  disabled={userGeo.isDetecting}
                >
                  <Crosshair size={14} className={userGeo.isDetecting ? 'animate-spin' : ''} />
                  <span>{userGeo.isDetecting ? 'Querying Device GPS Hardware...' : 'Detect Live Device Geolocation (GPS)'}</span>
                </button>

                {geoError && (
                  <div className="text-xs text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                    {geoError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Device Latitude</span>
                    <span className="font-mono text-emerald-400 font-bold">{userGeo.lat}° N</span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Device Longitude</span>
                    <span className="font-mono text-emerald-400 font-bold">{userGeo.lon}° E</span>
                  </div>
                </div>

                <div className="control-group">
                  <label className="control-label">Quick Regional Geolocation Presets:</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: 'mumbai', label: 'Mumbai' },
                      { key: 'delhi', label: 'Delhi' },
                      { key: 'london', label: 'London' },
                      { key: 'tokyo', label: 'Tokyo' },
                      { key: 'new_york', label: 'New York' },
                      { key: 'sydney', label: 'Sydney' },
                      { key: 'singapore', label: 'Singapore' },
                      { key: 'frankfurt', label: 'Berlin' }
                    ].map(p => (
                      <button
                        key={p.key}
                        type="button"
                        className="px-2 py-1 text-[11px] rounded bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
                        onClick={() => handleSelectPresetGeo(p.key)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Choose CDN Edge Server (POP) */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Server size={18} className="text-cyan-400" />
                    <h3 className="chaos-card-title">Choose CDN Edge Server</h3>
                  </div>
                  <span className="chaos-header-badge">CACHE POP</span>
                </div>
                <p className="chaos-card-desc">
                  Select which global Edge Server POP caches and accelerates content for your client device:
                </p>

                <div className="control-group">
                  <label htmlFor="select-edge-pop" className="control-label">Target Edge Server:</label>
                  <select
                    id="select-edge-pop"
                    className="control-select"
                    value={selectedEdgeKey}
                    onChange={(e) => {
                      setSelectedEdgeKey(e.target.value);
                      addCdnPracticalLog(`Selected Edge POP updated to ${servers[e.target.value]?.name}`, 'info');
                    }}
                  >
                    {Object.keys(servers).filter(k => k !== 'origin').map(k => (
                      <option key={k} value={k}>
                        {servers[k].name} [{servers[k].lat.toFixed(1)}°, {servers[k].lon.toFixed(1)}°] - Base Ping: {servers[k].baseLatency}ms
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Client to Edge</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {getHaversineDistance(userGeo.lat, userGeo.lon, servers[selectedEdgeKey]?.lat || 0, servers[selectedEdgeKey]?.lon || 0)} km
                    </span>
                  </div>
                  <div className="bg-black/40 p-2.5 rounded border border-white/5">
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">Edge to Origin</span>
                    <span className="font-mono text-amber-400 font-bold">
                      {getHaversineDistance(servers[selectedEdgeKey]?.lat || 0, servers[selectedEdgeKey]?.lon || 0, servers.origin.lat, servers.origin.lon)} km
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 rounded hover:bg-rose-500/20 flex items-center gap-1.5 transition"
                    onClick={handlePurgeSelectedEdgeCache}
                  >
                    <Trash2 size={13} />
                    <span>Purge POP Memory</span>
                  </button>
                  <span className="text-xs text-slate-400">
                    L1 Cache: {Object.keys(globalCache[selectedEdgeKey] || {}).length} Objects
                  </span>
                </div>
              </div>

              {/* 4. Real-Time Data Transfer Trigger & Payload Controls */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Send size={18} className="text-emerald-400" />
                    <h3 className="chaos-card-title">Transmit Asset Data Stream</h3>
                  </div>
                  <span className="chaos-header-badge">HTTP/3</span>
                </div>
                <p className="chaos-card-desc">
                  Issue asset request from your client position to evaluate cache hit/miss routing and packet hop visualization:
                </p>

                <div className="control-group">
                  <label htmlFor="select-asset" className="control-label">Select Requested Asset Payload:</label>
                  <select
                    id="select-asset"
                    className="control-select"
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                  >
                    <option value="video_4k.mp4">4K UltraHD Video Stream (video_4k.mp4 - 42.4 MB)</option>
                    <option value="app_bundle.js">Production React/Wasm Bundle (app_bundle.js - 1.8 MB)</option>
                    <option value="metrics.json">High-Frequency Telemetry API (metrics.json - 12 KB)</option>
                    <option value="hero_banner.webp">High-Res Brand Image (hero_banner.webp - 4.1 MB)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="force-miss-cb"
                    checked={forceCacheMiss}
                    onChange={(e) => setForceCacheMiss(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="force-miss-cb" className="text-xs text-slate-300 cursor-pointer select-none">
                    Force Cache Miss (Bypass Edge & Route to Origin Server)
                  </label>
                </div>

                <button
                  type="button"
                  className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={executeCdnDataTransfer}
                  disabled={isTransferring}
                >
                  <Send size={16} />
                  <span>{isTransferring ? 'Propagating Live Data Packets...' : 'Execute Data Transfer Stream'}</span>
                </button>
              </div>

              {/* 5. Chaos Fault Injections Presets */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Flame size={18} className="text-rose-400" />
                    <h3 className="chaos-card-title">Chaos Fault Injections</h3>
                  </div>
                  <span className="chaos-header-badge">RESILIENCE</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition ${originOverloaded ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' : 'bg-white/5 border-white/10 text-slate-300'}`}
                    onClick={() => toggleOverload('origin')}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Origin CPU Melt</span>
                      <Flame size={13} className="text-rose-400" />
                    </div>
                    <span className="text-[10px] text-slate-400">Lock Origin at 100% CPU</span>
                  </button>

                  <button
                    type="button"
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition ${weather[selectedEdgeKey] ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-white/5 border-white/10 text-slate-300'}`}
                    onClick={() => toggleWeather(selectedEdgeKey)}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Undersea Storm</span>
                      <CloudRain size={13} className="text-amber-400" />
                    </div>
                    <span className="text-[10px] text-slate-400">+120ms Subsea Fiber Latency</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ==================================================== */}
            {/* RIGHT COLUMN: REAL-TIME POSITION GRAPH & DATA STREAMS */}
            {/* ==================================================== */}
            <div className="practical-stage-col">

              {/* 1. Real-Time Device Position Matrix Graph (SVG World Projection) */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-cyan-400" />
                    <h3 className="chaos-card-title">Real-Time Device Position Matrix Graph</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      GPS POSITION LIVE
                    </span>
                  </div>
                </div>
                <p className="chaos-card-desc">
                  Nodes are positioned dynamically based on real-time device GPS coordinates and selected global POP locations. Visual packet streams travel across the links as requests are executed:
                </p>

                {/* SVG WORLD COORDINATES GRAPH */}
                <div className="w-full bg-slate-950/80 rounded-xl border border-white/10 p-3 overflow-hidden relative">
                  <svg viewBox="0 0 720 360" className="w-full h-auto block select-none">
                    <defs>
                      <filter id="cdn-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <linearGradient id="link-client-edge" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                      <linearGradient id="link-edge-origin" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>
                    </defs>

                    {/* Background World Coordinate Grid Lines */}
                    {[60, 120, 180, 240, 300].map(y => (
                      <line key={`lat-${y}`} x1="20" y1={y} x2="700" y2={y} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 6" />
                    ))}
                    {[120, 240, 360, 480, 600].map(x => (
                      <line key={`lon-${x}`} x1={x} y1="20" x2={x} y2="340" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 6" />
                    ))}

                    {/* Continents Subtle Grid Markers */}
                    <text x="40" y="40" fill="rgba(255,255,255,0.15)" fontSize="10" fontFamily="monospace">NORTH AMERICA</text>
                    <text x="320" y="60" fill="rgba(255,255,255,0.15)" fontSize="10" fontFamily="monospace">EUROPE</text>
                    <text x="460" y="80" fill="rgba(255,255,255,0.15)" fontSize="10" fontFamily="monospace">ASIA</text>
                    <text x="120" y="240" fill="rgba(255,255,255,0.15)" fontSize="10" fontFamily="monospace">SOUTH AMERICA</text>
                    <text x="340" y="200" fill="rgba(255,255,255,0.15)" fontSize="10" fontFamily="monospace">AFRICA</text>
                    <text x="560" y="260" fill="rgba(255,255,255,0.15)" fontSize="10" fontFamily="monospace">OCEANIA</text>

                    {/* Geodesic Coordinate Projections */}
                    {(() => {
                      const projX = (lon) => ((lon + 180) / 360) * 680 + 20;
                      const projY = (lat) => ((90 - lat) / 180) * 320 + 20;

                      const edge = servers[selectedEdgeKey] || servers.tokyo;
                      const origin = servers.origin;

                      const cX = projX(userGeo.lon);
                      const cY = projY(userGeo.lat);

                      const eX = projX(edge.lon);
                      const eY = projY(edge.lat);

                      const oX = projX(origin.lon);
                      const oY = projY(origin.lat);

                      // Quadratic Curves
                      const midCE_X = (cX + eX) / 2;
                      const midCE_Y = Math.min(cY, eY) - Math.abs(cX - eX) * 0.12 - 20;
                      const pathCE = `M ${cX} ${cY} Q ${midCE_X} ${midCE_Y} ${eX} ${eY}`;

                      const midEO_X = (eX + oX) / 2;
                      const midEO_Y = Math.min(eY, oY) - Math.abs(eX - oX) * 0.12 - 20;
                      const pathEO = `M ${eX} ${eY} Q ${midEO_X} ${midEO_Y} ${oX} ${oY}`;

                      return (
                        <g>
                          {/* Links */}
                          <path
                            d={pathCE}
                            fill="none"
                            stroke="url(#link-client-edge)"
                            strokeWidth="3"
                            strokeDasharray="6 4"
                            opacity="0.85"
                          />
                          <path
                            d={pathEO}
                            fill="none"
                            stroke="url(#link-edge-origin)"
                            strokeWidth="3"
                            strokeDasharray="6 4"
                            opacity="0.75"
                          />

                          {/* Live Animated Packets on Links */}
                          {isTransferring && (transferStep === 1 || transferStep === 5) && (
                            <circle r="7" fill="#10b981" filter="url(#cdn-glow)">
                              <animateMotion
                                path={transferStep === 1 ? pathCE : pathCE}
                                keyPoints={transferStep === 1 ? "0;1" : "1;0"}
                                keyTimes="0;1"
                                dur="0.7s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          )}

                          {isTransferring && (transferStep === 3 || transferStep === 4) && (
                            <circle r="7" fill="#f43f5e" filter="url(#cdn-glow)">
                              <animateMotion
                                path={transferStep === 3 ? pathEO : pathEO}
                                keyPoints={transferStep === 3 ? "0;1" : "1;0"}
                                keyTimes="0;1"
                                dur="0.7s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          )}

                          {/* Link Distance Badges */}
                          <g transform={`translate(${midCE_X}, ${midCE_Y + 14})`}>
                            <rect x="-45" y="-10" width="90" height="20" rx="10" fill="#030712" stroke="#10b981" strokeWidth="1" opacity="0.9" />
                            <text x="0" y="4" textAnchor="middle" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">
                              {getHaversineDistance(userGeo.lat, userGeo.lon, edge.lat, edge.lon)} km
                            </text>
                          </g>

                          <g transform={`translate(${midEO_X}, ${midEO_Y + 14})`}>
                            <rect x="-45" y="-10" width="90" height="20" rx="10" fill="#030712" stroke="#06b6d4" strokeWidth="1" opacity="0.9" />
                            <text x="0" y="4" textAnchor="middle" fill="#06b6d4" fontSize="10" fontFamily="monospace" fontWeight="bold">
                              {getHaversineDistance(edge.lat, edge.lon, origin.lat, origin.lon)} km
                            </text>
                          </g>

                          {/* 1. Client Node (Real GPS Coordinates) */}
                          <g transform={`translate(${cX}, ${cY})`}>
                            <circle r="18" fill="rgba(16, 185, 129, 0.2)" />
                            <circle r="10" fill="#10b981" filter="url(#cdn-glow)" />
                            <circle r="5" fill="#ffffff" />
                            <text x="0" y="24" textAnchor="middle" fill="#10b981" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                              CLIENT DEVICE
                            </text>
                            <text x="0" y="36" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                              {userGeo.name}
                            </text>
                          </g>

                          {/* 2. Edge Server Node (Chosen POP) */}
                          <g transform={`translate(${eX}, ${eY})`}>
                            <circle r="22" fill="rgba(6, 182, 212, 0.2)" />
                            <circle r="12" fill="#06b6d4" filter="url(#cdn-glow)" />
                            <circle r="6" fill="#ffffff" />
                            <text x="0" y="26" textAnchor="middle" fill="#06b6d4" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                              CDN EDGE POP
                            </text>
                            <text x="0" y="38" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                              {edge.name}
                            </text>
                          </g>

                          {/* 3. Origin Server Node (Room Creator) */}
                          <g transform={`translate(${oX}, ${oY})`}>
                            <circle r="24" fill="rgba(244, 63, 94, 0.2)" />
                            <circle r="14" fill="#f43f5e" filter="url(#cdn-glow)" />
                            <circle r="7" fill="#ffffff" />
                            <text x="0" y="28" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                              ORIGIN SERVER (HOST)
                            </text>
                            <text x="0" y="40" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                              {roomHostName}
                            </text>
                          </g>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* 2. Large Main Output Data Stream HUD */}
              <div className="large-output-hud-card">
                <div className="hud-card-top">
                  <div className="hud-badge">
                    <Activity size={14} />
                    <span>SYNCHRONIZED DATA STREAM HUD</span>
                  </div>
                  <span className="hud-topology-name">HTTP/3 ANYCAST EDGE</span>
                </div>

                <div className="hud-payload-banner">
                  <span className="payload-tag">REQUESTED ASSET PAYLOAD</span>
                  <h1 className="hud-payload-huge">"{selectedAsset}"</h1>
                </div>

                {/* Traversal Flow */}
                <div className="hud-traversal-bar">
                  <span className="traversal-bar-label">DELIVERY PIPELINE:</span>
                  <div className="traversal-nodes-flow">
                    <div className="hop-step-item">
                      <div className={`hop-node-bubble ${transferStep >= 1 ? 'delivered' : ''}`} style={{ borderColor: '#10b981' }}>
                        <span className="hop-letter">C</span>
                      </div>
                      <span className="hop-station-tag">Client Device</span>
                      <ArrowRight size={16} className={`hop-arrow ${transferStep >= 1 ? 'active' : ''}`} />
                    </div>

                    <div className="hop-step-item">
                      <div className={`hop-node-bubble ${transferStep >= 2 ? 'active-hop' : ''}`} style={{ borderColor: '#06b6d4' }}>
                        <span className="hop-letter">E</span>
                        {transferStep === 2 && <span className="hop-pulse-ring" />}
                      </div>
                      <span className="hop-station-tag">Edge POP ({servers[selectedEdgeKey]?.name.split(' ')[0]})</span>
                      <ArrowRight size={16} className={`hop-arrow ${transferStep >= 3 ? 'active' : ''}`} />
                    </div>

                    <div className="hop-step-item">
                      <div className={`hop-node-bubble ${transferStep >= 3 ? 'delivered' : ''}`} style={{ borderColor: '#f43f5e' }}>
                        <span className="hop-letter">O</span>
                      </div>
                      <span className="hop-station-tag">Origin Host ({roomHostName.split(' ')[0]})</span>
                    </div>
                  </div>
                </div>

                {/* Status Marquee */}
                <div className={`hud-status-marquee ${isTransferring ? 'running' : lastTransferResult ? 'completed' : 'idle'}`}>
                  <div className="marquee-dot" />
                  <span>
                    {isTransferring
                      ? transferStep === 1
                        ? `[HOP 1] Dispatching HTTP GET from Client Device to ${servers[selectedEdgeKey]?.name}...`
                        : transferStep === 2
                        ? `[CACHE EVAL] Edge POP inspecting local SSD cache...`
                        : transferStep === 3
                        ? `[HOP 2] Cache Miss! Edge routing request to Origin Server (${roomHostName})...`
                        : transferStep === 4
                        ? `[CACHE WARMING] Origin dispatching 4.2MB binary. Edge POP writing to L1 SSD cache...`
                        : `[HOP 3] Streaming final payload down to Client Device...`
                      : lastTransferResult
                      ? `[DELIVERED] Asset "${lastTransferResult.asset}" successfully delivered in ${lastTransferResult.totalLatency}ms. Status: ${lastTransferResult.cacheStatus}. (0% Packet Loss)`
                      : `[READY] Select an asset payload and click "Execute Data Transfer Stream" to observe live multi-hop routing.`}
                  </span>
                </div>
              </div>

              {/* 3. This Device's Local Perspective Card */}
              <div className="local-device-perspective-card">
                <div className="local-card-top">
                  <div className="local-title-row">
                    <Laptop size={16} className="device-icon" />
                    <h3>Your Device Local Perspective</h3>
                  </div>
                  <span
                    className="local-status-pill"
                    style={{
                      borderColor: myDeviceCdnRole === 'client' ? '#10b981' : myDeviceCdnRole === 'edge' ? '#06b6d4' : '#f43f5e',
                      color: myDeviceCdnRole === 'client' ? '#10b981' : myDeviceCdnRole === 'edge' ? '#06b6d4' : '#f43f5e'
                    }}
                  >
                    {myDeviceCdnRole === 'client' ? 'CLIENT CONSUMER' : myDeviceCdnRole === 'edge' ? 'EDGE CACHE POP' : 'PRIMARY ORIGIN SERVER'}
                  </span>
                </div>

                <p className="local-device-desc">
                  This card reflects your physical device's exact operational role in the CDN architecture right now:
                </p>

                <div
                  className="local-action-banner"
                  style={{
                    borderLeftColor: myDeviceCdnRole === 'client' ? '#10b981' : myDeviceCdnRole === 'edge' ? '#06b6d4' : '#f43f5e'
                  }}
                >
                  <span className="local-msg-highlight">
                    {myDeviceCdnRole === 'client'
                      ? `THIS DEVICE IS THE CLIENT CONSUMER: Located at [${userGeo.lat}°, ${userGeo.lon}°]. Consuming media via ${servers[selectedEdgeKey]?.name}.`
                      : myDeviceCdnRole === 'edge'
                      ? `THIS DEVICE IS THE CDN EDGE CACHE POP: Intercepting client requests, evaluating SSD cache index, and shielding Central Origin.`
                      : `THIS DEVICE IS THE PRIMARY ORIGIN SERVER: Room Creator host machine storing authoritative master objects and database records.`}
                  </span>
                </div>

                <div className="local-node-specs-grid">
                  <div className="spec-pill">
                    <span className="sp-title">Assigned Device Role</span>
                    <span className="sp-val">{myDeviceCdnRole.toUpperCase()}</span>
                  </div>
                  <div className="spec-pill">
                    <span className="sp-title">Coordinates</span>
                    <span className="sp-val font-mono">{userGeo.lat}°, {userGeo.lon}°</span>
                  </div>
                  <div className="spec-pill">
                    <span className="sp-title">Target Edge POP</span>
                    <span className="sp-val">{servers[selectedEdgeKey]?.name.split(' ')[0]}</span>
                  </div>
                  <div className="spec-pill">
                    <span className="sp-title">Network Duplex</span>
                    <span className="sp-val text-emerald-400 font-bold">FULL DUPLEX</span>
                  </div>
                </div>
              </div>

              {/* 4. Synchronized Telemetry Logbook */}
              <div className="chaos-card-full">
                <div className="chaos-card-header">
                  <div className="flex items-center gap-2">
                    <Terminal size={18} className="text-emerald-400" />
                    <h3 className="chaos-card-title">Real-Time Data Transfer & Routing Telemetry Stream</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="telemetry-live-dot" />
                    <span className="text-xs text-slate-400 font-mono">STREAM ACTIVE</span>
                    <button
                      type="button"
                      className="chaos-clear-logs-btn"
                      onClick={() => setCdnPracticalLogs([])}
                      title="Clear telemetry logs"
                    >
                      Clear Stream
                    </button>
                  </div>
                </div>

                <div className="chaos-terminal-full">
                  {cdnPracticalLogs.map((log, i) => (
                    <div key={log.id || i} className={`terminal-line-v2 ${i === 0 ? 'active' : ''}`}>
                      <span className="text-slate-500 font-mono mr-2">[{log.time}]</span>
                      <span className={log.type === 'success' ? 'text-emerald-400' : log.type === 'transfer' ? 'text-cyan-300' : log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
          </div>
        )}
      </main>

      {/* Manual Modal Help */}
      {showHelpModal && (
        <div className="cdn-modal-backdrop" onClick={() => setShowHelpModal(false)}>
          <div className="cdn-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cdn-modal-header">
              <h2>HOW IT WORKS // CDN SIMULATION SYSTEM MANUAL</h2>
              <button 
                type="button" 
                onClick={() => setShowHelpModal(false)}
                className="cdn-modal-close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="cdn-modal-body">
              <p className="text-sm text-slate-300">
                Netrium distributes traffic across 16 global POPs using Haversine distance, Anycast DNS, and real-time CPU scoring.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
