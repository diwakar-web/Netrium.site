import mongoose from 'mongoose';

const siteStatSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    value: {
      type: Number,
      default: 850
    }
  },
  {
    timestamps: true
  }
);

const SiteStat = mongoose.models.SiteStat || mongoose.model('SiteStat', siteStatSchema);

export default SiteStat;
