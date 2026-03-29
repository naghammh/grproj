import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
} from "@mui/material";

import interdata from "../../assets/images/interdata.png";
import plan from "../../assets/images/plan.png";
import meal from "../../assets/images/meal.png";
import check from "../../assets/images/check.png";

function Home() {
  return (
    <>
      <Box sx={{ py: 10, backgroundColor: "#f5f5f5" }}>
  <Container maxWidth="lg">
    <Grid container spacing={8} alignItems="center">
      
      {/* Left Text */}
      <Grid xs={12} md={6}>
        <Box sx={{ maxWidth: 480 }}>
          <Typography
            variant="h3"
            fontWeight="bold"
            lineHeight={1.2}
            gutterBottom
          >
            Your Healthy Journey
            <br />
            <Box component="span" color="success.main">
              Starts Here
            </Box>
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 2, mb: 4 }}
          >
            Unlock personalized nutrition with the power of AI and
            world-class specialists. Get a meal plan tailored
            specifically to your goals, preferences, and lifestyle.
          </Typography>

          <Button
            component={Link}
            to="/register"
            variant="contained"
            color="success"
            size="large"
            sx={{ px: 4, py: 1.5 }}
          >
            Get Started
          </Button>
        </Box>
      </Grid>

      {/* Right Image */}
      <Grid xs={12} md={6}>
        <Box
          component="img"
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061"
          alt="Healthy Food"
          sx={{
            width: "100%",
            maxWidth: 520,
            height: 380,
            objectFit: "cover",
            borderRadius: 3,
            boxShadow: 4,
            display: "block",
            margin: "0 auto",
          }}
        />
      </Grid>

    </Grid>
  </Container>
</Box>

     {/* 3 Steps */}
<Box id="how-it-works" sx={{ py: 10 }}>
  <Container maxWidth="lg">
    <Typography
      variant="h4"
      textAlign="center"
      fontWeight="bold"
      gutterBottom
    >
      Get Started in 3 Simple Steps
    </Typography>

    <Typography
      textAlign="center"
      color="text.secondary"
      sx={{ mb: 8 }}
    >
      We made it easy to begin your healthy journey.
    </Typography>

    <Grid container spacing={4}>
      {[
        {
          img: interdata,
          title: "Enter Health Data",
          desc: "Securely connect your devices and share your health information to create your personalized plan.",
        },
        {
          img: plan,
          title: "Choose Your Plan",
          desc: "Whether you're keto, vegan, or building muscle — we have a plan for you.",
        },
        {
          img: meal,
          title: "Get Personalized Meals",
          desc: "Receive a personalized meal plan, and easy recipes made just for you.",
        },
      ].map((item, index) => (
        <Grid
          key={index}
          size={{ xs: 12, md: 4 }}
          sx={{ display: "flex" }}
        >
          <Card
            sx={{
              flex: 1,
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <Box
              component="img"
              src={item.img}
              alt=""
              sx={{
                width: 70,
                height: 70,
                objectFit: "contain",
                mb: 3,
              }}
            />

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {item.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {item.desc}
            </Typography>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Container>
</Box>

    {/* Sustainable Section */}
<Box sx={{ backgroundColor: "#f5f5f5", py: 12 }}>
  <Container maxWidth="lg">
    <Grid container spacing={8} alignItems="center">
      
      {/* Left Cards */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Grid container spacing={4}>
          {[
            {
              title: "24/7 AI Assistant",
              text: "Ask anything about food, meals, or cravings — anytime.",
            },
            {
              title: "Certified Specialists",
              text: "Direct access to board-certified nutritionists and dietitians.",
            },
            {
              title: "Progress Tracking",
              text: "Visual data and weekly reports to keep you motivated.",
            },
            {
              title: "Smart Recipes",
              text: "Personalized recipes that adapt to your preferences.",
            },
          ].map((item, index) => (
            <Grid
              key={index}
              size={{ xs: 12, sm: 6 }}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  flex: 1,
                  p: 4,
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-6px)",
                  },
                }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {item.title}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {item.text}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>

      {/* Right Content */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Box sx={{ maxWidth: 480 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            lineHeight={1.3}
            gutterBottom
          >
            Built for{" "}
            <Box component="span" color="success.main">
              Sustainable
            </Box>{" "}
            Change
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 5 }}
          >
            We combine smart technology and expert guidance
            to help you build healthy habits that last.
          </Typography>

          {[
            "Science-backed approach",
            "Flexible plans for real life",
            "Secure and private data",
          ].map((text, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                component="img"
                src={check}
                alt=""
                sx={{ width: 22, mr: 2 }}
              />
              <Typography fontWeight="medium">
                {text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Grid>

    </Grid>
  </Container>
</Box>
    </>
  );
}

export default Home;