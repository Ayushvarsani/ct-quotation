'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
// import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PhoneIcon from '@mui/icons-material/Phone';
import MessageIcon from '@mui/icons-material/Message';
// import ErrorIcon from '@mui/icons-material/Error';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Autocomplete, Checkbox, TextField,  FormControlLabel, Tooltip } from '@mui/material';

const schema = yup.object({
  companyName: yup.string().required('Company name is required'),
  username: yup.string().email('Invalid email').required('Username is required'),
  password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
  mobileNo: yup.string().required('Mobile number is required').matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'),
  status: yup.string().oneOf(['active', 'inactive'], 'Status must be Active or Inactive').required('Status is required'),
  defaultMessageNumber: yup.string().required('Default message number is required').matches(/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'),
  startDate: yup.string().required('Start date is required'),
  endDate: yup.string().required('End date is required'),
  modules: yup.array().of(yup.string().oneOf(['quotation', 'visit'])).min(1, 'Select at least one module').required('Module is required'),
}).required();

type CompanyFormData = yup.InferType<typeof schema>;

export default function NewCompanyPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    product: true,
    size: true,
    series: false,
    category: false,
    finish: false,
    pcsPerBox: false,
    sqFtPerBox: false,
    weight: false,
    pre: false,
    std: false,
    com: false,
    eco: false,
   
  });
  const [statusChecked, setStatusChecked] = useState(true);
  const [selectedModules, setSelectedModules] = useState<{ label: string, value: string }[]>([]);

  const handlePermissionChange = (field: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      status: 'active',
      modules: [],
    },
  });

  const status = watch('status');
  const handleStatusChange = (value: 'active' | 'inactive') => {
    console.log(statusChecked);
    
    setValue('status', value);
    setStatusChecked(value === 'active');
  };
  // const handleStatusCheckbox = () => {
  //   const newStatus = statusChecked ? 'inactive' : 'active';
  //   setValue('status', newStatus);
  //   setStatusChecked(!statusChecked);
  // };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      console.log('Company data:', data);
      router.push('/admin/companies');
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const fieldList = [
    { key: 'product', label: 'Product' },
    { key: 'size', label: 'Size' },
    { key: 'series', label: 'Series' },
    { key: 'category', label: 'Category' },
    { key: 'finish', label: 'Finish' },
    { key: 'pcsPerBox', label: 'Pcs per box' },
    { key: 'sqFtPerBox', label: 'Sq.ft per box' },
    { key: 'weight', label: 'Weight' },
  ];

  const [labels, setLabels] = useState(
    Object.fromEntries(fieldList.map(f => [f.key, f.label]))
  );

  const isQuotationSelected = selectedModules.some(mod => mod.value === 'quotation');

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
              <h1 className="text-2xl sm:text-2xl font-bold text-gray-900 mb-2">Create New Company</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 ">
                  <TextField
                    {...register('companyName')}
                    label="Company Name"
                    placeholder="Enter company name"
                    error={!!errors.companyName}
                    helperText={errors.companyName?.message}
                    fullWidth
                    InputProps={{ endAdornment: <BusinessIcon className="text-gray-400" /> }}
                  />
                </div>
                <div className="space-y-2">
                  <TextField
                    {...register('username')}
                    label="Username"
                    placeholder="Choose a username"
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    fullWidth
                    InputProps={{ endAdornment: <PersonIcon className="text-gray-400" /> }}
                  />
                </div>
                <div className="space-y-2">
                  <TextField
                    {...register('password')}
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    fullWidth
                    InputProps={{
                      endAdornment: (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                        >
                          {showPassword ? (
                            <VisibilityOffIcon className="text-gray-400 hover:text-gray-600" />
                          ) : (
                            <VisibilityIcon className="text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      ),
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <TextField
                    {...register('mobileNo')}
                    label="Mobile Number"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    error={!!errors.mobileNo}
                    helperText={errors.mobileNo?.message}
                    fullWidth
                    InputProps={{ endAdornment: <PhoneIcon className="text-gray-400" /> }}
                  />
                </div>
                {/* Status Field */}
                <div className="space-y-2">
                  <Autocomplete
                    id="status-autocomplete"
                    options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]}
                    getOptionLabel={option => option.label}
                    value={{ label: status === 'active' ? 'Active' : 'Inactive', value: status }}
                    onChange={(_, newValue) => {
                      if (newValue) handleStatusChange(newValue.value as 'active' | 'inactive');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="status"
                        label="Status"
                        error={!!errors.status}
                        helperText={errors.status?.message}
                        placeholder="Select status"
                        fullWidth
                      />
                    )}
                    renderOption={(props, option) => (
                      <li {...props} key={option.value} className="flex items-center gap-2">
                        <Checkbox
                          checked={status === option.value}
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
                 {/* default message number Field */}
                 <div className="space-y-2">
                  <TextField
                    {...register('defaultMessageNumber')}
                    label="Default Message Number"
                    type="tel"
                    placeholder="Enter default message number"
                    InputProps={{ endAdornment: <MessageIcon className="text-gray-400" /> }}
                    error={!!errors.defaultMessageNumber}
                    helperText={errors.defaultMessageNumber?.message}
                    fullWidth
                  />
                </div>

                 {/* Module Field */}
                 <div className="space-y-2">
                  <Autocomplete
                    multiple
                    id="module-autocomplete"
                    options={[
                      { label: 'Quotation', value: 'quotation' },
                      { label: 'Visit', value: 'visit' }
                    ]}
                    getOptionLabel={option => option.label}
                    value={selectedModules}
                    onChange={(_, newValue) => {
                      setSelectedModules(newValue);
                      setValue('modules', newValue.map(opt => opt.value), { shouldValidate: true });
                    }}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="modules"
                        label="Module"
                        error={!!errors.modules}
                        helperText={errors.modules?.message}
                        placeholder="Select module(s)"
                        fullWidth
                      />
                    )}
                    renderOption={(props, option, { selected }) => (
                      <li {...props} key={option.value ?? option.label} className="flex items-center gap-2">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                
                {/* Start Date Field */}
                <div className="space-y-2">
                  <TextField
                    {...register('startDate')}
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                    fullWidth
                  />
                </div>
                {/* End Date Field */}
                <div className="space-y-2">
                  <TextField
                    {...register('endDate')}
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
                    fullWidth
                  />
                </div>
              </div>
              </div>
              
              {/* Status, Start Date, End Date fields */}
              

              {/* Permissions Table - Only show if Quotation is selected */}
              {isQuotationSelected && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Field Permissions</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 grid md:grid-cols-2">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Field Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Permission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {fieldList.map(field => (
                          <tr key={field.key} className="bg-white hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <Tooltip title={field.key} arrow>
                                <TextField
                                  value={labels[field.key]}
                                  onChange={e => setLabels({ ...labels, [field.key]: e.target.value })}
                                  size="small"
                                  variant="outlined"
                                />
                              </Tooltip>
                            </td>
                            <td className="px-4 py-3">
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={permissions[field.key as keyof typeof permissions]}
                                    onChange={() => handlePermissionChange(field.key as keyof typeof permissions)}
                                    color="primary"
                                  />
                                }
                                label=""
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <table className="w-full md:border-l-2 border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Grade Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Permission</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {[
                          { key: 'pre', label: 'PRE' },
                          { key: 'std', label: 'STD' },
                          { key: 'com', label: 'COM' },
                          { key: 'eco', label: 'ECO' },
                        ].map(field => (
                          <tr key={field.key} className="bg-white hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900">{field.label}</td>
                            <td className="px-4 py-3">
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={permissions[field.key as keyof typeof permissions]}
                                    onChange={() => handlePermissionChange(field.key as keyof typeof permissions)}
                                    color="primary"
                                  />
                                }
                                label=""
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8">
                <motion.button
                  type="button"
                  onClick={() => router.back()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm">Creating Company...</span>
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