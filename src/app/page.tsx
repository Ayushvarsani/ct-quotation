/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  ErrorOutline,
  CheckCircleOutline,
} from "@mui/icons-material"

// Form validation schema
const schema = yup
  .object({
    email: yup.string().email("Please enter a valid email").required("Email is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  })
  .required()

type LoginFormData = yup.InferType<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState("")
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { 
      errors, 
      // isSubmitting
     },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    mode: "onChange",
  })

  // Handle form submission
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setLoginError("")

    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      localStorage.setItem("user", JSON.stringify({ email: data.email }))

      // Show success message briefly before redirecting
      setLoginSuccess(true)

      // Redirect after showing success message
      setTimeout(() => {
        router.push("/user/products")
      }, 1000)
    } catch (error) {
      setLoginError("Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle social login
  // const handleSocialLogin = (provider: string) => {
  //   setIsLoading(true)

  //   // Simulate API call with delay
  //   setTimeout(() => {
  //     localStorage.setItem("user", JSON.stringify({ email: `user@${provider}.com` }))
  //     router.push("/user/products")
  //   }, 1500)
  // }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900 transition-colors duration-300">
      {/* Left side - Branding and information */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 relative overflow-hidden">
        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-indigo-600 font-bold text-xl">Q</span>
              </div>
              <h1 className="text-2xl font-bold text-white">QuotationPro</h1>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-white leading-tight">
              Streamline Your <br />
              Quotation Management
            </h2>
            <p className="text-indigo-100 max-w-md">
              Access your admin dashboard to manage companies, products, and generate professional quotations in minutes.
            </p>

            <div className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-300 flex items-center justify-center text-xs font-medium text-indigo-800"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-indigo-100">
                  Trusted by <span className="font-semibold">2,000+</span> businesses
                </div>
              </div>
            </div>
          </motion.div>

          <div className="text-sm text-indigo-200">© {new Date().getFullYear()} QuotationPro. All rights reserved.</div>
        </div>

        {/* Abstract shapes */}
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500 rounded-full opacity-20"></div>
        <div className="absolute top-1/4 -right-16 w-64 h-64 bg-purple-500 rounded-full opacity-20"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500 rounded-full opacity-20"></div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white md:bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 space-y-8">
            {/* Form header */}
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center items-center"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h2>
              </motion.div>
              <p className="text-gray-600">Please sign in to your account</p>
            </div>

            {/* Login form */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence>
                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center space-x-2"
                  >
                    <ErrorOutline className="text-red-500" />
                    <p className="text-sm text-red-600">{loginError}</p>
                  </motion.div>
                )}

                {loginSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center space-x-2"
                  >
                    <CheckCircleOutline className="text-green-500" />
                    <p className="text-sm text-green-600">Login successful! Redirecting...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Email className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("email")}
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Password field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="text-sm">
                      <Link
                        href="#"
                        className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("password")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-3 rounded-lg bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 focus:outline-none"
                      >
                        {showPassword ? <VisibilityOff className="h-5 w-5" /> : <Visibility className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>


              {/* Submit button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white ${
                  isLoading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                } transition duration-200 relative`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
