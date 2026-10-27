// CDN Routing and Optimization Engine - SaaS Telemetry Edition
// Real-world server GPS coordinates [Latitude, Longitude]

export const servers = {
  origin: { id: 'origin', name: 'San Francisco (Origin)', lat: 37.7749, lon: -122.4194, baseLatency: 240, dnsLatency: 45, routingHops: 7, baseLoad: 12, color: '#ef4444' },
  new_york: { id: 'new_york', name: 'New York Edge', lat: 40.7128, lon: -74.0060, baseLatency: 35, dnsLatency: 15, routingHops: 2, baseLoad: 45, color: '#3b82f6' },
  toronto: { id: 'toronto', name: 'Toronto Edge', lat: 43.6510, lon: -79.3470, baseLatency: 40, dnsLatency: 18, routingHops: 2, baseLoad: 35, color: '#10b981' },
  sao_paulo: { id: 'sao_paulo', name: 'São Paulo Edge', lat: -23.5505, lon: -46.6333, baseLatency: 110, dnsLatency: 25, routingHops: 3, baseLoad: 55, color: '#f59e0b' },
  london: { id: 'london', name: 'London Edge', lat: 51.5074, lon: -0.1278, baseLatency: 75, dnsLatency: 20, routingHops: 3, baseLoad: 60, color: '#8b5cf6' },
  frankfurt: { id: 'frankfurt', name: 'Frankfurt Edge', lat: 50.1109, lon: 8.6821, baseLatency: 80, dnsLatency: 22, routingHops: 3, baseLoad: 50, color: '#ec4899' },
  dubai: { id: 'dubai', name: 'Dubai Edge', lat: 25.2048, lon: 55.2708, baseLatency: 130, dnsLatency: 28, routingHops: 4, baseLoad: 40, color: '#06b6d4' },
  johannesburg: { id: 'johannesburg', name: 'Johannesburg Edge', lat: -26.2041, lon: 28.0473, baseLatency: 160, dnsLatency: 35, routingHops: 5, baseLoad: 30, color: '#f97316' },
  mumbai: { id: 'mumbai', name: 'Mumbai Edge', lat: 19.0760, lon: 72.8777, baseLatency: 140, dnsLatency: 30, routingHops: 4, baseLoad: 65, color: '#84cc16' },
  delhi: { id: 'delhi', name: 'Delhi Edge', lat: 28.6139, lon: 77.2090, baseLatency: 120, dnsLatency: 28, routingHops: 3, baseLoad: 40, color: '#f43f5e' },
  hyderabad: { id: 'hyderabad', name: 'Hyderabad Edge', lat: 17.3850, lon: 78.4867, baseLatency: 145, dnsLatency: 31, routingHops: 4, baseLoad: 45, color: '#8b5cf6' },
  kolkata: { id: 'kolkata', name: 'Kolkata Edge', lat: 22.5726, lon: 88.3639, baseLatency: 150, dnsLatency: 33, routingHops: 4, baseLoad: 55, color: '#eab308' },
  bengaluru: { id: 'bengaluru', name: 'Bengaluru Edge', lat: 12.9716, lon: 77.5946, baseLatency: 135, dnsLatency: 29, routingHops: 3, baseLoad: 50, color: '#10b981' },
  singapore: { id: 'singapore', name: 'Singapore Edge', lat: 1.3521, lon: 103.8198, baseLatency: 160, dnsLatency: 32, routingHops: 4, baseLoad: 55, color: '#14b8a6' },
  tokyo: { id: 'tokyo', name: 'Tokyo Edge', lat: 35.6895, lon: 139.6917, baseLatency: 110, dnsLatency: 26, routingHops: 3, baseLoad: 70, color: '#6366f1' },
  sydney: { id: 'sydney', name: 'Sydney Edge', lat: -33.8688, lon: 151.2093, baseLatency: 180, dnsLatency: 40, routingHops: 5, baseLoad: 40, color: '#d946ef' }
};

