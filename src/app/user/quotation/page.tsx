"use client"

import React, { useRef } from "react"
import { useState, useEffect } from "react"
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

// Mock data structure
interface Product {
  id: number
  srNo: number
  size: string
  category: string
  packing: string
  sqFt: number
  weight: number
}

interface ProductGroup {
  name: string
  products: Product[]
}

// Mock API data
const mockProductData: ProductGroup[] = [
  {
    name: "PGVT/GVT TILES",
    products: [
      { id: 1, srNo: 1, size: "600X600", category: "GVT/PGVT", packing: "4 Pcs", sqFt: 15.5, weight: 26 },
      { id: 2, srNo: 2, size: "600X600", category: "Lapato/Carving/Rocker", packing: "4 Pcs", sqFt: 15.5, weight: 26 },
      { id: 3, srNo: 3, size: "600x600", category: "Parking Tiles (12mm)", packing: "3 Pcs", sqFt: 11.6, weight: 29.5 },
      { id: 4, srNo: 4, size: "300x600", category: "Parking Tiles", packing: "4 Pcs", sqFt: 7.75, weight: 20 },
      { id: 5, srNo: 5, size: "300x300", category: "Parking Tiles", packing: "7 Pcs", sqFt: 6.78, weight: 17.5 },
      { id: 6, srNo: 6, size: "600X1200", category: "GVT/PGVT", packing: "2 Pcs", sqFt: 15.5, weight: 28 },
      { id: 7, srNo: 7, size: "600X1200", category: "Punch", packing: "2 Pcs", sqFt: 15.5, weight: 28 },
      { id: 8, srNo: 8, size: "600X1200", category: "Lapato/Carving/Rocker", packing: "2 Pcs", sqFt: 15.5, weight: 28 },
    ],
  },
  {
    name: "Wall Tiles",
    products: [
      { id: 9, srNo: 16, size: "300x300", category: "Floor Tiles", packing: "8 Pcs", sqFt: 7.75, weight: 9.1 },
      { id: 10, srNo: 17, size: "300x450", category: "Wall Tiles", packing: "6 Pcs", sqFt: 8.72, weight: 11 },
      { id: 11, srNo: 18, size: "300X600", category: "Wall Tiles", packing: "5 Pcs", sqFt: 9.68, weight: 14 },
      {
        id: 12,
        srNo: 19,
        size: "300X600",
        category: "High Depth Elevation",
        packing: "4 Pcs",
        sqFt: 7.75,
        weight: 11.7,
      },
    ],
  },
]

interface FormData {
  Name: string
  mobile: string
  refParty: string
  seName: string
  paymentWithDays: string
  tax: string
  remark: string
}

interface ProductPricing {
  [key: number]: {
    premium: string
    standard: string
    price: string
  }
}

// Columns config for dynamic rendering
const columns = [
  { key: "srNo", label: "Sr. No.", visible: true },
  { key: "sizeCategory", label: "Size - Category name", visible: true },
  { key: "packing", label: "Pcs / Box", visible: true },
  { key: "sqFt", label: "Sq.ft", visible: true },
  { key: "weight", label: "Weight", visible: true },
  { key: "premium", label: "Prem.", visible: true },
  { key: "standard", label: "Std", visible: true },
  { key: "price", label: "Price", visible: true },
]

