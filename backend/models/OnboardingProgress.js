import mongoose from 'mongoose';

/**
 * OnboardingProgress Model
 * Stores partial onboarding form data to enable autosave and resume functionality.
 * Automatically expires after 30 days using MongoDB TTL index.
 */
const OnboardingProgressSchema = new mongoose.Schema({
  inviteToken: {
    type: String,
    required: true,
    unique: true
  },
  // Last completed step number (1-10)
  lastCompletedStep: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 1
  },
  // Current step number (the step user is currently on, even if not completed)
  currentStep: {
    type: Number,
    required: true,
    min: 1,
    max: 10,
    default: 1
  },
  // Full form data as JSON object
  formData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {}
  },
  // Timestamp for TTL expiration (30 days)
  expiresAt: {
    type: Date,
    required: true,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30); // 30 days from now
      return date;
    },
    index: { expireAfterSeconds: 0 } // TTL index - MongoDB will auto-delete after expiresAt
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

const OnboardingProgress = mongoose.model('OnboardingProgress', OnboardingProgressSchema);

export default OnboardingProgress;
