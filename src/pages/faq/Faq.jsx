import React from "react";
import { Box, Container, Grid, Typography, Paper } from "@mui/material";

const faqs = [
  {
    question: "How can I improve my daily eating habits?",
    answer:
      "Start by eating balanced meals with vegetables, proteins, and whole grains, and try to reduce fast food and sugary drinks.",
  },
  {
    question: "What are the most important nutrients my body needs daily?",
    answer:
      "Your body needs proteins, carbohydrates, healthy fats, vitamins, minerals, and water to maintain optimal health.",
  },
  {
    question: "How many meals per day are ideal for good health?",
    answer:
      "It is generally recommended to have 3 main meals with 1-2 healthy snacks in between to maintain energy balance and control appetite.",
  },
  {
    question: "How do I balance protein, carbohydrates, and fats?",
    answer:
      "Aim for half your plate to be vegetables, a quarter protein like chicken or legumes, a quarter whole-grain carbs, and add healthy fats such as olive oil or nuts.",
  },
  {
    question: "What are the best foods to boost energy during the day?",
    answer:
      "Fruits, nuts, whole grains, and leafy greens provide steady energy without sudden spikes in blood sugar.",
  },
  {
    question: "How can I manage cravings for sweets?",
    answer:
      "Try replacing sweets with fresh or dried fruits, and eat balanced meals to prevent blood sugar drops that trigger strong cravings.",
  },
  {
    question: "Should I take dietary supplements, and when?",
    answer:
      "Supplements are only necessary if there is a deficiency in certain nutrients, like vitamin D or iron, and you should consult a nutritionist or doctor before taking them.",
  },
  {
    question: "What are some healthy meal planning strategies for the week?",
    answer:
      "Plan your meals ahead, prep ingredients, use healthy cooking methods like grilling or steaming, and keep healthy snacks ready.",
  },
  {
    question: "How can my diet affect weight and overall health?",
    answer:
      "A balanced diet helps maintain a healthy weight, reduces the risk of chronic diseases like diabetes and high blood pressure, and boosts energy and mood.",
  },
  {
    question: "Which drinks should I avoid for good health?",
    answer:
      "Avoid sugary sodas, packaged juices with added sugar, and alcohol; replace them with water, herbal teas, or natural juices without added sugar.",
  },
];

export default function FAQ() {
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
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            mb: 6,
            color: "text.primary",
          }}
        >
          Frequently Asked Questions
        </Typography>

        <Grid
          container
          spacing={3}
          sx={{
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          {faqs.map((faq, index) => (
            <Grid
              item
              key={index}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc(50% - 12px)",
                  md: "calc(50% - 12px)",
                },
                display: "flex",
                alignItems: "stretch",
                padding: "8px",
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  width: "100%",
                  minHeight: 200,
                  boxSizing: "border-box",
                  p: 3,
                  border: "1px solid",
                  borderColor: "#FFA500",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  color: "text.primary",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  lineHeight: 1.6,
                  transition:
                    "background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease",
                  "&:hover": {
                    boxShadow: 3,
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    mb: 2,
                    color: "text.primary",
                  }}
                >
                  {faq.question}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                  }}
                >
                  {faq.answer}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
