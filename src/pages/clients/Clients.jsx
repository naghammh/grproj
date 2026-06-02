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
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://nutrilife.runasp.net/api/Subscription";
const CACHE_KEY = "approvedClientsCache";
const ACTIVE_CLIENTS_KEY = "activeClientsCache";

export default function Clients() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [requests, setRequests] = useState([]);
  const [activeClients, setActiveClients] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ACTIVE_CLIENTS_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const decodeTokenPayload = () => {
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        "="
      );

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
      payload?.[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      localStorage.getItem("userId") ||
      null
    );
  };

  const getSubscriptionId = (item) =>
    item.subscriptionId ||
    item.SubscriptionId ||
    item.id ||
    item.Id ||
    item.subId ||
    item.SubId;

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
    (item.clientId ? `Client #${String(item.clientId).slice(0, 8)}` : null) ||
    "Unknown Client";

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
    item.requestDate ||
    item.RequestDate ||
    item.createdAt ||
    item.CreatedAt ||
    item.createdDate ||
    item.CreatedDate ||
    "-";

    const getStartDate = (item) => {
      const date =
        item.startDate ||
        item.StartDate ||
        item.approvedAt ||
        item.ApprovedAt ||
        item.approvedDate ||
        item.ApprovedDate ||
        "-";
    
      return date === "0001-01-01" ? "-" : date;
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

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ...cache,
        [subscriptionId]: data,
      })
    );
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

  const mergeUniqueClients = (oldClients, newClients) => {
    const map = new Map();

    [...oldClients, ...newClients].forEach((client) => {
      const key =
        getSubscriptionId(client) ||
        client.clientId ||
        client.ClientId ||
        getName(client);

      if (key) {
        map.set(String(key), client);
      }
    });

    return Array.from(map.values());
  };

  const fetchRequests = async () => {
    try {
      const nutritionistId = getCurrentNutritionistId();

      if (!token || !nutritionistId) return;

      const res = await axios.get(
        `${API_BASE}/NutritionistSubscriptionRequests/${nutritionistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Requests error:", err.response || err);
      setRequests([]);
    }
  };

  const fetchActiveClients = async () => {
    try {
      const nutritionistId = getCurrentNutritionistId();
  
      if (!token || !nutritionistId) return;
  
      const res = await axios.get(
        `${API_BASE}/NutritionistHistory/${nutritionistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("NUTRITIONIST HISTORY RESPONSE:", res.data);
  
      const data = Array.isArray(res.data) ? res.data : [];
  
      const validServerClients = data.filter((item) => {
        const subscriptionId = getSubscriptionId(item);
        const name = getName(item);
        const status = String(item.status || item.Status || "").toLowerCase();
  
        return (
          subscriptionId &&
          subscriptionId !== 0 &&
          name !== "Unknown Client" &&
          !["waitingpayment", "pending", "rejected", "cancelled", "canceled"].includes(
            status
          )
        );
      });
  
      const serverClients = mergeClientsWithCache(validServerClients);
  
      setActiveClients((prev) => {
        const mergedClients = mergeUniqueClients(prev, serverClients);
  
        saveActiveClients(mergedClients);
  
        return mergedClients;
      });
    } catch (err) {
      console.log("Active clients error:", err.response || err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchActiveClients();
  }, []);

  const handleApprove = async (subscriptionId) => {
    if (!subscriptionId) {
      alert("Subscription ID not found.");
      return;
    }

    const approvedRequest = requests.find(
      (item) => String(getSubscriptionId(item)) === String(subscriptionId)
    );

    try {
      await axios.put(
        `${API_BASE}/approve/${subscriptionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (approvedRequest) {
        const cachedClient = {
          subscriptionId,
          clientName: getName(approvedRequest),
          planId: approvedRequest.planId || approvedRequest.PlanId,
          planName: getPlanName(approvedRequest),
          startDate: new Date().toISOString().split("T")[0],
          status: "Active",
        };

        saveToCache(subscriptionId, {
          clientName: cachedClient.clientName,
          planId: cachedClient.planId,
          planName: cachedClient.planName,
        });

        setRequests((prev) =>
          prev.filter(
            (item) => String(getSubscriptionId(item)) !== String(subscriptionId)
          )
        );

        setActiveClients((prev) => {
          const alreadyExists = prev.some(
            (item) => String(getSubscriptionId(item)) === String(subscriptionId)
          );

          if (alreadyExists) return prev;

          const updated = [...prev, cachedClient];

          saveActiveClients(updated);

          return updated;
        });
      }

      setTab(1);

      setTimeout(() => {
        fetchRequests();
        fetchActiveClients();
      }, 1500);
    } catch (err) {
      console.log("Approve error:", err.response || err);
      alert("Unable to approve subscription.");
    }
  };

  const handleReject = async (subscriptionId) => {
    if (!subscriptionId) {
      alert("Subscription ID not found.");
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/reject/${subscriptionId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRequests((prev) =>
        prev.filter(
          (item) => String(getSubscriptionId(item)) !== String(subscriptionId)
        )
      );

      await fetchRequests();
      await fetchActiveClients();
    } catch (err) {
      console.log("Reject error:", err.response || err);
      alert("Unable to reject subscription.");
    }
  };

  const filteredRequests = requests.filter((item) =>
    getName(item).toLowerCase().includes(search.toLowerCase())
  );

  const filteredActiveClients = activeClients.filter((item) =>
    getName(item).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Clients
          </Typography>
          <Typography color="text.secondary">
            Review subscription requests and manage your active clients
          </Typography>
        </Box>

        <TextField
          size="small"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 280, bgcolor: "white" }}
        />
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Pending Requests</Typography>
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
        <Tabs
          value={tab}
          onChange={(e, value) => setTab(value)}
          sx={{ borderBottom: "1px solid #e5e7eb", px: 2 }}
        >
          <Tab label={`Subscription Requests ${requests.length}`} />
          <Tab label={`Active Clients ${activeClients.length}`} />
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

                  return (
                    <TableRow key={subscriptionId || index}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {getName(item).charAt(0)}
                          </Avatar>
                          <Typography fontWeight="bold">
                            {getName(item)}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>{getPlanName(item)}</TableCell>
                      <TableCell>{getRequestDate(item)}</TableCell>

                      <TableCell>
                        <Chip label="Pending" color="warning" size="small" />
                      </TableCell>

                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          sx={{ mr: 1 }}
                          disabled={!subscriptionId}
                          onClick={() => handleApprove(subscriptionId)}
                        >
                          Approve
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          disabled={!subscriptionId}
                          onClick={() => handleReject(subscriptionId)}
                        >
                          Reject
                        </Button>
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
                filteredActiveClients.map((item, index) => (
                  <TableRow key={getSubscriptionId(item) || item.clientId || index}>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {getName(item).charAt(0)}
                        </Avatar>
                        <Typography fontWeight="bold">{getName(item)}</Typography>
                      </Box>
                    </TableCell>

                    <TableCell>{getPlanName(item)}</TableCell>
                    <TableCell>{getStartDate(item)}</TableCell>

                    <TableCell>
                      <Chip label="Active" color="success" size="small" />
                    </TableCell>

                    <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() =>
                        navigate(`/specialistInbody/${item.clientId || item.ClientId}`)
                      }
                    >
                      View Profile
                    </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </Box>
  );
}