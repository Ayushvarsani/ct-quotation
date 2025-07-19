/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import type React from "react"
import { useState, useEffect, useCallback } from "react"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Grid,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@mui/material"
import { Visibility} from "@mui/icons-material"
import axios from "axios"
import type {
  Product,
  ProductGroup,
  FormData,
  ProductPricing,
  Column,
  User,
  GradeFields,
  ProductFields,
} from "@/components/types/quotation"
import * as yup from "yup"

interface DynamicQuotationFormProps {
  onPreview: (
    formData: FormData,
    productPricing: ProductPricing,
    productGroups: ProductGroup[],
    columns: Column[],
  ) => void
  onShare?: (formData: FormData, productPricing: ProductPricing) => void
}

const getProductValue = (
  product: Product,
  columnKey: string,
  index?: number,
  productPricing?: ProductPricing,
): string => {
  switch (columnKey) {
    case "srNo":
      return index !== undefined ? (index + 1).toString() : ""
    case "size":
      return product.product_size || ""
    case "category":
      return product.product_category || ""
    case "pcsperbox":
      return product.product_pieces_per_box?.toString() || ""
    case "sqFt":
      return product.product_sq_ft_box?.toString() || ""
    case "weight":
      return product.product_weight?.toString() || ""
    case "series":
      return product.product_series || ""
    case "finish":
      return product.product_finish || ""
    case "com":
      return productPricing?.[product.id]?.com || ""
    case "eco":
      return productPricing?.[product.id]?.eco || ""
    case "premium":
      return productPricing?.[product.id]?.premium || ""
    case "standard":
      return productPricing?.[product.id]?.standard || ""
    default:
      return ""
  }
}

