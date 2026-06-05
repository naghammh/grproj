import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  TextField,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Avatar,
  Alert,
  Snackbar,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://nutrilife.runasp.net/api/Subscription";
const CACHE_KEY = "approvedClientsCache";
const ACTIVE_CLIENTS_KEY = "activeClientsCache";

export default function Clients() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [activeClients, setActiveClients] = useState([]);
  const [search, setSearch] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const decodeTokenPayload = () => {
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  };

  const getCurrentNutritionistId = () => {
    const payload = decodeTokenPayload();
    return (
      localStorage.getItem("nutritionistId") ||
      payload?.nutritionistId ||
      payload?.NutritionistId ||
      payload?.userId ||
      payload?.UserId ||
      payload?.id ||
      payload?.Id ||
      payload?.sub ||
      payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      localStorage.getItem("userId") ||
      null
    );
  };

  const getSubscriptionId = (item) =>
    item.subscriptionId || item.SubscriptionId || item.subId || item.SubId || item.id || item.Id;

  const getClientId = (item) =>
    item.clientId || item.ClientId || item.client?.id || item.client?.Id || item.client?.clientId || item.client?.ClientId || null;

  const getName = (item) =>
    item.clientName ||
    item.ClientName ||
    item.fullName ||
    item.FullName ||
    item.name ||
    item.Name ||
    item.client?.fullName ||
    item.client?.FullName ||
    item.client?.name ||
    item.client?.Name ||
    (getClientId(item) ? `Client #${String(getClientId(item)).slice(0, 8)}` : null) ||
    "Unknown Client";

  const getFirstName = (item) => {
    const fullName = getName(item);
    return item.firstName || item.FirstName || item.client?.firstName || item.client?.FirstName || fullName.split(" ")[0] || "";
  };

  const getLastName = (item) => {
    const fullName = getName(item);
    return item.lastName || item.LastName || item.client?.lastName || item.client?.LastName || fullName.split(" ").slice(1).join(" ") || "";
  };

  const getAmount = (item) =>
    item.amount || item.Amount || item.price || item.Price || item.planPrice || item.PlanPrice || item.plan?.price || item.plan?.Price || item.userPlan?.price || item.UserPlan?.Price || 150;

  const getCurrency = (item) =>
    item.currency || item.Currency || item.plan?.currency || item.plan?.Currency || item.userPlan?.currency || item.UserPlan?.Currency || "USD";

  // ✅ تحسين استخراج طريقة الدفع
  const getPaymentMethod = (item) => {
    // البحث المباشر
    const direct =
      item.paymentMethod ||
      item.PaymentMethod ||
      item.paymentType ||
      item.PaymentType ||
      item.method ||
      item.Method;
    if (direct) return String(direct).toLowerCase().replace(/\s+/g, "").replace(/-/g, "");

    // البحث في notes (مهم)
    const notes = item.notes || item.Notes || item.note || item.Note || "";
    const match = notes.match(/payment\s*method\s*:\s*(\w+)/i);
    if (match) return match[1].toLowerCase();

    return "";
  };

  const isCashPayment = (item) => {
    const method = getPaymentMethod(item);
    return method === "cash" || method === "cashpayment";
  };

  const isCardPayment = (item) => {
    const method = getPaymentMethod(item);
    return (
      method === "card" ||
      method === "creditcard" ||
      method === "debitcard" ||
      method === "visa" ||
      method === "mastercard" ||
      method === "online" ||
      method === "electronic"
    );
  };

  const getPlanName = (item) =>
    item.planName ||
    item.PlanName ||
    item.userPlanName ||
    item.UserPlanName ||
    item.plan?.name ||
    item.plan?.Name ||
    item.userPlan?.title ||
    item.UserPlan?.Title ||
    (item.planId ? `Plan #${item.planId}` : null) ||
    (item.PlanId ? `Plan #${item.PlanId}` : null) ||
    (item.userPlan ? `Plan #${item.userPlan}` : null) ||
    (item.UserPlan ? `Plan #${item.UserPlan}` : null) ||
    "-";

  const getRequestDate = (item) =>
    item.requestDate || item.RequestDate || item.createdAt || item.CreatedAt || item.createdDate || item.CreatedDate || "-";

  const getStartDate = (item) => {
    const date = item.startDate || item.StartDate || item.approvedAt || item.ApprovedAt || item.approvedDate || item.ApprovedDate || "-";
    return String(date).startsWith("0001-01-01") ? "-" : date;
  };

  const getStatus = (item) =>
    String(item.status || item.Status || "").toLowerCase().replace(/\s+/g, "").replace(/-/g, "");

  const isPendingRequest = (item) => {
    const status = getStatus(item);
    return !status || status === "pending";
  };

  const isWaitingPayment = (item) => getStatus(item) === "waitingpayment";

  const getStatusLabel = (item) => {
    const status = getStatus(item);
    if (status === "waitingpayment") return "Waiting Payment";
    if (status === "active") return "Active";
    if (status === "rejected") return "Rejected";
    if (status === "cancelled" || status === "canceled") return "Cancelled";
    return "Pending";
  };

  const getStatusColor = (item) => {
    const status = getStatus(item);
    if (status === "waitingpayment") return "info";
    if (status === "active") return "success";
    if (status === "rejected") return "error";
    return "warning";
  };

  const getCache = () => {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
      return {};
    }
  };

  const saveToCache = (subscriptionId, data) => {
    const cache = getCache();
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...cache, [subscriptionId]: data }));
  };

  const saveActiveClients = (clients) => {
    localStorage.setItem(ACTIVE_CLIENTS_KEY, JSON.stringify(clients));
  };

  const mergeClientsWithCache = (clients) => {
    const cache = getCache();
    return clients.map((client) => {
      const subscriptionId = getSubscriptionId(client);
      const cached = cache[subscriptionId];
      return cached ? { ...client, ...cached } : client;
    });
  };

  const fetchRequests = async (showLoading = false) => {
    const nutritionistId = getCurrentNutritionistId();
    if (!token || !nutritionistId) return;

    if (showLoading) setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/NutritionistSubscriptionRequests/${nutritionistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const validRequests = data.filter((item) => {
        const status = getStatus(item);
        return !status || status === "pending" || status === "waitingpayment";
      });
      setRequests(validRequests);
    } catch (err) {
      console.error("Fetch requests error:", err.response || err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchActiveClients = async () => {
    const nutritionistId = getCurrentNutritionistId();
    if (!token || !nutritionistId) return;

    try {
      const res = await axios.get(`${API_BASE}/NutritionistHistory/${nutritionistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data) ? res.data : [];
      const validServerClients = data.filter((item) => {
        const subscriptionId = getSubscriptionId(item);
        const name = getName(item);
        const status = getStatus(item);
        return subscriptionId && String(subscriptionId) !== "0" && name !== "Unknown Client" && status === "active";
      });
      const serverClients = mergeClientsWithCache(validServerClients);
      setActiveClients(serverClients);
      saveActiveClients(serverClients);
    } catch (err) {
      console.error("Fetch active clients error:", err.response || err);
    }
  };

  useEffect(() => {
    fetchRequests(true);
    fetchActiveClients();
  }, []);

  // ✅ تعديل handleApprove لعدم إخفاء الزر
  const handleApprove = async (subscriptionId) => {
    if (!subscriptionId) {
      setSnackbar({ open: true, message: "Subscription ID not found.", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_BASE}/approve/${subscriptionId}`, {}, { headers: { Authorization: `Bearer ${token}` } });

      // تحديث محلي فوري دون إعادة جلب
      setRequests((prev) =>
        prev.map((item) =>
          String(getSubscriptionId(item)) === String(subscriptionId)
            ? { ...item, status: "WaitingPayment", Status: "WaitingPayment" }
            : item
        )
      );

      setSnackbar({ open: true, message: "Subscription approved. Waiting for payment.", severity: "success" });

      // لا نقوم بإعادة الجلب تلقائياً لتجنب اختفاء الزر
      // يمكن للمستخدم تحديث يدوياً بواسطة زر التحديث
    } catch (err) {
      console.error("Approve error:", err.response || err);
      setSnackbar({ open: true, message: "Unable to approve subscription.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCashPayment = async (item) => {
    const subscriptionId = getSubscriptionId(item);
    if (!subscriptionId) {
      setSnackbar({ open: true, message: "Subscription ID not found.", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/${subscriptionId}`,
        {
          SubscriptionId: subscriptionId,
          FirstName: getFirstName(item),
          LastName: getLastName(item),
          Amount: getAmount(item),
          Currency: getCurrency(item),
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      setSnackbar({ open: true, message: "Cash payment activated. Subscription is now active.", severity: "success" });
      // إزالة الطلب من القائمة
      setRequests((prev) => prev.filter((req) => String(getSubscriptionId(req)) !== String(subscriptionId)));
      await fetchActiveClients();
      setTab(1);
    } catch (err) {
      console.error("Activate cash payment error:", err.response || err);
      setSnackbar({ open: true, message: "Unable to activate cash payment.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (subscriptionId) => {
    if (!subscriptionId) {
      setSnackbar({ open: true, message: "Subscription ID not found.", severity: "error" });
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API_BASE}/reject/${subscriptionId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRequests((prev) => prev.filter((item) => String(getSubscriptionId(item)) !== String(subscriptionId)));
      setSnackbar({ open: true, message: "Subscription rejected.", severity: "info" });
      await fetchActiveClients();
    } catch (err) {
      console.error("Reject error:", err.response || err);
      setSnackbar({ open: true, message: "Unable to reject subscription.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRequests(true);
    fetchActiveClients();
  };

  const filteredRequests = requests.filter((item) => getName(item).toLowerCase().includes(search.toLowerCase()));
  const filteredActiveClients = activeClients.filter((item) => getName(item).toLowerCase().includes(search.toLowerCase()));

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Clients
          </Typography>
          <Typography color="text.secondary">Review subscription requests and manage your active clients</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField size="small" placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: 280, bgcolor: "white" }} />
          <IconButton onClick={handleRefresh} disabled={loading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Subscription Requests</Typography>
              <Typography variant="h4" fontWeight="bold">
                {requests.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Active Clients</Typography>
              <Typography variant="h4" fontWeight="bold">
                {activeClients.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Tabs value={tab} onChange={(e, value) => setTab(value)} sx={{ borderBottom: "1px solid #e5e7eb", px: 2 }}>
          <Tab label={`Subscription Requests (${requests.length})`} />
          <Tab label={`Active Clients (${activeClients.length})`} />
        </Tabs>

        {tab === 0 && (
          <Table>
            <TableHead sx={{ bgcolor: "#eef3fb" }}>
              <TableRow>
                <TableCell>CLIENT</TableCell>
                <TableCell>PLAN</TableCell>
                <TableCell>REQ. DATE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No subscription requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((item, index) => {
                  const subscriptionId = getSubscriptionId(item);
                  const isCash = isCashPayment(item);
                  const isCard = isCardPayment(item);
                  const waiting = isWaitingPayment(item);

                  return (
                    <TableRow key={subscriptionId || index}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>{getName(item).charAt(0)}</Avatar>
                          <Typography fontWeight="bold">{getName(item)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{getPlanName(item)}</TableCell>
                      <TableCell>{getRequestDate(item)}</TableCell>
                      <TableCell>
                        <Chip label={getStatusLabel(item)} color={getStatusColor(item)} size="small" />
                      </TableCell>
                      <TableCell>
                        {isPendingRequest(item) ? (
                          <>
                            <Button size="small" variant="contained" color="success" sx={{ mr: 1 }} disabled={!subscriptionId || loading} onClick={() => handleApprove(subscriptionId)}>
                              Approve
                            </Button>
                            <Button size="small" variant="outlined" color="error" disabled={!subscriptionId || loading} onClick={() => handleReject(subscriptionId)}>
                              Reject
                            </Button>
                          </>
                        ) : waiting && isCash ? (
                          <Button size="small" variant="contained" color="primary" disabled={!subscriptionId || loading} onClick={() => handleActivateCashPayment(item)}>
                            Activate Cash Payment
                          </Button>
                        ) : waiting && isCard ? (
                          <Typography color="text.secondary" fontSize={14}>
                            Waiting online payment (client will pay)
                          </Typography>
                        ) : waiting ? (
                          <Typography color="text.secondary" fontSize={14}>
                            Waiting payment
                          </Typography>
                        ) : (
                          <Typography color="text.secondary" fontSize={14}>
                            No action
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}

        {tab === 1 && (
          <Table>
            <TableHead sx={{ bgcolor: "#eef3fb" }}>
              <TableRow>
                <TableCell>CLIENT</TableCell>
                <TableCell>CURRENT PLAN</TableCell>
                <TableCell>START DATE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredActiveClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No active clients found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredActiveClients.map((item, index) => {
                  const clientId = getClientId(item);
                  return (
                    <TableRow key={getSubscriptionId(item) || clientId || index}>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>{getName(item).charAt(0)}</Avatar>
                          <Typography fontWeight="bold">{getName(item)}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{getPlanName(item)}</TableCell>
                      <TableCell>{getStartDate(item)}</TableCell>
                      <TableCell>
                        <Chip label="Active" color="success" size="small" />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined" disabled={!clientId} onClick={() => navigate(`/specialistInbody/${clientId}`)}>
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
}