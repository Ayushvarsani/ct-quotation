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
import { FormatListNumbered } from "@mui/icons-material";
import { motion } from "framer-motion";

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
  { key: "pre", label: "Pre" },
  { key: "std", label: "Std" },
  { key: "com", label: "Com" },
  { key: "eco", label: "Eco" },
];

const filter = createFilterOptions<string>();

export default function PermissionFormPage() {
  const [permissions, setPermissions] = useState<Record<
    string,
    boolean
  > | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
              pre: true,
              std: true,
              com: true,
              eco: true,
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
      setOptions((prev) => ({
        ...prev,
        [dialogField]: [...(prev[dialogField] || []), dialogValue.trim()],
      }));
      setFormData((prev) => ({
        ...prev,
        [dialogField]: dialogValue.trim(),
      }));
      setDialogOpen(false);
    }
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
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

    if (!hasError) {
      console.log("✅ Form Submitted:", formData);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
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
                    const fieldOptions = options[field.key] || [];
                    return (
                      <div key={field.key} className="space-y-2">
                        {isAuto ? (
                          <Autocomplete
                            freeSolo
                            value={value}
                            onChange={(_, newVal) => {
                              if (
                                typeof newVal === "string" &&
                                newVal.startsWith('Add "')
                              ) {
                                openDialog(
                                  field.key,
                                  inputValues[field.key] || ""
                                );
                              } else {
                                handleInputChange(field.key, newVal || "");
                              }
                            }}
                            inputValue={inputValues[field.key] || ""}
                            onInputChange={(_, newInputValue) => {
                              setInputValues((prev) => ({
                                ...prev,
                                [field.key]: newInputValue,
                              }));
                            }}
                            options={fieldOptions}
                            filterOptions={(opts, params) => {
                              const filtered = filter(opts, params);
                              if (
                                params.inputValue &&
                                !opts.includes(params.inputValue)
                              ) {
                                filtered.push(`Add "${params.inputValue}"`);
                              }
                              return filtered;
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
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  Submit
                </motion.button>
              </div>

              {submitSuccess && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  Form submitted successfully!
                </Alert>
              )}
            </form>

            {/* Add New Dialog */}
            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
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
                  onClick={() => setDialogOpen(false)}
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
