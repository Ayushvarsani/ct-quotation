"use client"

import {
  // NotificationsOutlined,
  // SearchOutlined,
  PersonOutlined,
  LogoutOutlined,
  ExpandMoreOutlined,
  SecurityOutlined,
  MenuOutlined,
  CloseOutlined,
} from "@mui/icons-material"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useMediaQuery } from "@mui/material"

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

// Define all modules and their menus
const ALL_MODULES = [
  {
    name: "Quotation",
    menus: [
      { name: "Dashboard", href: "/user/dashboard" },
      { name: "Products", href: "/user/products" },
      { name: "Quotation", href: "/user/quotation" },
      { name: "Users", href: "/user/users" },
    ],
  },
  // Example for future modules:
  // {
  //   name: "Inventory",
  //   menus: [
  //     { name: "Stock List", href: "/inventory/stock" },
  //     { name: "Add Item", href: "/inventory/add" },
  //   ],
  // },
]

export default function UserHeader({ username }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // const [ setIsNotificationOpen] = useState(false)
  // const [isDarkMode, setIsDarkMode] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  // const [searchQuery, setSearchQuery] = useState("")
  // const [isSearchFocused, setIsSearchFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const [allowedModules, setAllowedModules] = useState<string[]>([])
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

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
  // const notifications = [
  //   { id: 1, title: "New quotation request", time: "2 min ago", unread: true },
  //   { id: 2, title: "Company registration approved", time: "1 hour ago", unread: true },
  //   { id: 3, title: "System maintenance scheduled", time: "3 hours ago", unread: false },
  // ]

  // const unreadCount = notifications.filter((n) => n.unread).length

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        // setIsNotificationOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("modules")
    if (stored) setAllowedModules(JSON.parse(stored))
  }, [])

  // Filter modules for current user
  const userModules = ALL_MODULES.filter((module) =>
    allowedModules.includes(module.name)
  )

  // If only one module, show its menus as main nav
  const showSingleModuleMenus = userModules.length === 1
  const singleModuleMenus = showSingleModuleMenus ? userModules[0].menus : []

  const handleLogout = () => {
    setShowLogoutConfirm(true)
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
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

  const handleMobileNavClick = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
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
              {showSingleModuleMenus && singleModuleMenus.length > 0 && (
                <div
                  className="relative group"
                  onMouseEnter={() => setOpenDropdown(userModules[0].name)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      openDropdown === userModules[0].name
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      if (!isDesktop) {
                        setOpenDropdown(openDropdown === userModules[0].name ? null : userModules[0].name)
                      }
                    }}
                    type="button"
                  >
                    {userModules[0].name}
                    <ExpandMoreOutlined
                      className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                        openDropdown === userModules[0].name ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {/* Dropdown menu */}
                  {openDropdown === userModules[0].name && (
                    <div
                      className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-50"
                      style={{ minWidth: 180 }}
                      // onMouseEnter={() => setOpenDropdown(userModules[0].name)}
                      // onMouseLeave={() => setOpenDropdown(null)}
                    >
                      {singleModuleMenus.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${
                            pathname === item.href ? "font-semibold text-indigo-700" : ""
                          }`}
                          onClick={() => {
                            setOpenDropdown(null)
                          }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
             
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
                      // initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      // animate={{ opacity: 1, y: 0, scale: 1 }}
                      // exit={{ opacity: 0, y: -10, scale: 0.95 }}
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
                 <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {isMobileMenuOpen ? (
                  <CloseOutlined className="h-5 w-5" />
                ) : (
                  <MenuOutlined className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0  z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu Popup */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              ref={mobileMenuRef}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials(userProfile.name)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{userProfile.name}</p>
                    <p className="text-xs text-gray-500">{userProfile.email}</p>
                    <p className="text-xs text-green-500">{userProfile.role}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <CloseOutlined className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Navigation</h3>
                {showSingleModuleMenus && singleModuleMenus.length > 0 && (
                  <div>
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      onClick={() => setOpenDropdown(openDropdown === userModules[0].name ? null : userModules[0].name)}
                    >
                      <span>{userModules[0].name}</span>
                      <ExpandMoreOutlined
                        className={`h-4 w-4 ml-1 transition-transform duration-200 ${openDropdown === userModules[0].name ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openDropdown === userModules[0].name && (
                      <div className="pl-4 mt-2 space-y-1">
                        {singleModuleMenus.map((item) => (
                          <button
                            key={item.name}
                            onClick={() => handleMobileNavClick(item.href)}
                            className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                              pathname === item.href
                                ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Mobile Logout Button */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center"
                >
                  <LogoutOutlined className="h-4 w-4 mr-3" />
                  Sign Out
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            // initial={{ opacity: 0 }}
            // animate={{ opacity: 1 }}
            // exit={{ opacity: 0 }}
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
                Are you sure you want to sign out? You Will need to sign in again to access your account.
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
