import SnackbarComponent from "@/components/snackbar/SnackbarComponent";
import { createContext, useContext, useState, ReactNode } from "react";

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: "success" | "error" | "warning" | "info", duration?: number, onClose?: () => void) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info" as "success" | "error" | "warning" | "info",
    duration: 2000 as number | undefined,
    onClose: undefined as (() => void) | undefined,
  });

  const showSnackbar = (
    message: string, 
    severity: "success" | "error" | "warning" | "info" = "info",
    duration?: number,
    onClose?: () => void
  ) => {
    setSnackbar({ open: true, message, severity, duration, onClose });
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
    if (snackbar.onClose) {
        snackbar.onClose(); // Call the callback function on close
    }
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <SnackbarComponent open={snackbar.open} message={snackbar.message} severity={snackbar.severity} duration={snackbar.duration} onClose={handleClose} />
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
