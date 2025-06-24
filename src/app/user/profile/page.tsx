/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiEdit2, FiUser, FiMail, FiPhone, FiBriefcase, FiAward, FiArrowLeft, FiSettings } from 'react-icons/fi';
import * as Yup from 'yup';

interface UserProfile {
  name: string;
  email: string;
  mobileNo: string;
  defaultMessageNo?: string;
  companyName?: string;
  designation?: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    mobileNo: '',
    defaultMessageNo: '',
    companyName: '',
    designation: '',
    profileImage: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const [modules, setModules] = useState<string[] | null>(null);
  const [waSettings, setWaSettings] = useState<{ [module: string]: { apiKey: string; sender: string } }>({});
  const [waForm, setWaForm] = useState<{ apiKey: string; sender: string }>({ apiKey: '', sender: '' });
  const [defaultMsgError, setDefaultMsgError] = useState<string | null>(null);
  const [defaultMsgLoading, setDefaultMsgLoading] = useState(false);

  // Yup schema for Default Message Number
  const defaultMsgSchema = Yup.object().shape({
    defaultMessageNo: Yup.string()
      .required('Default Message Number is required')
      .matches(/^\+?\d{10,15}$/, 'Enter a valid phone number'),
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setProfile({
        name: parsedData.name || '',
        email: parsedData.email || '',
        mobileNo: parsedData.mobileNo || '',
        defaultMessageNo: parsedData.defaultMessageNo || '',
        companyName: parsedData.companyName || '',
        designation: parsedData.designation || '',
        profileImage: parsedData.profileImage || ''
      });
    }
    setIsLoading(false);

    // Get module(s) from localStorage
    const updateModules = () => {
      const moduleData = localStorage.getItem('modules');
      if (moduleData) {
        try {
          const parsed = JSON.parse(moduleData);
          if (Array.isArray(parsed)) {
            setModules(parsed.map(String));
          } else if (typeof parsed === 'string') {
            setModules([parsed]);
          } else {
            setModules(['Default Module']);
          }
        } catch {
          setModules([moduleData]);
        }
      } else {
        setModules(['Default Module']);
      }
    };
    updateModules();
    setIsLoading(false);

    // Listen for localStorage changes
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'module') {
        updateModules();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Load WhatsApp settings for selected tab
  useEffect(() => {
    if (modules && modules[selectedTab]) {
      const mod = modules[selectedTab];
      const local = localStorage.getItem(`whatsappSettings_${mod}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setWaForm({ apiKey: parsed.apiKey || '', sender: parsed.sender || '' });
        } catch {
          setWaForm({ apiKey: '', sender: '' });
        }
      } else {
        setWaForm({ apiKey: '', sender: '' });
      }
    }
  }, [modules, selectedTab]);

  const handleWaFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWaSave = () => {
    if (modules && modules[selectedTab]) {
      const mod = modules[selectedTab];
      localStorage.setItem(`whatsappSettings_${mod}`,
        JSON.stringify({ apiKey: waForm.apiKey, sender: waForm.sender })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDefaultMsgError(null);
    setDefaultMsgLoading(true);
    try {
      await defaultMsgSchema.validate({ defaultMessageNo: profile.defaultMessageNo });
      // Call mock update API
      await fetch('/api/mock-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultMessageNo: profile.defaultMessageNo }),
      });
      // Update localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedData = JSON.parse(userData);
        const updatedData = { ...parsedData, defaultMessageNo: profile.defaultMessageNo };
        localStorage.setItem('user', JSON.stringify(updatedData));
      }
    } catch (err: any) {
      if (err instanceof Yup.ValidationError) {
        setDefaultMsgError(err.message);
      } else {
        setDefaultMsgError('An error occurred.');
      }
    } finally {
      setDefaultMsgLoading(false);
    }
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
          className="bg-white rounded-2xl shadow-xl overflow-hidden relative"
        >
         {/* Back Button */}
         <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-20 flex items-center bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow transition-colors"
            aria-label="Go back"
            type="button"
          >
            <FiArrowLeft className="h-5 w-5 text-indigo-600" />
          </button>
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
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="pt-20 pb-8 px-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{profile.name || 'Your Name'}</h2>
                <p className="text-gray-600 mt-1">{profile.email || 'Email Address'}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiUser className="h-5 w-5 text-indigo-600 mr-2" />
                      Full Name
                    </label>
                    <div className="w-full bg-white rounded-lg border-gray-300 px-3 py-2 text-gray-900">
                      {profile.name || 'Your Name'}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiMail className="h-5 w-5 text-indigo-600 mr-2" />
                      Email Address
                    </label>
                    <div className="w-full bg-white rounded-lg border-gray-300 px-3 py-2 text-gray-900">
                      {profile.email || 'Email Address'}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiBriefcase className="h-5 w-5 text-indigo-600 mr-2" />
                      Company Name
                    </label>
                    <div className="w-full bg-white rounded-lg border-gray-300 px-3 py-2 text-gray-900">
                      {profile.companyName || 'Company Name'}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <FiPhone className="h-5 w-5 text-indigo-600 mr-2" />
                      Mobile Number
                    </label>
                    <div className="w-full bg-white rounded-lg border-gray-300 px-3 py-2 text-gray-900">
                      {profile.mobileNo || 'Mobile Number'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 max-w-md mx-auto">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FiPhone className="h-5 w-5 text-indigo-600 mr-2" />
                  Default Message Number
                </label>
                <input
                  type="tel"
                  value={profile.defaultMessageNo}
                  onChange={(e) => setProfile({ ...profile, defaultMessageNo: e.target.value })}
                  className="w-full bg-white rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                {defaultMsgError && (
                  <div className="text-red-600 text-sm mt-1">{defaultMsgError}</div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-6 max-w-md mx-auto"
              >
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={defaultMsgLoading}
                >
                  {defaultMsgLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </motion.div>
            </form>

            {/* Dynamic Tabs Section */}
            {modules === null ? null : (
              <div className="mt-10">
                <div className="flex border-b border-gray-200">
                  {modules.map((mod, idx) => (
                    <button
                      key={mod + idx}
                      className={`px-4 py-2 -mb-px font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
                        selectedTab === idx
                          ? 'border-indigo-600 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-indigo-600'
                      }`}
                      onClick={() => setSelectedTab(idx)}
                    >
                      {mod}
                    </button>
                  ))}
                </div>
                <div className="p-6 bg-white rounded-b-xl shadow-md">
                  <h3 className="text-lg font-semibold mb-4">WhatsApp API Settings</h3>
                  <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleWaSave(); }}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                      <input
                        type="text"
                        name="apiKey"
                        value={waForm.apiKey}
                        onChange={handleWaFormChange}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Enter WhatsApp API Key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sender Number</label>
                      <input
                        type="text"
                        name="sender"
                        value={waForm.sender}
                        onChange={handleWaFormChange}
                        className="w-full border rounded px-3 py-2"
                        placeholder="Enter Sender Number"
                      />
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">Save WhatsApp Settings</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 