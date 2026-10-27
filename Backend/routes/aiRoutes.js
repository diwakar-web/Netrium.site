import express from 'express';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// Fallback models in priority order
const MODEL_PRIORITIES = [
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest'
];

/**
 * Intelligent local knowledge fallback in case of network or quota issues
 */
function getSimulatedNetriumResponse(userQuery, mode) {
  const query = (userQuery || '').toLowerCase();
  
  if (mode === 'translate' || query.startsWith('translate')) {
    return `[NetAI Translation Mode]\n\nProcessed query: "${userQuery}"\n\nTranslation / Linguistic Analysis:\nNetrium's neural pipeline translates technical terminology into clear, accessible computing concepts while preserving protocols, RFC standards, and data structures intact.`;
  }

  if (query.includes('topology') || query.includes('mesh') || query.includes('star') || query.includes('ring')) {
    return `### Netrium Network Topologies\n\nNetwork topologies define the geometric arrangement of nodes and links:\n\n* **Full Mesh**: Every node connects directly to every other node ($O(N^2)$ links). Maximum fault tolerance and minimum latency, but highest cabling and port cost.\n* **Star Topology**: All nodes connect to a central hub/switch. Easy to manage and isolate faults, but the central switch is a single point of failure.\n* **Ring Topology**: Data travels sequentially in a circular loop (often dual-ring with FDDI for redundancy).\n* **Tree / Hierarchical**: Multi-layer distribution typical of enterprise and campus campus networks.\n\nExplore our interactive visualizer in the **Topology Lab** to experiment with node packet routing live!`;
  }

  if (query.includes('cdn') || query.includes('edge') || query.includes('caching') || query.includes('latency')) {
    return `### Netrium Content Delivery Network (CDN)\n\nA CDN relies on globally distributed **Edge Points of Presence (PoPs)** using **Anycast BGP routing**:\n\n1. **Anycast Routing**: User DNS queries resolve to the closest physical PoP by BGP hop count.\n2. **Origin Shield & Edge Caching**: Static assets (images, videos, WebAssembly) cache at edge servers, reducing origin database load by up to 90%.\n3. **Dynamic Route Optimization**: Packet paths bypass internet congestion through private backbone peering.\n\nCheck out the interactive **CDN Lab** in Netrium to inspect live global node ping and packet delivery!`;
  }

  if (query.includes('dsa') || query.includes('algorithm') || query.includes('dijkstra') || query.includes('bellman') || query.includes('graph')) {
    return `### Algorithmic Routing & Graph Theory\n\nIn computer networks, routing algorithms calculate optimal packet transmission paths:\n\n* **Dijkstra's Algorithm**: Greedy single-source shortest path using non-negative link weights ($O((V + E) \\log V)$ with a Min-Heap). Powers **OSPF (Open Shortest Path First)**.\n* **Bellman-Ford Algorithm**: Dynamic programming approach capable of handling negative edge weights. Powers **RIP (Routing Information Protocol)**.\n* **A* Search**: Heuristic-guided traversal for prioritized routing across spatial meshes.\n\nYou can visualize these algorithms step-by-step inside the **DSA Lab**!`;
  }

  return `### NetAI Intelligence\n\nThank you for exploring Netrium! You asked: \n\n> "${userQuery}"\n\nNetrium is an interactive systems and networking laboratory platform that brings distributed systems, CDN edge routing, network topologies, and algorithmic computing to life through real-time interactive simulations.\n\nFeel free to ask me to explain any networking protocol (BGP, OSPF, TCP/IP), data structure (graphs, trees, priority queues), or highlight any text on the website to translate or analyze it!`;
}

/**
 * POST /api/ai/chat
 * Multi-turn or single-shot chat with Google GenAI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [], mode = 'chat', targetLang } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid message string is required.'
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Build persona system prompt
    const systemPrompt = `You are NetAI, the resident artificial intelligence for Netrium — a premier interactive systems, networking, and algorithms engineering platform.
Your expertise spans:
- Network topologies (Mesh, Star, Ring, Tree, Hybrid) and packet flow
- Content Delivery Networks (CDN edge caching, Anycast BGP, latency optimization)
- Data Structures & Algorithms (Dijkstra, Bellman-Ford, A*, Graph traversals, trees)
- Operating Systems (Page replacement algorithms, memory management, kernel internals)
- Web engineering, protocols (TCP, UDP, HTTP/3, QUIC, WebSockets)

Behavior:
1. Provide concise, clear, and technically sound answers.
2. Use markdown formatting with bullet points, headers, and code blocks where applicable.
3. If mode is "translate", provide an accurate translation to ${targetLang || 'English'} while preserving technical clarity and computer science terminology.
4. Keep a modern, confident, helpful cyber-engineering tone.`;

    if (!apiKey) {
      console.warn('[NetAI Notice] No GEMINI_API_KEY in environment. Using simulated intelligence response.');
      const simulated = getSimulatedNetriumResponse(message, mode);
      return res.status(200).json({
        success: true,
        reply: simulated,
        model: 'netai-simulated-knowledge',
        isSimulated: true
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare contents array incorporating history
    const contents = [];

    // Append prior turns (limited to last 8 turns to stay snappy)
    const validHistory = Array.isArray(history) ? history.slice(-8) : [];
    for (const item of validHistory) {
      if (item && item.text) {
        contents.push({
          role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
          parts: [{ text: item.text }]
        });
      }
    }

    // Append current prompt with mode formatting if needed
    let finalPrompt = message.trim();
    if (mode === 'translate') {
      finalPrompt = `Translate the following text into ${targetLang || 'English'}. Keep technical terms clear:\n\n"${finalPrompt}"`;
    }

    contents.push({
      role: 'user',
      parts: [{ text: finalPrompt }]
    });

    let generatedText = null;
    let usedModel = null;
    let lastError = null;

    // Try models in cascade order
    for (const modelName of MODEL_PRIORITIES) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 1200
          }
        });

        if (response && response.text) {
          generatedText = response.text;
          usedModel = modelName;
          break;
        }
      } catch (err) {
        lastError = err;
        console.warn(`[NetAI] Model ${modelName} call failed:`, err?.message || err);
      }
    }

    if (generatedText) {
      return res.status(200).json({
        success: true,
        reply: generatedText,
        model: usedModel,
        isSimulated: false
      });
    }

    // Fallback if all Google API models hit quota or error
    console.warn('[NetAI] All live models unavailable, serving knowledge fallback. Error:', lastError?.message);
    const fallbackResponse = getSimulatedNetriumResponse(message, mode);
    return res.status(200).json({
      success: true,
      reply: fallbackResponse,
      model: 'netai-knowledge-fallback',
      isSimulated: true,
      notice: 'Served via NetAI offline knowledge base due to temporary upstream rate limit.'
    });

  } catch (error) {
    console.error('[NetAI Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate response from NetAI.',
      error: error.message
    });
  }
});

/**
 * GET /api/ai/status
 * Health and model status endpoint
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'NetAI Gateway',
    hasKey: Boolean(process.env.GEMINI_API_KEY),
    defaultModel: MODEL_PRIORITIES[0]
  });
});

export default router;
