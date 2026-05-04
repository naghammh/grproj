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

const GREEN = "#22c55e";
const DARK_GREEN = "#15803d";

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

function PlanCard({ plan, featured, onSubscribe }) {
  if (!plan) return null;

  const title = plan.title || plan.Title;
  const price = plan.price || plan.Price;
  const description = plan.description || plan.Description || [];

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "2px solid",
        borderColor: featured ? GREEN : "divider",
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: featured ? "0 8px 24px rgba(34, 197, 94, 0.22)" : "none",
        bgcolor: featured ? getSoftGreen : "background.paper",
        color: "text.primary",
        backgroundImage: "none",
      }}
    >
      {featured && (
        <Box
          sx={{
            position: "absolute",
            top: -13,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: GREEN,
            color: "#fff",
            px: 2,
            py: 0.3,
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          BEST VALUE
        </Box>
      )}

      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>

      <Typography variant="h4" fontWeight={900} sx={{ color: GREEN, my: 1 }}>
        ${price}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1} flex={1}>
        {description.map((item, idx) => (
          <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircleIcon sx={{ color: GREEN, fontSize: 17 }} />
            <Typography variant="body2" color="text.secondary">
              {item}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Button
        variant="contained"
        fullWidth
        sx={{
          mt: 2.5,
          borderRadius: 2,
          fontWeight: 700,
          bgcolor: GREEN,
          "&:hover": { bgcolor: DARK_GREEN },
        }}
        onClick={() => onSubscribe(plan.id)}
      >
        Subscribe
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
        payload.nameid ||
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        null
      );
    } catch (e) {
      console.error("Invalid token format", e);
      return null;
    }
  };

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
        const found = res.data.find((item) => String(item.id) === String(id));

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
    if (!spec?.id) return;

    const fetchPlans = async () => {
      setPlansLoading(true);

      try {
        const res = await axios.get(
          `https://nutrilife.runasp.net/api/NutritionistPlans/MyPlans/${spec.id}`
        );

        setPlans(res.data || []);
      } catch (err) {
        console.error("Error fetching plans", err);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, [spec]);

  const fetchFeedbacks = async (nutritionistId) => {
    setFeedbackLoading(true);
    setFeedbackError("");

    try {
      const res = await axios.get(
        `https://nutrilife.runasp.net/api/FeedBack/AllNutriFeddbacks/${nutritionistId}`
      );

      setFeedbacks(Array.isArray(res.data) ? res.data : []);
    } catch {
      setFeedbackError("Could not load feedbacks.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchActiveSubscription = async (nutritionistId) => {
    setLoadingSubscription(true);
    setSubscriptionError("");

    const token = getAuthToken();

    if (!token) {
      setSubscriptionError("Please log in to leave feedback.");
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

      const subscriptions = response.data;

      const activeSub = subscriptions.find(
        (sub) =>
          sub.nutritionistId === nutritionistId &&
          (sub.status === "approved" ||
            sub.status === "active" ||
            sub.status === "confirmed")
      );

      if (activeSub) {
        setActiveSubscriptionId(activeSub.subscriptionId || activeSub.id);
      } else {
        setSubscriptionError(
          "You don't have an active subscription with this nutritionist."
        );
      }
    } catch (err) {
      console.error(err);
      setSubscriptionError("Unable to verify subscription.");
    } finally {
      setLoadingSubscription(false);
    }
  };

  useEffect(() => {
    if (spec?.id) fetchFeedbacks(spec.id);
  }, [spec]);

  useEffect(() => {
    if (spec?.id && currentUserId) fetchActiveSubscription(spec.id);
  }, [spec, currentUserId]);

  useEffect(() => {
    if (activeSubscriptionId && feedbacks.length > 0) {
      const alreadyLeft = feedbacks.some(
        (fb) => fb.subscriptionId === activeSubscriptionId
      );

      setHasUserLeftFeedback(alreadyLeft);
    } else {
      setHasUserLeftFeedback(false);
    }
  }, [feedbacks, activeSubscriptionId]);

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
  }, []);

  const handleSubscribe = async (planId) => {
    const token = getAuthToken();

    if (!token) {
      alert("Please login first to subscribe.");
      return;
    }

    try {
      await axios.post(
        "https://nutrilife.runasp.net/api/Subscription/subscribe",
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Subscribed successfully!");

      if (spec?.id) await fetchActiveSubscription(spec.id);
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Subscription failed. Please try again.";
      alert(`❌ ${msg}`);
    }
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

    setSubmitLoading(true);
    setSubmitMessage({ text: "", type: "" });

    const token = getAuthToken();

    if (!token) {
      setSubmitMessage({
        text: "❌ You are not logged in. Please log in to submit feedback.",
        type: "error",
      });
      setSubmitLoading(false);
      return;
    }

    try {
      await axios.post(
        "https://nutrilife.runasp.net/api/FeedBack/AddFeddback",
        {
          subscriptionId: activeSubscriptionId,
          content: newContent.trim(),
          rate: newRate,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitMessage({
        text: "✅ Feedback submitted successfully!",
        type: "success",
      });

      setNewContent("");
      setNewRate(0);
      setHasUserLeftFeedback(true);
      fetchFeedbacks(spec.id);
    } catch (err) {
      let errorMsg = "❌ Failed to submit feedback.";

      if (err.response) {
        if (err.response.status === 400) {
          if (
            err.response.data &&
            (err.response.data.includes("already") ||
              err.response.data.includes("duplicate"))
          ) {
            errorMsg =
              "❌ You have already submitted feedback for this subscription.";
            setHasUserLeftFeedback(true);
          } else {
            errorMsg = `❌ ${
              err.response.data?.message || err.response.data || "Invalid request."
            }`;
          }
        } else if (err.response.status === 401 || err.response.status === 403) {
          errorMsg = "❌ You are not authorized. Please log in again.";
        } else {
          errorMsg = `❌ Server error (${err.response.status}).`;
        }
      } else if (err.request) {
        errorMsg = "❌ Network error. Please check your connection.";
      }

      setSubmitMessage({ text: errorMsg, type: "error" });
    } finally {
      setSubmitLoading(false);
    }
  };

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

  if (error) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/specialists")}
          sx={{ mt: 2, bgcolor: GREEN }}
        >
          Back
        </Button>
      </Container>
    );
  }

  if (!spec) {
    return (
      <Container sx={{ py: 8, textAlign: "center" }}>
        <Typography>Specialist not found</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/specialists")}
          sx={{ mt: 2, bgcolor: GREEN }}
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
  const languages = spec.languages || spec.Languages;
  const email = spec.email || spec.Email;
  const phone = spec.phoneNumber || spec.PhoneNumber;
  const experience = spec.yearsOfExperience || spec.YearsOfExperience;
  const bio = spec.bio || spec.Bio;
  const expertIn = spec.expertIn || spec.ExpertIn;
  const certifications = spec.certifications || spec.Certifications;
  const workingTime =
    spec.WorkingTime ||
    spec.workingTime ||
    spec.oppeningTime ||
    spec.OppeningTime;

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
        py: 5,
      }}
    >
      <Container maxWidth="lg">
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

        <Grid container spacing={3}>
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
                ["Working Hours", workingTime, <AccessTimeIcon sx={{ color: GREEN }} />],
                [
                  "Languages",
                  languages?.length > 0 ? languages.join(", ") : null,
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

                {expertIn?.length > 0 ? (
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
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: getSoftGreen,
                            },
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

                {certifications?.length > 0 ? (
                  <Stack spacing={1.2}>
                    {certifications.map((cert, i) => (
                      <Box key={i} sx={{ display: "flex", gap: 1.5 }}>
                        <FiberManualRecordIcon sx={{ color: GREEN, fontSize: 10 }} />
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
                    {plans.map((plan, index) => (
                      <Grid key={plan.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <PlanCard
                          plan={plan}
                          featured={index === Math.floor(plans.length / 2)}
                          onSubscribe={handleSubscribe}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>

            <Card sx={{ ...themedCardSx, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={800} mb={2}>
                  Client Feedbacks
                </Typography>

                {feedbackLoading && <CircularProgress size={24} sx={{ color: GREEN }} />}
                {feedbackError && <Typography color="error">{feedbackError}</Typography>}

                {!feedbackLoading && feedbacks.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No feedbacks yet. Be the first to leave a review!
                  </Typography>
                )}

                <List disablePadding>
                  {feedbacks.map((fb) => (
                    <ListItem key={fb.id} disablePadding sx={{ display: "block", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Rating value={fb.rate} readOnly size="small" sx={{ color: GREEN }} />
                        <Typography variant="caption">
                          {fb.userName && `— ${fb.userName}`}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{fb.content}</Typography>
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

                {activeSubscriptionId && !loadingSubscription && !hasUserLeftFeedback && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: getSoftGreen, borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ color: GREEN }}>
                      ✅ You have an active subscription. You can leave feedback.
                    </Typography>
                  </Box>
                )}

                {hasUserLeftFeedback && (
                  <Box sx={{ mb: 2, p: 2, bgcolor: getSoftGreen, borderRadius: 2 }}>
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
                        color: submitMessage.type === "success" ? GREEN : "error.main",
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
    </Box>
  );
}
