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
  IconButton,
} from "@mui/material";
import { useParams, useNavigate, Link } from "react-router-dom";

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
import DeleteIcon from "@mui/icons-material/Delete";

const GREEN = "#22c55e";
const DARK_GREEN = "#15803d";

const FEEDBACK_BASE = "https://nutrilife.runasp.net/api/FeedBack";
const FEEDBACK_GET_ALL = (nutritionistId) => `${FEEDBACK_BASE}/AllNutriFeddbacks/${nutritionistId}`;
const FEEDBACK_ADD = `${FEEDBACK_BASE}/AddFeddback`;
const FEEDBACK_DELETE = (feedbackId) => `${FEEDBACK_BASE}/DeleteFeddback/${feedbackId}`;

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

  const getAuthToken = () => localStorage.getItem("token");

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

  const isLoggedIn = !!getAuthToken();

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

  // حالة الحذف
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState({ text: "", type: "" });

  const [pendingSubscription, setPendingSubscription] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [showPayButton, setShowPayButton] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);

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

  // --- دالة حذف التقييم ---
  const handleDeleteFeedback = async (feedbackId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this feedback? This action cannot be undone.");
    if (!confirmDelete) return;

    setDeleteLoading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error("You must be logged in");

      await axios.delete(FEEDBACK_DELETE(feedbackId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      // تحديث القائمة محلياً
      setFeedbacks(prev => prev.filter(fb => 
        (fb.id ?? fb.feedbackId ?? fb.FeedBackId) !== feedbackId
      ));

      setDeleteMessage({ text: "Feedback deleted successfully!", type: "success" });
      setTimeout(() => setDeleteMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteMessage({
        text: err.response?.status === 404 ? "Feedback not found" : "Failed to delete feedback. Please try again.",
        type: "error",
      });
      setTimeout(() => setDeleteMessage({ text: "", type: "" }), 3000);
    } finally {
      setDeleteLoading(false);
    }
  };

  // باقي الـ state والـ Effects كما هي...
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
  
    // 1. التحقق من وجود بيانات لأخصائي مسجل حديثًا
    const justRegistered = localStorage.getItem("justRegisteredSpecialist");
    if (justRegistered) {
      const specialistData = JSON.parse(justRegistered);
      setSpec(specialistData);
      localStorage.removeItem("justRegisteredSpecialist");
      setLoading(false);
      return;
    }
  
    // 2. جلب بيانات الأخصائي مع إرسال التوكن إذا كان المستخدم مسجلاً
    const fetchSpecialist = async () => {
      try {
        const token = getAuthToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(
          `https://nutrilife.runasp.net/api/NutritionistPlans/GetNutri/${id}`,
          { headers }
        );
        setSpec(response.data);
      } catch (err) {
        console.error("API Error:", err);
        if (err.response?.status === 401) {
          setError("You need to login to view specialist details.");
        } else {
          setError("Failed to load specialist data");
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchSpecialist();
  }, [id]);
  
  useEffect(() => {
    const nutritionistIdForPlans = getSpecialistId(spec) || id;
    if (!nutritionistIdForPlans || !isLoggedIn) return;

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
  }, [spec, id, isLoggedIn]);

  const fetchFeedbacks = async (nutritionistId) => {
    setFeedbackLoading(true);
    setFeedbackError("");
    try {
      const token = getAuthToken();
      const res = await axios.get(FEEDBACK_GET_ALL(nutritionistId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = getResponseArray(res.data);
      setFeedbacks(data);
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const subscriptions = getResponseArray(response.data);
      const activeStatuses = ["approved", "active", "confirmed", "waitingpayment", "finished"];
      const currentNutritionistName = spec?.fullName || spec?.FullName;

      let activeSub = null;
      for (const sub of subscriptions) {
        const status = String(sub.status ?? sub.Status ?? "").toLowerCase();
        if (sub.nutritionistName === currentNutritionistName && activeStatuses.includes(status)) {
          activeSub = sub;
          break;
        }
      }

      if (activeSub) {
        let subId = getSubscriptionId(activeSub);
        if (subId === 0 || subId === "0") {
          if (pendingSubscription && String(pendingSubscription.nutritionistId) === String(nutritionistId)) {
            subId = pendingSubscription.id;
          }
        }
        setActiveSubscriptionId(subId);
      } else {
        setSubscriptionError("You don't have an active subscription with this nutritionist.");
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
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const subscriptions = getResponseArray(response.data);
        const foundSub = subscriptions.find((sub) => String(getSubscriptionId(sub)) === String(subscriptionId));
        if (foundSub) {
          const status = String(foundSub.status ?? foundSub.Status ?? "").toLowerCase();
          const paymentAllowedStatuses = ["approved", "active", "confirmed", "waitingpayment", "finished"];
          if (paymentAllowedStatuses.includes(status)) {
            setShowPayButton(true);
            setPendingSubscription({
              id: subscriptionId,
              firstName: firstNameVal,
              lastName: lastNameVal,
              planTitle: planTitle,
              nutritionistId: specialistId,
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
      const subscriptionRes = await axios.post(
        "https://nutrilife.runasp.net/api/Subscription",
        {
          NutritionistId: specialistId,
          UserPlan: Number(planId),
          notes: `Payment method: ${paymentMethod}, Name: ${firstName} ${lastName}`,
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      const newSubscriptionId = subscriptionRes.data?.subscriptionId ?? subscriptionRes.data?.SubscriptionId ?? subscriptionRes.data?.id;
      if (!newSubscriptionId) throw new Error("No subscription ID returned from server.");
      setPendingSubscription({
        id: newSubscriptionId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        planTitle: selectedPlan.title ?? selectedPlan.Title ?? "Subscription Plan",
        nutritionistId: specialistId,
      });
      startPollingSubscriptionStatus(newSubscriptionId, firstName.trim(), lastName.trim(), selectedPlan.title ?? selectedPlan.Title ?? "Subscription Plan");
      setSnackbar({ open: true, message: "Subscription request sent! Waiting for nutritionist approval...", severity: "info" });
      setModalOpen(false);
      setSelectedPlan(null);
      setFirstName("");
      setLastName("");
      setPaymentMethod("");
    } catch (err) {
      console.error("Subscription creation error:", err.response || err);
      if (err.response?.status === 403) {
        setSnackbar({ open: true, message: "You don't have permission to subscribe. Make sure you are logged in as a client.", severity: "error" });
        if (!isTokenValid()) setTimeout(() => navigate("/login"), 3000);
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.title || err.response?.data || "Failed to create subscription. Please try again.";
        setSnackbar({ open: true, message: errorMsg, severity: "error" });
      }
    } finally {
      setModalSubmitting(false);
      setRequestingPlanId(null);
    }
  };

  const handlePayNow = async () => {
    if (!pendingSubscription || !pendingSubscription.id) {
      setSnackbar({ open: true, message: "No pending payment found.", severity: "error" });
      return;
    }
    const token = getAuthToken();
    if (!token || !isTokenValid()) {
      setSnackbar({ open: true, message: "Please login first.", severity: "warning" });
      navigate("/login");
      return;
    }
    setModalSubmitting(true);
    try {
      const paymentRes = await axios.post(
        "https://nutrilife.runasp.net/api/Payment",
        {
          SubscriptionId: pendingSubscription.id,
          FirstName: pendingSubscription.firstName,
          LastName: pendingSubscription.lastName,
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      const responseData = paymentRes.data;
      let paymentUrl = null;
      if (typeof responseData === "string") paymentUrl = responseData;
      else if (typeof responseData === "object" && responseData !== null) {
        const possibleKeys = ["paymentUrl", "paymentURL", "PaymentUrl", "PaymentURL", "redirectUrl", "redirectURL", "RedirectUrl", "RedirectURL", "url", "URL", "Url", "paymentLink", "paymentLinkUrl", "PaymentLink", "link", "Link", "checkoutUrl", "checkout_url", "CheckoutUrl", "data", "result", "response"];
        for (let key of possibleKeys) {
          const value = responseData[key];
          if (typeof value === "string" && (value.startsWith("http") || value.includes("://"))) {
            paymentUrl = value;
            break;
          }
        }
        if (!paymentUrl) {
          const nestedSearch = (obj, depth = 0) => {
            if (depth > 3) return null;
            for (let k in obj) {
              const v = obj[k];
              if (typeof v === "string" && (v.startsWith("http") || v.includes("://"))) return v;
              if (typeof v === "object" && v !== null) {
                const found = nestedSearch(v, depth + 1);
                if (found) return found;
              }
            }
            return null;
          };
          paymentUrl = nestedSearch(responseData);
        }
        if (!paymentUrl) {
          const stringified = JSON.stringify(responseData);
          const match = stringified.match(/https?:\/\/[^\s"']+/);
          if (match) paymentUrl = match[0];
        }
      }
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }
      console.error("No payment URL found. Full response:", responseData);
      alert("لم يتم العثور على رابط الدفع في استجابة الخادم.\n\nيرجى نسخ هذه البيانات وإرسالها للدعم:\n" + JSON.stringify(responseData, null, 2));
      setSnackbar({ open: true, message: "لم يتم العثور على رابط الدفع. تحقق من وحدة التحكم لمزيد من التفاصيل.", severity: "error" });
    } catch (err) {
      console.error("Payment error:", err.response || err);
      if (err.response?.status === 403) {
        setSnackbar({ open: true, message: "⚠️ صلاحية الدفع مرفوضة. يرجى تسجيل الدخول مرة أخرى.", severity: "error" });
        navigate("/login");
      } else {
        const errorMsg = err.response?.data?.message || err.response?.data?.title || "فشل بدء عملية الدفع. يرجى المحاولة مرة أخرى.";
        setSnackbar({ open: true, message: errorMsg, severity: "error" });
      }
    } finally {
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
      setSubmitMessage({ text: "Please write a feedback and provide a rating.", type: "error" });
      return;
    }
    if (hasUserLeftFeedback) {
      setSubmitMessage({ text: "You have already left feedback for this nutritionist.", type: "error" });
      return;
    }
    if (!activeSubscriptionId) {
      setSubmitMessage({ text: "No active subscription found. You cannot leave feedback.", type: "error" });
      return;
    }
    const token = getAuthToken();
    if (!token) {
      setSubmitMessage({ text: "You are not logged in. Please log in to submit feedback.", type: "error" });
      return;
    }
    setSubmitLoading(true);
    setSubmitMessage({ text: "", type: "" });
    try {
      await axios.post(FEEDBACK_ADD, { subscriptionId: activeSubscriptionId, content: newContent.trim(), rate: newRate }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
      setSubmitMessage({ text: "Feedback submitted successfully!", type: "success" });
      setNewContent("");
      setNewRate(0);
      setHasUserLeftFeedback(true);
      if (specialistId) await fetchFeedbacks(specialistId);
    } catch (err) {
      console.error("Submit feedback error:", err.response || err);
      if (err.response?.status === 400) setSubmitMessage({ text: "You may have already submitted feedback for this subscription.", type: "error" });
      else setSubmitMessage({ text: "Failed to submit feedback. Please try again.", type: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    if (specialistId) fetchFeedbacks(specialistId);
  }, [specialistId]);

  useEffect(() => {
    if (specialistId && currentUserId && spec) fetchActiveSubscription(specialistId);
  }, [specialistId, currentUserId, spec]);

  useEffect(() => {
    if (!activeSubscriptionId) {
      setHasUserLeftFeedback(false);
      return;
    }
    const alreadyLeft = feedbacks.some((fb) => String(getFeedbackSubscriptionId(fb)) === String(activeSubscriptionId));
    setHasUserLeftFeedback(alreadyLeft);
  }, [feedbacks, activeSubscriptionId]);

  if (loading) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress sx={{ color: GREEN }} />
      </Box>
    );
  }

  if (error || !spec) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography color={error ? "error" : "text.primary"}>{error || "Specialist not found"}</Typography>
        <Button variant="contained" onClick={() => navigate("/specialists")} sx={{ mt: 2, bgcolor: GREEN, "&:hover": { bgcolor: DARK_GREEN } }}>Back</Button>
      </Container>
    );
  }

  const fullName = spec.fullName || spec.FullName;
  const specialization = spec.specialization || spec.Specialization || "Nutrition Specialist";
  const location = spec.location || spec.Location;
  const languages = getArrayValue(spec.languages || spec.Languages);
  const email = spec.email || spec.Email;
  const phone = spec.phoneNumber || spec.PhoneNumber;
  const experience = spec.yearsOfExperience || spec.YearsOfExperience;
  const bio = spec.bio || spec.Bio;
  const expertIn = getArrayValue(spec.expertIn || spec.ExpertIn);
  const certifications = getArrayValue(spec.certifications || spec.Certifications);
  const workingTime = spec.WorkingTime || spec.workingTime || spec.oppeningTime || spec.OppeningTime;

  return (
    <Box dir="ltr" sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh", py: 5, textAlign: "left" }}>
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 5 }, mx: 0 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/specialists")} sx={{ mb: 3, color: "primary.main", "&:hover": { bgcolor: getSoftGreen } }}>Back to Specialists</Button>
        {showPayButton && pendingSubscription && (
          <Alert severity="success" sx={{ mb: 3 }} action={<Button color="inherit" size="small" startIcon={<PaymentIcon />} onClick={handlePayNow} disabled={modalSubmitting} sx={{ fontWeight: "bold" }}>{modalSubmitting ? <CircularProgress size={20} /> : "Pay Now"}</Button>}>
            Your subscription for "{pendingSubscription.planTitle}" has been approved! Click Pay Now to complete payment.
          </Alert>
        )}
        <Grid container spacing={3} sx={{ direction: "ltr" }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ ...themedCardSx, p: 3, borderRadius: 3, position: "sticky", top: 20, boxShadow: 2 }}>
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Avatar sx={{ width: 90, height: 90, margin: "auto", mb: 1.5, bgcolor: GREEN, fontSize: 36, fontWeight: 800 }}>{fullName?.charAt(0) || "?"}</Avatar>
                <Typography variant="h6" fontWeight={800}>{fullName}</Typography>
                <Typography variant="body2" color="text.secondary">{specialization}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {[
                ["Location", location, <LocationOnIcon sx={{ color: GREEN }} />],
                ["Working Hours", workingTime, <AccessTimeIcon sx={{ color: GREEN }} />],
                ["Languages", languages.length > 0 ? languages.join(", ") : null, <TranslateIcon sx={{ color: GREEN }} />],
                ["Email", email, <EmailIcon sx={{ color: GREEN }} />],
                ["Phone", phone, <PhoneIcon sx={{ color: GREEN }} />],
                ["Experience", experience ? `${experience} years` : null, <StarIcon sx={{ color: GREEN }} />],
              ].map(([label, value, icon]) => (
                <Box key={label} sx={{ display: "flex", gap: 1.5, mb: 1.5 }}>
                  {icon}
                  <Box>
                    <Typography variant="caption" fontWeight={600}>{label}</Typography>
                    <Typography variant="body2">{value || <NotAvailable />}</Typography>
                  </Box>
                </Box>
              ))}
              <Button variant="contained" fullWidth sx={{ bgcolor: GREEN, "&:hover": { bgcolor: DARK_GREEN } }}>Send Message</Button>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Biography */}
            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>Professional Biography</Typography>
                <Typography color="text.secondary">{bio || <NotAvailable message="No bio provided yet" />}</Typography>
              </CardContent>
            </Card>
            {/* Areas of Expertise */}
            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>Areas of Expertise</Typography>
                {expertIn.length > 0 ? (
                  <Grid container spacing={2}>
                    {expertIn.map((area, i) => (
                      <Grid size={{ xs: 6, sm: 3 }} key={i}>
                        <Box sx={{ textAlign: "center", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.default" }}>
                          <StarIcon sx={{ color: GREEN }} />
                          <Typography variant="body2" fontWeight={600}>{area}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ) : <NotAvailable message="No expertise areas added" />}
              </CardContent>
            </Card>
            {/* Certifications */}
            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800}>Certifications</Typography>
                {certifications.length > 0 ? (
                  <Stack spacing={1.2}>
                    {certifications.map((cert, i) => (
                      <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
                        <FiberManualRecordIcon sx={{ color: GREEN, fontSize: 10 }} />
                        <Typography variant="body2">{cert}</Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : <NotAvailable message="No certifications added" />}
              </CardContent>
            </Card>
            {/* Plans */}
            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} mb={2}>Pricing & Plans</Typography>
                {!isLoggedIn ? (
                  <Alert severity="info" sx={{ mt: 1 }}>Please <Link to="/login" style={{ textDecoration: 'none', fontWeight: 'bold' }}>login</Link> to view subscription plans and pricing.</Alert>
                ) : plansLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress sx={{ color: GREEN }} /></Box>
                ) : plans.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No plans available at the moment.</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {plans.map((plan, index) => {
                      const planId = getPlanId(plan);
                      return (
                        <Grid key={planId ?? index} size={{ xs: 12, sm: 6, md: 4 }}>
                          <PlanCard plan={plan} onSubscribe={handleSubscribe} subscribing={String(requestingPlanId) === String(planId)} />
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </CardContent>
            </Card>
            {/* Feedbacks */}
            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} mb={2}>Client Feedbacks</Typography>
                {feedbackLoading && <CircularProgress size={24} sx={{ color: GREEN }} />}
                {feedbackError && <Typography color="error">{feedbackError}</Typography>}
                {!feedbackLoading && feedbacks.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>No feedbacks yet. Be the first to leave a review!</Typography>
                )}
              <List disablePadding>
  {feedbacks.map((fb, index) => {
    const feedbackId = fb.id ?? fb.feedbackId ?? fb.FeedBackId;
    // ✅ حل مؤقت: إظهار زر الحذف لأي مستخدم مسجل دخول
    const isOwn = !!getAuthToken(); 
    
    return (
      <ListItem key={feedbackId ?? index} disablePadding sx={{ display: "block", mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Rating value={fb.rate ?? fb.Rate ?? 0} readOnly size="small" sx={{ color: GREEN }} />
              <Typography variant="caption">
                {/* يمكن إظهار اسم المستخدم إذا وُجد، وإلا يظهر "Anonymous" */}
                {(fb.userName || fb.UserName) ? `- ${fb.userName || fb.UserName}` : '- Anonymous'}
              </Typography>
            </Box>
            <Typography variant="body2">{fb.content || fb.Content}</Typography>
          </Box>
          {isOwn && (
            <IconButton 
              onClick={() => handleDeleteFeedback(feedbackId)} 
              disabled={deleteLoading}
              size="small" 
              sx={{ color: "error.main", ml: 1 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
        <Divider sx={{ mt: 1 }} />
      </ListItem>
    );
  })}
</List>
                {deleteMessage.text && (
                  <Alert severity={deleteMessage.type} sx={{ mt: 2 }}>{deleteMessage.text}</Alert>
                )}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={700} mb={1}>Leave Your Feedback</Typography>
                {loadingSubscription && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><CircularProgress size={20} sx={{ color: GREEN }} /><Typography>Checking subscription...</Typography></Box>
                )}
                {subscriptionError && !loadingSubscription && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: getSoftRed, borderRadius: 2 }}><Typography variant="body2" color="error">{subscriptionError}</Typography></Box>
                )}
                {activeSubscriptionId && !loadingSubscription && !hasUserLeftFeedback && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: getSoftGreen, borderRadius: 2 }}><Typography variant="body2" sx={{ color: GREEN }}>You have an active subscription. You can leave feedback.</Typography></Box>
                )}
                {hasUserLeftFeedback && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: getSoftGreen, borderRadius: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon sx={{ color: GREEN }} /><Typography variant="body2" sx={{ color: GREEN }}>You have already shared your feedback. Thank you!</Typography>
                  </Box>
                )}
                <Box component="form" sx={{ mt: 1 }}>
                  <TextField fullWidth label="Your feedback" multiline rows={2} value={newContent} onChange={(e) => setNewContent(e.target.value)} disabled={!activeSubscriptionId || hasUserLeftFeedback || submitLoading || loadingSubscription} sx={{ mb: 2 }} />
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Typography>Rating:</Typography>
                    <Rating value={newRate} onChange={(e, val) => setNewRate(val || 0)} disabled={!activeSubscriptionId || hasUserLeftFeedback || submitLoading || loadingSubscription} sx={{ color: GREEN }} />
                  </Box>
                  <Button variant="contained" disabled={!activeSubscriptionId || hasUserLeftFeedback || submitLoading || loadingSubscription || !newContent.trim() || !newRate} onClick={handleSubmitFeedback} sx={{ bgcolor: GREEN, "&:hover": { bgcolor: DARK_GREEN } }}>
                    {submitLoading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Submit Feedback"}
                  </Button>
                  {submitMessage.text && (
                    <Typography variant="caption" sx={{ display: "block", mt: 1, color: submitMessage.type === "success" ? GREEN : "error.main", bgcolor: submitMessage.type === "success" ? getSoftGreen : "transparent", p: 1, borderRadius: 1 }}>{submitMessage.text}</Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
            {location && (
              <Card sx={themedCardSx}>
                <CardContent>
                  <Typography variant="h6" fontWeight={800}>Office Location</Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>{location}</Typography>
                  <Box sx={{ height: 200, borderRadius: 2, overflow: "hidden" }}>
                    <iframe title="map" width="100%" height="100%" style={{ border: 0 }} loading="lazy" src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`} />
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Container>
      {/* Subscription Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Subscription</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Plan: {selectedPlan?.title ?? selectedPlan?.Title ?? "Subscription Plan"}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>Price: ${selectedPlan?.price ?? selectedPlan?.Price ?? 0}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>After requesting, the nutritionist will review and approve your subscription. You will then be able to complete payment.</Typography>
          <TextField fullWidth margin="normal" label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={modalSubmitting} required />
          <TextField fullWidth margin="normal" label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={modalSubmitting} required />
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={modalSubmitting}>
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)} disabled={modalSubmitting}>Cancel</Button>
          <Button onClick={handleRequestSubscription} variant="contained" disabled={modalSubmitting || !firstName.trim() || !lastName.trim() || !paymentMethod} sx={{ bgcolor: GREEN, "&:hover": { bgcolor: DARK_GREEN } }}>{modalSubmitting ? <CircularProgress size={24} /> : "Request Subscription"}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}