import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const collectorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalCompleted: {
      type: Number,
      default: 0,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


collectorSchema.virtual('activePickups', {
  ref: 'Pickup',
  localField: '_id',
  foreignField: 'assignedCollector',
  count: true,
  match: { status: { $in: ['Approved', 'In Progress'] } },
});

collectorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

collectorSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Collector = mongoose.model('Collector', collectorSchema);
export default Collector;