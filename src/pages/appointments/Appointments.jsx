import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Alert,
  Snackbar,
  Tab,
  Tabs,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axios from "axios";

const API = "https://nutrilife.runasp.net/api/Appointment";

export default function Appointments() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openMeetingDialog, setOpenMeetingDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");

  const [createForm, setCreateForm] = useState({
    date: "",
    time: "",
    notes: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const token = localStorage.getItem("token");

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getErrorMessage = (err) => {
    const data = err.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    return err.message || "حدث خطأ غير معروف";
  };

  const normalizeTime = (time) => {
    if (!time) return "";
    return time.length === 5 ? `${time}:00` : time;
  };

  const fetchNutritionistAppointments = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API}/NutritionistAppointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      console.log("Nutritionist appointments:", data);

      setAllAppointments(data);
      setPendingAppointments(
        data.filter((app) => (app.status || "").toLowerCase() === "pending")
      );
    } catch (err) {
      console.error(
        "Nutritionist appointments error:",
        err.response?.status,
        err.response?.data || err.message
      );
      showMessage(`فشل جلب المواعيد: ${getErrorMessage(err)}`, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritionistAppointments();
  }, []);

  const handleCreateAppointment = async () => {
    if (!createForm.date || !createForm.time) {
      showMessage("الرجاء إدخال التاريخ والوقت", "warning");
      return;
    }

    try {
      await axios.post(
        `${API}/CreateAppointment`,
        {
          date: createForm.date,
          Time: normalizeTime(createForm.time),
          Notes: createForm.notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage("تم إنشاء الموعد بنجاح وسيظهر للمشتركين", "success");
      setOpenCreateDialog(false);
      setCreateForm({ date: "", time: "", notes: "" });
    } catch (err) {
      console.error(
        "Create appointment error:",
        err.response?.status,
        err.response?.data || err.message
      );
      showMessage(`فشل إنشاء الموعد: ${getErrorMessage(err)}`, "error");
    }
  };

  const handleApprove = async (appointmentId) => {
    if (!appointmentId) return;

    if (!meetingLink) {
      showMessage("الرجاء إدخال رابط اللقاء", "warning");
      return;
    }

    try {
      await axios.put(
        `${API}/ApproveAppointment/${appointmentId}`,
        { meetingLink },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage("تمت الموافقة على الموعد", "success");
      setOpenMeetingDialog(false);
      setMeetingLink("");
      setSelectedAppointment(null);
      await fetchNutritionistAppointments();
    } catch (err) {
      console.error(
        "Approve error:",
        err.response?.status,
        err.response?.data || err.message
      );
      showMessage(`فشل الموافقة: ${getErrorMessage(err)}`, "error");
    }
  };

  const handleReject = async (appointmentId) => {
    if (!appointmentId) return;

    try {
      await axios.post(
        `${API}/RejectAppointment/${appointmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage("تم رفض الموعد", "success");
      await fetchNutritionistAppointments();
    } catch (err) {
      console.error(
        "Reject error:",
        err.response?.status,
        err.response?.data || err.message
      );
      showMessage(`فشل الرفض: ${getErrorMessage(err)}`, "error");
    }
  };

  const handleComplete = async (appointmentId) => {
    if (!appointmentId) return;

    try {
      await axios.put(
        `${API}/completed/${appointmentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage("تم إنهاء الموعد", "success");
      await fetchNutritionistAppointments();
    } catch (err) {
      console.error(
        "Complete error:",
        err.response?.status,
        err.response?.data || err.message
      );
      showMessage(`فشل إنهاء الموعد: ${getErrorMessage(err)}`, "error");
    }
  };

  const renderAppointmentCard = (app, isPending = false) => {
    const status = (app.status || "").toLowerCase();

    return (
      <Card key={app.id} sx={{ mb: 2, p: 2, borderLeft: "4px solid #2e7d32" }}>
        <Typography variant="h6">
          {app.clientName || app.clientFullName || "Client"} - ID: {app.id}
        </Typography>

        <Typography sx={{ mt: 1 }}>
          {app.date} | {app.time || app.Time} | {app.type || "-"}
        </Typography>

        <Chip
          label={app.status || "Pending"}
          color={status === "confirmed" ? "success" : "warning"}
          size="small"
          sx={{ mt: 1 }}
        />

        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {isPending && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setSelectedAppointment(app);
                  setOpenMeetingDialog(true);
                }}
              >
                Approve
              </Button>

              <Button
                variant="outlined"
                color="error"
                onClick={() => handleReject(app.id)}
              >
                Reject
              </Button>
            </>
          )}

          {status === "confirmed" && (
            <Button variant="contained" onClick={() => handleComplete(app.id)}>
              Complete
            </Button>
          )}
        </Box>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Nutritionist Appointments
        </Typography>

        <Box>
          <Button
            variant="outlined"
            onClick={fetchNutritionistAppointments}
            startIcon={<RefreshIcon />}
          >
            تحديث
          </Button>

          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenCreateDialog(true)}
            startIcon={<AddIcon />}
            sx={{ ml: 1 }}
          >
            Create Slot
          </Button>
        </Box>
      </Box>

      <Paper>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 2 }}>
          <Tab label={`Pending (${pendingAppointments.length})`} />
          <Tab label={`Appointments (${allAppointments.length})`} />
        </Tabs>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            {tabValue === 0 &&
              (pendingAppointments.length === 0 ? (
                <Typography color="text.secondary">
                  لا توجد مواعيد بانتظار الموافقة
                </Typography>
              ) : (
                pendingAppointments.map((app) => renderAppointmentCard(app, true))
              ))}

            {tabValue === 1 &&
              (allAppointments.length === 0 ? (
                <Typography color="text.secondary">لا توجد مواعيد محجوزة</Typography>
              ) : (
                allAppointments.map((app) =>
                  renderAppointmentCard(
                    app,
                    (app.status || "").toLowerCase() === "pending"
                  )
                )
              ))}
          </Box>
        )}
      </Paper>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)}>
        <DialogTitle>Create Appointment</DialogTitle>

        <DialogContent>
          <TextField
            label="Date"
            type="date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={createForm.date}
            onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
          />

          <TextField
            label="Time"
            type="time"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={createForm.time}
            onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })}
          />

          <TextField
            label="Notes"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            value={createForm.notes}
            onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleCreateAppointment}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openMeetingDialog} onClose={() => setOpenMeetingDialog(false)}>
        <DialogTitle>Meeting Link</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Zoom / Google Meet link"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenMeetingDialog(false)}>إلغاء</Button>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleApprove(selectedAppointment?.id)}
          >
            إرسال
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}