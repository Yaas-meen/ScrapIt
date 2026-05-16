import mongoose from 'mongoose';

const wasteItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Plastic', 'Glass', 'Metal'],
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: [0.1, 'Weight must be at least 0.1kg'],
    },
    pointsRate: {
      type: Number,
      required: true,
    },
    pointsEarned: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const statusLogSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'statusLog.changedByModel',
    },
    changedByModel: {
      type: String,
      enum: ['User', 'Collector', 'Admin'],
    },
    note: String,
  },
  { timestamps: true, _id: false }
);

const pickupSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wasteItems: {
      type: [wasteItemSchema],
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one waste item is required',
      },
    },
    totalWeight: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    pickupDate: {
      type: Date,
      required: [true, 'Pickup date is required'],
    },
    address: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'In Progress', 'Completed', 'Rejected'],
      default: 'Pending',
    },
    assignedCollector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collector',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    completionNotes: {
      type: String,
      default: null,
    },
    statusLog: [statusLogSchema],
    pointsAwarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

pickupSchema.index({ user: 1, createdAt: -1 });
pickupSchema.index({ status: 1 });
pickupSchema.index({ assignedCollector: 1, status: 1 });
pickupSchema.index({ createdAt: -1 });


pickupSchema.virtual('requestId').get(function () {
  return `PK-${this._id.toString().slice(-6).toUpperCase()}`;
});

pickupSchema.set('toJSON', { virtuals: true });
pickupSchema.set('toObject', { virtuals: true });

const Pickup = mongoose.model('Pickup', pickupSchema);
export default Pickup;