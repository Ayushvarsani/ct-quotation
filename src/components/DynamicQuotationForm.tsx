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
import { Visibility, Share } from "@mui/icons-material"
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
    case "packing":
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

const DynamicQuotationForm: React.FC<DynamicQuotationFormProps> = ({ onPreview, onShare }) => {
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

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true)
  }, [])

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
      ...(productFields.product_category
        ? [{ key: "category", label: productFields.product_category, visible: true }]
        : []),
      ...(productFields.product_series ? [{ key: "series", label: productFields.product_series, visible: true }] : []),
      ...(productFields.product_finish ? [{ key: "finish", label: productFields.product_finish, visible: true }] : []),
      ...(productFields.product_pieces_per_box
        ? [{ key: "packing", label: productFields.product_pieces_per_box, visible: true }]
        : []),
      ...(productFields.product_sq_ft_box
        ? [{ key: "sqFt", label: productFields.product_sq_ft_box, visible: true }]
        : []),
      ...(productFields.product_weight ? [{ key: "weight", label: productFields.product_weight, visible: true }] : []),
      ...(gradeFields.com_grade ? [{ key: "com", label: "Com", visible: true }] : []),
      ...(gradeFields.eco_grade ? [{ key: "eco", label: "Eco", visible: true }] : []),
      ...(gradeFields.pre_grade ? [{ key: "premium", label: "Prem.", visible: true }] : []),
      ...(gradeFields.std_grade ? [{ key: "standard", label: "Std", visible: true }] : []),
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

  const handlePreview = useCallback(async () => {
    if (!formData.Name.trim() || !formData.mobile.trim()) {
      alert("Please fill in customer name and mobile number")
      return
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
  }, [formData, productPricing, productGroups, columns, onPreview])

  const handleShare = useCallback(() => {
    if (onShare) {
      onShare(formData, productPricing)
    } else {
      alert("Share functionality - This would open share options")
    }
  }, [formData, productPricing, onShare])

  const renderMobileProductGroup = useCallback(
    (group: ProductGroup) => (
      <Box>
        {group.products.map((product, idx) => (
          <Paper key={product.id} sx={{ p: 2, mb: 2, boxShadow: 2, borderRadius: 2 }}>
            {/* Always show size-category at the top if enabled */}
            {columns.find((col) => col.key === "size" && col.visible) && (
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                {product.product_size}
              </Typography>
            )}
            {columns.find((col) => col.key === "category" && col.visible) && (
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                {product.product_category}
              </Typography>
            )}
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} sx={{ mb: 1 }}>
              {columns
                .filter(
                  (col) =>
                    col.key !== "size" &&
                    col.key !== "category" &&
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
                      case "packing":
                      case "sqFt":
                      case "weight":
                      case "series":
                      case "finish":
                        return (
                          <TableCell key={col.key} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                            {getProductValue(product, col.key, col.key === "srNo" ? idx : undefined, productPricing)}
                          </TableCell>
                        )
                      case "com":
                      case "eco":
                      case "premium":
                      case "standard":
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
        <Typography sx={{ ml: 2 }}>Loading products...</Typography>
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
                  fullWidth
                  required
                  label=""
                  placeholder="Enter customer name"
                  value={formData.Name}
                  onChange={handleInputChange("Name")}
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
                  Mobile :
                </Typography>
                <TextField
                  fullWidth
                  required
                  label=""
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange("mobile")}
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
                    display: { xs: "block", sm: "flex" },
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    Taxes
                  </Typography>
                  <TextField
                    size="small"
                    variant="standard"
                    sx={{ width: { xs: "100%", sm: 150 } }}
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
                    display: { xs: "block", sm: "flex" },
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      mr: { sm: 1 },
                      mb: { xs: 1, sm: 0 },
                    }}
                  >
                    Payment within
                  </Typography>
                  <TextField
                    size="small"
                    variant="standard"
                    sx={{ width: { xs: "100%", sm: 100 }, mr: { sm: 1 } }}
                    placeholder="Days"
                    required
                    value={formData.paymentWithDays}
                    onChange={handleInputChange("paymentWithDays")}
                  />
                  <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>from date of billing</Typography>
                </Box>
              </Box>
              <Box component="li">
                <TextField
                  size="small"
                  variant="standard"
                  fullWidth
                  placeholder="Additional notes"
                  sx={{ maxWidth: { xs: "100%", sm: 400 } }}
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
                    onClick={handleShare}
                    disabled={isGenerating}
                    sx={{
                      border: "1px solid #1976d2",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <Share sx={{ mr: 1 }} />
                    <Typography variant="body2">Share</Typography>
                  </IconButton>
                  <IconButton
                    onClick={handlePreview}
                    disabled={isGenerating || productGroups.length === 0}
                    sx={{
                      bgcolor: "#1976d2",
                      color: "white",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": { bgcolor: "#1565c0" },
                    }}
                  >
                    {isGenerating ? <CircularProgress size={20} color="inherit" /> : <Visibility sx={{ mr: 1 }} />}
                    <Typography variant="body2">{isGenerating ? "Preparing..." : "Preview"}</Typography>
                  </IconButton>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={handleShare}
                    disabled={isGenerating}
                    sx={{ px: 3 }}
                  >
                    Share
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