// Global clients including Indian states and worldwide capitals
export const clients = {
  srinagar: { name: 'Client in Srinagar (J&K)', lat: 34.0837, lon: 74.7973 },
  jammu: { name: 'Client in Jammu (J&K)', lat: 32.7266, lon: 74.8570 },
  delhi: { name: 'Client in Delhi (NCR)', lat: 28.6139, lon: 77.2090 },
  mumbai: { name: 'Client in Mumbai (MH)', lat: 19.0760, lon: 72.8777 },
  bengaluru: { name: 'Client in Bengaluru (KA)', lat: 12.9716, lon: 77.5946 },
  hyderabad: { name: 'Client in Hyderabad (TS)', lat: 17.3850, lon: 78.4867 },
  kolkata: { name: 'Client in Kolkata (WB)', lat: 22.5726, lon: 88.3639 },
  chennai: { name: 'Client in Chennai (TN)', lat: 13.0827, lon: 80.2707 },
  kathmandu: { name: 'Client in Kathmandu (Nepal)', lat: 27.7172, lon: 85.3240 },
  dhaka: { name: 'Client in Dhaka (Bangladesh)', lat: 23.8103, lon: 90.4125 },
  karachi: { name: 'Client in Karachi (Pakistan)', lat: 24.8607, lon: 67.0011 },
  colombo: { name: 'Client in Colombo (Sri Lanka)', lat: 6.9271, lon: 79.8612 },
  dubai: { name: 'Client in Dubai (UAE)', lat: 25.2048, lon: 55.2708 },
  riyadh: { name: 'Client in Riyadh (Saudi Arabia)', lat: 24.7136, lon: 46.6753 },
  tehran: { name: 'Client in Tehran (Iran)', lat: 35.6892, lon: 51.3890 },
  istanbul: { name: 'Client in Istanbul (Turkey)', lat: 41.0082, lon: 28.9784 },
  moscow: { name: 'Client in Moscow (Russia)', lat: 55.7558, lon: 37.6173 },
  london: { name: 'Client in London (UK)', lat: 51.5074, lon: -0.1278 },
  paris: { name: 'Client in Paris (France)', lat: 48.8566, lon: 2.3522 },
  berlin: { name: 'Client in Berlin (Germany)', lat: 52.5200, lon: 13.4050 },
  madrid: { name: 'Client in Madrid (Spain)', lat: 40.4168, lon: -3.7038 },
  rome: { name: 'Client in Rome (Italy)', lat: 41.9028, lon: 12.4964 },
  amsterdam: { name: 'Client in Amsterdam (Netherlands)', lat: 52.3676, lon: 4.9041 },
  stockholm: { name: 'Client in Stockholm (Sweden)', lat: 59.3293, lon: 18.0686 },
  lagos: { name: 'Client in Lagos (Nigeria)', lat: 6.5244, lon: 3.3792 },
  nairobi: { name: 'Client in Nairobi (Kenya)', lat: -1.2921, lon: 36.8219 },
  cape_town: { name: 'Client in Cape Town (South Africa)', lat: -33.9249, lon: 18.4241 },
  new_york: { name: 'Client in New York (USA)', lat: 40.7128, lon: -74.0060 },
  chicago: { name: 'Client in Chicago (USA)', lat: 41.8781, lon: -87.6298 },
  los_angeles: { name: 'Client in Los Angeles (USA)', lat: 34.0522, lon: -118.2437 },
  toronto: { name: 'Client in Toronto (Canada)', lat: 43.6510, lon: -79.3470 },
  mexico_city: { name: 'Client in Mexico City (Mexico)', lat: 19.4326, lon: -99.1332 },
  sao_paulo: { name: 'Client in São Paulo (Brazil)', lat: -23.5505, lon: -46.6333 },
  buenos_aires: { name: 'Client in Buenos Aires (Argentina)', lat: -34.6037, lon: -58.3816 },
  santiago: { name: 'Client in Santiago (Chile)', lat: -33.4489, lon: -70.6693 },
  tokyo: { name: 'Client in Tokyo (Japan)', lat: 35.6895, lon: 139.6917 },
  seoul: { name: 'Client in Seoul (South Korea)', lat: 37.5665, lon: 126.9780 },
  beijing: { name: 'Client in Beijing (China)', lat: 39.9042, lon: 116.4074 },
  hong_kong: { name: 'Client in Hong Kong', lat: 22.3193, lon: 114.1694 },
  bangkok: { name: 'Client in Bangkok (Thailand)', lat: 13.7563, lon: 100.5018 },
  kuala_lumpur: { name: 'Client in Kuala Lumpur (Malaysia)', lat: 3.1390, lon: 101.6869 },
  jakarta: { name: 'Client in Jakarta (Indonesia)', lat: -6.2088, lon: 106.8456 },
  manila: { name: 'Client in Manila (Philippines)', lat: 14.5995, lon: 120.9842 },
  singapore: { name: 'Client in Singapore', lat: 1.3521, lon: 103.8198 },
  sydney: { name: 'Client in Sydney (Australia)', lat: -33.8688, lon: 151.2093 },
  melbourne: { name: 'Client in Melbourne (Australia)', lat: -37.8136, lon: 144.9631 },
  auckland: { name: 'Client in Auckland (New Zealand)', lat: -36.8485, lon: 174.7633 }
};

/**
 * Calculates physical distance on spherical earth using Haversine formula (in km).
 */
