/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import type React from "react"
import { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
} from "@mui/material"
import { ArrowBack, Download, WhatsApp, CheckCircle } from "@mui/icons-material"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { useSnackbar } from "@/app/hooks/useSnackbar"

interface FormData {
  Name?: string
  mobile?: string
  refParty?: string
  seName?: string
  tax?: string
  paymentWithDays?: string
  remark?: string
}

interface ProductPricing {
  [key: number]: {
    com?: string
    eco?: string
    premium?: string
    standard?: string
  }
}

interface Product {
  id: number
  product_name?: string
  product_size?: string
  product_category?: string
  product_pieces_per_box?: number
  product_sq_ft_box?: number
  product_weight?: number
  product_series?: string
  product_finish?: string
}

interface ProductGroup {
  name: string
  products: Product[]
}

interface Column {
  key: string
  label: string
  visible: boolean
}

interface User {
  name?: string
  usermobile?: string
}

interface DynamicPDFPreviewProps {
  formData: FormData
  productPricing: ProductPricing
  productGroups: ProductGroup[]
  columns: Column[]
  onBack: () => void
  onWhatsAppSend?: (
    formData: FormData,
    productPricing: ProductPricing,
    productGroups: ProductGroup[],
    columns: Column[],
  ) => Promise<boolean>
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

const DynamicPDFPreview: React.FC<DynamicPDFPreviewProps> = ({
  formData,
  productPricing,
  productGroups,
  columns,
  onBack,
  onWhatsAppSend,
}) => {
  const theme = useTheme()
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle")
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const { showSnackbar } = useSnackbar()

  const pricingColumnKeys = ["com", "eco", "premium", "standard"];
  const srNoColumn = columns.find(col => col.key === "srNo");
  const pricingColumns = columns.filter(col => pricingColumnKeys.includes(col.key));
  const otherColumns = columns.filter(
    col => col.key !== "srNo" && !pricingColumnKeys.includes(col.key)
  );
  const previewColumns = [
    ...(srNoColumn ? [srNoColumn] : []),
    ...pricingColumns,
    ...otherColumns,
  ].filter(col => col.visible);

  const generatePDF = () => {
    const doc = new jsPDF("p", "mm", "a4")
    const pageWidth = doc.internal.pageSize.width
    let yPosition = 15

    
    const headerColor: [number, number, number] = [52, 73, 94]
    const borderColor: [number, number, number] = [180, 180, 180]
    const textColor: [number, number, number] = [0, 0, 0]

    // Get only visible columns
    const visibleColumns = columns.filter((col) => col.visible)

    // Header
    doc.setFontSize(19)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(headerColor[0], headerColor[1], headerColor[2])
    doc.text("PRICE QUOTATION", 20, yPosition)

    // Date and time
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(80, 80, 80)
    const dateStr = new Date().toLocaleDateString("en-GB")
    const timeStr = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
    const dateTimeText = `${dateStr} | ${timeStr}`
    const dateTimeWidth = doc.getTextWidth(dateTimeText)
    doc.text(dateTimeText, pageWidth - dateTimeWidth - 20, yPosition)

    // Line under header
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2])
    doc.setLineWidth(0.3)
    doc.line(20, yPosition + 3, pageWidth - 20, yPosition + 3)
    yPosition += 12

    // Customer Information
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("CUSTOMER DETAILS", 20, yPosition)
    yPosition += 6

    // Customer details
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

