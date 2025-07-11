"use client";
import React, { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import DynamicQuotationForm from "../../../components/DynamicQuotationForm";
import DynamicPDFPreview from "../../../components/DynamicPDFPreview";
import type { FormData, ProductPricing, ProductGroup, Column } from "@/components/types/quotation";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
  },
});

type AppView = "form" | "preview";

const DynamicQuotationApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>("form");
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);
  const [currentProductPricing, setCurrentProductPricing] = useState<ProductPricing | null>(null);
  const [currentProductGroups, setCurrentProductGroups] = useState<ProductGroup[]>([]);
  const [currentColumns, setCurrentColumns] = useState<Column[]>([]);

  const handlePreview = (
    formData: FormData,
    productPricing: ProductPricing,
    productGroups: ProductGroup[],
    columns: Column[]
  ) => {
    setCurrentFormData(formData);
    setCurrentProductPricing(productPricing);
    setCurrentProductGroups(productGroups);
    setCurrentColumns(columns);
    setCurrentView("preview");
  };

  const handleBackToForm = () => {
    setCurrentView("form");
    setCurrentFormData(null);
    setCurrentProductPricing(null);
    setCurrentProductGroups([]);
    setCurrentColumns([]);
  };

  const handleShare = (formData: FormData, ) => {   
    alert(`Share functionality called for customer: ${formData.Name}`);
  };

  const handleWhatsAppSend = async (

  ): Promise<boolean> => {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Simulate success
      return true;
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      return false;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ minHeight: "100vh" }}>
        {currentView === "form" && (
          <DynamicQuotationForm onPreview={handlePreview} onShare={handleShare} />
        )}
        {currentView === "preview" &&
          currentFormData &&
          currentProductPricing &&
          currentProductGroups.length > 0 &&
          currentColumns.length > 0 && (
            <DynamicPDFPreview
              formData={currentFormData}
              productPricing={currentProductPricing}
              productGroups={currentProductGroups}
              columns={currentColumns}
              onBack={handleBackToForm}
              onWhatsAppSend={handleWhatsAppSend}
            />
          )}
      </div>
    </ThemeProvider>
  );
};

export default DynamicQuotationApp;