export default function QuotationPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const [isClient, setIsClient] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

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
 // const [currentDate, setCurrentDate] = useState("")

  // Mock API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProductGroups(mockProductData)
    }, 500)

    // // Set current date
    // const today = new Date()
    // const formattedDate = today.toISOString().split("T")[0]
    // setCurrentDate(formattedDate)
  }, [])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleInputChange = (field: keyof FormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handlePricingChange =
    (productId: number, field: "premium" | "standard" | "price") => (event: React.ChangeEvent<HTMLInputElement>) => {
      setProductPricing((prev) => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          [field]: event.target.value,
        },
      }))
    }

  const handleShare = () => {
    console.log("Share functionality")
  }

  // Dynamic PDF generator based on visible columns
  const generateModernPDF = () => {
    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
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

    // Four items in two rows, two columns each
    customerDetails.forEach((detail, index) => {
      const xPos = index % 2 === 0 ? 20 : pageWidth / 2 + 10
      const yPos = yPosition + Math.floor(index / 2) * 6.5

      doc.setFont("helvetica", "bold")
      doc.text(detail.label, xPos, yPos)
      doc.setFont("helvetica", "normal")
      doc.text(detail.value, xPos + doc.getTextWidth(detail.label) + 2, yPos)
    })

    yPosition += 15

    // Helper function to get product data based on column key
    const getProductValue = (product: Product, columnKey: string) => {
      switch (columnKey) {
        case "srNo":
          return product.srNo.toString()
        case "sizeCategory":
          return `${product.size} - ${product.category}`
        case "packing":
          return product.packing
        case "sqFt":
          return product.sqFt.toString()
        case "weight":
          return product.weight.toString()
        case "premium":
          return productPricing[product.id]?.premium || ""
        case "standard":
          return productPricing[product.id]?.standard || ""
        case "price":
          return productPricing[product.id]?.price || ""
        default:
          return ""
      }
    }

    // Calculate dynamic column widths based on visible columns
    const totalTableWidth = pageWidth - 40 // 20mm margin on each side
    const getColumnWidth = (columnKey: string, totalColumns: number) => {
      // Define base widths for different column types
      const baseWidths: { [key: string]: number } = {
        srNo: 15,
        sizeCategory: 60,
        packing: 20,
        sqFt: 18,
        weight: 18,
        premium: 20,
        standard: 20,
        price: 20,
      }

      const baseWidth = baseWidths[columnKey] || 20
      const totalBaseWidth = visibleColumns.reduce((sum, col) => sum + (baseWidths[col.key] || 20), 0)

      // Scale proportionally to fit available width
      return (baseWidth / totalBaseWidth) * totalTableWidth
    }

    // Dynamic Product sections with minimal spacing
    productGroups.forEach((group, groupIndex) => {
      // Section title with reduced spacing
      doc.setTextColor(textColor[0], textColor[1], textColor[2])
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text(group.name, 20, yPosition)
      yPosition += 5

      // Prepare dynamic table data based on visible columns
      const tableHeaders = visibleColumns.map((col) => col.label)
      const tableData = group.products.map((product) => {
        return visibleColumns.map((col) => getProductValue(product, col.key))
      })

      // Create dynamic column styles
      const columnStyles: { [key: number]: any } = {}
      visibleColumns.forEach((col, index) => {
        columnStyles[index] = {
          cellWidth: getColumnWidth(col.key, visibleColumns.length),
          halign: col.key === "sizeCategory" ? "left" : "center",
        }
      })

      // Compact table with dynamic columns
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

      // Minimal spacing between tables
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

    // Convert to blob and open in new tab instead of downloading
    const pdfBlob = doc.output("blob")
    const pdfUrl = URL.createObjectURL(pdfBlob)
    window.open(pdfUrl, "_blank")

    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl)
    }, 1000)
  }

  // Use the new PDF generator in handlePreview
  const handlePreview = () => {
    generateModernPDF();
  };

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
              {/* <CalendarToday sx={{ color: "#666" }} /> */}
              <Typography variant="h6" >
                {`${new Date().toLocaleDateString("en-GB")} ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
              </Typography>
            </Box>
          }
        />

        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>

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

            {/* <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
                  Date :
                </Typography>
                <TextField
                  type="date"
                  required
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ width: { xs: "100%", sm: 200 } }}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Grid> */}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Product Tables - Keep Original Design */}
          {productGroups.map((group, groupIndex) => (
            <Box key={groupIndex} sx={{ mb: 4 }}>
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: "bold", mb: 2, color: "#333" }}>
                {group.name}
              </Typography>

              {isClient && isMobile ? (
                // Mobile View: Card-based layout (dynamic columns, size-category always on top)
                <Box>
                  {group.products.map((product) => (
                    <Paper key={product.id} sx={{ p: 2, mb: 2, boxShadow: 2, borderRadius: 2 }}>
                      {/* Always show size-category at the top */}
                      <Typography variant="body1" sx={{ fontWeight: "bold", mb: 1 }}>
                        {product.size} - {product.category}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {/* Render the rest of the fields dynamically */}
                      {columns.filter(col => col.visible && col.key !== "sizeCategory").map((col) => (
                        <React.Fragment key={col.key}>
                          {(() => {
                            switch (col.key) {
                              case "srNo":
                                return (
                                  <Grid container spacing={2} sx={{ mb: 1 }}>
                                    <Grid size={{ xs: 6 }}>
                                      <Typography variant="body2">
                                        <strong>Sr. No.:</strong> {product.srNo}
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>Pcs/Box:</strong> {product.packing}
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6 }}>
                                      <Typography variant="body2">
                                        <strong>Sq.ft:</strong> {product.sqFt}
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>Weight:</strong> {product.weight}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                );
                              case "premium":
                                return (
                                  <Grid container spacing={2} sx={{ mb: 1 }}>
                                    <Grid size={{ xs: 4 }}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        label="Premium"
                                        value={productPricing[product.id]?.premium || ""}
                                        onChange={handlePricingChange(product.id, "premium")}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        label="Standard"
                                        value={productPricing[product.id]?.standard || ""}
                                        onChange={handlePricingChange(product.id, "standard")}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        variant="outlined"
                                        label="Price"
                                        value={productPricing[product.id]?.price || ""}
                                        onChange={handlePricingChange(product.id, "price")}
                                      />
                                    </Grid>
                                  </Grid>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </React.Fragment>
                      ))}
                    </Paper>
                  ))}
                </Box>
              ) : (
                // Desktop View: Table layout
                <TableContainer
                  component={Paper}
                  sx={{
                    mb: 3,
                    overflowX: "auto",
                  }}
                >
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
                      {group.products.map((product) => (
                        <TableRow key={product.id} hover>
                          {columns.filter(col => col.visible).map((col) => {
                            switch (col.key) {
                              case "srNo":
                                return <TableCell key={col.key} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{product.srNo}</TableCell>;
                              case "sizeCategory":
                                return (
                                  <TableCell key={col.key} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                                    <Typography variant="body2">
                                      {product.size} - {product.category}
                                    </Typography>
                                  </TableCell>
                                );
                              case "packing":
                                return <TableCell key={col.key} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{product.packing}</TableCell>;
                              case "sqFt":
                                return <TableCell key={col.key} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{product.sqFt}</TableCell>;
                              case "weight":
                                return <TableCell key={col.key} sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>{product.weight}</TableCell>;
                              case "premium":
                                return (
                                  <TableCell key={col.key}>
                                    <TextField
                                      size="small"
                                      variant="outlined"
                                      placeholder="Premium"
                                      value={productPricing[product.id]?.premium || ""}
                                      onChange={handlePricingChange(product.id, "premium")}
                                      sx={{ width: { xs: 80, sm: 100 } }}
                                    />
                                  </TableCell>
                                );
                              case "standard":
                                return (
                                  <TableCell key={col.key}>
                                    <TextField
                                      size="small"
                                      variant="outlined"
                                      placeholder="Standard"
                                      value={productPricing[product.id]?.standard || ""}
                                      onChange={handlePricingChange(product.id, "standard")}
                                      sx={{ width: { xs: 80, sm: 100 } }}
                                    />
                                  </TableCell>
                                );
                              case "price":
                                return (
                                  <TableCell key={col.key}>
                                    <TextField
                                      size="small"
                                      variant="outlined"
                                      placeholder="Price"
                                      value={productPricing[product.id]?.price || ""}
                                      onChange={handlePricingChange(product.id, "price")}
                                      sx={{ width: { xs: 80, sm: 100 } }}
                                    />
                                  </TableCell>
                                );
                              default:
                                return null;
                            }
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ))}

          {/* Note Section - Responsive */}
          <Box sx={{ mt: 4, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
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
                <Box
                  sx={{
                    display: { xs: "block", sm: "flex" },
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
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

          {/* Action Buttons - Responsive with IconButton option */}
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
                    sx={{
                      bgcolor: "#1976d2",
                      color: "white",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": { bgcolor: "#1565c0" },
                    }}
                  >
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
