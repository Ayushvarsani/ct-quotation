/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useRef, useState, useEffect, useCallback } from "react"
import type { Product, ProductGroup, FormData, ProductPricing } from "@/components/types/quotation"
import {
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
  Box,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material"
import { Share, Visibility } from "@mui/icons-material"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import axios from "axios"


const getProductValue = (
  product: Product,
  columnKey: string,
  index?: number,
  productPricing?: ProductPricing
): string => {
  switch (columnKey) {
    case "srNo":
      return index !== undefined ? (index + 1).toString() : ""
    case "sizeCategory":
      return `${product.product_size} - ${product.product_category}`
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

const QuotationPage: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [isClient, setIsClient] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  
  const [columns, setColumns] = useState<any[]>([])
  const [formData, setFormData] = useState<FormData>({
    Name: "",
    mobile: "",
    refParty: "",
    seName: "",
    paymentWithDays: "",
    tax: "",
    remark: "",
  })
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [productPricing, setProductPricing] = useState<ProductPricing>({})

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const userStr = localStorage.getItem("user")
        const user = userStr ? JSON.parse(userStr) : null
        const company_uuid = user?.companyuuid
        const token = localStorage.getItem("token")
        if (!company_uuid || !token) {
          setProductGroups([])
          return
        }
        const res = await axios.get("/api/protected/create-product", {
          params: { company_uuid },
          headers: {
            'x-auth-token': `Bearer ${token}`
          }
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
        // Convert to array of groups for your UI
        const productGroups: ProductGroup[] = Object.entries(grouped).map(([name, products]) => ({
          name,
          products: products as Product[],
        }))
        setProductGroups(productGroups)
      } catch (err) {
        console.error("Failed to fetch products", err)
        setProductGroups([])
      }
    }
    fetchProducts()
  }, [])

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Set dynamic columns from localStorage
  useEffect(() => {
    const gradeFieldsStr = typeof window !== 'undefined' ? localStorage.getItem("quotation_grade_fields") : null;
    const productFieldsStr = typeof window !== 'undefined' ? localStorage.getItem("quotation_product_fields") : null;
    let gradeFields: any = {};
    let productFields: any = {};
    if (gradeFieldsStr) gradeFields = JSON.parse(gradeFieldsStr);
    if (productFieldsStr) productFields = JSON.parse(productFieldsStr);
    const dynamicColumns = [
      { key: "srNo", label: "Sr. No.", visible: true },
      ...(productFields.product_size ? [{ key: "sizeCategory", label: productFields.product_size + "-" + productFields.product_category, visible: true }] : []),
      ...(productFields.product_series ? [{ key: "series", label: productFields.product_series, visible: true }] : []),
      ...(productFields.product_finish ? [{ key: "finish", label: productFields.product_finish, visible: true }] : []),
      ...(productFields.product_pieces_per_box ? [{ key: "packing", label: productFields.product_pieces_per_box, visible: true }] : []),
      ...(productFields.product_sq_ft_box ? [{ key: "sqFt", label: productFields.product_sq_ft_box, visible: true }] : []),
      ...(productFields.product_weight ? [{ key: "weight", label: productFields.product_weight, visible: true }] : []),
      ...(gradeFields.com_grade ? [{ key: "com", label: 'Com', visible: true }] : []),
      ...(gradeFields.eco_grade ? [{ key: "eco", label: 'Eco', visible: true }] : []),
      ...(gradeFields.pre_grade ? [{ key: "premium", label: 'Prem.', visible: true }] : []),
      ...(gradeFields.std_grade ? [{ key: "standard", label: 'Std', visible: true }] : []),
    ];
    setColumns(dynamicColumns)
  }, [])

  
  const handleInputChange = useCallback((field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }, [])

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
    []
  )

  
  const handleShare = useCallback(() => {
    console.log("Share functionality")
  }, [])

  
  const generateModernPDF = useCallback(() => {
    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.width
    let yPosition = 15

    // Professional colors
    const headerColor: [number, number, number] = [52, 73, 94]
    const borderColor: [number, number, number] = [180, 180, 180]
    const textColor: [number, number, number] = [0, 0, 0]

    // Get only visible columns
    const visibleColumns = columns.filter((col) => col.visible)

    // Compact Header
    doc.setFontSize(19)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2])
    doc.text("PRICE QUOTATION", 20, yPosition)

    // Date and time on the right
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(80, 80, 80)
    const dateStr = new Date().toLocaleDateString("en-GB")
    const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    const dateTimeText = `${dateStr} | ${timeStr}`
    const dateTimeWidth = doc.getTextWidth(dateTimeText)
    doc.text(dateTimeText, pageWidth - dateTimeWidth - 20, yPosition)

    // Thin line under header
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
    doc.setLineWidth(0.3)
    doc.line(20, yPosition + 3, pageWidth - 20, yPosition + 3)

    yPosition += 12

    // Compact Customer Information
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("CUSTOMER DETAILS", 20, yPosition)
    yPosition += 6

    // Customer info in compact format
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    const customerDetails = [
      { label: "Name:", value: formData.Name || "________________" },
      { label: "Mobile:", value: formData.mobile || "________________" },
      { label: "Ref. Party:", value: formData.refParty || "________________" },
      { label: "SE Name:", value: formData.seName || "________________" },
    ]
    customerDetails.forEach((detail, index) => {
      const xPos = index % 2 === 0 ? 20 : pageWidth / 2 + 10
      const yPos = yPosition + Math.floor(index / 2) * 6.5
      doc.setFont("helvetica", "bold")
      doc.text(detail.label, xPos, yPos)
      doc.setFont("helvetica", "normal")
      doc.text(detail.value, xPos + doc.getTextWidth(detail.label) + 2, yPos)
    })
    yPosition += 15

    // Calculate dynamic column widths based on visible columns
    const totalTableWidth = pageWidth - 40
    const getColumnWidth = (columnKey: string, length: number) => {
      if (length === 0) return 20 
      const baseWidths: { [key: string]: number } = {
        srNo: 15,
        sizeCategory: 60,
        packing: 20,
        sqFt: 18,
        weight: 18,
        series: 18,
        finish: 18,
        com: 20,
        eco: 20,
        premium: 20,
        standard: 20,
      }
      const baseWidth = baseWidths[columnKey] || 20
      const totalBaseWidth = visibleColumns.reduce((sum, col) => sum + (baseWidths[col.key] || 20), 0)
      return (baseWidth / totalBaseWidth) * totalTableWidth
    }

    // Dynamic Product sections with minimal spacing
    productGroups.forEach((group, groupIndex) => {
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text(group.name, 20, yPosition)
      yPosition += 5
      const tableHeaders = visibleColumns.map((col) => col.label)
      const tableData = group.products.map((product, idx) => {
        return visibleColumns.map((col) => getProductValue(product, col.key, idx, productPricing))
      })
      const columnStyles: { [key: number]: any } = {}
      visibleColumns.forEach((col, index) => {
        columnStyles[index] = {
          cellWidth: getColumnWidth(col.key, visibleColumns.length),
          halign: col.key === "sizeCategory" ? "left" : "center",
        }
      })
      autoTable(doc, {
        startY: yPosition,
        head: [tableHeaders],
        body: tableData,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: borderColor as [number, number, number],
          lineWidth: 0.2,
          textColor: textColor as [number, number, number],
          overflow: "linebreak",
        },
        headStyles: {
          fillColor: [248, 248, 248] as [number, number, number],
          textColor: textColor as [number, number, number],
          fontStyle: "bold",
          fontSize: 9,
          halign: "center",
        },
        columnStyles: columnStyles,
        margin: { left: 20, right: 20 },
        tableLineColor: borderColor as [number, number, number],
        tableLineWidth: 0.2,
        tableWidth: "auto",
      })
      yPosition = (doc as any).lastAutoTable.finalY + (groupIndex < productGroups.length - 1 ? 8 : 12)
    })

    // Compact Terms and Conditions
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text("TERMS & CONDITIONS", 20, yPosition)
    yPosition += 6
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    const terms = [
      `1. Taxes: ${formData.tax || "As applicable"}`,
      `2. Payment: Within ${formData.paymentWithDays || "___"} days from billing date`,
      `3. ${formData.remark || "Additional terms as discussed"}`,
    ]
    terms.forEach((term) => {
      if (
        term.trim() !== "1. Taxes: " &&
        term.trim() !== "2. Payment: Within  days from billing date" &&
        term.trim() !== "3. "
      ) {
        doc.text(term, 25, yPosition)
        yPosition += 5
      }
    })
    yPosition += 8

    // Get user info from localStorage
    const userStr = localStorage.getItem("user");
    let generatedBy = "";
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name || user.usermobile) {
          generatedBy = `PDF generated by: ${user.name} (${user.usermobile})`;
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    // Add the generated by line at the bottom of the PDF
    if (generatedBy) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      // Place it near the bottom of the page
      doc.text(generatedBy, 20, doc.internal.pageSize.height - 10);
    }

    const pdfBlob = doc.output("blob")
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, "_blank")
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl)
    }, 1000)
  }, [columns, formData, productGroups, productPricing])

  
  const handlePreview = useCallback(() => {
    generateModernPDF()
  }, [generateModernPDF])

  
  const renderMobileProductGroup = useCallback((group: ProductGroup) => (
    <Box>
      {group.products.map((product, idx) => (
        <Paper key={product.id} sx={{ p: 2, mb: 2, boxShadow: 2, borderRadius: 2 }}>
          {/* Always show size-category at the top if enabled */}
          {columns.find(col => col.key === "sizeCategory" && col.visible) && (
            <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
              {product.product_size} - {product.product_category}
            </Typography>
          )}
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2} sx={{ mb: 1 }}>
            {columns.filter(col => col.key !== "sizeCategory" && !["premium", "standard", "com", "eco"].includes(col.key) && col.visible).map((col) => (
              <Grid size={{ xs: 6 }} key={col.key}>
                <Typography variant="body2">
                  <strong>{col.label}:</strong> {getProductValue(product, col.key, idx, productPricing)}
                </Typography>
              </Grid>
            ))}
          </Grid>
          {/* Pricing fields (editable) */}
          <Grid container spacing={2} sx={{ mb: 1 }}>
            {columns.filter(col => ["premium", "standard", "com", "eco"].includes(col.key) && col.visible).map((col) => (
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
  ), [columns, productPricing, handlePricingChange])

  
  const renderDesktopProductGroup = useCallback((group: ProductGroup) => (
    <TableContainer component={Paper} sx={{ mb: 3, overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: { xs: 700, sm: "auto" } }}>
        <TableHead>
          <TableRow sx={{ bgcolor: "#f5f5f5" }}>
            {columns.filter(col => col.visible).map((col) => (
              <TableCell
                key={col.key}
                sx={{ fontWeight: "bold", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {group.products.map((product, idx) => (
            <TableRow key={product.id} hover>
              {columns.filter(col => col.visible).map((col) => {
                switch (col.key) {
                  case "srNo":
                  case "sizeCategory":
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
  ), [columns, productPricing, handlePricingChange])

  
  return (
    <Box ref={printRef} sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2 } }}>
      <Card sx={{ maxWidth: 1200, mx: "auto", boxShadow: 3 }}>
        <CardHeader
          title={
            <Typography variant={isMobile ? "h5" : "h4"} component="h1" sx={{ fontWeight: "bold", color: "#1976d2" }}>
              Price List
            </Typography>
          }
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="h6" >
                {`${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
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
                  sx={{ minWidth: { sm: 120 }, fontWeight: 500, fontSize: { xs: "0.9rem", sm: "1rem" }, mb: { xs: 1, sm: 0 } }}
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
                  sx={{ minWidth: { sm: 120 }, fontWeight: 500, fontSize: { xs: "0.9rem", sm: "1rem" }, mb: { xs: 1, sm: 0 } }}
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
                  sx={{ minWidth: { sm: 120 }, fontWeight: 500, fontSize: { xs: "0.9rem", sm: "1rem" }, mb: { xs: 1, sm: 0 } }}
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
                  sx={{ minWidth: { sm: 120 }, fontWeight: 500, fontSize: { xs: "0.9rem", sm: "1rem" }, mb: { xs: 1, sm: 0 } }}
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
          {productGroups.map((group, groupIndex) => (
            <Box key={groupIndex} sx={{ mb: 4 }}>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: "bold", mb: 2, color: "#333" }}>
                {group.name}
              </Typography>
              {isClient && isMobile
                ? renderMobileProductGroup(group)
                : renderDesktopProductGroup(group)}
            </Box>
          ))}
          {/* Note Section */}
          <Box sx={{ mt: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
              Note :-
            </Typography>
            <Box component="ol" sx={{ pl: { xs: 2, sm: 3 }, "& li": { mb: { xs: 2, sm: 1 } } }}>
              <Box component="li">
                <Box sx={{ display: { xs: "block", sm: "flex" }, alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, mb: { xs: 1, sm: 0 } }}>Taxes</Typography>
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
                <Box sx={{ display: { xs: "block", sm: "flex" }, alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                  <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1rem" }, mr: { sm: 1 }, mb: { xs: 1, sm: 0 } }}>
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
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "flex-end", gap: { xs: 2, sm: 2 }, mt: 4 }}>
            {isClient &&
              (isMobile ? (
                <>
                  <IconButton onClick={handleShare} sx={{ border: "1px solid #1976d2", borderRadius: 2, p: 2, "&:hover": { bgcolor: "#f5f5f5" } }}>
                    <Share sx={{ mr: 1 }} />
                    <Typography variant="body2">Share</Typography>
                  </IconButton>
                  <IconButton onClick={handlePreview} sx={{ bgcolor: "#1976d2", color: "white", borderRadius: 2, p: 2, "&:hover": { bgcolor: "#1565c0" } }}>
                    <Visibility sx={{ mr: 1 }} />
                    <Typography variant="body2">Preview</Typography>
                  </IconButton>
                </>
              ) : (
                <>
                  <Button variant="outlined" startIcon={<Share />} onClick={handleShare} sx={{ px: 3 }}>
                    Share
                  </Button>
                  <Button variant="contained" startIcon={<Visibility />} onClick={handlePreview} sx={{ px: 3 }}>
                    Preview
                  </Button>
                </>
              ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default QuotationPage
