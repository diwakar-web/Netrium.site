import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
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
  Database
} from 'lucide-react';
import Navbar from '../components/Navbar';
import HoloCard from '../components/HoloCard';
import CdnMap from '../components/CdnMap';
import { CDN_CARDS } from '../utils/cdnCardArts';
import { servers, clients, simulateRequest, getHaversineDistance } from '../utils/cdnEngine';
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
        {activeTab === 'chaos' && (
          <div className="cdn-chaos-layout">
            <div className="theory-main-column">
              {/* Chaos Engineering Triggers */}
              <div className="theory-concept-card">
                <h3 className="theory-section-title">
                  <Flame size={18} className="text-rose-400" />
                  <span>Chaos Engineering Fault Injection Suite</span>
                </h3>
                <p className="theory-body-p">
                  Inject deterministic infrastructure failures to test Netrium Anycast re-routing, failover resilience, and origin protection under stress:
                </p>

                <div className="chaos-preset-grid">
                  <button
                    type="button"
                    className={`chaos-preset-btn ${originOverloaded ? 'active' : ''}`}
                    onClick={() => toggleOverload('origin')}
                  >
                    <span className="preset-title flex items-center gap-2">
                      <Flame size={15} className="text-rose-400" />
                      <span>Origin Server CPU Melt</span>
                    </span>
                    <span className="preset-desc">{originOverloaded ? 'Origin locked at 100% CPU' : 'Spike origin to 100% CPU'}</span>
                  </button>

                  <button
                    type="button"
                    className={`chaos-preset-btn ${weather.mumbai ? 'active' : ''}`}
                    onClick={() => toggleWeather('mumbai')}
                  >
                    <span className="preset-title flex items-center gap-2">
                      <CloudRain size={15} className="text-cyan-400" />
                      <span>Mumbai Fiber Cyclone</span>
                    </span>
                    <span className="preset-desc">{weather.mumbai ? 'Severe Storm (+120ms latency)' : 'Inject latency spike (+120ms)'}</span>
                  </button>

                  <button
                    type="button"
                    className={`chaos-preset-btn ${overload.mumbai ? 'active' : ''}`}
                    onClick={() => toggleOverload('mumbai')}
                  >
                    <span className="preset-title flex items-center gap-2">
                      <Zap size={15} className="text-amber-400" />
                      <span>Mumbai POP Overload</span>
                    </span>
                    <span className="preset-desc">{overload.mumbai ? 'Force re-route to Frankfurt' : 'Saturate queue to 95% CPU'}</span>
                  </button>

                  <button
                    type="button"
                    className="chaos-preset-btn"
                    onClick={() => purgeCache('all')}
                  >
                    <span className="preset-title flex items-center gap-2">
                      <Trash2 size={15} className="text-purple-400" />
                      <span>Global Cache Stampede</span>
                    </span>
                    <span className="preset-desc">Flush all edge POP cache memory</span>
                  </button>
                </div>
              </div>

              {/* Custom Payload Publishing Studio */}
              <div className="theory-concept-card">
                <h3 className="theory-section-title">
                  <Database size={18} className="text-cyan-400" />
                  <span>Payload Replication & Cache Invalidation Studio</span>
                </h3>
                <p className="theory-body-p">
                  Publish a new document payload to Central Origin. Then run requests from different regional clients to observe cache miss propagation followed by persistent edge replication:
                </p>

                <form onSubmit={handlePublish} className="flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Enter document payload (e.g. 'v2.4-firmware-binary-blob')"
                    className="chaos-input-field"
                  />
                  <button type="submit" className="chaos-apply-btn">
                    <Sparkles size={14} />
                    <span>Publish to Origin</span>
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-400 bg-black/40 p-3 rounded-lg border border-white/5">
                  <span>Active Content ID: <strong className="text-emerald-400">{activeContentId}</strong></span>
                  <span>Origin Master Copy: <strong className="text-cyan-400">{globalCache.origin[activeContentId] || 'None'}</strong></span>
                </div>
              </div>

              {/* Chaos Telemetry Terminal Log */}
              <div className="theory-concept-card">
                <h3 className="theory-section-title">
                  <Terminal size={18} className="text-emerald-400" />
                  <span>Chaos Telemetry Real-Time Log</span>
                </h3>
                <div className="chaos-terminal">
                  {logs.map((log, i) => (
                    <div key={i} className={`terminal-line ${i === 0 ? 'active' : ''}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar Chaos Diagnostics */}
            <div className="theory-sidebar-column">
              <div className="theory-complexity-card">
                <h3 className="theory-sidebar-heading">Active Fault States</h3>
                <div className="complexity-table">
                  <div className="complexity-row">
                    <span className="tbl-label">Origin Overload:</span>
                    <span className={`tbl-val ${originOverloaded ? 'orange' : 'green'}`}>
                      {originOverloaded ? 'ACTIVE (100% CPU)' : 'NOMINAL (Normal)'}
                    </span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">Mumbai Storm:</span>
                    <span className={`tbl-val ${weather.mumbai ? 'orange' : 'green'}`}>
                      {weather.mumbai ? '+120ms Latency' : 'Clear Link'}
                    </span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">Mumbai Overload:</span>
                    <span className={`tbl-val ${overload.mumbai ? 'orange' : 'green'}`}>
                      {overload.mumbai ? '95% CPU Saturated' : 'Balanced Queue'}
                    </span>
                  </div>
                  <div className="complexity-row">
                    <span className="tbl-label">Anycast Failover:</span>
                    <span className="tbl-val cyan">Automatic Re-route</span>
                  </div>
                </div>
              </div>

              <div className="theory-complexity-card">
                <h3 className="theory-sidebar-heading">Chaos Best Practices</h3>
                <ul className="theory-bullet-list">
                  <li><strong>Origin Shielding:</strong> Absorbs cache miss spikes to prevent thundering herd failures.</li>
                  <li><strong>Anycast Load Shedding:</strong> Redirects traffic to next nearest POP when CPU exceeds 85%.</li>
                  <li><strong>TTL Jitter:</strong> Applies randomized +/- 5% TTL to prevent synchronous mass expiration.</li>
                </ul>
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
