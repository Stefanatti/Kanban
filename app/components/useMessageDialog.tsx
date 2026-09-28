"use client";

import { useId, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

export function useMessageDialog(title: string) {
  const [message, showMessage] = useState<string | null>(null);
  const id = useId();
  const close = () => showMessage(null);

  const messageDialog = (
    <Dialog open={message !== null} onClose={close} fullWidth maxWidth="xs"
      aria-labelledby={`${id}-title`} aria-describedby={`${id}-message`}
      PaperProps={{ role: "alertdialog", sx: {
        borderRadius: 3, bgcolor: "background.paper", color: "text.primary",
        backgroundImage: "none", border: "1px solid", borderColor: "divider",
      } }}>
      <DialogTitle id={`${id}-title`}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id={`${id}-message`} sx={{ whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button autoFocus variant="contained" onClick={close}>OK</Button>
      </DialogActions>
    </Dialog>
  );

  return { showMessage, messageDialog };
}
