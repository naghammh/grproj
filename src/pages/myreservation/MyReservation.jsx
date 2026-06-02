import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  Chip,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Alert,
  Snackbar,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { BookmarkAdd as BookIcon } from "@mui/icons-material";
import axios from "axios";

const API = "https://nutrilife.runasp.net/api/Appointment";

function MyReservation() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [subscriptionId, setSubscriptionId] = useState(null);
  const [clientId, setClientId] = useState(null);

  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState("inclinic");

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

  const getClientIdFromToken = () => {
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(base64));

      return (
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded["nameid"] ||
        decoded["sub"] ||
        decoded["id"] ||
        decoded["userId"] ||
        decoded["UserId"] ||
        null
      );
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  };

  const fetchSubscriptionId = async (cId) => {
    if (!cId) return null;

    try {
      const res = await axios.get(
        `https://nutrilife.runasp.net/api/Subscription/clientHistory/${cId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log("Subscriptions:", res.data);

      const list = Array.isArray(res.data) ? res.data : [];
      console.log("Subscriptions:", list);

      const activeSub =
        list.find((s) =>
          ["active", "approved"].includes((s.status || "").toLowerCase())
        ) || list[0];

      if (activeSub?.id) {
        setSubscriptionId(activeSub.id);
        return activeSub.id;
      }

      showMessage("لا يوجد اشتراك فعال لهذا المراجع", "warning");
      return null;
    } catch (err) {
      console.error(
        "Subscription error:",
        err.response?.status,
        err.response?.data || err.message
      );
      showMessage(`فشل جلب الاشتراك: ${getErrorMessage(err)}`, "error");
      return null;
    }
  };

  const fetchAvailableSlots = async (subId) => {
    if (!subId) {
      setAvailableSlots([]);
      return [];
    }

    try {
      const res = await axios.get(`${API}/AvailableAppointments/${subId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      console.log("Available slots:", data);

      setAvailableSlots(data);
      return data;
    } catch (err) {
      console.error(
        "Available appointments error:",
        err.response?.status,
        err.response?.data || err.message
      );
      showMessage(`فشل جلب المواعيد المتاحة: ${getErrorMessage(err)}`, "error");
      setAvailableSlots([]);
      return [];
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const res = await axios.get(`${API}/ClientAppointment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = Array.isArray(res.data) ? res.data : [];
      console.log("Client appointments:", data);

      const now = new Date();
      const upcomingApps = [];
      const pastApps = [];

      data.forEach((app) => {
        const status = (app.status || "").toLowerCase();
        const dateText = `${app.date || ""} ${app.time || app.Time || ""}`;
        const appDate = new Date(dateText);

        if (status === "completed" || appDate < now) {
          pastApps.push(app);
        } else {
          upcomingApps.push(app);
        }
      });

      setUpcoming(upcomingApps);
      setPast(pastApps);
    } catch (err) {
      console.error(
        "Client appointments error:",
        err.response?.status,
        err.response?.data || err.message
      );
      setUpcoming([]);
      setPast([]);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const cId = getClientIdFromToken();
      setClientId(cId);

      if (!cId) {
        showMessage("لم يتم العثور على رقم المراجع من التوكن", "error");
        setLoading(false);
        return;
      }

      const subId = await fetchSubscriptionId(cId);

      if (subId) {
        await fetchAvailableSlots(subId);
      }

      await fetchMyAppointments();
      setLoading(false);
    };

    init();
  }, []);

  const handleBookAppointment = async () => {
    if (!selectedSlot || !subscriptionId) {
      showMessage("اختاري موعد أولاً", "warning");
      return;
    }

    try {
      await axios.post(
        `${API}/ReserveAppointment`,
        {
          Id: selectedSlot.id,
          SubscriptionId: subscriptionId,
          type: appointmentType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showMessage("تم حجز الموعد بنجاح", "success");
      setOpenBookDialog(false);
      setSelectedSlot(null);

      await fetchAvailableSlots(subscriptionId);
      await fetchMyAppointments();
    } catch (err) {
      console.error(
        "Reserve appointment error:",
        err.response?.status,
        err.response?.data || err.message
      );
      showMessage(`فشل الحجز: ${getErrorMessage(err)}`, "error");
    }
  };

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, "_blank");
    } else {
      showMessage("رابط اللقاء غير متوفر بعد", "warning");
    }
  };

  const handleCancelAppointment = async () => {
    showMessage("إلغاء الموعد غير مربوط حالياً", "warning");
    setOpenCancelDialog(false);
  };

  const submitReview = async () => {
    showMessage("تم إرسال التقييم بنجاح", "success");
    setOpenReviewDialog(false);
    setRating(0);
    setReviewComment("");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: 3 }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "primary.main", color: "#fff" }}>
        <Typography variant="h5" fontWeight="bold">
          My Reservation
        </Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          إدارة مواعيدك مع الأخصائي
        </Typography>
      </Paper>

      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "#fff3e0" }}>
        <Typography variant="body2">Client ID: {clientId || "غير موجود"}</Typography>
        <Typography variant="body2">Subscription ID: {subscriptionId || "غير موجود"}</Typography>
        <Typography variant="body2">Available Slots: {availableSlots.length}</Typography>
      </Paper>

      {availableSlots.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#2e7d32" }}>
            Available Appointments
          </Typography>

          <Grid container spacing={2}>
            {availableSlots.map((slot) => (
              <Grid item xs={12} sm={6} md={4} key={slot.id}>
                <Card sx={{ p: 2, borderLeft: "4px solid #2e7d32" }}>
                  <Typography fontWeight="bold">{slot.date}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    {slot.time || slot.Time}
                  </Typography>

                  {slot.notes && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {slot.notes}
                    </Typography>
                  )}

                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={<BookIcon />}
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setSelectedSlot(slot);
                      setAppointmentType("inclinic");
                      setOpenBookDialog(true);
                    }}
                  >
                    Book Appointment
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab label={`القادمة (${upcoming.length})`} />
          <Tab label={`السابقة (${past.length})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 &&
            (upcoming.length > 0 ? (
              upcoming.map((app) => (
                <Card key={app.id} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="h6">
                    {app.specialistName || app.nutritionistName || "أخصائي تغذية"}
                  </Typography>

                  <Typography>{app.date}</Typography>
                  <Typography>{app.time || app.Time}</Typography>

                  <Chip
                    label={app.status || "Pending"}
                    color={(app.status || "").toLowerCase() === "confirmed" ? "success" : "warning"}
                    size="small"
                    sx={{ mt: 1 }}
                  />

                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleJoinMeeting(app.meetingLink)}
                    >
                      Join
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setSelectedAppointment(app);
                        setOpenCancelDialog(true);
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Card>
              ))
            ) : (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <Typography color="text.secondary">لا توجد حجوزات قادمة</Typography>
              </Box>
            ))}

          {tabValue === 1 &&
            (past.length > 0 ? (
              past.map((app) => (
                <Card key={app.id} sx={{ mb: 2, p: 2 }}>
                  <Typography variant="h6">
                    {app.specialistName || app.nutritionistName || "أخصائي تغذية"}
                  </Typography>

                  <Typography>{app.date}</Typography>
                  <Typography>{app.time || app.Time}</Typography>

                  <Chip label={app.status || "Completed"} size="small" sx={{ mt: 1 }} />

                  <Button
                    sx={{ mt: 2 }}
                    variant="outlined"
                    onClick={() => {
                      setSelectedAppointment(app);
                      setOpenReviewDialog(true);
                    }}
                  >
                    تقييم
                  </Button>
                </Card>
              ))
            ) : (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <Typography color="text.secondary">لا توجد حجوزات سابقة</Typography>
              </Box>
            ))}
        </Box>
      </Paper>

      <Dialog open={openBookDialog} onClose={() => setOpenBookDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>حجز موعد جديد</DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {selectedSlot?.date} | {selectedSlot?.time || selectedSlot?.Time}
            </Typography>

            <FormControl fullWidth>
              <InputLabel>نوع الموعد</InputLabel>
              <Select
                value={appointmentType}
                label="نوع الموعد"
                onChange={(e) => setAppointmentType(e.target.value)}
              >
                <MenuItem value="inclinic">وجاهي</MenuItem>
                <MenuItem value="online">إلكتروني</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenBookDialog(false)}>إلغاء</Button>
          <Button variant="contained" onClick={handleBookAppointment}>
            تأكيد الحجز
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>إلغاء الحجز</DialogTitle>
        <DialogContent>
          <Typography>هل أنت متأكد من إلغاء هذا الحجز؟</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>تراجع</Button>
          <Button onClick={handleCancelAppointment} color="error" variant="contained">
            إلغاء الحجز
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تقييم الأخصائي</DialogTitle>

        <DialogContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedAppointment?.specialistName || "الأخصائي"}
            </Typography>

            <Rating
              value={rating}
              onChange={(e, v) => setRating(v)}
              size="large"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="اكتب تعليقك عن الجلسة..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>إلغاء</Button>
          <Button onClick={submitReview} variant="contained">
            إرسال التقييم
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default MyReservation;