/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSnackbar } from "@/app/hooks/useSnackbar";
import axios from 'axios';

const schema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
}).required();

type LoginFormData = yup.InferType<typeof schema>;

export default function LoginPage() {
 const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginFormData) => {
   const Admindata= {
          email: data.email,
          password: data.password,
        }
    try {
      const response = await axios.post('/api/admin-login',  Admindata,{
       headers: {
          'Content-Type': 'application/json',
        },
      
      });

      console.log('Login response:', response);
if(response.data && response.data.status){
  localStorage.setItem('admin_jwt_token', response.data.data.jwt_token);
  localStorage.setItem('admin_info', JSON.stringify(response.data.data));
  showSnackbar(response.data.msg, "success");
  router.push('/admin/companies');
}else{
    showSnackbar(response.data.msg, "error");
}
    } catch (error) {
      console.error('Login error:', error);
      showSnackbar((error as any).response.data.msg, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 ">
      <motion.div 
        className="max-w-md w-full mx-4"
      >
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          <div className="text-center">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-2"
            >
              Welcome Back
            </motion.h2>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <motion.p 
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </div>
            </div>

            <div className="flex items-end justify-end">


              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
            >
              Sign in
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
} 