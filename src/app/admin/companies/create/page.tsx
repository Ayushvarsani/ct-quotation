'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PhoneIcon from '@mui/icons-material/Phone';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const schema = yup.object({
  companyName: yup.string().required('Company name is required'),
  username: yup.string().email('Invalid email').required('Username is required'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  mobileNo: yup.string().required('Mobile number is required').matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'),
}).required();

type CompanyFormData = yup.InferType<typeof schema>;

export default function NewCompanyPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: CompanyFormData) => {
    try {
      console.log('Company data:', data);
      router.push('/admin');
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BusinessIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create New Company</h1>
              <p className="text-gray-600 text-sm sm:text-base">Fill in the details to onboard your company</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 ">
                <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700">
                  Company Name
                </label>
                <div className="relative">
                  <input
                    {...register('companyName')}
                    type="text"
                    placeholder="Enter company name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <BusinessIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                {errors.companyName && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ErrorIcon className="w-4 h-4 mr-1" />
                    {errors.companyName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <input
                    {...register('username')}
                    type="text"
                    placeholder="Choose a username"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <PersonIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                {errors.username && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ErrorIcon className="w-4 h-4 mr-1" />
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <VisibilityOffIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <VisibilityIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ErrorIcon className="w-4 h-4 mr-1" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="mobileNo" className="block text-sm font-semibold text-gray-700">
                  Mobile Number
                </label>
                <div className="relative">
                  <input
                    {...register('mobileNo')}
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <PhoneIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                {errors.mobileNo && (
                  <p className="text-sm text-red-500 flex items-center">
                    <ErrorIcon className="w-4 h-4 mr-1" />
                    {errors.mobileNo.message}
                  </p>
                )}
              </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8">
                <motion.button
                  type="button"
                  onClick={() => router.back()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm sm:text-base">Creating Company...</span>
                    </div>
                  ) : (
                    'Create Company'
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 