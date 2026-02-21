import mongoose from 'mongoose';

/**
 * Admin Model
 * Stores admin profile information (single admin for now)
 */
const AdminSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: 'admin-001' // Single admin for now
  },
  name: {
    type: String,
    default: 'Admin'
  },
  email: {
    type: String,
    default: 'admin@xpectgroup.com'
  },
  profilePicture: {
    type: String, // Base64 or URL
    default: null
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500
  },
  role: {
    type: String,
    default: 'Administrator'
  }
}, {
  timestamps: true
});

// Ensure only one admin document exists
AdminSchema.statics.getAdmin = async function() {
  let admin = await this.findOne({ id: 'admin-001' });
  if (!admin) {
    admin = await this.create({ id: 'admin-001' });
  }
  return admin;
};

const Admin = mongoose.model('Admin', AdminSchema);

export default Admin;
