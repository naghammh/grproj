import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  AccessTime,
  Close,
  LocalFireDepartment,
  Restaurant,
} from "@mui/icons-material";

const API_URL = "PUT_CLIENT_RECIPES_API_HERE";

const fallbackRecipes = [
  {
    id: 1,
    title: "Atlantic Salmon & Quinoa",
    category: "Dinner",
    calories: 450,
    time: "15 mins",
    image:
      "https://images.unsplash.com/photo-1485921325833-c519f76c4927?q=80&w=900&auto=format&fit=crop",
    shortDescription: "Heart-healthy omega-3 fats paired with balanced grains.",
    description:
      "A nourishing salmon and quinoa plate designed for steady energy, healthy fats, and a balanced protein-rich meal.",
    ingredients: [
      "Salmon fillet",
      "Cooked quinoa",
      "Asparagus",
      "Cherry tomatoes",
      "Olive oil",
      "Lemon juice",
    ],
    instructions:
      "Season the salmon, bake or grill until cooked through, then serve with quinoa and vegetables. Finish with lemon juice and olive oil.",
  },
  {
    id: 2,
    title: "Mediterranean Buddha Bowl",
    category: "Lunch",
    calories: 380,
    time: "20 mins",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=900&auto=format&fit=crop",
    shortDescription: "A colorful mix of roasted vegetables and chickpeas.",
    description:
      "A fiber-rich bowl packed with roasted vegetables, chickpeas, greens, and a light dressing.",
    ingredients: [
      "Chickpeas",
      "Avocado",
      "Sweet potato",
      "Greens",
      "Tahini dressing",
    ],
    instructions:
      "Roast the vegetables, warm the chickpeas, then arrange everything in a bowl with greens and dressing.",
  },
  {
    id: 3,
    title: "Lemon Herb Chicken Salad",
    category: "Lunch",
    calories: 320,
    time: "12 mins",
    image:
      "https://images.unsplash.com/photo-1604909052743-94e838986d24?q=80&w=900&auto=format&fit=crop",
    shortDescription: "Lean protein infused with zesty citrus and herbs.",
    description:
      "A fresh chicken salad made for a light but satisfying meal with lean protein and crisp vegetables.",
    ingredients: [
      "Grilled chicken breast",
      "Romaine lettuce",
      "Cherry tomatoes",
      "Cucumber",
      "Lemon herb dressing",
    ],
    instructions:
      "Slice grilled chicken, combine with fresh vegetables, then toss gently with lemon herb dressing.",
  },
  {
    id: 4,
    title: "Berry Power Overnight Oats",
    category: "Breakfast",
    calories: 290,
    time: "10 mins",
    image:
      "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=900&auto=format&fit=crop",
    shortDescription: "Sustained energy with high fiber and berries.",
    description:
      "A simple overnight oats recipe rich in fiber, antioxidants, and slow-digesting carbohydrates.",
    ingredients: [
      "Rolled oats",
      "Greek yogurt",
      "Milk",
      "Blueberries",
      "Strawberries",
      "Chia seeds",
    ],
    instructions:
      "Mix oats, yogurt, milk, and chia seeds. Refrigerate overnight, then top with berries before serving.",
  },
  {
    id: 5,
    title: "Garden Hummus Wrap",
    category: "Snack",
    calories: 410,
    time: "8 mins",
    image:
      "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=900&auto=format&fit=crop",
    shortDescription: "A quick portable lunch option packed with vegetables.",
    description:
      "A colorful wrap with hummus and crunchy vegetables, perfect for a quick client-friendly meal.",
    ingredients: [
      "Whole wheat wrap",
      "Hummus",
      "Lettuce",
      "Bell pepper",
      "Carrot",
      "Cucumber",
    ],
    instructions:
      "Spread hummus over the wrap, add vegetables, roll tightly, and slice before serving.",
  },
  {
    id: 6,
    title: "Herbed Lentil Soup",
    category: "Dinner",
    calories: 350,
    time: "25 mins",
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=900&auto=format&fit=crop",
    shortDescription: "A warming high-fiber soup designed for fullness.",
    description:
      "A comforting lentil soup rich in plant protein, fiber, and herbs for a balanced warm meal.",
    ingredients: [
      "Red lentils",
      "Carrot",
      "Onion",
      "Garlic",
      "Vegetable broth",
      "Parsley",
    ],
    instructions:
      "Cook onion, carrot, and garlic, then add lentils and broth. Simmer until soft and finish with parsley.",
  },
];

