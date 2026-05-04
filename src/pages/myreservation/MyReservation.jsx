import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
} from "@mui/material";
import {
  Videocam as VideoIcon,
  DateRange as DateIcon,
  AccessTime as TimeIcon,
  Cancel as CancelIcon,
  Chat as ChatIcon,
  Star as StarIcon,
} from "@mui/icons-material";

function MyReservation() {
  const [tabValue, setTabValue] = useState(0);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [rating, setRating] = useState(0);

  const [appointments, setAppointments] = useState({
    upcoming: [
      {
        id: 1,
        specialistName: "د. أحمد محمد",
        specialistImage: "https://randomuser.me/api/portraits/men/1.jpg",
        specialty: "أخصائي تغذية",
        date: "2026-01-25",
        time: "4:00 م",
        duration: 30,
        type: "online",
        status: "confirmed",
        meetingLink: "https://zoom.us/meeting/123",
      },
      {
        id: 2,
        specialistName: "د. سارة علي",
        specialistImage: "https://randomuser.me/api/portraits/women/2.jpg",
        specialty: "أخصائية تغذية رياضية",
        date: "2026-01-28",
        time: "11:00 ص",
        duration: 45,
        type: "online",
        status: "pending",
        meetingLink: null,
      },
    ],
    past: [
      {
        id: 3,
        specialistName: "د. أحمد محمد",
        specialistImage: "https://randomuser.me/api/portraits/men/1.jpg",
        specialty: "أخصائي تغذية",
        date: "2026-01-10",
        time: "3:00 م",
        duration: 30,
        type: "online",
        status: "completed",
        hasReview: true,
      },
      {
        id: 4,
        specialistName: "د. سارة علي",
        specialistImage: "https://randomuser.me/api/portraits/women/2.jpg",
        specialty: "أخصائية تغذية رياضية",
        date: "2026-01-05",
        time: "10:00 ص",
        duration: 30,
        type: "online",
        status: "completed",
        hasReview: false,
      },
    ],
  });

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenCancelDialog(true);
  };

  const confirmCancel = () => {
    setAppointments((prev) => ({
      ...prev,
      upcoming: prev.upcoming.filter((a) => a.id !== selectedAppointment.id),
    }));
    setOpenCancelDialog(false);
    setSelectedAppointment(null);
  };

  const handleReviewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenReviewDialog(true);
  };

  const submitReview = () => {
    setAppointments((prev) => ({
      ...prev,
      past: prev.past.map((a) =>
        a.id === selectedAppointment.id ? { ...a, hasReview: true } : a
      ),
    }));
    setOpenReviewDialog(false);
    setRating(0);
  };

  const handleJoinMeeting = (link) => {
    window.open(link, "_blank");
  };

  const AppointmentCard = ({ appointment, isPast = false }) => (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        bgcolor: "background.paper",
        color: "text.primary",
        border: "1px solid",
        borderColor: "divider",
        backgroundImage: "none",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Avatar
            src={appointment.specialistImage}
            sx={{ width: 60, height: 60 }}
          />

          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {appointment.specialistName}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {appointment.specialty}
                </Typography>
              </Box>

              <Chip
                label={
                  appointment.status === "confirmed"
                    ? "مؤكد"
                    : appointment.status === "pending"
                    ? "قيد المراجعة"
                    : "مكتمل"
                }
                color={
                  appointment.status === "confirmed"
                    ? "success"
                    : appointment.status === "pending"
                    ? "warning"
                    : "default"
                }
                size="small"
              />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <DateIcon color="action" fontSize="small" />
                  <Typography variant="body2">{appointment.date}</Typography>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TimeIcon color="action" fontSize="small" />
                  <Typography variant="body2">
                    {appointment.time} ({appointment.duration} دقيقة)
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
              {!isPast &&
                appointment.status === "confirmed" &&
                appointment.meetingLink && (
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<VideoIcon />}
                    onClick={() => handleJoinMeeting(appointment.meetingLink)}
                  >
                    انضم للجلسة
                  </Button>
                )}

              {!isPast && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleCancelClick(appointment)}
                >
                  إلغاء
                </Button>
              )}

              {isPast && !appointment.hasReview && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<StarIcon />}
                  onClick={() => handleReviewClick(appointment)}
                >
                  تقييم الأخصائي
                </Button>
              )}

              <Button variant="text" size="small" startIcon={<ChatIcon />}>
                مراسلة
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: "primary.main",
          color: "#fff",
          backgroundImage: "none",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          My Reservation
        </Typography>

        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          إدارة مواعيدك مع الأخصائيين
        </Typography>
      </Paper>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.paper",
          color: "text.primary",
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 2,
            "& .MuiTab-root": {
              color: "text.secondary",
            },
            "& .Mui-selected": {
              color: "primary.main",
            },
          }}
        >
          <Tab label={`القادمة (${appointments.upcoming.length})`} />
          <Tab label={`السابقة (${appointments.past.length})`} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {tabValue === 0 &&
            (appointments.upcoming.length > 0 ? (
              appointments.upcoming.map((app) => (
                <AppointmentCard
                  key={app.id}
                  appointment={app}
                  isPast={false}
                />
              ))
            ) : (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <Typography color="text.secondary">
                  لا توجد حجوزات قادمة
                </Typography>

                <Button variant="contained" sx={{ mt: 2 }}>
                  حجز موعد جديد
                </Button>
              </Box>
            ))}

          {tabValue === 1 &&
            (appointments.past.length > 0 ? (
              appointments.past.map((app) => (
                <AppointmentCard key={app.id} appointment={app} isPast />
              ))
            ) : (
              <Box sx={{ textAlign: "center", py: 5 }}>
                <Typography color="text.secondary">
                  لا توجد حجوزات سابقة
                </Typography>
              </Box>
            ))}
        </Box>
      </Paper>

      <Dialog
  open={openCancelDialog}
  onClose={() => setOpenCancelDialog(false)}
  PaperProps={{
    sx: {
      bgcolor: "background.paper",
      color: "text.primary",
      backgroundImage: "none",
    },
  }}
>
        <DialogTitle>إلغاء الحجز</DialogTitle>

        <DialogContent>
          <Typography>هل أنت متأكد من إلغاء هذا الحجز؟</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>تراجع</Button>
          <Button onClick={confirmCancel} color="error" variant="contained">
            إلغاء الحجز
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
  open={openReviewDialog}
  onClose={() => setOpenReviewDialog(false)}
  maxWidth="sm"
  fullWidth
  PaperProps={{
    sx: {
      bgcolor: "background.paper",
      color: "text.primary",
      backgroundImage: "none",
    },
  }}
>
        <DialogTitle>تقييم الأخصائي</DialogTitle>

        <DialogContent>
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedAppointment?.specialistName}
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
              variant="outlined"
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
    </Box>
  );
}

export default MyReservation;
