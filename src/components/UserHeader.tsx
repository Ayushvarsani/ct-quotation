"use client"

import {
  NotificationsOutlined,
  SearchOutlined,
  SettingsOutlined,
  PersonOutlined,
  LogoutOutlined,
  ExpandMoreOutlined,
  SecurityOutlined,
  HelpOutlineOutlined,
  DarkModeOutlined,
  LightModeOutlined,
  MenuOutlined,
} from "@mui/icons-material"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"

interface HeaderProps {
  username: string
}

interface UserProfile {
  name: string
  email: string
  role: string
  avatar?: string
  lastLogin?: string
}

const navigation = [
  { name: "Dashboard", href: "/user/dashboard" },
  { name: "Products", href: "/user/products" },
  { name: "Quotation", href: "/user/quotation" },
  { name: "Users", href: "/user/users" },
]

export default function UserHeader({ username }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Mock user profile data
  const userProfile: UserProfile = {
    name: username
      .split("@")[0]
      .replace(/[0-9]/g, "")
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    email: username,
    role: "User",
    lastLogin: new Date().toLocaleDateString(),
  }

  // Mock notifications
  const notifications = [
    { id: 1, title: "New quotation request", time: "2 min ago", unread: true },
    { id: 2, title: "Company registration approved", time: "1 hour ago", unread: true },
    { id: 3, title: "System maintenance scheduled", time: "3 hours ago", unread: false },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    setShowLogoutConfirm(true)
    setIsDropdownOpen(false)
  }

  const confirmLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleProfileClick = () => {
    router.push("/user/profile")
    setIsDropdownOpen(false)
  }

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div className="flex-shrink-0" whileHover={{ scale: 1.02 }}>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-indigo-600">Quotation</span>
                <span className="text-gray-600">Pro</span>
              </h1>
            </motion.div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group relative flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <motion.span whileHover={{ x: 2 }} className="flex-1">
                      {item.name}
                    </motion.span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <motion.div
                className={`relative transition-all duration-300 ${isSearchFocused ? "w-64" : "w-48"}`}
                whileHover={{ scale: 1.02 }}
              >
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
              </motion.div>

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <NotificationsOutlined className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </motion.button>
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(userProfile.name)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
                      <p className="text-xs text-gray-500">{userProfile.role}</p>
                    </div>
                  </div>
                  <ExpandMoreOutlined
                    className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </motion.button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    >
                      {/* User Info Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                            {getInitials(userProfile.name)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{userProfile.name}</p>
                            <p className="text-xs text-gray-500">{userProfile.email}</p>
                            <div className="flex items-center mt-1">
                              <SecurityOutlined className="h-3 w-3 text-green-500 mr-1" />
                              <span className="text-xs text-green-600 font-medium">{userProfile.role}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={handleProfileClick}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                        >
                          <PersonOutlined className="h-4 w-4 mr-3 text-gray-400" />
                          My Profile
                        </button>
                        <div className="border-t border-gray-100 my-2"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                        >
                          <LogoutOutlined className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <MenuOutlined className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <LogoutOutlined className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirm Logout</h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to sign out? You'll need to sign in again to access your account.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
