/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUser, FiPhone, FiBriefcase, FiArrowLeft, FiHelpCircle } from "react-icons/fi";
import * as Yup from "yup";
import axios from "axios";
import { useSnackbar } from "@/app/hooks/useSnackbar";
interface UserProfile {
  enddate: string;
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
    name: "",
    email: "",
    mobileNo: "",
    defaultMessageNo: "",
    companyName: "",
    profileImage: "",
    enddate:"",
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);
  const [modules, setModules] = useState<string[] | null>(null);
  const [waForm, setWaForm] = useState<{ apiKey: string; sender: string }>({
    apiKey: "",
    sender: "",
  });
  const [defaultMsgLoading, setDefaultMsgLoading] = useState(false);
  const { showSnackbar } = useSnackbar();

  
  const defaultMsgSchema = Yup.object().shape({
    defaultMessageNo: Yup.string()
      .required("Default Message Number is required")
      .matches(/^\+?\d{10,15}$/, "Enter a valid phone number"),
  });

  const fetchCustomersByCompany = async (customerUuid: string) => {
    const token = localStorage.getItem("token");

    try {
      const userData = localStorage.getItem("user");
      if (!userData) {
        return;
      }
      const response = await axios.get(
        `/api/protected/get-customers-by-company?customer_uuid=${customerUuid}`,
        {
          headers: {
            "x-auth-token": `Bearer ${token}`,
          },
        }
      );
      if (response.data && response.data.data) {
          const d = response.data.data;
          setProfile({
            name: d.customer_name || '',
            email: d.customer_email || '',
            mobileNo: d.customer_mobile || '',
            defaultMessageNo: d.company_message_number || '',
            companyName: d.company_name || '',
            enddate:d.end_date ,
            profileImage: '', 
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      if (parsedData.customeruuid) {
        fetchCustomersByCompany(parsedData.customeruuid);
      }
    }

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

  // Load WhatsApp API key from database
  const loadWhatsAppApiKey = async () => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem("token");
      
      if (!userData || !token) {
        return;
      }

      const user = JSON.parse(userData);
      const companyUuid = user.companyuuid;

      const response = await axios.get(
        `/api/protected/whatsapp-api-key?company_uuid=${companyUuid}`,
        {
          headers: {
            "x-auth-token": `Bearer ${token}`,
          },
        }
      );

      if (response.data.status && response.data.data.whatsapp_api_key) {
        setWaForm(prev => ({ ...prev, apiKey: response.data.data.whatsapp_api_key }));
      }
    } catch (error) {
      console.error('Error loading WhatsApp API key:', error);
    }
  };

  // Load WhatsApp settings for selected tab
  useEffect(() => {
    if (modules && modules[selectedTab]) {
      // Load from database first
      loadWhatsAppApiKey();
      
      // Fallback to localStorage if needed
      const mod = modules[selectedTab];
      const local = localStorage.getItem(`whatsappSettings_${mod}`);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setWaForm(prev => ({ 
            apiKey: prev.apiKey || parsed.apiKey || '', 
            sender: parsed.sender || '' 
          }));
        } catch {
          // Keep existing apiKey if available
        }
      }
    }
  }, [modules, selectedTab]);

  const handleWaFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWaForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWaSave = async () => {
    try {
      // Get user data and token
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem("token");
      
      if (!userData || !token) {
        throw new Error('User data or token not found');
      }

      const user = JSON.parse(userData);
      const companyUuid = user.companyuuid;

      const response = await axios.post(
        `/api/protected/whatsapp-api-key?company_uuid=${companyUuid}`,
        {
          whatsapp_api_key: waForm.apiKey
        },
        {
          headers: {
            "x-auth-token": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.status) {
        showSnackbar('WhatsApp API key saved successfully', 'success');
      } else {
        throw new Error(response.data.msg || 'Failed to save WhatsApp API key');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showSnackbar(err.message, 'error');
      } else {
        showSnackbar('An error occurred while saving WhatsApp API key', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDefaultMsgLoading(true);
    
    try {
      await defaultMsgSchema.validate({ defaultMessageNo: profile.defaultMessageNo });
      
      // Get user data and token
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem("token");
      
      if (!userData || !token) {
        throw new Error('User data or token not found');
      }

      const user = JSON.parse(userData);
      const companyUuid = user.companyuuid;
      const response = await axios.put(
        `/api/protected/update-company-message-number?company_uuid=${companyUuid}`,
        {
          company_message_number: profile.defaultMessageNo
        },
        {
          headers: {
            "x-auth-token": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.status) {
        showSnackbar(response.data.msg, 'success');
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedData = JSON.parse(userData);
          if (parsedData.customeruuid) {
            fetchCustomersByCompany(parsedData.customeruuid);
          }
        }
      } else {
        throw new Error(response.data.msg || 'Failed to update company message number');
      }
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        showSnackbar(err.message, 'error');
      } else if (err instanceof Error) {
        showSnackbar(err.message, 'error');
      } else {
        const errorMessage = 'An error occurred while updating the company message number.';
        showSnackbar(errorMessage, 'error');
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
            <div className="flex justify-between ">
            <div className="flex justify-between items-start mb-8">
              <div >
                <h2 className="text-3xl font-bold text-gray-900">{profile.name || 'Your Name'}</h2>
                <p className="text-gray-600 mt-1">{profile.email || 'Email Address'}</p>
              </div>
              
            </div>
            <div className="text-right">
          <span className="text-gray-500 text-sm">Your plan ends on</span>
          <br />
          <span className="font-semibold text-indigo-600 text-lg">
            {profile.enddate.split("T")[0]}
          </span>
</div>
            </div>

            {/* Read-only Profile Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <FiBriefcase className="h-5 w-5 text-indigo-600 mr-2" />
                  Company Name
                </label>
                <div className="w-full bg-white rounded-lg border border-gray-200 px-4 py-3 text-gray-900 font-medium">
                  {profile.companyName || 'Not provided'}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <FiPhone className="h-5 w-5 text-indigo-600 mr-2" />
                  Mobile Number
                </label>
                <div className="w-full bg-white rounded-lg border border-gray-200 px-4 py-3 text-gray-900 font-medium">
                  {profile.mobileNo || 'Not provided'}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <FiPhone className="h-5 w-5 text-indigo-600 mr-2" />
                  Default Message Number
                </label>
                <div className="relative group">
                  <FiHelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  <div className="absolute bottom-full right-0 mb-2 w-96 p-3 bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <div className="relative">
                      <p>This number will be used as the sender number when sending WhatsApp messages with PDF quotations.</p>
                      <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="tel"
                    value={profile.defaultMessageNo}
                    onChange={(e) => setProfile({ ...profile, defaultMessageNo: e.target.value })}
                    className="w-full bg-white rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 px-4 py-3 text-gray-900 transition-colors"
                    placeholder="1234567890"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-2"
                >
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={defaultMsgLoading}
                  >
                    {defaultMsgLoading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      'Save Company Message Number'
                    )}
                  </button>
                </motion.div>
              </form>
            </div>

            {/* Dynamic Tabs Section */}
            {modules === null ? null : (
              <div className="mt-10">
                <div className="flex border-b border-gray-200">
                  {modules.map((mod, idx) => {                  
                    const displayName = mod.includes('_module') ? mod.split('_module')[0] : mod;
                    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
                    
                    return (
                      <button
                        key={mod + idx}
                        className={`px-4 py-2 -mb-px font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
                          selectedTab === idx
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-indigo-600'
                        }`}
                        onClick={() => setSelectedTab(idx)}
                      >
                        {formattedName}
                      </button>
                    );
                  })}
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