export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Simulates a request routing decision and logs step-by-step logic.
 */
export function simulateRequest(clientKey, activeFactors, serverStates, contentKey, globalCache) {
  const client = clients[clientKey] || clients.srinagar;
  const logs = [];
  
  logs.push(`[DNS] Initiating lookups for CDN hostname resolution...`);
  
  // 1. DNS Factor
  let dnsTime = 0;
  if (activeFactors.dns) {
    dnsTime = 4; // Anycast DNS resolves almost instantly at closest POP
    logs.push(`[DNS] CDN Anycast active: Resolved via edge Anycast resolver in ${dnsTime}ms.`);
  } else {
    dnsTime = servers.origin.dnsLatency + Math.floor(Math.random() * 10);
    logs.push(`[DNS] CDN Anycast inactive: Queries routed back to Origin DNS authority. Latency: ${dnsTime}ms.`);
  }

  // CDN Bypass State (CDN turned OFF)
  if (!serverStates.cdnEnabled) {
    const originServer = servers.origin;
    const distance = getHaversineDistance(client.lat, client.lon, originServer.lat, originServer.lon);
    
    let originLoad = serverStates.originOverloaded ? 100 : originServer.baseLoad;
    let weatherPenalty = serverStates.weather.origin ? 120 : 0;
    
    let travelLatency = Math.round(distance / 120) + 15; 
    let loadPenalty = Math.round((originLoad / 100) * 90);
    let totalLatency = travelLatency + loadPenalty + weatherPenalty;

    logs.push(`[BYPASS] CDN Disabled. Direct packet traversal to Origin Server (San Francisco) initiated.`);
    logs.push(`[ROUTE] Route distance: ${distance} km | Router hops: ${originServer.routingHops}`);
    
    if (serverStates.originOverloaded) {
      logs.push(`[OUTAGE] Alert: San Francisco Origin Server CPU queue is full (100% Load!).`);
    }
    if (serverStates.weather.origin) {
      logs.push(`[WEATHER] Atmospheric storm over San Francisco: network packet loss detected (+120ms).`);
    }

    logs.push(`[RESULT] Connected directly to Origin. Fetch time: ${totalLatency}ms (Total latency: ${totalLatency + dnsTime}ms).`);
    
    const contentVal = (globalCache.origin[contentKey] || "NULL") + " - San Francisco";

    return {
      selectedServerId: 'origin',
      selectedServerName: originServer.name,
      path: [
        { lat: client.lat, lon: client.lon }, 
        { lat: originServer.lat, lon: originServer.lon }
      ],
      latency: totalLatency + dnsTime,
      dnsLatency: dnsTime,
      edgeLatency: totalLatency,
      cacheHit: false,
      logs,
      contentReceived: contentVal,
      contentModifier: "Raw Origin Copy"
    };
  }

  // CDN is enabled: Score and choose edge server candidates
  const candidates = Object.keys(servers).filter(key => key !== 'origin');
  const evaluated = candidates.map(id => {
    const s = servers[id];
    
    const hasBadWeather = serverStates.weather[id] || false;
    const isOverloaded = serverStates.overload[id] || false;
    
    const currentLoad = isOverloaded ? 100 : (s.baseLoad + (serverStates.loadFluctuations?.[id] || 0));
    const currentHealth = Math.max(10, 100 - (hasBadWeather ? 40 : 0) - (isOverloaded ? 30 : 0));
    
    const distance = getHaversineDistance(client.lat, client.lon, s.lat, s.lon);
    
    const distanceLatency = Math.round(distance / 100);
    const weatherAdjustment = hasBadWeather ? 100 : 0;
    const loadAdjustment = Math.round((currentLoad / 100) * 45);
    const routingAdjustment = activeFactors.routing ? 0 : (s.routingHops * 10);
    
    const finalLatency = s.baseLatency + distanceLatency + weatherAdjustment + loadAdjustment + routingAdjustment;
    const isCached = globalCache[id]?.[contentKey] !== undefined;

    let score = 0;
    
    if (activeFactors.geographic) score += distance * 0.4;
    if (activeFactors.latency) score += finalLatency * 1.8;
    if (activeFactors.load) score += currentLoad * 2.0;
    if (activeFactors.health) score += (100 - currentHealth) * 6.5;
    if (activeFactors.caching && isCached) score -= 150;
    if (activeFactors.routing) score += s.routingHops * 15;

    return {
      id,
      server: s,
      distance,
      currentLoad,
      currentHealth,
      latency: finalLatency,
      isCached,
      score,
      hasBadWeather,
      isOverloaded
    };
  });

  // Select candidate with lowest penalty score
  let chosenCandidate;
  if (Object.values(activeFactors).filter(Boolean).length === 0) {
    evaluated.sort((a, b) => a.distance - b.distance);
    chosenCandidate = evaluated[0];
    logs.push(`[CDN] No custom routing rules active. Defaulting to closest edge server geographically.`);
  } else {
    evaluated.sort((a, b) => a.score - b.score);
    chosenCandidate = evaluated[0];
    logs.push(`[CDN] Scoring POP candidates based on active rules...`);
  }

  evaluated.slice(0, 5).forEach(cand => {
    let factorDetails = [];
    if (activeFactors.geographic) factorDetails.push(`Dist: ${cand.distance}km`);
    if (activeFactors.latency) factorDetails.push(`Ping: ${cand.latency}ms`);
    if (activeFactors.load) factorDetails.push(`Load: ${cand.currentLoad}%`);
    if (activeFactors.health) factorDetails.push(`Health: ${cand.currentHealth}%`);
    if (activeFactors.caching) factorDetails.push(`Cache: ${cand.isCached ? 'HIT' : 'MISS'}`);
    
    logs.push(`└─ POP ${cand.server.id.toUpperCase()}: Score = ${Math.round(cand.score)} [${factorDetails.join(' | ')}]`);
  });

  logs.push(`[DECISION] Optimal POP selected: **${chosenCandidate.server.name}**.`);

  let cacheHit = false;
  let responseLatency = chosenCandidate.latency;
  let contentVal = "NO_DATA";
  let contentModifier = "";

  // 5. Cache Fetch Simulation
  if (activeFactors.caching) {
    if (chosenCandidate.isCached) {
      cacheHit = true;
      contentVal = globalCache[chosenCandidate.id][contentKey];
      responseLatency = Math.round(chosenCandidate.latency * 0.12) + 2; 
      logs.push(`[CACHE] **HIT** at edge node. Served directly from cache memory in ${responseLatency}ms.`);
    } else {
      logs.push(`[CACHE] **MISS** at edge node. Pulling from Central Origin (San Francisco)...`);
      
      const originDist = getHaversineDistance(chosenCandidate.server.lat, chosenCandidate.server.lon, servers.origin.lat, servers.origin.lon);
      const originFetchLatency = Math.round(originDist / 110) + (serverStates.originOverloaded ? 150 : 25);
      
      responseLatency += originFetchLatency;
      contentVal = globalCache.origin[contentKey] || "NULL";
      
      globalCache[chosenCandidate.id][contentKey] = contentVal;
      logs.push(`[CACHE] Content fetched from San Francisco (+${originFetchLatency}ms) and cached at ${chosenCandidate.server.id.toUpperCase()} POP.`);
    }
  } else {
    logs.push(`[PROXY] Cache rules disabled. Edge acting as a proxy pipe...`);
    const originDist = getHaversineDistance(chosenCandidate.server.lat, chosenCandidate.server.lon, servers.origin.lat, servers.origin.lon);
    const originFetchLatency = Math.round(originDist / 110) + (serverStates.originOverloaded ? 150 : 25);
    responseLatency += originFetchLatency;
    contentVal = globalCache.origin[contentKey] || "NULL";
  }

  let transformedContent = contentVal;
  contentModifier = "Unmodified";

  const indianCities = ['delhi', 'mumbai', 'hyderabad', 'kolkata', 'bengaluru'];
  
  if (indianCities.includes(chosenCandidate.id)) {
    const cityName = chosenCandidate.id.charAt(0).toUpperCase() + chosenCandidate.id.slice(1);
    transformedContent = typeof transformedContent === 'string' ? `${transformedContent} -by ${cityName}` : transformedContent;
    contentModifier = "Edge Compute: Appended Location";
  } else {
    contentModifier = "Unmodified";
  }

  logs.push(`[EDGE COMPUTE] Applied transformation: "${contentModifier}"`);
  logs.push(`[RESULT] Packet delivered to client. Total round-trip time: ${responseLatency + dnsTime}ms (DNS: ${dnsTime}ms + Edge: ${responseLatency}ms).`);

  const path = [
    { lat: client.lat, lon: client.lon }, 
    { lat: chosenCandidate.server.lat, lon: chosenCandidate.server.lon }
  ];
  if (!cacheHit) {
    path.push({ lat: servers.origin.lat, lon: servers.origin.lon });
  }

  return {
    selectedServerId: chosenCandidate.id,
    selectedServerName: chosenCandidate.server.name,
    path,
    latency: responseLatency + dnsTime,
    dnsLatency: dnsTime,
    edgeLatency: responseLatency,
    cacheHit,
    logs,
    contentReceived: transformedContent + ` - ${chosenCandidate.server.name}`,
    contentModifier
  };
}
