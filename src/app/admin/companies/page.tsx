"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
// import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import { Button } from "@mui/material"
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Slide, Stack, Pagination,CircularProgress } from "@mui/material"
import axios from "axios"
import { useSnackbar } from "@/app/hooks/useSnackbar";

interface Company {
  company_uuid: string
  company_name: string
  company_email: string
  company_mobile: string
  created_at: string
  updated_at: string
  created_by: string
  status: string
  start_date: string | null
  end_date: string | null
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("admin_jwt_token")
        const response = await axios.get("/api/protected/get-all-companies", {
          headers: {
            "x-auth-token": `Bearer ${token}`,
          },
        })
        setCompanies(response.data.data)
      } catch (error) {
        console.error("Failed to fetch companies", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCompanies()
  }, [])

  const handleDeleteClick = (company: Company) => {
    setCompanyToDelete(company)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (companyToDelete) {
      try {
        const token = localStorage.getItem("admin_jwt_token");
        await axios.delete(`/api/protected/create-company`, {
          params: { company_uuid: companyToDelete.company_uuid },
          headers: {
            "x-auth-token": `Bearer ${token}`,
          },
        });
        setCompanies((prev) => prev.filter((c) => c.company_uuid !== companyToDelete.company_uuid));
        showSnackbar("Company deleted successfully", "success");
      } catch (error) {
        showSnackbar("Failed to delete company", "error");
        console.error("Failed to delete company", error);
      } finally {
        setDeleteModalOpen(false);
        setCompanyToDelete(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setCompanyToDelete(null)
  }

  const totalCount = companies.length
  const activeCount = companies.filter((c) => c.status === "ACTIVE").length
  const inactiveCount = companies.filter((c) => c.status !== "ACTIVE").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-300"
      case "INACTIVE":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10
  const maxPage = Math.ceil(companies.length / rowsPerPage)
  const paginatedCompanies = companies.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <CircularProgress />
    </div>
  }

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
          <h1 className=" text-2xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Company List</h1>
          <Link
            href="/admin/companies/create"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600  text-white px-4 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base font-medium shadow-sm"
          >
            
            <span className="hidden sm:inline">Add  Company</span>
            <span className="sm:hidden">Add Company</span>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-4 sm:p-6 flex flex-col items-center">
            <span className="text-sm sm:text-lg text-blue-700 font-medium">Total</span>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-800 mt-1">{totalCount}</span>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-sm p-4 sm:p-6 flex flex-col items-center">
            <span className="text-sm sm:text-lg text-green-700 font-medium">Active</span>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-800 mt-1">{activeCount}</span>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-4 sm:p-6 flex flex-col items-center">
            <span className="text-sm sm:text-lg text-red-700 font-medium">Inactive</span>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-800 mt-1">{inactiveCount}</span>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Company Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mobile Number</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Start Date | End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCompanies.map((company, idx) => (
                  <tr key={company.company_uuid} className={idx % 2 === 0 ? "bg-white hover:bg-blue-50 transition" : "bg-gray-50 hover:bg-blue-50 transition"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-semibold text-gray-900">{company.company_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{company.company_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{company.company_mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(company.start_date || company.created_at)} | {formatDate(company.end_date || company.updated_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(company.status)}`}>
                        {company.status === "ACTIVE" ? (
                          <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                        ) : (
                          <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                        )}
                        {company.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {/* <Tooltip title="View" arrow>
                          <Link href={`/admin/companies/${company.company_uuid}`} className="text-blue-600 hover:text-blue-900">
                            <IconButton size="small" color="primary">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Link>
                        </Tooltip> */}
                        <Tooltip title="Edit" arrow>
                          <Link href={`/admin/companies/${company.company_uuid}/edit`} className="text-green-600 hover:text-green-900">
                            <IconButton size="small" color="success">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Link>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <span>
                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(company)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
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
          {paginatedCompanies.map((company) => (
            <motion.div
              key={company.company_uuid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{company.company_name}</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span> {company.company_email}
                      </div>
                      <div>
                        <span className="font-medium">Mobile Number:</span> {company.company_mobile}
                      </div>
                      <div>
                        <span className="font-medium">Start Date | End Date: </span> {formatDate(company.start_date || company.created_at)} | {formatDate(company.end_date || company.updated_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-gray-500 font-medium">Status:</span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(company.status)}`}>
                        {company.status === "ACTIVE" ? (
                          <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                        ) : (
                          <span className="w-2 h-2 bg-red-500 rounded-full inline-block"></span>
                        )}
                        {company.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col sm:gap-2">
                  {/* <Link
                    href={`/admin/companies/${company.company_uuid}`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <VisibilityIcon className="w-4 h-4" />
                    View
                  </Link> */}
                  <Link
                    href={`/admin/companies/${company.company_uuid}/edit`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <EditIcon className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(company)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <DeleteIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

{/* Empty State */}
{companies.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first company to the system.</p>
              <Link
                href="/admin/companies/create"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <AddIcon className="w-5 h-5" />
                Add Your First Company
              </Link>
            </div>
          </div>
        )}
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
              Are you sure you want to delete <b>{companyToDelete?.company_name}</b>? This action cannot be undone.
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
