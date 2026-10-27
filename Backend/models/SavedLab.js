import mongoose from 'mongoose';

const savedLabSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  userName: {
    type: String,
    default: 'Researcher'
  },
  roomCode: {
    type: String,
    default: ''
  },
  topologyType: {
    type: String,
    required: true,
    default: 'ring'
  },
  title: {
    type: String,
    required: true,
    default: 'Multi-Device Network Simulation'
  },
  maxParticipants: {
    type: Number,
    default: 4
  },
  participants: [
    {
      email: String,
      name: String,
      nodeId: String,
      nodeLabel: String
    }
  ],
  nodes: [
    {
      id: String,
      label: String,
      name: String,
      status: String,
      role: String
    }
  ],
  sourceNodeId: {
    type: String,
    default: 'node-a'
  },
  targetNodeId: {
    type: String,
    default: 'node-c'
  },
  sourceLabel: {
    type: String,
    default: 'A'
  },
  targetLabel: {
    type: String,
    default: 'C'
  },
  payloadText: {
    type: String,
    default: 'Hello Netrium'
  },
  traversalPath: {
    type: [String],
    default: []
  },
  pathLabels: {
    type: [String],
    default: []
  },
  stepMessages: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  logs: [
    {
      id: String,
      time: String,
      message: String,
      type: String
    }
  ],
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const SavedLab = mongoose.model('SavedLab', savedLabSchema);
export default SavedLab;
