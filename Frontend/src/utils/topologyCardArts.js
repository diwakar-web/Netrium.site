// High-definition Topology card artworks tailored for HoloCard
// Standard card ratio: 63:88 (630px x 880px)

import starSvg from '../assets/topologies/star.svg';
import busSvg from '../assets/topologies/bus.svg';
import ringSvg from '../assets/topologies/ring.svg';
import meshSvg from '../assets/topologies/mesh.svg';
import treeSvg from '../assets/topologies/tree.svg';
import hybridSvg from '../assets/topologies/hybrid.svg';

export const TOPOLOGY_CARDS = {
  star: {
    id: 'star',
    name: 'Star Topology',
    badge: 'Centralized Architecture',
    preset: 'bursts',
    foilColor: '#00bf63',
    description: 'All nodes connect to a single central hub or switch which orchestrates and transmits all network traffic.',
    image: starSvg
  },
  bus: {
    id: 'bus',
    name: 'Bus Topology',
    badge: 'Single Shared Backbone',
    preset: 'shards',
    foilColor: '#38bdf8',
    description: 'Devices share a single continuous communication cable with 50Ω terminators preventing signal reflection.',
    image: busSvg
  },
  ring: {
    id: 'ring',
    name: 'Ring Topology',
    badge: 'Closed Loop Token Flow',
    preset: 'swirl',
    foilColor: '#c084fc',
    description: 'Each node is connected exactly to two adjacent neighbors in a circular data token highway.',
    image: ringSvg
  },
  mesh: {
    id: 'mesh',
    name: 'Mesh Topology',
    badge: 'Full Interconnection',
    preset: 'gold',
    foilColor: '#f59e0b',
    description: 'Every node has a dedicated point-to-point link to every other node for ultimate fault-tolerant routing.',
    image: meshSvg
  },
  tree: {
    id: 'tree',
    name: 'Tree Topology',
    badge: 'Hierarchical Structure',
    preset: 'cosmos',
    foilColor: '#10b981',
    description: 'Hierarchical branching with root switches managing secondary hubs and distributed leaf terminals.',
    image: treeSvg
  },
  hybrid: {
    id: 'hybrid',
    name: 'Hybrid Topology',
    badge: 'Star-Ring Integration',
    preset: 'rainbow',
    foilColor: '#ec4899',
    description: 'Fusion of multiple topologies (e.g. star clusters linked by ring bridges) to maximize scalability.',
    image: hybridSvg
  }
};
