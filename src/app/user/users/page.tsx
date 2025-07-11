/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import { Button } from "@mui/material"
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Slide, Stack, Pagination, Chip } from "@mui/material"
import axios from "axios"
import {useSnackbar} from "@/app/hooks/useSnackbar";

interface User {
  id: string
  name: string
  email: string
  mobileNumber: string
  status: string
  customerRole: number
}

interface ApiUser {
  customer_uuid: string
  customer_name: string
  customer_email: string
  customer_mobile: string
  status: string
  customer_role: number
}

const fetchUsers = async (setUsers: (users: User[]) => void) => {
  try {
    const userStr = localStorage.getItem("user")
    if (!userStr) return
    const userObj = JSON.parse(userStr)
    const company_uuid = userObj.companyuuid || userObj.company_uuid
    if (!company_uuid) return
    const token = localStorage.getItem("token")
    const res = await axios.get(`/api/protected/get-all-company-users?company_uuid=${company_uuid}`,
      token ? { headers: { "x-auth-token": `Bearer ${token}` } } : undefined
    )
    if (res.data && Array.isArray(res.data.data)) {
      const apiUsers = res.data.data.map((u: ApiUser) => ({
        id: u.customer_uuid,
        name: u.customer_name,
        email: u.customer_email,
        mobileNumber: u.customer_mobile,
        status: u.status || "ACTIVE",
        customerRole: u.customer_role || 1,
      }))
      setUsers(apiUsers)
    }
  } catch (err) {
    console.error("Failed to fetch users", err)
  }
}

const getStatusChipStyles = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return {
        sx: {
          backgroundColor: '#d1fae5', // green-100
          color: '#065f46', // green-800
          borderColor: '#6ee7b7', // green-300
        },
        iconColor: '#22c55e', // green-500
      }
    case "INACTIVE":
      return {
        sx: {
          backgroundColor: '#fee2e2', // red-100
          color: '#991b1b', // red-800
          borderColor: '#fca5a5', // red-300
        },
        iconColor: '#ef4444', // red-500
      }
    default:
      return {
        sx: {
          backgroundColor: '#f3f4f6', // gray-100
          color: '#374151', // gray-800
          borderColor: '#d1d5db', // gray-300
        },
        iconColor: '#6b7280', // gray-500
      }
  }
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const { showSnackbar } = useSnackbar();

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        const token = localStorage.getItem("token");
       const res= await axios.delete(
          `/api/protected/create-customer?customer_uuid=${userToDelete.id}`,
          token ? { headers: { "x-auth-token": `Bearer ${token}` } } : undefined
        );
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        showSnackbar(res.data.msg, "success");
      } catch (error:any) {
        showSnackbar(error?.response?.data?.msg || "Failed to delete user", "error");
      } finally {
        setDeleteModalOpen(false);
        setUserToDelete(null);
      }
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setUserToDelete(null)
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10
  const maxPage = Math.ceil(users.length / rowsPerPage)
  const paginatedUsers = users.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  useEffect(() => {
    setLoading(true)
    fetchUsers(setUsers).finally(() => setLoading(false))
  }, [])

  return (
    <motion.div
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      // transition={{ duration: 0.5 }}
      className="min-h-screen max-w-screen bg-gray-50"
    >
      <main className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 w-full max-w-8xl mx-auto py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col  sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 lg:mb-8">
          <h1 className=" text-2xl sm:text-2xl lg:text-3xl font-bold text-gray-900">User List</h1>
          <Link
            href="/user/users/add"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600  text-white px-4 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base font-medium shadow-sm"
          >
            <AddIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile Number</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user, idx) => (
                  <tr key={user.id} className={idx % 2 === 0 ? "bg-white hover:bg-blue-50 transition" : "bg-gray-50 hover:bg-blue-50 transition"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {idx+1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">  
                      <div className="text-base font-semibold text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.mobileNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <Chip 
                        label={user.customerRole === 1 ? "ADMIN" : user.customerRole === 2 ? "STAFF" : user.customerRole} 
                        size="small" 
                        color={user.customerRole === 1 ? "primary" : user.customerRole === 2 ? "secondary" : "default"}
                        variant="outlined"
                        className="ml-2"
                        sx={{
                          color: 'white',
                          backgroundColor: '#4f46e5', // Tailwind bg-indigo-500
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <Chip 
                        label={user.status} 
                        size="small" 
                        variant="outlined"
                        className="ml-2"
                        sx={getStatusChipStyles(user.status).sx}
                         
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Tooltip title="Edit" arrow>
                            <Link href={`/user/users/${user.id}/edit`} className="text-green-600 hover:text-green-900">
                              <IconButton size="small" color="success">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Link>
                          </Tooltip>
                          {user.customerRole !== 1 && (
                          <Tooltip title="Delete" arrow>
                            <span>
                              <IconButton size="small" color="error" onClick={() => handleDeleteClick(user)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                             )}
                        </div>
                   
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden space-y-4">
          {paginatedUsers.map((user) => (
            <motion.div
              key={user.id}
              // initial={{ opacity: 0, y: 10 }}
              // animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{user.name}</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span> {user.email}
                      </div>
                      <div>
                        <span className="font-medium">Mobile Number:</span> {user.mobileNumber}
                      </div>
                      <div>
                        <span className="font-medium">Role:</span> 
                        <Chip 
                          label={user.customerRole === 1 ? "ADMIN" : user.customerRole === 2 ? "STAFF" : user.customerRole} 
                          size="small" 
                          // color={user.customerRole === 3 ? "primary" : user.customerRole === 2 ? "secondary" : "default"}
                          variant="outlined"
                          className="ml-2"
                          sx={{
                          color:'red'
                          }}
                        />
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> 
                        <Chip 
                          label={user.status} 
                          size="small" 
                          variant="outlined"
                          className="ml-2"
                          sx={getStatusChipStyles(user.status).sx}
                          icon={<span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: getStatusChipStyles(user.status).iconColor }} />}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col sm:gap-2">
                  <Link
                    href={`/user/users/${user.id}/edit`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                  >
                    <EditIcon className="w-4 h-4" />
                    Edit
                  </Link>
                   {user.customerRole !== 1 && (
                  <button
                    onClick={() => handleDeleteClick(user)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <DeleteIcon className="w-4 h-4" />
                    Delete
                  </button>
                    )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
 {/* Loading and Empty State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Loading...</h3>
          </div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No data found</h3>
          </div>
        ) : null}
        {/* Pagination for Mobile/Tablet */}
        <Stack direction="row" justifyContent="center" mt={4} sx={{ '& .MuiPagination-ul': { gap: 1 } }}>
          <Pagination
            count={maxPage}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Stack>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={deleteModalOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
          TransitionComponent={Slide}
        >
          <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              Are you sure you want to delete <b>{userToDelete?.name}</b>? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

       
      </main>
    </motion.div>
  )
}
