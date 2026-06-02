import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  Rating,
  TextField,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TranslateIcon from "@mui/icons-material/Translate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import StarIcon from "@mui/icons-material/Star";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WarningIcon from "@mui/icons-material/Warning";
import PaymentIcon from "@mui/icons-material/Payment";

const GREEN = "#22c55e";
const DARK_GREEN = "#15803d";

const FEEDBACK_API = "https://nutrilife.runasp.net/api/FeedBack/AddFeddback";

const getSoftGreen = (theme) =>
  theme.palette.mode === "dark" ? "rgba(34, 197, 94, 0.14)" : "#e8f5e9";

const getSoftRed = (theme) =>
  theme.palette.mode === "dark" ? "rgba(239, 68, 68, 0.14)" : "#fee2e2";

const themedCardSx = {
  bgcolor: "background.paper",
  color: "text.primary",
  backgroundImage: "none",
  border: "1px solid",
  borderColor: "divider",
};

const getArrayValue = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) return [value];
  return [];
};

const getResponseArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
};

const getPlanId = (plan) => plan?.id ?? plan?.planId ?? plan?.PlanId ?? plan?.Id;

const getSpecialistId = (specialist) =>
  specialist?.id ??
  specialist?.Id ??
  specialist?.nutritionistId ??
  specialist?.NutritionistId ??
  specialist?.userId ??
  specialist?.UserId;

const getSubscriptionId = (sub) =>
  sub?.subscriptionId ?? sub?.SubscriptionId ?? sub?.id ?? sub?.Id;

const getFeedbackSubscriptionId = (fb) =>
  fb?.subscriptionId ??
  fb?.SubscriptionId ??
  fb?.subscribtionId ??
  fb?.SubscribtionId;

function PlanCard({ plan, onSubscribe, subscribing }) {
  if (!plan) return null;

  const planId = getPlanId(plan);
  const title = plan.title ?? plan.Title ?? "Subscription Plan";
  const price = plan.price ?? plan.Price ?? 0;
  const days =
    plan.NumOfDays ?? plan.numOfDays ?? plan.durationDays ?? plan.DurationDays;
  const description = getArrayValue(plan.description ?? plan.Description);

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "2px solid",
        borderColor: "divider",
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "none",
        bgcolor: "background.paper",
        color: "text.primary",
        backgroundImage: "none",
      }}
    >
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>

      {days && (
        <Chip
          label={`${days} days`}
          size="small"
          sx={{
            alignSelf: "flex-start",
            mt: 1,
            bgcolor: getSoftGreen,
            color: GREEN,
            fontWeight: 700,
          }}
        />
      )}

      <Typography variant="h4" fontWeight={900} sx={{ color: GREEN, my: 1 }}>
        ${price}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1} flex={1}>
        {description.length > 0 ? (
          description.map((item, idx) => (
            <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CheckCircleIcon sx={{ color: GREEN, fontSize: 17 }} />
              <Typography variant="body2" color="text.secondary">
                {item}
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No features added yet.
          </Typography>
        )}
      </Stack>

      <Button
        variant="contained"
        fullWidth
        disabled={!planId || subscribing}
        sx={{
          mt: 2.5,
          borderRadius: 2,
          fontWeight: 700,
          bgcolor: GREEN,
          "&:hover": { bgcolor: DARK_GREEN },
        }}
        onClick={() => onSubscribe(plan)}
      >
        {subscribing ? "Requesting..." : "Subscribe"}
      </Button>
    </Card>
  );
}

function NotAvailable({ message = "Not provided" }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        color: "text.secondary",
        fontStyle: "italic",
        py: 1,
      }}
    >
      <WarningIcon sx={{ fontSize: 18 }} />
      <Typography variant="body2">{message}</Typography>
    </Box>
  );
}

