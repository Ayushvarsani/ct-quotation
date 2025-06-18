/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiEdit2, FiUser, FiMail, FiPhone, FiBriefcase, FiAward } from 'react-icons/fi';

interface UserProfile {
  name: string;
  email: string;
  mobileNo: string;
  companyName?: string;
  designation?: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    mobileNo: '',
    companyName: '',
    designation: '',
    profileImage: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setProfile({
        name: parsedData.name || '',
        email: parsedData.email || '',
        mobileNo: parsedData.mobileNo || '',
        companyName: parsedData.companyName || '',
        designation: parsedData.designation || '',
        profileImage: parsedData.profileImage || ''
      });
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically make an API call to update the profile
    // For now, we'll just update localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      const updatedData = { ...parsedData, ...profile };
      localStorage.setItem('user', JSON.stringify(updatedData));
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header Section */}
          <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
                  {profile.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <FiUser className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
                    <FiEdit2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="pt-20 pb-8 px-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{profile.name || 'Your Name'}</h2>
                <p className="text-gray-600 mt-1">{profile.designation || 'Your Designation'}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isEditing
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                }`}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="h-5 w-5 text-indigo-600 mr-2" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-white rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="h-5 w-5 text-indigo-600 mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-white rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiPhone className="h-5 w-5 text-indigo-600 mr-2" />
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={profile.mobileNo}
                      onChange={(e) => setProfile({ ...profile, mobileNo: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-white rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiBriefcase className="h-5 w-5 text-indigo-600 mr-2" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={profile.companyName}
                      onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-white rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiAward className="h-5 w-5 text-indigo-600 mr-2" />
                      Designation
                    </label>
                    <input
                      type="text"
                      value={profile.designation}
                      onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-white rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-6"
                >
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Save Changes
                  </button>
                </motion.div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 