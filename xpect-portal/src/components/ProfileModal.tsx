import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id?: string;
    name?: string;
    email?: string;
    profilePicture?: string | null;
    bio?: string;
    role?: string;
  };
  onUpdate: () => void; // Callback to refresh profile in Header
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, profile, onUpdate }) => {
  const [editedName, setEditedName] = useState(profile.name || '');
  const [editedEmail, setEditedEmail] = useState(profile.email || '');
  const [editedProfilePicture, setEditedProfilePicture] = useState<string | null>(profile.profilePicture || null);
  const [newProfilePictureFile, setNewProfilePictureFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEditedName(profile.name || '');
      setEditedEmail(profile.email || '');
      setEditedProfilePicture(profile.profilePicture || null);
      setNewProfilePictureFile(null);
      setError('');
    }
  }, [isOpen, profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setNewProfilePictureFile(file);
      setError('');
      
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      let profilePictureToSave = editedProfilePicture;

      // If new file selected, convert to base64
      if (newProfilePictureFile) {
        const reader = new FileReader();
        profilePictureToSave = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(newProfilePictureFile);
        });
      }

      await api.admin.updateProfile({
        name: editedName,
        email: editedEmail,
        bio: '', // Keep bio empty
        profilePicture: profilePictureToSave,
        role: profile.role || 'Administrator'
      });

      onUpdate(); // Refresh profile in Header
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-black text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* Profile Picture */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 border-2 border-gray-200"
              style={{ backgroundImage: editedProfilePicture ? `url('${editedProfilePicture}')` : 'none' }}
            >
              {!editedProfilePicture && (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
                  <span className="material-symbols-outlined text-gray-400 text-4xl">person</span>
                </div>
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-base">photo_camera</span>
                Change Photo
              </span>
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={editedEmail}
              onChange={(e) => setEditedEmail(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !editedName.trim()}
            className="px-6 py-2 bg-[#2e4150] text-white font-bold rounded-lg hover:bg-[#2e4150]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">hourglass_empty</span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