export default function Specialist() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [requestingPlanId, setRequestingPlanId] = useState(null);

  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newRate, setNewRate] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ text: "", type: "" });

  const [activeSubscriptionId, setActiveSubscriptionId] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [hasUserLeftFeedback, setHasUserLeftFeedback] = useState(false);

  // New states for subscription flow
  const [pendingSubscription, setPendingSubscription] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [showPayButton, setShowPayButton] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const getAuthToken = () => localStorage.getItem("token");

  const getCurrentUserId = () => {
    const userId = localStorage.getItem("userId");
    if (userId) return userId;

    const token = getAuthToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return (
        payload.sub ||
        payload.userId ||
        payload.id ||
        payload.nameid ||
        payload[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        null
      );
    } catch {
      return null;
    }
  };

  const specialistId = getSpecialistId(spec) || id;

  // Helper to check if token is valid (not expired)
  const isTokenValid = () => {
    const token = getAuthToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp;
      if (exp && Date.now() >= exp * 1000) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  // Check payment status on return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');

    if (paymentStatus === 'success' && specialistId) {
      fetchActiveSubscription(specialistId);
      setSnackbar({ open: true, message: 'Payment successful! Your subscription is now active.', severity: 'success' });
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('pendingSubscription');
      setShowPayButton(false);
      setPendingSubscription(null);
      if (pollingInterval) clearInterval(pollingInterval);
    } else if (paymentStatus === 'failed') {
      setSnackbar({ open: true, message: 'Payment failed. Please try again.', severity: 'error' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [specialistId]);

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");

    const justRegistered = localStorage.getItem("justRegisteredSpecialist");

    if (justRegistered) {
      const specialistData = JSON.parse(justRegistered);
      setSpec(specialistData);
      localStorage.removeItem("justRegisteredSpecialist");
      setLoading(false);
      return;
    }

    axios
      .get("https://nutrilife.runasp.net/api/Account/allNutritionists")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const found = data.find((item) => {
          const foundId = getSpecialistId(item);
          return String(foundId) === String(id);
        });
        if (found) setSpec(found);
        else setError("Specialist not found");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load specialist data");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const nutritionistIdForPlans = getSpecialistId(spec) || id;
    if (!nutritionistIdForPlans) return;

    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const token = getAuthToken();
        const res = await axios.get(
          `https://nutrilife.runasp.net/api/NutritionistPlans/MyPlans/${nutritionistIdForPlans}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setPlans(Array.isArray(res.data) ? res.data : []);
      } catch {
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, [spec, id]);

  const fetchFeedbacks = async (nutritionistId) => {
    setFeedbackLoading(true);
    setFeedbackError("");
    try {
      const token = getAuthToken();
      const res = await axios.get(
        `${FEEDBACK_API}/GetNutriFeddBacks/${nutritionistId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setFeedbacks(getResponseArray(res.data));
    } catch (err) {
      console.error("Fetch feedbacks error:", err.response || err);
      setFeedbackError("Could not load feedbacks.");
      setFeedbacks([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchActiveSubscription = async (nutritionistId) => {
    setLoadingSubscription(true);
    setSubscriptionError("");
    setActiveSubscriptionId(null);

    const token = getAuthToken();
    if (!token) {
      setSubscriptionError("Please log in to leave feedback.");
      setLoadingSubscription(false);
      return;
    }
    if (!currentUserId) {
      setSubscriptionError("Unable to identify current user.");
      setLoadingSubscription(false);
      return;
    }

    try {
      const response = await axios.get(
        `https://nutrilife.runasp.net/api/Subscription/clientHistory/${currentUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const subscriptions = getResponseArray(response.data);
      const activeSub = subscriptions.find((sub) => {
        const subNutritionistId =
          sub.nutritionistId ??
          sub.NutritionistId ??
          sub.nutritionistID ??
          sub.nutritionist?.id ??
          sub.Nutritionist?.Id;
        const status = String(sub.status ?? sub.Status ?? "").toLowerCase();
        return (
          String(subNutritionistId) === String(nutritionistId) &&
          ["approved", "active", "confirmed"].includes(status)
        );
      });
      if (activeSub) {
        setActiveSubscriptionId(getSubscriptionId(activeSub));
      } else {
        setSubscriptionError(
          "You don't have an active subscription with this nutritionist."
        );
      }
    } catch (err) {
      console.error("Subscription verification error:", err.response || err);
      setSubscriptionError("Unable to verify subscription.");
    } finally {
      setLoadingSubscription(false);
    }
  };

  const startPollingSubscriptionStatus = (subscriptionId, firstNameVal, lastNameVal, planTitle) => {
    if (pollingInterval) clearInterval(pollingInterval);

    const interval = setInterval(async () => {
      const token = getAuthToken();
      if (!token || !currentUserId) return;

      try {
        const response = await axios.get(
          `https://nutrilife.runasp.net/api/Subscription/clientHistory/${currentUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const subscriptions = getResponseArray(response.data);
        const foundSub = subscriptions.find(
          (sub) => String(getSubscriptionId(sub)) === String(subscriptionId)
        );

        if (foundSub) {
          const status = String(foundSub.status ?? foundSub.Status ?? "").toLowerCase();
          
          if (status === "approved" || status === "active" || status === "confirmed") {
            setShowPayButton(true);
            setPendingSubscription({
              id: subscriptionId,
              firstName: firstNameVal,
              lastName: lastNameVal,
              planTitle: planTitle,
            });
            setSnackbar({
              open: true,
              message: `Your subscription request has been approved! You can now complete payment.`,
              severity: "success",
            });
            clearInterval(interval);
            setPollingInterval(null);
          } else if (status === "rejected" || status === "cancelled") {
            setSnackbar({
              open: true,
              message: `Your subscription request was rejected.`,
              severity: "error",
            });
            clearInterval(interval);
            setPollingInterval(null);
            setShowPayButton(false);
            setPendingSubscription(null);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    setPollingInterval(interval);
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  // Request subscription (only creation, no payment yet)
  const handleRequestSubscription = async () => {
    if (!firstName.trim() || !lastName.trim() || !paymentMethod) {
      setSnackbar({ open: true, message: "Please fill all fields and select payment method.", severity: "error" });
      return;
    }
    if (!selectedPlan) {
      setSnackbar({ open: true, message: "No plan selected.", severity: "error" });
      return;
    }

    const planId = getPlanId(selectedPlan);
    if (!planId) {
      setSnackbar({ open: true, message: "Plan ID not found.", severity: "error" });
      return;
    }

    // Validate token before proceeding
    if (!isTokenValid()) {
      setSnackbar({ open: true, message: "Your session has expired. Please login again.", severity: "warning" });
      navigate("/login");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setSnackbar({ open: true, message: "Please login first.", severity: "warning" });
      navigate("/login");
      return;
    }

    setModalSubmitting(true);
    setRequestingPlanId(planId);

    try {
      console.log("Sending subscription request with payload:", {
        NutritionistId: specialistId,
        UserPlan: Number(planId),
        notes: `Payment method: ${paymentMethod}, Name: ${firstName} ${lastName}`,
      });
      console.log("Using token:", token ? `${token.substring(0, 20)}...` : "No token");

      const subscriptionRes = await axios.post(
        "https://nutrilife.runasp.net/api/Subscription",
        {
          NutritionistId: specialistId,
          UserPlan: Number(planId),
          notes: `Payment method: ${paymentMethod}, Name: ${firstName} ${lastName}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Subscription response:", subscriptionRes.data);

      const newSubscriptionId =
        subscriptionRes.data?.subscriptionId ??
        subscriptionRes.data?.SubscriptionId ??
        subscriptionRes.data?.id;
      
      if (!newSubscriptionId) {
        throw new Error("No subscription ID returned from server.");
      }

      setPendingSubscription({
        id: newSubscriptionId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        planTitle: selectedPlan.title ?? selectedPlan.Title ?? "Subscription Plan",
      });
      
      startPollingSubscriptionStatus(
        newSubscriptionId,
        firstName.trim(),
        lastName.trim(),
        selectedPlan.title ?? selectedPlan.Title ?? "Subscription Plan"
      );

      setSnackbar({
        open: true,
        message: "Subscription request sent! Waiting for nutritionist approval...",
        severity: "info",
      });
      
      setModalOpen(false);
      setSelectedPlan(null);
      setFirstName("");
      setLastName("");
      setPaymentMethod("");
      
    } catch (err) {
      console.error("Subscription creation error:", err.response || err);
      
      // Handle 403 specifically
      if (err.response?.status === 403) {
        setSnackbar({
          open: true,
          message: "You don't have permission to subscribe. Make sure you are logged in as a client and your account is active.",
          severity: "error",
        });
        // Optionally redirect to login if token might be invalid
        if (!isTokenValid()) {
          setTimeout(() => navigate("/login"), 3000);
        }
      } else {
        const errorMsg =
          err.response?.data?.message ||
          err.response?.data?.title ||
          err.response?.data ||
          "Failed to create subscription. Please try again.";
        setSnackbar({ open: true, message: errorMsg, severity: "error" });
      }
    } finally {
      setModalSubmitting(false);
      setRequestingPlanId(null);
    }
  };

  const handlePayNow = async () => {
    if (!pendingSubscription) {
      setSnackbar({ open: true, message: "No pending subscription found.", severity: "error" });
      return;
    }

    if (!isTokenValid()) {
      setSnackbar({ open: true, message: "Your session has expired. Please login again.", severity: "warning" });
      navigate("/login");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setSnackbar({ open: true, message: "Please login first.", severity: "error" });
      navigate("/login");
      return;
    }

    setModalSubmitting(true);
    try {
      console.log("Initiating payment for subscription:", pendingSubscription.id);
      
      const paymentRes = await axios.post(
        "https://nutrilife.runasp.net/api/Payment",
        {
          SubscriptionId: pendingSubscription.id,
          FirstName: pendingSubscription.firstName,
          LastName: pendingSubscription.lastName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Payment response:", paymentRes.data);

      const paymentUrl = paymentRes.data?.paymentUrl ?? 
                         paymentRes.data?.redirectUrl ?? 
                         paymentRes.data?.url ?? 
                         paymentRes.data?.paymentLink;
      
      if (!paymentUrl) {
        console.error("Payment response missing URL:", paymentRes.data);
        throw new Error("Payment URL not returned from server.");
      }

      window.location.href = paymentUrl;
      
    } catch (err) {
      console.error("Payment error:", err.response || err);
      if (err.response?.status === 403) {
        setSnackbar({
          open: true,
          message: "Payment permission denied. Please login again.",
          severity: "error",
        });
        navigate("/login");
      } else {
        const errorMsg =
          err.response?.data?.message ||
          err.response?.data?.title ||
          "Payment initialization failed. Please try again.";
        setSnackbar({ open: true, message: errorMsg, severity: "error" });
      }
      setModalSubmitting(false);
    }
  };

  const handleSubscribe = (plan) => {
    if (!isTokenValid()) {
      alert("Please login first to subscribe.");
      navigate("/login");
      return;
    }
    if (!specialistId) {
      alert("Nutritionist ID not found.");
      return;
    }
    setSelectedPlan(plan);
    setFirstName("");
    setLastName("");
    setPaymentMethod("");
    setModalOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!newContent.trim() || !newRate) {
      setSubmitMessage({
        text: "Please write a feedback and provide a rating.",
        type: "error",
      });
      return;
    }

    if (hasUserLeftFeedback) {
      setSubmitMessage({
        text: "You have already left feedback for this nutritionist.",
        type: "error",
      });
      return;
    }

    if (!activeSubscriptionId) {
      setSubmitMessage({
        text: "No active subscription found. You cannot leave feedback.",
        type: "error",
      });
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setSubmitMessage({
        text: "You are not logged in. Please log in to submit feedback.",
        type: "error",
      });
      return;
    }

    setSubmitLoading(true);
    setSubmitMessage({ text: "", type: "" });

    try {
      await axios.post(
        `${FEEDBACK_API}/AddFeddback`,
        {
          subscriptionId: activeSubscriptionId,
          content: newContent.trim(),
          rate: newRate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSubmitMessage({
        text: "Feedback submitted successfully!",
        type: "success",
      });
      setNewContent("");
      setNewRate(0);
      setHasUserLeftFeedback(true);
      if (specialistId) {
        await fetchFeedbacks(specialistId);
      }
    } catch (err) {
      console.error("Submit feedback error:", err.response || err);
      setSubmitMessage({
        text:
          err.response?.status === 400
            ? "You may have already submitted feedback."
            : "Failed to submit feedback.",
        type: "error",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (specialistId) fetchFeedbacks(specialistId);
  }, [specialistId]);

  useEffect(() => {
    if (specialistId && currentUserId) fetchActiveSubscription(specialistId);
  }, [specialistId, currentUserId]);

  useEffect(() => {
    if (!activeSubscriptionId) {
      setHasUserLeftFeedback(false);
      return;
    }
    const alreadyLeft = feedbacks.some((fb) => {
      const feedbackSubscriptionId = getFeedbackSubscriptionId(fb);
      return String(feedbackSubscriptionId) === String(activeSubscriptionId);
    });
    setHasUserLeftFeedback(alreadyLeft);
  }, [feedbacks, activeSubscriptionId]);

  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: GREEN }} />
      </Box>
    );
  }

  if (error || !spec) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography color={error ? "error" : "text.primary"}>
          {error || "Specialist not found"}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/specialists")}
          sx={{ mt: 2, bgcolor: GREEN, "&:hover": { bgcolor: DARK_GREEN } }}
        >
          Back
        </Button>
      </Container>
    );
  }

  const fullName = spec.fullName || spec.FullName;
  const specialization =
    spec.specialization || spec.Specialization || "Nutrition Specialist";
  const location = spec.location || spec.Location;
  const languages = getArrayValue(spec.languages || spec.Languages);
  const email = spec.email || spec.Email;
  const phone = spec.phoneNumber || spec.PhoneNumber;
  const experience = spec.yearsOfExperience || spec.YearsOfExperience;
  const bio = spec.bio || spec.Bio;
  const expertIn = getArrayValue(spec.expertIn || spec.ExpertIn);
  const certifications = getArrayValue(
    spec.certifications || spec.Certifications
  );
  const workingTime =
    spec.WorkingTime ||
    spec.workingTime ||
    spec.oppeningTime ||
    spec.OppeningTime;

  return (
    <Box
      dir="ltr"
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
        py: 5,
        textAlign: "left",
      }}
    >
      <Container
        maxWidth={false}
        disableGutters
        sx={{
          px: { xs: 2, md: 5 },
          mx: 0,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/specialists")}
          sx={{
            mb: 3,
            color: "primary.main",
            "&:hover": { bgcolor: getSoftGreen },
          }}
        >
          Back to Specialists
        </Button>

        {showPayButton && pendingSubscription && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<PaymentIcon />}
                onClick={handlePayNow}
                disabled={modalSubmitting}
                sx={{ fontWeight: "bold" }}
              >
                {modalSubmitting ? <CircularProgress size={20} /> : "Pay Now"}
              </Button>
            }
          >
            Your subscription for "{pendingSubscription.planTitle}" has been approved! Click Pay Now to complete payment.
          </Alert>
        )}

        <Grid container spacing={3} sx={{ direction: "ltr" }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              sx={{
                ...themedCardSx,
                p: 3,
                borderRadius: 3,
                position: "sticky",
                top: 20,
                boxShadow: 2,
              }}
            >
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    width: 90,
                    height: 90,
                    margin: "auto",
                    mb: 1.5,
                    bgcolor: GREEN,
                    fontSize: 36,
                    fontWeight: 800,
                  }}
                >
                  {fullName?.charAt(0) || "?"}
                </Avatar>
                <Typography variant="h6" fontWeight={800}>
                  {fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {specialization}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {[
                ["Location", location, <LocationOnIcon sx={{ color: GREEN }} />],
                [
                  "Working Hours",
                  workingTime,
                  <AccessTimeIcon sx={{ color: GREEN }} />,
                ],
                [
                  "Languages",
                  languages.length > 0 ? languages.join(", ") : null,
                  <TranslateIcon sx={{ color: GREEN }} />,
                ],
                ["Email", email, <EmailIcon sx={{ color: GREEN }} />],
                ["Phone", phone, <PhoneIcon sx={{ color: GREEN }} />],
                [
                  "Experience",
                  experience ? `${experience} years` : null,
                  <StarIcon sx={{ color: GREEN }} />,
                ],
              ].map(([label, value, icon]) => (
                <Box key={label} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                  {icon}
                  <Box>
                    <Typography variant="caption" fontWeight={600}>
                      {label}
                    </Typography>
                    <Typography variant="body2">
                      {value || <NotAvailable />}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Button
                variant="contained"
                fullWidth
                sx={{ bgcolor: GREEN, "&:hover": { bgcolor: DARK_GREEN } }}
              >
                Send Message
              </Button>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>
                  Professional Biography
                </Typography>
                <Typography color="text.secondary">
                  {bio || <NotAvailable message="No bio provided yet" />}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>
                  Areas of Expertise
                </Typography>
                {expertIn.length > 0 ? (
                  <Grid container spacing={2}>
                    {expertIn.map((area, i) => (
                      <Grid size={{ xs: 6, sm: 3 }} key={i}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            bgcolor: "background.default",
                          }}
                        >
                          <StarIcon sx={{ color: GREEN }} />
                          <Typography variant="body2" fontWeight={600}>
                            {area}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <NotAvailable message="No expertise areas added" />
                )}
              </CardContent>
            </Card>

            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>
                  Certifications
                </Typography>
                {certifications.length > 0 ? (
                  <Stack spacing={1.2}>
                    {certifications.map((cert, i) => (
                      <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
                        <FiberManualRecordIcon
                          sx={{ color: GREEN, fontSize: 10 }}
                        />
                        <Typography variant="body2">{cert}</Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <NotAvailable message="No certifications added" />
                )}
              </CardContent>
            </Card>

            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} mb={2}>
                  Pricing & Plans
                </Typography>
                {plansLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress sx={{ color: GREEN }} />
                  </Box>
                ) : plans.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No plans available at the moment.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {plans.map((plan, index) => {
                      const planId = getPlanId(plan);
                      return (
                        <Grid key={planId ?? index} size={{ xs: 12, sm: 6, md: 4 }}>
                          <PlanCard
                            plan={plan}
                            onSubscribe={handleSubscribe}
                            subscribing={
                              String(requestingPlanId) === String(planId)
                            }
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </CardContent>
            </Card>

            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} mb={2}>
                  Client Feedbacks
                </Typography>
                {feedbackLoading && (
                  <CircularProgress size={24} sx={{ color: GREEN }} />
                )}
                {feedbackError && (
                  <Typography color="error">{feedbackError}</Typography>
                )}
                {!feedbackLoading && feedbacks.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No feedbacks yet. Be the first to leave a review!
                  </Typography>
                )}
                <List disablePadding>
                  {feedbacks.map((fb, index) => (
                    <ListItem
                      key={
                        fb.id ??
                        fb.feedbackId ??
                        fb.FeedBackId ??
                        fb.subscriptionId ??
                        index
                      }
                      disablePadding
                      sx={{ display: "block", mb: 2 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Rating
                          value={fb.rate ?? fb.Rate ?? 0}
                          readOnly
                          size="small"
                          sx={{ color: GREEN }}
                        />
                        <Typography variant="caption">
                          {(fb.userName || fb.UserName) &&
                            `- ${fb.userName || fb.UserName}`}
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {fb.content || fb.Content}
                      </Typography>
                      <Divider sx={{ mt: 1 }} />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={700} mb={1}>
                  Leave Your Feedback
                </Typography>
                {loadingSubscription && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: GREEN }} />
                    <Typography>Checking subscription...</Typography>
                  </Box>
                )}
                {subscriptionError && !loadingSubscription && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: getSoftRed, borderRadius: 2 }}>
                    <Typography variant="body2" color="error">
                      {subscriptionError}
                    </Typography>
                  </Box>
                )}
                {activeSubscriptionId &&
                  !loadingSubscription &&
                  !hasUserLeftFeedback && (
                    <Box
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: getSoftGreen,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: GREEN }}>
                        You have an active subscription. You can leave feedback.
                      </Typography>
                    </Box>
                  )}
                {hasUserLeftFeedback && (
                  <Box
                    sx={{
                      mb: 2,
                      p: 2,
                      bgcolor: getSoftGreen,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: GREEN }} />
                    <Typography variant="body2" sx={{ color: GREEN }}>
                      You have already shared your feedback. Thank you!
                    </Typography>
                  </Box>
                )}
                <Box component="form" sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Your feedback"
                    multiline
                    rows={2}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    disabled={
                      !activeSubscriptionId ||
                      hasUserLeftFeedback ||
                      submitLoading ||
                      loadingSubscription
                    }
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Typography>Rating:</Typography>
                    <Rating
                      value={newRate}
                      onChange={(e, val) => setNewRate(val || 0)}
                      disabled={
                        !activeSubscriptionId ||
                        hasUserLeftFeedback ||
                        submitLoading ||
                        loadingSubscription
                      }
                      sx={{ color: GREEN }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    disabled={
                      !activeSubscriptionId ||
                      hasUserLeftFeedback ||
                      submitLoading ||
                      loadingSubscription ||
                      !newContent.trim() ||
                      !newRate
                    }
                    onClick={handleSubmitFeedback}
                    sx={{ bgcolor: GREEN, "&:hover": { bgcolor: DARK_GREEN } }}
                  >
                    {submitLoading ? (
                      <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : (
                      "Submit Feedback"
                    )}
                  </Button>
                  {submitMessage.text && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mt: 1,
                        color:
                          submitMessage.type === "success"
                            ? GREEN
                            : "error.main",
                        bgcolor:
                          submitMessage.type === "success"
                            ? getSoftGreen
                            : "transparent",
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      {submitMessage.text}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>

            {location && (
              <Card sx={themedCardSx}>
                <CardContent>
                  <Typography variant="h6" fontWeight={800}>
                    Office Location
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {location}
                  </Typography>
                  <Box sx={{ height: 200, borderRadius: 2, overflow: "hidden" }}>
                    <iframe
                      title="map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        location
                      )}&output=embed`}
                    />
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Subscription Request Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Subscription</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Plan: {selectedPlan?.title ?? selectedPlan?.Title ?? "Subscription Plan"}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Price: ${selectedPlan?.price ?? selectedPlan?.Price ?? 0}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            After requesting, the nutritionist will review and approve your subscription. You will then be able to complete payment.
          </Typography>
          <TextField
            fullWidth
            margin="normal"
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={modalSubmitting}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={modalSubmitting}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={modalSubmitting}
            >
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} disabled={modalSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleRequestSubscription}
            variant="contained"
            disabled={
              modalSubmitting ||
              !firstName.trim() ||
              !lastName.trim() ||
              !paymentMethod
            }
            sx={{ bgcolor: GREEN, "&:hover": { bgcolor: DARK_GREEN } }}
          >
            {modalSubmitting ? <CircularProgress size={24} /> : "Request Subscription"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}