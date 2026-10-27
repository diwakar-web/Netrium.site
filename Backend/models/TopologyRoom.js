import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    default: 'Researcher'
  },
  nodeId: {
    type: String,
    default: ''
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  lastPing: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const nodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  role: {
    type: String,
    default: 'node'
  }
}, { _id: false });

const logEntrySchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => Date.now().toString() + Math.random().toString(36).substr(2, 4)
  },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString()
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'transfer', 'receive', 'success', 'warning', 'error'],
    default: 'info'
  },
  fromNode: String,
  toNode: String,
  atNode: String
}, { _id: false });

const topologyRoomSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  topologyType: {
    type: String,
    required: true,
    enum: ['star', 'bus', 'ring', 'mesh', 'tree', 'hybrid'],
    default: 'ring'
  },
  hostEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  hostName: {
    type: String,
    default: 'Host Lead'
  },
  maxParticipants: {
    type: Number,
    required: true,
    min: 2,
    max: 8,
    default: 4
  },
  participants: [participantSchema],
  nodes: [nodeSchema],
  sourceNodeId: {
    type: String,
    default: 'node-a'
  },
  targetNodeId: {
    type: String,
    default: 'node-c'
  },
  payloadText: {
    type: String,
    default: 'Hello Netrium'
  },
  simulation: {
    status: {
      type: String,
      enum: ['idle', 'running', 'completed', 'paused'],
      default: 'idle'
    },
    path: {
      type: [String],
      default: []
    },
    currentStepIndex: {
      type: Number,
      default: 0
    },
    currentHop: {
      from: { type: String, default: '' },
      to: { type: String, default: '' },
      stepNumber: { type: Number, default: 0 },
      totalSteps: { type: Number, default: 0 }
    },
    lastAction: {
      type: String,
      default: 'Awaiting simulation trigger'
    },
    stepMessages: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    startedAt: {
      type: Date,
      default: null
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  logs: [logEntrySchema],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically expire after 24 hours
  }
}, {
  timestamps: true
});

export const TopologyRoom = mongoose.model('TopologyRoom', topologyRoomSchema);
export default TopologyRoom;
