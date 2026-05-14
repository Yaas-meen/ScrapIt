import mongoose from 'mongoose';

const rewardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['Airtime', 'Gift Card'],
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    pointsSpent: {
      type: Number,
      required: true,
      min: [500, 'Minimum redemption is 500 points'],
    },
    nairaValue: {
      type: Number,
      required: true,
    },
    code: {
      type: String,
      required: true,
      select: false, 
    },
    isCodeRevealed: {
      type: Boolean,
      default: false,
    },
    denomination: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Reward = mongoose.model('Reward', rewardSchema);
export default Reward;