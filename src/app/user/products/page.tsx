"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import VisibilityIcon from "@mui/icons-material/Visibility"
import EditIcon from "@mui/icons-material/Edit"
import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import { Button } from "@mui/material"
import { Tooltip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Slide, Stack, Pagination } from "@mui/material"

interface Product {
  id: string
  name: string
  size: string
  series: string
  category: string
  finish: string
  pcsPerBox: number
  sqFtPerBox: number
  weight: number
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Laptop Pro",
      size: "15-inch",
      series: "Pro X",
      category: "Electronics",
      finish: "Space Gray",
      pcsPerBox: 1,
      sqFtPerBox: 1.5,
      weight: 4.5,
    },
    {
      id: "2",
      name: "Wireless Mouse",
      size: "Standard",
      series: "Silent",
      category: "Accessories",
      finish: "Matte Black",
      pcsPerBox: 50,
      sqFtPerBox: 0.2,
      weight: 0.25,
    },
    {
      id: "3",
      name: "Mechanical Keyboard",
      size: "Full-size",
      series: "Gamer",
      category: "Accessories",
      finish: "RGB",
      pcsPerBox: 10,
      sqFtPerBox: 1.2,
      weight: 2.5,
    },
  ])

  // Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id))
      setDeleteModalOpen(false)
      setProductToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false)
    setProductToDelete(null)
  }

  // const totalCount = products.length

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 5
  const maxPage = Math.ceil(products.length / rowsPerPage)
  const paginatedProducts = products.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

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
          <h1 className=" text-2xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Product List</h1>
          <Link
            href="/user/products/add"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600  text-white px-4 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base font-medium shadow-sm"
          >
            <AddIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add Product</span>
          </Link>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Series</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Finish</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Pcs per box</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Sq.ft per box</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Weight</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedProducts.map((product, idx) => (
                  <tr key={product.id} className={idx % 2 === 0 ? "bg-white hover:bg-blue-50 transition" : "bg-gray-50 hover:bg-blue-50 transition"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-base font-semibold text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.size}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.series}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.finish}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.pcsPerBox}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.sqFtPerBox}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{product.weight}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Tooltip title="View" arrow>
                          <Link href={`/user/products/${product.id}`} className="text-blue-600 hover:text-blue-900">
                            <IconButton size="small" color="primary">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Link>
                        </Tooltip>
                        <Tooltip title="Edit" arrow>
                          <Link href={`/user/products/${product.id}/edit`} className="text-green-600 hover:text-green-900">
                            <IconButton size="small" color="success">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Link>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <span>
                            <IconButton size="small" color="error" onClick={() => handleDeleteClick(product)}>
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
          {paginatedProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Category:</span> {product.category}
                      </div>
                      <div>
                        <span className="font-medium">Size:</span> {product.size}
                      </div>
                      <div>
                        <span className="font-medium">Series:</span> {product.series}
                      </div>
                      <div>
                        <span className="font-medium">Finish:</span> {product.finish}
                      </div>
                      <div>
                        <span className="font-medium">Pcs per box:</span> {product.pcsPerBox}
                      </div>
                      <div>
                        <span className="font-medium">Sq.ft per box:</span> {product.sqFtPerBox}
                      </div>
                      <div>
                        <span className="font-medium">Weight:</span> {product.weight}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:flex-col sm:gap-2">
                  <Link
                    href={`/user/products/${product.id}`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <VisibilityIcon className="w-4 h-4" />
                    View
                  </Link>
                  <Link
                    href={`/user/products/${product.id}/edit`}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                  >
                    <EditIcon className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(product)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <DeleteIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
              Are you sure you want to delete <b>{productToDelete?.name}</b>? This action cannot be undone.
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

        {/* Empty State */}
        {products.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first product to the system.</p>
              <Link
                href="/user/products/add"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <AddIcon className="w-5 h-5" />
                Add Your First Product
              </Link>
            </div>
          </div>
        )}
      </main>
    </motion.div>
  )
}