    // Calculate dynamic column widths
    const totalTableWidth = pageWidth - 40
    const getColumnWidth = (columnKey: string, length: number) => {
      if (length === 0) return 20
      const baseWidths: { [key: string]: number } = {
        srNo: 15,
        size: 25,
        category: 25,
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

    // Product tables
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
          halign: col.key === "size" || col.key === "category" ? "left" : "center",
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

    // Notes
    const noteSectionHeight = 25
    if (yPosition + noteSectionHeight > doc.internal.pageSize.height - 20) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(textColor[0], textColor[1], textColor[2])
    doc.text("NOTES", 20, yPosition)
    yPosition += 6

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    const note = [
      `1. Taxes: ${formData.tax || "As applicable"}`,
      `2. Payment: Within ${formData.paymentWithDays || "___"} days from billing date`,
      `3. ${formData.remark || "Additional note as discussed"}`,
    ]

    note.forEach((term) => {
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
    const userStr = localStorage.getItem("user")
    let generatedBy = ""
    if (userStr) {
      try {
        const user: User = JSON.parse(userStr)
        if (user.name) {
          generatedBy = `PDF generated by: ${user.name}`
        }
      } catch (e) {
        console.log(e)
      }
    }

    // Add the generated by line at the bottom
    if (generatedBy) {
      if (yPosition + 15 > doc.internal.pageSize.height - 10) {
        doc.addPage()
        yPosition = 20
      }
      doc.setFontSize(9)
      doc.setFont("helvetica", "italic")
      doc.setTextColor(120, 120, 120)
      doc.text(generatedBy, 20, doc.internal.pageSize.height - 10)
    }

    return doc.output("blob")
  }

  const handleDownload = () => {
    setIsGeneratingPDF(true)
    try {
      const pdfBlob = generatePDF()
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Quotation_${formData.Name || "Customer"}_${new Date().toLocaleDateString()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      showSnackbar("PDF download successfully!", "success")
    } catch (error) {
      console.error("Error generating PDF:", error)
      showSnackbar("Failed to Download PDF", "error")
      alert("Failed to generate PDF")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleWhatsAppSend = async () => {
    if (!formData.mobile) {
      alert("Customer mobile number is missing")
      return
    }

    setIsSending(true)
    setSendStatus("idle")

    try {
      let success = false
      if (onWhatsAppSend) {
        success = await onWhatsAppSend(formData, productPricing, productGroups, columns)
      } else {
        // Default simulation
        await new Promise((resolve) => setTimeout(resolve, 2000))
        console.log("Sending WhatsApp message to:", formData.mobile)
        showSnackbar("PDF generated and sent successfully!", "success")
        success = true
      }

      setSendStatus(success ? "success" : "error")
      setTimeout(() => setSendStatus("idle"), 3000)
    } catch (error) {
      console.error("Error sending WhatsApp:", error)
      setSendStatus("error")
      setTimeout(() => setSendStatus("idle"), 3000)
    } finally {
      setIsSending(false)
    }
  }

  // const handleWhatsAppDirect = () => {
  //   const message = encodeURIComponent(
  //     `Hi ${formData.Name}, please find your quotation. We will send the PDF document separately.`,
  //   )
  //   const whatsappUrl = `https://wa.me/${formData.mobile}?text=${message}`
  //   window.open(whatsappUrl, "_blank")
  // }

  const userData = localStorage.getItem("user")
  const parsedUser = userData ? JSON.parse(userData) : {}
  const loginname = parsedUser.name

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        p: { xs: 1, sm: 2, md: 3 },
        width: "100%",
        maxWidth: "92vw",
        // overflowX: "hidden",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: "100vw",
          mx: "auto",
          boxShadow: 3,
         // overflowX: "hidden",
        }}
      >
        <CardHeader
          title={
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 }, flexWrap: "wrap" }}>
              <IconButton onClick={onBack} color="primary" size={isMobile ? "small" : "medium"}>
                <ArrowBack />
              </IconButton>
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                }}
              >
                Quotation Preview
              </Typography>
              <Box sx={{ ml: "auto", display: "flex", gap: { xs: 0.5, sm: 1 } }}>
                <Button
                  variant="outlined"
                  startIcon={isGeneratingPDF ? <CircularProgress size={16} /> : <Download />}
                  onClick={handleDownload}
                  disabled={isGeneratingPDF}
                  size={isMobile ? "small" : "medium"}
                  sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                >
                  {isGeneratingPDF ? "Generating..." : "Download"}
                </Button>
              </Box>
            </Box>
          }
          sx={{ pb: { xs: 1, sm: 2 } }}
        />

        <CardContent sx={{ p: isMobile ? 1 : isTablet ? 2 : 3 }}>
          {/* PDF-styled Preview */}
          <Card
            sx={{
              mb: 3,
              bgcolor: "white",
              border: "1px solid #ddd",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              minHeight: { xs: "auto", md: "800px" },
            }}
          >
            <CardContent sx={{ p: isMobile ? 2 : isTablet ? 3 : 4 }}>
              {/* Header Section */}
              <Box sx={{ mb: { xs: 2, sm: 3, md: 4 }, borderBottom: "2px solid #34495e", pb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 0 },
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: "bold",
                      color: "#34495e",
                      fontFamily: "serif",
                      fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem" },
                    }}
                  >
                    PRICE QUOTATION
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    {new Date().toLocaleDateString("en-GB")} |{" "}
                    {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                </Box>
              </Box>

              {/* Customer Details Section */}
              <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    mb: { xs: 1, sm: 2 },
                    color: "#34495e",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  CUSTOMER DETAILS
                </Typography>
                <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "bold",
                         // minWidth: { xs: "60px", sm: "80px" },
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        Name:
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                        {formData.Name || "________________"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "bold",
                         // minWidth: { xs: "60px", sm: "80px" },
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        Mobile:
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                        {formData.mobile || "________________"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "bold",
                         // minWidth: { xs: "60px", sm: "80px" },
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        Ref. Party:
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                        {formData.refParty || "________________"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: "bold",
                         // minWidth: { xs: "60px", sm: "80px" },
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        SE Name:
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                        {formData.seName || "________________"}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Product Tables */}
              {productGroups.map((group, groupIndex) => (
                <Box key={groupIndex} sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      mb: { xs: 1, sm: 2 },
                      color: "#34495e",
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                    }}
                  >
                    {group.name}
                  </Typography>

                  {/* Always Table View - Responsive with Horizontal Scroll */}
                  <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                      border: "1px solid #ddd",
                      overflowX: "auto",
                      width: "100%",
                      // minWidth removed from here
                    }}
                  >
                    <Table
                      size="small"
                      sx={{
                        minWidth: columns.length * 110,
                        width: "100%",
                        tableLayout: "auto",
                      }}
                    >
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8f8f8" }}>
                          {previewColumns.map((col) => (
                            <TableCell
                              key={col.key}
                              sx={{
                                fontWeight: "bold",
                                fontSize: "0.9rem",
                                textAlign: "center",
                                border: "1px solid #ddd",
                                py: 1,
                                px: 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {col.label}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {group.products.map((product, idx) => (
                          <TableRow key={product.id}>
                            {previewColumns.map((col) => (
                              <TableCell
                                key={col.key}
                                sx={{
                                  fontSize: "0.9rem",
                                  textAlign: "center",
                                  border: "1px solid #ddd",
                                  py: 1,
                                  px: 1,
                                  fontWeight: ["com", "eco", "premium", "standard"].includes(col.key)
                                    ? "bold"
                                    : "normal",
                                  color: ["com", "eco", "premium", "standard"].includes(col.key)
                                    ? "#1976d2"
                                    : "inherit",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "150px",
                                }}
                              >
                                {getProductValue(
                                  product,
                                  col.key,
                                  col.key === "srNo" ? idx : undefined,
                                  productPricing,
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}

              <Box sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    mb: { xs: 1, sm: 2 },
                    color: "#34495e",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  NOTES :
                </Typography>
                <Box sx={{ pl: { xs: 1, sm: 2 } }}>
                  {formData.tax && (
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      1. Taxes: {formData.tax}
                    </Typography>
                  )}
                  {formData.paymentWithDays && (
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      2. Payment: Within {formData.paymentWithDays} days from billing date
                    </Typography>
                  )}
                  {formData.remark && (
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      3. {formData.remark}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Footer */}
              <Box sx={{ mt: { xs: 2, sm: 3, md: 4 }, pt: 2, borderTop: "1px solid #ddd" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontStyle: "italic",
                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                  }}
                >
                  PDF generated by: {loginname}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Divider sx={{ my: { xs: 2, sm: 3 } }} />

          {/* WhatsApp Actions */}
          <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              sx={{
                mb: { xs: 1, sm: 2 },
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Share Quotation
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2 }}
              justifyContent="center"
              alignItems="center"
            >
              <Button
                variant="contained"
                size="large"
                startIcon={
                  isSending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : sendStatus === "success" ? (
                    <CheckCircle />
                  ) : (
                    <WhatsApp />
                  )
                }
                onClick={handleWhatsAppSend}
                disabled={isSending || !formData.mobile}
                sx={{
                  bgcolor: "#25D366",
                  "&:hover": { bgcolor: "#128C7E" },
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: 250 },
                  py: { xs: 1, sm: 1.5 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                }}
              >
                {isSending
                  ? "Generating & Sending PDF..."
                  : sendStatus === "success"
                    ? "PDF Sent Successfully!"
                    : "Generate PDF & Send via WhatsApp"}
              </Button>
            </Stack>
          </Box>

          {/* Status Messages */}
          {!formData.mobile && (
            <Alert severity="warning" sx={{ mb: 2, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Customer mobile number is required to send via WhatsApp
            </Alert>
          )}
          {sendStatus === "success" && (
            <Alert severity="success" sx={{ mb: 2, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              PDF generated and sent successfully to {formData.mobile}
            </Alert>
          )}
          {sendStatus === "error" && (
            <Alert severity="error" sx={{ mb: 2, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Failed to generate or send PDF. Please try again.
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default DynamicPDFPreview
