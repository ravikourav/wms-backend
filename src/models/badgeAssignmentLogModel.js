import mongoose from 'mongoose';

const badgeAssignmentLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  badge: {
    type: String,
    required: true,
    enum: ['blue', 'green', 'gold', 'none']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAt: {
    type: Date,
    default: Date.now
  }
});

export const BadgeAssignmentLog = mongoose.model('BadgeAssignmentLog', badgeAssignmentLogSchema);