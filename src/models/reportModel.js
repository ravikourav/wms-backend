import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['user', 'post', 'comment', 'reply'], required: true 
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reasons: [{
        reporterId: { type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true 
    },
    reason: { 
        type: String,
        required: true 
    },
    extraInfo: { 
        type: String 
    },
    reportedAt: { 
        type: Date, 
        default: Date.now 
    }
  }],
  count: { 
    type: Number, 
    default: 1 
  },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'dismissed'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date,
    default: Date.now 
  }
});

reportSchema.index({ type: 1, targetId: 1 }, { unique: true });

export const Report = mongoose.model('Report', reportSchema);