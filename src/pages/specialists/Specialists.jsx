import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Specialists() {
  const navigate = useNavigate();
  const [specialists, setSpecialists] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("https://nutrilife.runasp.net/api/Account/allNutritionists")
      .then((res) => {
        setSpecialists(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load specialists");
        setLoading(false);
      });
  }, []);

  const filtered = specialists.filter(
    (item) =>
      item.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      item.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
        py: 5,
      }}
    >
      <Container>
        <Typography
          variant="h4"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          Find a Nutrition Specialist
        </Typography>

        <Typography align="center" color="text.secondary" mb={4}>
          Browse certified specialists and choose the right partner for your
          wellness journey. Science-backed guidance tailored to your life.
        </Typography>

        <Box display="flex" justifyContent="center" mb={4}>
          <TextField
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              width: { xs: "100%", sm: 400 },
              bgcolor: "background.paper",
              borderRadius: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Box>

        {loading && (
          <Box textAlign="center">
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}

        {!loading && !error && filtered.length === 0 && (
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
            😕 No specialists found matching "{search}"
          </Typography>
        )}

        <Grid container spacing={3}>
          {filtered.map((spec) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={spec.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  textAlign: "center",
                  py: 3,
                  bgcolor: "background.paper",
                  color: "text.primary",
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundImage: "none",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  transition:
                    "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                  },
                }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      margin: "auto",
                      mb: 2,
                      bgcolor: "primary.main",
                      color: "#fff",
                      fontSize: 30,
                    }}
                  >
                    {spec.fullName?.charAt(0)}
                  </Avatar>

                  <Typography variant="h6" fontWeight="bold">
                    {spec.fullName}
                  </Typography>

                  <Typography color="text.secondary" mb={1}>
                    {spec.specialization}
                  </Typography>

                  <Typography
                    fontSize={14}
                    sx={{ color: "primary.main", fontWeight: 500 }}
                  >
                    🎓 {spec.yearsOfExperience} years experience
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/specialist/${spec.id}`)}
                    sx={{
                      bgcolor: "primary.main",
                      color: "#fff",
                      borderRadius: 2,
                      px: 3,
                      "&:hover": { bgcolor: "#16a34a" },
                    }}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
