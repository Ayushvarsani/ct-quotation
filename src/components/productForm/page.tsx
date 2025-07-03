"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
} from "@mui/material"
import { FormatListNumbered, ArrowBack } from "@mui/icons-material"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSnackbar } from "@/app/hooks/useSnackbar"
import axios from "axios"

// Define a type for Autocomplete options
type AutoOption = { label: string; value: string } | { label: string; isAddOption: true }

// Product data interface
// interface ProductData {
//   id: number
//   product_uuid: string
//   product_name: string
//   product_category: string
//   product_size: string
//   product_quantity: number
//   product_cost: number
//   product_series: string
//   product_finish: string
//   product_pieces_per_box: number
//   product_weight: number
//   product_sq_ft_box: number
//   customer_uuid: string
//   company_uuid: string
//   created_at: string
//   updated_at: string
// }

interface DynamicProductFormProps {
  productId?: string // Pass product UUID for edit mode
  isViewMode?: boolean
}

export default function DynamicProductForm({ productId, isViewMode = false }: DynamicProductFormProps) {
  const router = useRouter()
  const { showSnackbar } = useSnackbar()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)

  // Autocomplete dropdown options (only for 'product' and 'size')
  const [options, setOptions] = useState<Record<string, string[]>>({
    product_name: [],
    product_size: [],
  })

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogField, setDialogField] = useState<string | null>(null)
  const [dialogValue, setDialogValue] = useState("")
  const [inputValues, setInputValues] = useState<Record<string, string>>({})

  // Check if it's edit mode
  const isEditMode = !!productId

  // Move this line higher, before any useEffect that uses 'fields':
  const [fields, setFields] = useState<{ key: string; label: string }[]>([])

  // Fetch product data for edit mode
  useEffect(() => {
    if (isEditMode && productId && fields.length > 0) {
      fetchProductData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, productId, fields])

  const fetchProductData = async () => {
    setLoading(true)
    try {
      const userStr = localStorage.getItem("user")
      const user = userStr ? JSON.parse(userStr) : null
      const companyUuid = user?.companyuuid
      if (!companyUuid) {
        showSnackbar("Company UUID not found in localStorage", "error", 4000)
        return
      }
      const token = localStorage.getItem("token")
      if (!token) {
        showSnackbar("Token not found in localStorage", "error", 4000)
        return
      }
      const response = await axios.get(`/api/protected/get-single-product`, {
        params: { product_uuid: productId },
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": `Bearer ${token}`,
        },
      })
      const result = response.data
      if (result.status && result.data && result.data.length > 0) {
        const productData = result.data[0]
        const mappedData: Record<string, string> = {}
        fields.forEach(field => {
          mappedData[field.key] = productData[field.key] !== undefined ? String(productData[field.key] ?? "") : ""
        })
        setFormData(mappedData)
        setInputValues({
          product_name: mappedData.product_name || "",
          product_size: mappedData.product_size || "",
        })
      }
    } catch (error) {
      console.error("Error fetching product data:", error)
      showSnackbar("Failed to fetch product data", "error", 4000)
    } finally {
      setLoading(false)
    }
  }

  // Field input handler
  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  // Open Add Dialog
  const openDialog = (fieldKey: string, typedValue: string) => {
    setDialogField(fieldKey)
    setDialogValue(typedValue)
    setDialogOpen(true)
  }

  // Fetch dropdown options on mount and when permissions change
  useEffect(() => {
    ["product_name", "product_size"].forEach(async (field) => {
      const opts = await fetchDropdownOptions(field as "product_name" | "product_size")
      setOptions((prev) => ({ ...prev, [field]: opts }))
    })
  }, [])

  // Update handleDialogAdd to use API for adding new options
  const handleDialogAdd = async () => {
    if (dialogField && dialogValue.trim()) {
      const added = await addDropdownOption(dialogField as "product_name" | "product_size", dialogValue.trim())
      if (added) {
        const opts = await fetchDropdownOptions(dialogField as "product_name" | "product_size")
        setOptions((prev) => ({ ...prev, [dialogField]: opts }))
        setFormData((prev) => ({
          ...prev,
          [dialogField]: dialogValue.trim(),
        }))
      }
      setDialogOpen(false)
    }
  }

  const fetchDropdownOptions = async (field: "product_name" | "product_size") => {
    const userStr = localStorage.getItem("user")
    const user = userStr ? JSON.parse(userStr) : null
    const companyUuid = user?.companyuuid
    const token = localStorage.getItem("token")
    if (!companyUuid || !token) return []

    const url = `/api/protected/${field === "product_name" ? "product-name" : "product-size"}?company_uuid=${companyUuid}`
    try {
      const res = await axios.get(url, {
        headers: { "x-auth-token": `Bearer ${token}` }
      })
      // Adjust this if your API returns a different structure
      return res.data?.data?.map((item: any) => item[field]) || []
    } catch (err) {
      showSnackbar(`Failed to fetch ${field} options`, "error", 3000)
      return []
    }
  }

  const addDropdownOption = async (field: "product_name" | "product_size", value: string) => {
    const userStr = localStorage.getItem("user")
    const user = userStr ? JSON.parse(userStr) : null
    const companyUuid = user?.companyuuid
    const token = localStorage.getItem("token")
    if (!companyUuid || !token) return false

    const url = `/api/protected/${field === "product_name" ? "product-name" : "product-size"}?company_uuid=${companyUuid}`
    try {
      await axios.post(url, {
        [field]: value
      }, {
        headers: { "x-auth-token": `Bearer ${token}` }
      })
      showSnackbar(`Added new ${field}`, "success", 2000)
      return true
    } catch (err) {
      showSnackbar(`Failed to add ${field}`, "error", 3000)
      return false
    }
  }

  const submitProduct = async (data: Record<string, string>) => {
    const userStr = localStorage.getItem("user")
    const user = userStr ? JSON.parse(userStr) : null
    const companyUuid = user?.companyuuid
    if (!companyUuid) {
      throw new Error("Company UUID not found in localStorage user")
    }

    const payload = {
      product_name: data.product_name,
      product_category: data.product_category,
      product_size: data.product_size,
      product_series: data.product_series,
      product_finish: data.product_finish,
      product_pieces_per_box: data.product_pieces_per_box,
      product_weight: data.product_weight,
      product_sq_ft_box: data.product_sq_ft_box,
    }

    const url = isEditMode
      ? `/api/protected/create-product?product_uuid=${productId}`
      : `/api/protected/create-product?company_uuid=${companyUuid}`

    const token = localStorage.getItem("token")
    if (!token) {
      throw new Error("Token not found in localStorage")
    }

    let response
    if (isEditMode) {
      response = await axios.put(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": `Bearer ${token}`,
        },
      })
    } else {
      response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": `Bearer ${token}`,
        },
      })
    }

    if (!response.data || !response.data.status) {
      throw new Error(response.data?.message || `Failed to ${isEditMode ? "update" : "create"} product`)
    }

    return response.data
  }

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    let hasError = false

    fields.forEach((field) => {
      if (!formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`
        hasError = true
      }
    })

    setErrors(newErrors)

    if (!hasError) {
      setIsSubmitting(true)
      try {
        const result = await submitProduct(formData)
        if (result.status) {
          showSnackbar(result.msg, "success", 3000)
          router.push("/user/products")
          if (!isEditMode) {
            setFormData({})
            setInputValues({})
          }
        } else {
          showSnackbar(result.msg, "error", 3000)
        }
      } catch (err) {
        showSnackbar(err instanceof Error ? err.message : "Unexpected error occurred.", "error", 3000)
      } finally {
        setIsSubmitting(false)
      }
    } else {
      showSnackbar("Please fix the validation errors", "error", 4000)
    }
  }

  // Add a function to reset the form
  const handleCancel = () => {
    if (isEditMode) {
      // In edit mode, go back or reload original data
      router.back()
    } else {
      // In create mode, clear the form
      setFormData({})
      setInputValues({})
      setErrors({})
      showSnackbar("Form cleared", "info", 2000)
    }
  }

  useEffect(() => {
    const fieldsStr = localStorage.getItem("quotation_product_fields")
    if (fieldsStr) {
      try {
        const parsed = JSON.parse(fieldsStr)
        setFields(Object.entries(parsed).map(([key, label]) => ({ key, label: String(label) })))
      } catch (e) {
        setFields([])
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Back Button */}
          <button
            type="button"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-4"
            onClick={() => router.back()}
          >
            <ArrowBack fontSize="small" />
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FormatListNumbered className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-2xl font-bold text-gray-900 mb-2">
                {isEditMode ? "Edit Product" : "Add New Product"}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {fields.map((field) => {
                  const isAuto = field.key === "product_name" || field.key === "product_size"
                  const value = formData[field.key] || ""
                  const fieldOptions: AutoOption[] = (options[field.key] || []).map((opt) => ({
                    label: opt,
                    value: opt,
                  }))
                  return (
                    <div key={field.key} className="space-y-2">
                      {isAuto ? (
                        <Autocomplete
                          value={fieldOptions.find((opt) => ("value" in opt ? opt.value === value : false)) || null}
                          onChange={(_, newVal: AutoOption | null) => {
                            if (newVal && "isAddOption" in newVal && newVal.isAddOption) {
                              openDialog(field.key, inputValues[field.key] || "")
                            } else if (newVal && "value" in newVal) {
                              handleInputChange(field.key, newVal.value)
                            } else {
                              handleInputChange(field.key, "")
                            }
                          }}
                          inputValue={inputValues[field.key] || ""}
                          onInputChange={(_, newInputValue) => {
                            setInputValues((prev) => ({
                              ...prev,
                              [field.key]: newInputValue,
                            }))
                          }}
                          options={fieldOptions as AutoOption[]}
                          filterOptions={(opts) => [...opts, { label: "Add", isAddOption: true } as AutoOption]}
                          getOptionLabel={(option) => option.label}
                          isOptionEqualToValue={(option, value) =>
                            "value" in option && "value" in value && option.value === value.value
                          }
                          disabled={isViewMode}
                          renderOption={(props, option) => {
                            const opt = option as AutoOption
                            return (
                              <li {...props} key={opt.label}>
                                {"isAddOption" in opt && opt.isAddOption ? (
                                  <Button variant="outlined" color="primary" fullWidth>
                                    {opt.label}
                                  </Button>
                                ) : (
                                  opt.label
                                )}
                              </li>
                            )
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={field.label}
                              variant="outlined"
                              size="small"
                              error={!!errors[field.key]}
                              helperText={errors[field.key]}
                            />
                          )}
                        />
                      ) : (
                        <TextField
                          fullWidth
                          size="small"
                          label={field.label}
                          value={value}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          error={!!errors[field.key]}
                          helperText={errors[field.key]}
                          disabled={isViewMode}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {!isViewMode && (
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8">
                  <motion.button
                    type="button"
                    onClick={handleCancel}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    {isEditMode ? "Cancel" : "Clear"}
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <CircularProgress size={22} color="inherit" /> : isEditMode ? "Update" : "Submit"}
                  </motion.button>
                </div>
              )}
            </form>

            {/* Add New Dialog */}
            <Dialog
              open={dialogOpen}
              onClose={() => {
                setDialogOpen(false)
                if (dialogField) {
                  setInputValues((prev) => ({ ...prev, [dialogField]: "" }))
                }
              }}
              fullWidth
              maxWidth="xs"
              PaperProps={{
                className: "rounded-2xl",
                style: { boxShadow: "0 8px 32px rgba(80, 80, 180, 0.15)" },
              }}
            >
              <DialogTitle className="font-bold text-indigo-700">Add New {dialogField?.toUpperCase()}</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  autoFocus
                  label="New Value"
                  value={dialogValue}
                  onChange={(e) => setDialogValue(e.target.value)}
                  sx={{ mt: 1 }}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setDialogOpen(false)
                    if (dialogField) {
                      setInputValues((prev) => ({ ...prev, [dialogField]: "" }))
                    }
                  }}
                  variant="outlined"
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDialogAdd}
                  variant="contained"
                  disabled={!dialogValue.trim()}
                  sx={{
                    background: "linear-gradient(to right, #6366f1, #a21caf)",
                  }}
                >
                  Add
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