const DynamicQuotationForm: React.FC<DynamicQuotationFormProps> = ({ onPreview}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  // Dynamic state
  const [columns, setColumns] = useState<Column[]>([])
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [productPricing, setProductPricing] = useState<ProductPricing>({})
  const [formData, setFormData] = useState<FormData>({
    Name: "",
    mobile: "",
    refParty: "",
    seName: "",
    paymentWithDays: "",
    tax: "",
    remark: "",
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Load formData and productPricing from localStorage on mount
  useEffect(() => {
    if (isClient) {
      const savedFormData = localStorage.getItem("quotation_form_data")
      const savedProductPricing = localStorage.getItem("quotation_product_pricing")
      if (savedFormData) setFormData(JSON.parse(savedFormData))
      if (savedProductPricing) setProductPricing(JSON.parse(savedProductPricing))
    }
  }, [isClient])

  // Save formData and productPricing to localStorage on change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("quotation_form_data", JSON.stringify(formData))
      localStorage.setItem("quotation_product_pricing", JSON.stringify(productPricing))
    }
  }, [formData, productPricing, isClient])

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const userStr = localStorage.getItem("user")
        const user: User | null = userStr ? JSON.parse(userStr) : null
        const company_uuid = user?.companyuuid
        const token = localStorage.getItem("token")

        if (!company_uuid || !token) {
          setProductGroups([])
          setIsLoading(false)
          return
        }

        const res = await axios.get("/api/protected/create-product", {
          params: { company_uuid },
          headers: {
            "x-auth-token": `Bearer ${token}`,
          },
        })

        const products: Product[] = Array.isArray(res.data?.data) ? res.data.data : []

        // Group by product_name
        const grouped = products.reduce((acc: Record<string, Product[]>, product: Product) => {
          const groupKey = product.product_name || "Other"
          if (!acc[groupKey]) {
            acc[groupKey] = []
          }
          acc[groupKey].push(product)
          return acc
        }, {})

        // Convert to array of groups
        const productGroups: ProductGroup[] = Object.entries(grouped).map(([name, products]) => ({
          name,
          products: products as Product[],
        }))

        setProductGroups(productGroups)
      } catch (err) {
        console.error("Failed to fetch products", err)
        setProductGroups([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Set dynamic columns from localStorage
  useEffect(() => {
    if (!isClient) return

    const gradeFieldsStr = localStorage.getItem("quotation_grade_fields")
    const productFieldsStr = localStorage.getItem("quotation_product_fields")

    let gradeFields: GradeFields = {}
    let productFields: ProductFields = {}

    if (gradeFieldsStr) gradeFields = JSON.parse(gradeFieldsStr)
    if (productFieldsStr) productFields = JSON.parse(productFieldsStr)

    const dynamicColumns: Column[] = [
      { key: "srNo", label: "Sr. No.", visible: true },
      ...(productFields.product_size ? [{ key: "size", label: productFields.product_size, visible: true }] : []),
      
      ...(productFields.product_series ? [{ key: "series", label: productFields.product_series, visible: true }] : []),
      ...(productFields.product_category
        ? [{ key: "category", label: productFields.product_category, visible: true }]
        : []),
      ...(productFields.product_finish ? [{ key: "finish", label: productFields.product_finish, visible: true }] : []),
      ...(productFields.product_pieces_per_box
        ? [{ key: "pcsperbox", label: productFields.product_pieces_per_box, visible: true }]
        : []),
      ...(productFields.product_sq_ft_box
        ? [{ key: "sqFt", label: productFields.product_sq_ft_box, visible: true }]
        : []),
      ...(productFields.product_weight ? [{ key: "weight", label: productFields.product_weight, visible: true }] : []),
      ...(gradeFields.pre_grade ? [{ key: "premium", label: "Prem.", visible: true }] : []),
      ...(gradeFields.std_grade ? [{ key: "standard", label: "Std", visible: true }] : []),
      ...(gradeFields.com_grade ? [{ key: "com", label: "Com", visible: true }] : []),
      ...(gradeFields.eco_grade ? [{ key: "eco", label: "Eco", visible: true }] : []),
    ]

    setColumns(dynamicColumns)
  }, [isClient])

  const handleInputChange = useCallback(
    (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }))
    },
    [],
  )

  const handlePricingChange = useCallback(
    (productId: number, field: keyof ProductPricing[number]) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setProductPricing((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [field]: event.target.value,
        },
      }))
    },
    [],
  )

  const validationSchema = yup.object().shape({
    Name: yup.string().required("Name is required"),
    mobile: yup
      .string()
      .required("Mobile number is required")
      .matches(/^\d{10}$/, "Please enter a valid 10-digit mobile number"),
    refParty: yup.string(),
    seName: yup.string(),
    paymentWithDays: yup.string(),
    tax: yup.string(),
    remark: yup.string(),
  })

  const handlePreview = useCallback(async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false })
      setErrors({})
    } catch (err: any) {
      if (err.inner) {
        const newErrors: { [key: string]: string } = {}
        err.inner.forEach((validationError: any) => {
          newErrors[validationError.path] = validationError.message
        })
        setErrors(newErrors)
        if (newErrors.mobile) {
          const mobileInput = document.getElementById("quotation-mobileNumber")
          if (mobileInput) mobileInput.focus()
        } else if (newErrors.Name) {
          const nameInput = document.getElementById("quotation-Name")
          if (nameInput) nameInput.focus()
        }
      return
      }
    }
    setIsGenerating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onPreview(formData, productPricing, productGroups, columns)
    } catch (error) {
      console.error("Error preparing preview:", error)
      alert("Failed to prepare preview")
    } finally {
      setIsGenerating(false)
    }
  }, [formData, productPricing, productGroups, columns, onPreview,validationSchema])

  const renderMobileProductGroup = useCallback(
    (group: ProductGroup) => (
      <Box>
        {group.products.map((product, idx) => (
          <Paper key={product.id} sx={{ p: 2, mb: 2, boxShadow: 2, borderRadius: 2 }}>
            <Box sx={{ display: "flex",justifyContent: "space-between", gap: 1, mb: 1, flexWrap: "wrap" }}>
              {columns.find((col) => col.key === "size" && col.visible) && (
                <Typography variant="body1" >
                  <strong>{columns.find((col) => col.key === "size")?.label}:</strong> {product.product_size}
                </Typography>
              )}
              {columns.find((col) => col.key === "series" && col.visible) && (
                <Typography variant="body1" >
                  <strong>{columns.find((col) => col.key === "series")?.label}:</strong> {product.product_series}
                </Typography>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} sx={{ mb: 1 }}>
              {columns
                .filter(
                  (col) =>
                    col.key !== "size" &&
                    col.key !== "series" &&
                    !["premium", "standard", "com", "eco"].includes(col.key) &&
                    col.visible,
                )
                .map((col) => (
                  <Grid size={{ xs: 6 }} key={col.key}>
                    <Typography variant="body2">
                      <strong>{col.label}:</strong> {getProductValue(product, col.key, idx, productPricing)}
                    </Typography>
                  </Grid>
                ))}
            </Grid>
            {/* Pricing fields (editable) */}
            <Grid container spacing={2} sx={{ mb: 1 }}>
              {columns
                .filter((col) => ["premium", "standard", "com", "eco"].includes(col.key) && col.visible)
                .map((col) => (
                  <Grid size={{ xs: 6 }} key={col.key}>
                    <TextField
                      fullWidth
                      size="small"
                      variant="outlined"
                      label={col.label}
                      value={productPricing[product.id]?.[col.key as keyof ProductPricing[number]] || ""}
                      onChange={handlePricingChange(product.id, col.key as any)}
                    />
                  </Grid>
                ))}
            </Grid>
          </Paper>
        ))}
      </Box>
    ),
    [columns, productPricing, handlePricingChange],
  )

  const renderDesktopProductGroup = useCallback(
    (group: ProductGroup) => (
      <TableContainer component={Paper} sx={{ mb: 3, overflowX: "auto" }}>
        <Table size="small" sx={{ minWidth: { xs: 700, sm: "auto" } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              {columns
                .filter((col) => col.visible)
                .map((col) => (
                  <TableCell key={col.key} sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    {col.label}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {group.products.map((product, idx) => (
              <TableRow key={product.id} hover>
                {columns
                  .filter((col) => col.visible)
                  .map((col) => {
                    switch (col.key) {
                      case "srNo":
                      case "size":
                      case "category":
                      case "pcsperbox":
                      case "sqFt":
                      case "weight":
                      case "series":
                      case "finish":
                        return (
                          <TableCell key={col.key} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                            {getProductValue(product, col.key, col.key === "srNo" ? idx : undefined, productPricing)}
                          </TableCell>
                        )
                      case "premium":
                      case "standard":
                      case "com":
                      case "eco":
                        return (
                          <TableCell key={col.key}>
                            <TextField
                              size="small"
                              variant="outlined"
                              placeholder={col.label}
                              value={productPricing[product.id]?.[col.key as keyof ProductPricing[number]] || ""}
                              onChange={handlePricingChange(product.id, col.key as any)}
                              sx={{ width: { xs: 80, sm: 85 } }}
                            />
                          </TableCell>
                        )
                      default:
                        return null
                    }
                  })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ),
    [columns, productPricing, handlePricingChange],
  )

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <CircularProgress size={40} />
        <Typography sx={{ ml: 2 }}>Loading Quotation...</Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        py: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
      }}
    >
      <Card sx={{ maxWidth: 1200, mx: "auto", boxShadow: 3 }}>
        <CardHeader
          title={
            <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              Price List
            </Typography>
          }
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6">
                {`${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
              </Typography>
            </Box>
          }
        />
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {/* Customer Details Form */}
          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  display: { xs: "block", sm: "flex" },
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    minWidth: { sm: 120 },
                    fontWeight: 500,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    mb: { xs: 1, sm: 0 },
                  }}
                >
                  Name :
                </Typography>
                <TextField
                  id="quotation-Name"
                  fullWidth
                  required
                  label=""
                  placeholder="Enter customer name"
                  value={formData.Name}
                  onChange={handleInputChange("Name")}
                  variant="outlined"
                  size="small"
                  error={!!errors.Name}
                  helperText={errors.Name}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  display: { xs: "block", sm: "flex" },
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    minWidth: { sm: 120 },
                    fontWeight: 500,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    mb: { xs: 1, sm: 0 },
                  }}
                >
                  Mobile :
                </Typography>
                <TextField
                  id="quotation-mobileNumber"
                  fullWidth
                  required
                  label=""
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange("mobile")}
                  variant="outlined"
                  size="small"
                  error={!!errors.mobile}
                  helperText={errors.mobile}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  display: { xs: "block", sm: "flex" },
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    minWidth: { sm: 120 },
                    fontWeight: 500,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    mb: { xs: 1, sm: 0 },
                  }}
                >
                  Ref Party :
                </Typography>
                <TextField
                  fullWidth
                  label=""
                  placeholder="Enter reference party"
                  value={formData.refParty}
                  onChange={handleInputChange("refParty")}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  display: { xs: "block", sm: "flex" },
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    minWidth: { sm: 120 },
                    fontWeight: 500,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    mb: { xs: 1, sm: 0 },
                  }}
                >
                  SE Name :
                </Typography>
                <TextField
                  fullWidth
                  label=""
                  placeholder="Enter SE name"
                  value={formData.seName}
                  onChange={handleInputChange("seName")}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Product Tables */}
          {productGroups.length === 0 ? (
            <Card sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                No products found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Please add products to your inventory first.
              </Typography>
            </Card>
          ) : (
            productGroups.map((group, groupIndex) => (
              <Box key={groupIndex} sx={{ mb: 4 }}>
                <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: "bold", mb: 2, color: "#333" }}>
                  {group.name}
                </Typography>
                {isClient && isMobile ? renderMobileProductGroup(group) : renderDesktopProductGroup(group)}
              </Box>
            ))
          )}

          {/* Note Section */}
          <Box sx={{ mt: 4, mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 2,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Note :-
            </Typography>
            <Box component="ol" sx={{ pl: { xs: 2, sm: 3 }, "& li": { mb: { xs: 2, sm: 1 } } }}>
              <Box component="li">
                <Box
                  sx={{
                    display: { xs: "flex", sm: "flex" },
                    alignItems: "center",
                    gap: 1.5,
                    px: 0,
                    py: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1.05rem" },
                      fontWeight: 500,
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    Taxes
                  </Typography>
                  <TextField
                    size="small"
                    variant="outlined"
                    sx={{ width: { xs: "100%", sm: 180 } }}
                    placeholder="Enter tax details"
                    required
                    value={formData.tax}
                    onChange={handleInputChange("tax")}
                  />
                </Box>
              </Box>
              <Box component="li">
                <Box
                  sx={{
                    display: { xs: "flex", sm: "flex" },
                    alignItems: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                    px: 0,
                    py: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.95rem", sm: "1.05rem" },
                      fontWeight: 500,
                      mr: { sm: 1 },
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    Payment within
                  </Typography>
                  <TextField
                    size="small"
                    variant="outlined"
                    sx={{ width: { xs: "100%", sm: 100 }, mr: { sm: 1 } }}
                    placeholder="Days"
                    required
                    value={formData.paymentWithDays}
                    onChange={handleInputChange("paymentWithDays")}
                  />
                  <Typography sx={{ fontSize: { xs: "0.95rem", sm: "1.05rem" } }}>from date of billing</Typography>
                </Box>
              </Box>
              <Box component="li">
                <TextField
                  size="small"
                  variant="outlined"
                  fullWidth
                  multiline
                  minRows={2}
                  maxRows={2}
                  placeholder="Additional notes"
                  sx={{ maxWidth: { xs: "100%", sm: 400, md: 600 } }}
                  value={formData.remark}
                  onChange={handleInputChange("remark")}
                />
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "flex-end",
              gap: { xs: 2, sm: 2 },
              mt: 4,
            }}
          >
            {isClient &&
              (isMobile ? (
                <>
                  <IconButton
                    onClick={handlePreview}
                    disabled={isGenerating || productGroups.length === 0}
                    sx={{
                      bgcolor: "#1976d2",
                      color: "white",
                      borderRadius: 2,
                      p: 1,
                      "&:hover": { bgcolor: "#1565c0" },
                    }}
                  >
                    {isGenerating ? <CircularProgress size={20} color="inherit" /> : <Visibility sx={{ mr: 1 }} />}
                    <Typography variant="body2">{isGenerating ? "Preparing..." : "Preview"}</Typography>
                  </IconButton>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      localStorage.removeItem("quotation_form_data");
                      localStorage.removeItem("quotation_product_pricing");
                      setFormData({
                        Name: "",
                        mobile: "",
                        refParty: "",
                        seName: "",
                        paymentWithDays: "",
                        tax: "",
                        remark: "",
                      });
                      setProductPricing({});
                    }}
                    disabled={isGenerating}
                  >
                    Clear Data
                  </Button>
                </>
              ) : (
                <>
                 <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                      localStorage.removeItem("quotation_form_data");
                      localStorage.removeItem("quotation_product_pricing");
                      setFormData({
                        Name: "",
                        mobile: "",
                        refParty: "",
                        seName: "",
                        paymentWithDays: "",
                        tax: "",
                        remark: "",
                      });
                      setProductPricing({});
                    }}
                    disabled={isGenerating}
                    sx={{ px: 3 }}
                  >
                    Clear Data
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <Visibility />}
                    onClick={handlePreview}
                    disabled={isGenerating || productGroups.length === 0}
                    sx={{ px: 3 }}
                  >
                    {isGenerating ? "Preparing..." : "Preview"}
                  </Button>
                 
                </>
              ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default DynamicQuotationForm
