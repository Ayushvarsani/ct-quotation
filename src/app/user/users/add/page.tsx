/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import * as yup from 'yup';
import axios from 'axios';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Phone, Lock,ArrowBack } from '@mui/icons-material';
import { useSnackbar } from '@/app/hooks/useSnackbar';
import { useRouter } from 'next/navigation';

interface UserFormData {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}

const userSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  email: yup.string().required('Email is required').email('Please enter a valid email address'),
  mobileNumber: yup.string().required('Mobile number is required').matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string().required('Please confirm your password').oneOf([yup.ref('password')], 'Passwords do not match'),
  modules: yup.array().min(1, 'Select at least one module'),
});

const initialFormData: UserFormData = {
  name: '',
  email: '',
  mobileNumber: '',
  password: '',
  confirmPassword: '',
};

const UsersPage: React.FC = () => {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<UserFormData & { modules?: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedModules, setSelectedModules] = useState<{ label: string; value: string }[]>([]);
  const [moduleOptions, setModuleOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    // Load module options from localStorage
    try {
      const stored = localStorage.getItem('modules');
      if (stored) {
        const parsed = JSON.parse(stored);
        const options = Array.isArray(parsed)
          ? parsed.map((mod: any) => ({
              label: mod.label ?? mod.value ?? String(mod),
              value: mod.value ?? mod.label ?? String(mod),
            }))
          : [];
        setModuleOptions(options);
      } else {
        setModuleOptions([]);
      }
    } catch {
      setModuleOptions([]);
    }
  }, []);

  const validateForm = async (): Promise<boolean> => {
    try {
      await userSchema.validate(
        { ...formData, modules: selectedModules },
        { abortEarly: false }
      );
      setErrors({});
      return true;
    } catch (err: any) {
      const newErrors: any = {};
      if (err.inner) {
        err.inner.forEach((validationError: any) => {
          if (validationError.path === 'modules') {
            newErrors.modules = validationError.message;
          } else {
            newErrors[validationError.path] = validationError.message;
          }
        });
      }
      setErrors(newErrors);
      return false;
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const clearForm = () => {
    setFormData(initialFormData);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSelectedModules([]);
  };

  const handleCancel = () => {
    clearForm();
    setErrors({});
    showSnackbar('Form cleared', 'info', 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await validateForm())) {
      showSnackbar('Please fix the validation errors', 'error', 4000);
      return;
    }
    setIsSubmitting(true);

    // Get companyuuid from localStorage user object
    let companyUUID = '';
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        companyUUID = userObj.companyuuid || '';
      }
    } catch {
      companyUUID = '';
    }
    if (!companyUUID) {
      showSnackbar('Company UUID not found. Please login again.', 'error', 4000);
      setIsSubmitting(false);
      return;
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      showSnackbar('Auth token not found. Please login again.', 'error', 4000);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      customer_name: formData.name,
      customer_email: formData.email,
      customer_password: formData.password,
      // customer_country_code: '+91', // TODO: Make dynamic if needed
      customer_mobile: formData.mobileNumber,
     // customer_role: 1, // TODO: Make dynamic if needed
      quotation_module: true, // TODO: Make dynamic if needed
      // bussiness_card_module: false, // TODO: Make dynamic if needed
    };

    try {
      const response = await axios.post(`/api/protected/create-customer?company_uuid=${companyUUID}`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': `Bearer ${token}`,
        },
      });
      showSnackbar(response.data.msg, 'success', 3000);
      clearForm();
      router.push('/user/users');
    } catch (error: any) {
      console.error('Error adding user:', error);
      showSnackbar(error.response.data.msg, 'error', 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button - left aligned, above the title */}
        <div >
         
        </div>
        {/* Title */}
        <div className="text-center mb-8">
        <button
            type="button"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold"
            onClick={() => router.back()}
          >
            <ArrowBack fontSize="small" />
            Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Add New User</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name *</label>
                <div className="relative">
                  <Person className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                    placeholder="Enter name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
                <div className="relative">
                  <Email className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              {/* Mobile Number Field */}
              <div className="space-y-2">
                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    id="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={e => handleInputChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.mobileNumber ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                    placeholder="1234567890"
                    maxLength={10}
                  />
                </div>
                {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber}</p>}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <VisibilityOff className="h-5 w-5" /> : <Visibility className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={e => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(prev => !prev)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <VisibilityOff className="h-5 w-5" /> : <Visibility className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Module Autocomplete Field */}
              <div className="space-y-2">
                <Autocomplete
                  multiple
                  id="module-autocomplete"
                  options={moduleOptions}
                  getOptionLabel={option => option.label}
                  value={selectedModules}
                  onChange={(_, newValue) => setSelectedModules(newValue)}
                  isOptionEqualToValue={(option, value) => option.value === value.value}
                  renderInput={params => (
                    <TextField
                      {...params}
                      name="modules"
                      label="Module"
                      error={!!errors.modules}
                      helperText={errors.modules}
                      placeholder="Select module(s)"
                      fullWidth
                    />
                  )}
                  renderOption={(props, option, { selected }) => (
                    <li {...props} key={option.value} className="flex items-center gap-2">
                      <Checkbox
                        checked={selected}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-label': option.label }}
                      />
                      {option.label}
                    </li>
                  )}
                  disableCloseOnSelect
                />
              </div>

              {/* Submit/Cancel Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-6 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-medium text-white transition-all duration-200 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>Submit</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;