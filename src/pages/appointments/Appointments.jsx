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
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
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
    if (time.length === 5) return `${time}:00`;
    return time;
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchNutritionistAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/NutritionistAppointment`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = Array.isArray(res.data) ? res.data : [];
      if (res.data?.$values && Array.isArray(res.data.$values)) {
        data = res.data.$values;
      }
      setAllAppointments(data);
      setPendingAppointments(
        data.filter((app) => (app.status || "").toLowerCase() === "pending")
      );
    } catch (err) {
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
      const payload = {
        date: createForm.date,
        time: normalizeTime(createForm.time),
        notes: createForm.notes,
      };
      await axios.post(`${API}/CreateAppointment`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      showMessage("✅ تم إنشاء الموعد بنجاح", "success");
      setOpenCreateDialog(false);
      setCreateForm({ date: "", time: "", notes: "" });
      await fetchNutritionistAppointments();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.title || getErrorMessage(err);
      showMessage(`❌ فشل إنشاء الموعد: ${errorMsg}`, "error");
    }
  };

  // ✅ الموافقة على موعد داخل العيادة (بدون رابط)
  const approveInClinicAppointment = async (appointmentId) => {
    if (!appointmentId) return;
    try {
      await axios.put(
        `${API}/ApproveAppointment/${appointmentId}`,
        { meetingLink: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage("✅ تمت الموافقة على الموعد (داخل العيادة)", "success");
      await fetchNutritionistAppointments();
    } catch (err) {
      showMessage(`❌ فشل الموافقة: ${getErrorMessage(err)}`, "error");
    }
  };

  // الموافقة على الموعد الأونلاين (تتطلب رابط)
  const handleApproveOnline = async () => {
    if (!selectedAppointment) return;
    if (!meetingLink) {
      showMessage("الرجاء إدخال رابط اللقاء", "warning");
      return;
    }
    try {
      await axios.put(
        `${API}/ApproveAppointment/${selectedAppointment.id}`,
        { meetingLink },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showMessage("✅ تمت الموافقة على الموعد (أونلاين)", "success");
      setOpenMeetingDialog(false);
      setMeetingLink("");
      setSelectedAppointment(null);
      await fetchNutritionistAppointments();
    } catch (err) {
      showMessage(`❌ فشل الموافقة: ${getErrorMessage(err)}`, "error");
    }
  };

  const handleReject = async (appointmentId) => {
    if (!appointmentId) return;
    try {
      await axios.put(`${API}/RejectAppointment/${appointmentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("✅ تم رفض الموعد", "success");
      await fetchNutritionistAppointments();
    } catch (err) {
      showMessage(`❌ فشل الرفض: ${getErrorMessage(err)}`, "error");
    }
  };

  const handleComplete = async (appointmentId) => {
    if (!appointmentId) return;
    try {
      await axios.put(`${API}/completed/${appointmentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage("✅ تم إنهاء الموعد", "success");
      await fetchNutritionistAppointments();
    } catch (err) {
      showMessage(`❌ فشل إنهاء الموعد: ${getErrorMessage(err)}`, "error");
    }
  };

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, "_blank");
    } else {
      showMessage("رابط اللقاء غير متوفر بعد", "warning");
    }
  };

  const renderAppointmentCard = (app, isPending = false) => {
    const status = (app.status || "").toLowerCase();
    return (
      <Card key={app.id} sx={{ mb: 2, p: 2, borderLeft: "4px solid #2e7d32" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Typography variant="h6">
            {app.clientName || app.clientFullName || "موعد جديد"} 
            {app.clientId && ` - ID: ${app.clientId}`}
          </Typography>
        </Box>
        <Typography sx={{ mt: 1 }}>
          📅 {app.date} | 🕐 {app.time || app.Time} | 🏷️ {app.type === "inclinic" ? "عيادة" : "أونلاين"}
        </Typography>
        <Chip
          label={app.status || "قيد الانتظار"}
          color={status === "confirmed" || status === "approved" ? "success" : "warning"}
          size="small"
          sx={{ mt: 1 }}
        />
        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {isPending && (
            <>
              {app.type === "inclinic" ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => approveInClinicAppointment(app.id)}
                >
                  ✅ موافقة (عيادة)
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setSelectedAppointment(app);
                    setOpenMeetingDialog(true);
                  }}
                >
                  ✅ موافقة (أونلاين)
                </Button>
              )}
              <Button variant="outlined" color="error" onClick={() => handleReject(app.id)}>
                ❌ رفض
              </Button>
            </>
          )}
          {status === "confirmed" && (
            <>
              <Button variant="outlined" color="primary" onClick={() => handleJoinMeeting(app.meetingLink)}>
                🔗 انضمام
              </Button>
              <Button variant="contained" color="secondary" onClick={() => handleComplete(app.id)}>
                ✅ إنهاء
              </Button>
            </>
          )}
        </Box>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header and rest of the JSX remains the same */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">📋 مواعيد الأخصائي</Typography>
        <Box>
          <Button variant="outlined" onClick={fetchNutritionistAppointments} startIcon={<RefreshIcon />}>🔄 تحديث</Button>
          <Button variant="contained" color="primary" onClick={() => setOpenCreateDialog(true)} startIcon={<AddIcon />} sx={{ ml: 1 }}>➕ إنشاء موعد</Button>
        </Box>
      </Box>

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ px: 2, borderBottom: 1, borderColor: "divider" }}>
          <Tab label={`⏳ قيد الانتظار (${pendingAppointments.length})`} />
          <Tab label={`📅 جميع المواعيد (${allAppointments.length})`} />
        </Tabs>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (pendingAppointments.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: "center", py: 5 }}>✨ لا توجد مواعيد بانتظار الموافقة</Typography>
            ) : (
              pendingAppointments.map((app) => renderAppointmentCard(app, true))
            ))}
            {tabValue === 1 && (allAppointments.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: "center", py: 5 }}>📭 لا توجد مواعيد محجوزة</Typography>
            ) : (
              allAppointments.map((app) => renderAppointmentCard(app, (app.status || "").toLowerCase() === "pending"))
            ))}
          </Box>
        )}
      </Paper>

      {/* Dialog for creating appointment (unchanged) */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        {/* ... same as before ... */}
      </Dialog>

      {/* Dialog for meeting link (online only) */}
      <Dialog open={openMeetingDialog} onClose={() => setOpenMeetingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>🔗 إضافة رابط اللقاء (أونلاين)</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            📅 {selectedAppointment?.date} | 🕐 {selectedAppointment?.time || selectedAppointment?.Time}
          </Typography>
          <TextField
            fullWidth
            label="رابط Zoom / Google Meet"
            placeholder="https://zoom.us/j/..."
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            helperText="أدخل الرابط الذي سيستخدمه العميل للانضمام للقاء"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMeetingDialog(false)}>إلغاء</Button>
          <Button variant="contained" color="success" onClick={handleApproveOnline} disabled={!meetingLink}>
            إرسال واعتماد
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}