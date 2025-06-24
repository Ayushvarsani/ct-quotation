"use client";

import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  Alert,
  createFilterOptions,
} from "@mui/material";
import { FormatListNumbered, ArrowBack } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/app/hooks/useSnackbar";

// Define fields and type
const fields = [
  { key: "product", label: "Product Name", type: "autocomplete" },
  { key: "size", label: "Size", type: "autocomplete" },
  { key: "series", label: "Series" },
  { key: "category", label: "Category" },
  { key: "finish", label: "Finish" },
  { key: "pcsPerBox", label: "Pcs per box" },
  { key: "sqFtPerBox", label: "Sq.ft per box" },
  { key: "weight", label: "Weight" },
  // { key: "pre", label: "Pre" },
  // { key: "std", label: "Std" },
  // { key: "com", label: "Com" },
  // { key: "eco", label: "Eco" },
];

const filter = createFilterOptions<string>();

// Define a type for Autocomplete options
type AutoOption = { label: string; value: string } | { label: string; isAddOption: true };

export default function PermissionFormPage() {
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const [permissions, setPermissions] = useState<Record<
    string,
    boolean
  > | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autocomplete dropdown options (only for 'product' and 'size')
  const [options, setOptions] = useState<Record<string, string[]>>({
    product: [],
    size: [],
  });

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogField, setDialogField] = useState<string | null>(null);
  const [dialogValue, setDialogValue] = useState("");
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // Fetch field permissions (mocking API)
  useEffect(() => {
    const fetchPermissions = async () => {
      const mockPermissions = await new Promise<Record<string, boolean>>(
        (resolve) =>
          setTimeout(() => {
            resolve({
              product: true,
              size: true,
              series: true,
              category: true,
              finish: true,
              pcsPerBox: true,
              sqFtPerBox: true,
              weight: true,
              // pre: true,
              // std: true,
              // com: true,
              // eco: true,
            });
          }, 300)
      );
      setPermissions(mockPermissions);
    };

    fetchPermissions();
  }, []);

  // Field input handler
  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // Open Add Dialog
  const openDialog = (fieldKey: string, typedValue: string) => {
    setDialogField(fieldKey);
    setDialogValue(typedValue);
    setDialogOpen(true);
  };

  // Confirm Add New Option
  const handleDialogAdd = () => {
    if (dialogField && dialogValue.trim()) {
      setOptions((prev) => {
        const existing = prev[dialogField] || [];
        if (existing.includes(dialogValue.trim())) {
          return prev; // Do not add duplicate
        }
        return {
          ...prev,
          [dialogField]: [...existing, dialogValue.trim()],
        };
      });
      setFormData((prev) => ({
        ...prev,
        [dialogField]: dialogValue.trim(),
      }));
      setDialogOpen(false);
    }
  };

  // Mock API function for submitting product
  const submitProduct = async (data: Record<string, string>) => {
    // Simulate network delay and random error
    return new Promise<{ success: boolean; message?: string }>((resolve) => { //, reject
      setTimeout(() => {
        // Simulate random error for demonstration
        if (data.product === "error") {
          resolve({ success: false, message: "Mock API error: Product name cannot be 'error'" });
        } else {
          resolve({ success: true }); 
        }
      }, 1200);
    });
  };

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    let hasError = false;

    fields.forEach((field) => {
      if (permissions?.[field.key] && !formData[field.key]) {
        newErrors[field.key] = `${field.label} is required`;
        hasError = true;
      }
    });

    setErrors(newErrors);
    setSubmitError(null);

    if (!hasError) {
      setIsSubmitting(true);
      try {
        const result = await submitProduct(formData);
        if (result.success) {
          setSubmitSuccess(true);
          setFormData({});
          setInputValues({});
          showSnackbar("Product added successfully!", "success", 3000);
          setTimeout(() => setSubmitSuccess(false), 3000);
        } else {
          setSubmitError(result.message || "Failed to submit product.");
          showSnackbar(result.message || "Failed to submit product.", "error", 4000);
        }
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Unexpected error occurred."  );
        showSnackbar("Unexpected error occurred.", "error", 4000);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      showSnackbar("Please fix the validation errors", "error", 4000);
    }
  };

  // Add a function to reset the form
  const handleCancel = () => {
    setFormData({});
    setInputValues({});
    setErrors({});
    showSnackbar("Form cleared", "info", 2000);
  };

  if (!permissions) {
    return (
      <div className="flex justify-center items-center h-40">
        <CircularProgress />
      </div>
    );
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
                Add New Product
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
  {fields
    .filter((field) => permissions[field.key])
    .map((field) => {
      const isAuto = field.type === "autocomplete";
      const value = formData[field.key] || "";
      const fieldOptions: AutoOption[] = (options[field.key] || []).map((opt) => ({
        label: opt,
        value: opt,
      }));

      return (
        <div key={field.key} className="space-y-2">
          {isAuto ? (
            <Autocomplete
              value={
                fieldOptions.find((opt) =>
                  "value" in opt ? opt.value === value : false
                ) || null
              }
              onChange={(_, newVal: AutoOption | null) => {
                if (newVal && "isAddOption" in newVal && newVal.isAddOption) {
                  openDialog(field.key, inputValues[field.key] || "");
                } else if (newVal && "value" in newVal) {
                  handleInputChange(field.key, newVal.value);
                } else {
                  handleInputChange(field.key, "");
                }
              }}
              inputValue={inputValues[field.key] || ""}
              onInputChange={(_, newInputValue) => {
                setInputValues((prev) => ({
                  ...prev,
                  [field.key]: newInputValue,
                }));
              }}
              options={fieldOptions as AutoOption[]}
              filterOptions={(opts) => [
                ...opts,
                { label: "Add", isAddOption: true } as AutoOption,
              ]}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) =>
                "value" in option && "value" in value && option.value === value.value
              }
              renderOption={(props, option) => {
                const opt = option as AutoOption;
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
                );
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
              onChange={(e) =>
                handleInputChange(field.key, e.target.value)
              }
              error={!!errors[field.key]}
              helperText={errors[field.key]}
            />
          )}
        </div>
      );
    })}
</div>


              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8">
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <CircularProgress size={22} color="inherit" /> : "Submit"}
                </motion.button>
              </div>

              {submitSuccess && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  Form submitted successfully!
                </Alert>
              )}
              {submitError && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {submitError}
                </Alert>
              )}
            </form>

            {/* Add New Dialog */}
            <Dialog
              open={dialogOpen}
              onClose={() => {
                setDialogOpen(false);
                if (dialogField) {
                  setInputValues((prev) => ({ ...prev, [dialogField]: "" }));
                }
              }}
              fullWidth
              maxWidth="xs"
              PaperProps={{
                className: "rounded-2xl",
                style: { boxShadow: "0 8px 32px rgba(80, 80, 180, 0.15)" },
              }}
            >
              <DialogTitle className="font-bold text-indigo-700">
                Add New {dialogField?.toUpperCase()}
              </DialogTitle>
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
                    setDialogOpen(false);
                    if (dialogField) {
                      setInputValues((prev) => ({ ...prev, [dialogField]: "" }));
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
  );
}
