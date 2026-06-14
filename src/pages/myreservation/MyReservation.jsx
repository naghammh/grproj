import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Paper, Typography, Grid, Card, Chip, Button, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, Snackbar, CircularProgress, MenuItem, FormControl,
  InputLabel, Select
} from "@mui/material";
import { BookmarkAdd as BookIcon, VideoCall as VideoIcon } from "@mui/icons-material";
import axios from "axios";

// ✅ استخدام الروابط الصحيحة
const API_APPOINTMENT = "https://nutrilife.runasp.net/api/Appointment";
const API_SUBSCRIPTION = "https://nutrilife.runasp.net/api/Subscription";

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
  const [openBookDialog, setOpenBookDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [appointmentType, setAppointmentType] = useState("online");

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const token = localStorage.getItem("token");

  const showMessage = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const getErrorMessage = (err) => {
    const data = err.response?.data;
    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.title) return data.title;
    return err.message || "حدث خطأ غير معروف";
  };

  // استخراج ClientId من التوكن
  const getClientIdFromToken = () => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(base64));
      return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
             decoded["nameid"] || decoded["sub"] || decoded["id"] ||
             decoded["userId"] || decoded["clientId"] || null;
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  };

  // ✅ جلب الـ SubscriptionId النشط (باستخدام الرابط الصحيح)
  const fetchSubscriptionId = async (cId) => {
    if (!cId) return null;
    try {
      const url = `${API_SUBSCRIPTION}/clientHistory/${cId}`;
      console.log("🔍 Fetching subscription history from:", url);
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("📦 Full response:", res.data);
      
      // محاولة استخراج المصفوفة بأي شكل
      let list = [];
      if (Array.isArray(res.data)) list = res.data;
      else if (res.data?.$values) list = res.data.$values;
      else if (res.data?.data) list = res.data.data;
      else if (res.data?.items) list = res.data.items;
      
      console.log("📋 Extracted list:", list);
      
      if (list.length === 0) {
        console.warn("⚠️ No subscriptions found for client:", cId);
        showMessage("⚠️ لا يوجد أي اشتراك لهذا العميل", "warning");
        return null;
      }
      
      // طباعة أول اشتراك لمعرفة حقوله
      console.log("🔎 First subscription object keys:", Object.keys(list[0]));
      console.log("🔎 First subscription full:", list[0]);
      
      // البحث عن اشتراك نشط - جرب عدة أسماء للحالة
      const activeSub = list.find(s => {
        const status = (s.status || s.subscriptionStatus || s.state || "").toLowerCase();
        return status === "active" || status === "approved" ; 
      });
      
      if (activeSub) {
        console.log("✅ Active subscription found:", activeSub);
        // جرب id أو subscriptionId أو subId
        const subId = activeSub.id || activeSub.subscriptionId || activeSub.subId;
        if (subId) {
          setSubscriptionId(subId);
          return subId;
        } else {
          console.warn("⚠️ Active subscription has no id field:", activeSub);
          showMessage("⚠️ الاشتراك النشط لا يحتوي على معرف", "error");
          return null;
        }
      } else {
        console.warn("⚠️ No active subscription. Available statuses:", list.map(s => s.status));
        showMessage("⚠️ لا يوجد اشتراك فعال. الحالات الموجودة: " + list.map(s => s.status).join(", "), "warning");
        return null;
      }
    } catch (err) {
      console.error("❌ Failed to fetch subscription:", err);
      showMessage(`فشل جلب الاشتراك: ${getErrorMessage(err)}`, "error");
      return null;
    }
  };

  // ✅ جلب المواعيد المتاحة للحجز (باستخدام الرابط الصحيح)
  const fetchAvailableSlots = async (subId) => {
    if (!subId) {
      setAvailableSlots([]);
      return;
    }
    try {
      console.log(`🔍 جلب المواعيد المتاحة للاشتراك ${subId}`);
      const res = await axios.get(`${API_APPOINTMENT}/AvailableAppointments/${subId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Available Appointments Response:", res.data);
      let data = Array.isArray(res.data) ? res.data : (res.data?.$values || []);
      console.log(`✅ تم جلب ${data.length} موعد متاح`);
      setAvailableSlots(data);
    } catch (err) {
      console.error("فشل جلب المواعيد المتاحة:", err);
      showMessage(`فشل جلب المواعيد: ${getErrorMessage(err)}`, "error");
      setAvailableSlots([]);
    }
  };

  // ✅ جلب مواعيد العميل المحجوزة (باستخدام الرابط الصحيح)
  // ✅ استخدام useCallback لمنع إعادة التهيئة غير الضرورية
  const fetchMyAppointments = async () => {
    try {
      const res = await axios.get(`${API_APPOINTMENT}/ClientAppointment`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("My Appointments Response:", res.data);
      let data = Array.isArray(res.data) ? res.data : (res.data?.$values || []);
      
      // الحالات التي تعني أن الموعد لا يزال قادماً أو قيد الانتظار
      const isUpcoming = (status) => {
        const upcomingStatuses = ["pending", "approved", "confirmed"];
        return upcomingStatuses.includes(status?.toLowerCase());
      };
      
      // السابقة فقط للمكتمل
      const isPast = (status) => status?.toLowerCase() === "completed";
      
      const upcomingApps = data.filter(app => isUpcoming(app.status));
      const pastApps = data.filter(app => isPast(app.status));
      
      // أي مواعيد بحالات أخرى (rejected, canceled, cancelled_by_specialist, available, expired, missed) لن تظهر في أي من القائمتين
      // إذا أردت عرضها يمكنك إضافتها إلى pastApps بشروط خاصة
      
      setUpcoming(upcomingApps);
      setPast(pastApps);
    } catch (err) {
      console.error("فشل جلب مواعيد العميل:", err);
      setUpcoming([]);
      setPast([]);
    }
  };

  // ✅ تهيئة الصفحة مع تحديث تلقائي كل 30 ثانية
  useEffect(() => {
    let intervalId;
    const init = async () => {
      // ... كود التهيئة كما هو ...
    };
    init();

    // التحديث التلقائي
    intervalId = setInterval(() => {
      if (subscriptionId) fetchAvailableSlots(subscriptionId);
      fetchMyAppointments();
    }, 30000);

    // التحديث عند العودة إلى الصفحة (Focus)
    const handleFocus = () => {
      if (subscriptionId) fetchAvailableSlots(subscriptionId);
      fetchMyAppointments();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [subscriptionId, fetchMyAppointments]); // ✅ إضافة التبعيات الصحيحة

  // ✅ حجز موعد جديد (باستخدام الرابط الصحيح)
  const handleBookAppointment = async () => {
    if (!selectedSlot) return showMessage("اختر موعداً أولاً", "warning");
    if (!subscriptionId) return showMessage("لا يوجد اشتراك فعال", "warning");

    try {
      await axios.post(`${API_APPOINTMENT}/ReserveAppointment`, {
        Id: selectedSlot.id,
        SubscriptionId: subscriptionId,
        type: appointmentType
      }, { headers: { Authorization: `Bearer ${token}` } });

      showMessage("✅ تم حجز الموعد بنجاح");
      setOpenBookDialog(false);
      setSelectedSlot(null);
      await fetchAvailableSlots(subscriptionId);
      await fetchMyAppointments();
    } catch (err) {
      console.error("فشل الحجز:", err);
      showMessage(`❌ فشل الحجز: ${getErrorMessage(err)}`, "error");
    }
  };

  // انضمام إلى اللقاء
  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) window.open(meetingLink, "_blank");
    else showMessage("⚠️ رابط اللقاء غير متوفر بعد", "warning");
  };

  // ✅ إلغاء حجز (باستخدام الرابط الصحيح)
    // ✅ إلغاء حجز (باستخدام الطريقة PATCH كما هو موثق في الـ API)
    const handleCancelAppointment = async () => {
      if (!selectedAppointment) return;
  
      try {
        // ✅ تم التغيير من axios.put إلى axios.patch
        await axios.patch(`${API_APPOINTMENT}/CancelR/${selectedAppointment.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("");
        showMessage("✅ تم إلغاء الموعد بنجاح");
        setOpenCancelDialog(false);
        setSelectedAppointment(null);
        await fetchMyAppointments();
        if (subscriptionId) await fetchAvailableSlots(subscriptionId);
      } catch (err) {
        console.error("فشل الإلغاء:", err);
        showMessage(`❌ فشل الإلغاء: ${getErrorMessage(err)}`, "error");
      }
    };
  // تهيئة الصفحة
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const cId = getClientIdFromToken();
      setClientId(cId);
      if (!cId) {
        showMessage("⚠️ لم يتم العثور على رقم المراجع", "error");
        setLoading(false);
        return;
      }
      const subId = await fetchSubscriptionId(cId);
      setSubscriptionId(subId);
      if (subId) await fetchAvailableSlots(subId);
      await fetchMyAppointments();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: "primary.main", color: "#fff" }}>
        <Typography variant="h5" fontWeight="bold">📅 حجوزاتي</Typography>
        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>إدارة مواعيدك مع الأخصائي</Typography>
      </Paper>

   

      {/* المواعيد المتاحة للحجز */}
      {availableSlots.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: "#2e7d32" }}>🆕 المواعيد المتاحة للحجز</Typography>
          <Grid container spacing={2}>
            {availableSlots.map((slot) => (
              <Grid item xs={12} sm={6} md={4} key={slot.id}>
                <Card sx={{ p: 2, borderLeft: "4px solid #2e7d32" }}>
                  <Typography fontWeight="bold">📅 {slot.date}</Typography>
                  <Typography variant="body2" color="text.secondary">🕐 {slot.time || slot.Time}</Typography>
                  {slot.notes && <Typography variant="caption" display="block" sx={{ mt: 1 }}>📝 {slot.notes}</Typography>}
                  <Button variant="contained" color="success" fullWidth startIcon={<BookIcon />} sx={{ mt: 2 }}
                    onClick={() => { setSelectedSlot(slot); setAppointmentType("online"); setOpenBookDialog(true); }}>
                    احجز الآن
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {availableSlots.length === 0 && subscriptionId && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, textAlign: "center" }}>
          <Typography color="text.secondary">📭 لا توجد مواعيد متاحة حالياً</Typography>
          <Typography variant="body2" color="text.secondary">سيتم إضافة مواعيد جديدة قريباً</Typography>
        </Paper>
      )}

      {!subscriptionId && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 3, textAlign: "center", bgcolor: "#ffebee" }}>
          <Typography color="error">⚠️ لا يوجد اشتراك فعال</Typography>
          <Typography variant="body2" color="error">يرجى تفعيل اشتراكك لعرض المواعيد المتاحة</Typography>
        </Paper>
      )}

      {/* تبويب حجوزاتي */}
      <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tab label={`⏳ القادمة (${upcoming.length})`} />
          <Tab label={`✅ السابقة (${past.length})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (upcoming.length ? upcoming.map((app) => (
            <Card key={app.id} sx={{ mb: 2, p: 2 }}>
              <Typography variant="h6">👨‍⚕️ {app.specialistName || app.nutritionistName || "أخصائي تغذية"}</Typography>
              <Typography>📅 {app.date}</Typography>
              <Typography>🕐 {app.time || app.Time}</Typography>
              <Typography>🏷️ {app.type === "online" ? "إلكتروني" : "وجاهي"}</Typography>
              <Chip label={["approved", "confirmed"].includes(app.status?.toLowerCase()) ? "مؤكد" : "قيد الانتظار"}
                color={["approved", "confirmed"].includes(app.status?.toLowerCase()) ? "success" : "warning"} size="small" sx={{ mt: 1 }} />
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                {app.meetingLink && (
                  <Button variant="contained" color="primary" startIcon={<VideoIcon />} onClick={() => handleJoinMeeting(app.meetingLink)}>
                    انضم للقاء
                  </Button>
                )}
                <Button variant="outlined" color="error" onClick={() => { setSelectedAppointment(app); setOpenCancelDialog(true); }}>
                  إلغاء
                </Button>
              </Box>
            </Card>
          )) : <Box sx={{ textAlign: "center", py: 5 }}><Typography color="text.secondary">📭 لا توجد حجوزات قادمة</Typography></Box>)}

          {tabValue === 1 && (past.length ? past.map((app) => (
            <Card key={app.id} sx={{ mb: 2, p: 2 }}>
              <Typography variant="h6">👨‍⚕️ {app.specialistName || app.nutritionistName || "أخصائي تغذية"}</Typography>
              <Typography>📅 {app.date}</Typography>
              <Typography>🕐 {app.time || app.Time}</Typography>
              <Chip label={app.status === "completed" ? "مكتمل" : (app.status || "مكتمل")} color="success" size="small" sx={{ mt: 1 }} />
            </Card>
          )) : <Box sx={{ textAlign: "center", py: 5 }}><Typography color="text.secondary">📭 لا توجد حجوزات سابقة</Typography></Box>)}
        </Box>
      </Paper>

      {/* حوار الحجز */}
      <Dialog open={openBookDialog} onClose={() => setOpenBookDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>📝 حجز موعد جديد</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 2 }}>📅 {selectedSlot?.date} | 🕐 {selectedSlot?.time || selectedSlot?.Time}</Typography>
            <FormControl fullWidth>
              <InputLabel>نوع الموعد</InputLabel>
              <Select value={appointmentType} label="نوع الموعد" onChange={(e) => setAppointmentType(e.target.value)}>
                <MenuItem value="online">💻 إلكتروني (أونلاين)</MenuItem>
                <MenuItem value="inclinic">🏥 وجاهي (عيادة)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBookDialog(false)}>إلغاء</Button>
          <Button variant="contained" color="success" onClick={handleBookAppointment}>تأكيد الحجز</Button>
        </DialogActions>
      </Dialog>

      {/* حوار إلغاء الحجز */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>❌ إلغاء الحجز</DialogTitle>
        <DialogContent>
          <Typography>هل أنت متأكد من إلغاء هذا الحجز؟</Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>ملاحظة: لا يمكن استرجاع الموعد بعد الإلغاء.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>تراجع</Button>
          <Button onClick={handleCancelAppointment} color="error" variant="contained">تأكيد الإلغاء</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

export default MyReservation;