export default function ClientRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      // لما تبعتيلي API الحقيقي بنفعّل هذا الجزء:
      // const res = await fetch(API_URL);
      // const data = await res.json();
      // setRecipes(data);

      setRecipes(fallbackRecipes);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      setRecipes(fallbackRecipes);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7f8fc",
        color: "#111827",
      }}
    >
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Box mb={3}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ fontSize: { xs: 26, md: 34 } }}
          >
            Recommended Recipes
          </Typography>

          <Typography color="text.secondary" mt={0.5}>
            Healthy meals prepared by your nutritionist
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {recipes.map((recipe) => (
            <RecipeClientCard
              key={recipe.id}
              recipe={recipe}
              onView={() => setSelectedRecipe(recipe)}
            />
          ))}
        </Box>
      </Box>

      <RecipeDetailsModal
        recipe={selectedRecipe}
        open={Boolean(selectedRecipe)}
        onClose={() => setSelectedRecipe(null)}
      />
    </Box>
  );
}

function RecipeClientCard({ recipe, onView }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: "0 10px 28px rgba(15, 23, 42, 0.08)",
        border: "1px solid #edf0f5",
        bgcolor: "#fff",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={recipe.image}
          alt={recipe.title}
          sx={{
            height: 210,
            objectFit: "cover",
          }}
        />

        <Chip
          icon={<LocalFireDepartment sx={{ fontSize: 15 }} />}
          label={`${recipe.calories} kcal`}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "#e5f8ed",
            color: "#00874f",
            fontWeight: 800,
            backdropFilter: "blur(6px)",
          }}
        />
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <AccessTime sx={{ fontSize: 15, color: "#00874f" }} />
          <Typography fontSize={12} color="text.secondary">
            {recipe.time}
          </Typography>
        </Stack>

        <Typography fontWeight={800} mb={0.7}>
          {recipe.title}
        </Typography>

        <Typography
          fontSize={13}
          color="text.secondary"
          sx={{
            minHeight: 38,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {recipe.shortDescription || recipe.description}
        </Typography>

        <Button
          fullWidth
          variant="contained"
          onClick={onView}
          sx={{
            mt: 2,
            bgcolor: "#007a3d",
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 800,
            py: 1,
            "&:hover": {
              bgcolor: "#006633",
            },
          }}
        >
          View Recipe
        </Button>
      </CardContent>
    </Card>
  );
}

function RecipeDetailsModal({ open, onClose, recipe }) {
  if (!recipe) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.25)",
        },
      }}
      BackdropProps={{
        sx: {
          bgcolor: "rgba(15, 23, 42, 0.35)",
          backdropFilter: "blur(6px)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <Box
          component="img"
          src={recipe.image}
          alt={recipe.title}
          sx={{
            width: "100%",
            height: { xs: 220, md: 320 },
            objectFit: "cover",
            display: "block",
          }}
        />

        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            bgcolor: "rgba(255,255,255,0.92)",
            "&:hover": { bgcolor: "#fff" },
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <DialogTitle sx={{ pb: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={900}>
              {recipe.title}
            </Typography>

            <Typography color="text.secondary" fontSize={14} mt={0.5}>
              {recipe.description}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Chip
              icon={<AccessTime />}
              label={recipe.time}
              sx={{
                bgcolor: "#eef3ff",
                fontWeight: 700,
              }}
            />

            <Chip
              icon={<LocalFireDepartment />}
              label={`${recipe.calories} kcal`}
              sx={{
                bgcolor: "#e5f8ed",
                color: "#00874f",
                fontWeight: 800,
              }}
            />
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, pb: 3 }}>
        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.8fr 1.2fr" },
            gap: 3,
          }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
              <Restaurant sx={{ color: "#00874f" }} />
              <Typography fontWeight={900}>Ingredients</Typography>
            </Stack>

            <Stack spacing={1}>
              {(recipe.ingredients || []).map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    bgcolor: "#f1f5f9",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {item}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography fontWeight={900} mb={1.5}>
              Preparation
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                lineHeight: 1.8,
                bgcolor: "#f8fafc",
                borderRadius: 2,
                p: 2,
                border: "1px solid #edf0f5",
              }}
            >
              {recipe.instructions}
            </Typography>

            {recipe.category && (
              <Chip
                label={recipe.category}
                sx={{
                  mt: 2,
                  bgcolor: "#dff7ea",
                  color: "#007a3d",
                  fontWeight: 800,
                }}
              />
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}