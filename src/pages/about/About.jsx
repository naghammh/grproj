import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Card,
  Typography,
  Button,
} from "@mui/material";
import salad from "../../assets/images/salad.jpg";

function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      title: "Personalized Plans",
      text: "Customized meal plans based on your health goals.",
    },
    {
      title: "Certified Specialists",
      text: "Professional nutrition guidance you can trust.",
    },
    {
      title: "Smart AI Support",
      text: "24/7 assistance to keep you on track.",
    },
  ];

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        py: 8,
        minHeight: "100vh",
        transition: "background-color 0.25s ease, color 0.25s ease",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            position: "relative",
            backgroundImage: `url(${salad})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 4,
            minHeight: 320,
            display: "flex",
            alignItems: "flex-end",
            p: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Typography variant="h3" fontWeight="bold" color="#fff">
              About NutriLife
            </Typography>

            <Typography variant="h6" color="#fff">
              Your personalized path to a healthier lifestyle.
            </Typography>
          </Box>
        </Box>

        <Grid container justifyContent="center" sx={{ mt: 8, mb: 8 }}>
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                p: 5,
                textAlign: "center",
                borderRadius: 4,
                boxShadow: 3,
                bgcolor: "background.paper",
                color: "text.primary",
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Who We Are
              </Typography>

              <Typography color="text.secondary">
                NutriLife is a smart nutrition platform designed to make healthy
                living simple and personalized. We combine expert guidance with
                intelligent technology to create meal plans tailored to your goals,
                lifestyle, and preferences.
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid key={index} size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
              <Card
                sx={{
                  flex: 1,
                  p: 4,
                  mb: 4,
                  borderRadius: 3,
                  boxShadow: 3,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  bgcolor: "background.paper",
                  color: "text.primary",
                  transition:
                    "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.25s ease, color 0.25s ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 6,
                  },
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {feature.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {feature.text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center">
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            sx={{
              px: 5,
              py: 1.8,
              borderRadius: 3,
              fontWeight: "bold",
              bgcolor: "primary.main",
              color: "#fff",
              "&:hover": {
                bgcolor: "#1b5e20",
              },
            }}
          >
            Start Your Healthy Journey
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default About;
