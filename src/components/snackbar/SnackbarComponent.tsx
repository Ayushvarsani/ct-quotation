import React from "react";
import { Snackbar, Alert } from "@mui/material";

interface SnackbarComponentProps {
  open: boolean;
  message: string;
  severity?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

const SnackbarComponent: React.FC<SnackbarComponentProps> = ({ open, message, severity = "info", duration = 2000, onClose }) => {
  return (
    <Snackbar open={open} autoHideDuration={duration} onClose={onClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarComponent;
