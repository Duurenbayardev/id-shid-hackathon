// models/user.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  dailyScore: {
    type: Number,
    default: 0
  },
  zoos: {
    type: Number,
    default: 0
  },
  ymbuu: {
    type: Number,
    default: 0
  },
  stats: {
    hp: {
      type: Number,
      default: 100
    },
    earning: {
      type: Number,
      default: 10
    },
    maxCapacity: {
      type: Number,
      default: 100
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', userSchema);