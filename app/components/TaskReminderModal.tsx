import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, TextField, Typography,
} from "@mui/material";
import { Task, TaskUpdateInput } from "@/app/interfaces/interfaces";

const options = [
  { value: 0, label: "At due time" },
  { value: 10, label: "10 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 1440, label: "1 day before" },
];

interface Props {
  task: Task;
  completed: boolean;
  onClose: () => void;
  onSave: (taskId: string, changes: TaskUpdateInput) => Promise<void>;
}

export default function TaskReminderModal({ task, completed, onClose, onSave }: Props) {
  const activeReminder = task.reminders?.find((item) => !item.sentAt && !item.cancelledAt);
  const initialOffset = activeReminder && task.dueDate
    ? Math.max(0, Math.round((new Date(task.dueDate).getTime() - new Date(activeReminder.remindAt).getTime()) / 60000))
    : 10;
  const [dueDate, setDueDate] = useState<Dayjs | null>(() => task.dueDate ? dayjs(task.dueDate) : null);
  const [dateInvalid, setDateInvalid] = useState(false);
  const [offset, setOffset] = useState(initialOffset);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const save = async (remove = false) => {
    if (saving) return;
    setError("");
    if (!remove && (!dueDate?.isValid() || dateInvalid)) {
      setError("Choose a due date and time for this reminder.");
      return;
    }
    setSaving(true);
    try {
      await onSave(task.id, remove ? { reminderMinutesBefore: null } : {
        dueDate: dueDate!.second(0).millisecond(0).toISOString(),
        reminderMinutesBefore: offset,
        timezone,
      });
      onClose();
    } catch {
      setError("Could not save the reminder. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={() => { if (!saving) onClose(); }} fullWidth maxWidth="xs"
      aria-labelledby="task-reminder-title" PaperProps={{ sx: {
        borderRadius: 3, bgcolor: "background.paper", color: "text.primary",
        backgroundImage: "none", border: "1px solid", borderColor: "divider",
      } }}>
      <Box component="form" noValidate onSubmit={(event) => { event.preventDefault(); if (!completed) void save(); }}>
        <DialogTitle id="task-reminder-title">{activeReminder ? "Edit reminder" : "Set reminder"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>{task.title}</Typography>
          {completed && <Alert severity="info">Move this task to To Do or Doing to set a reminder.</Alert>}
          {error && <Alert severity="error">{error}</Alert>}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker label="Due date and time" value={dueDate}
              onChange={(value, context) => {
                setDueDate(value);
                setDateInvalid(context.validationError !== null);
              }}
              onError={(reason) => setDateInvalid(reason !== null)}
              ampm={false} format="DD/MM/YYYY HH:mm" timeSteps={{ minutes: 1 }}
              disabled={saving || completed}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: dateInvalid ? "Enter a valid date and time." : `Times are shown in ${timezone}`,
                },
                actionBar: { actions: ["cancel", "accept"] },
                popper: { sx: { zIndex: (theme) => theme.zIndex.modal + 1 } },
              }} />
          </LocalizationProvider>
          <TextField select label="Remind me" fullWidth value={offset}
            disabled={saving || completed} onChange={(event) => setOffset(Number(event.target.value))}>
            {!options.some((item) => item.value === initialOffset) &&
              <MenuItem value={initialOffset}>{initialOffset} minutes before</MenuItem>}
            {options.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, flexWrap: "wrap", gap: 1 }}>
          {activeReminder && <Button color="error" disabled={saving} onClick={() => void save(true)}
            sx={{ mr: "auto" }}>Remove reminder</Button>}
          <Button disabled={saving} onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving || completed}>
            {saving ? "Saving…" : "Save reminder"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
