import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fab,
} from "@mui/material";
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AccessTime as TimeIcon,
  LocalFireDepartment as CaloriesIcon,
  Restaurant as CategoryIcon,
  Close as CloseIcon,
  NavigateNext as NextIcon,
} from "@mui/icons-material";

function Recipes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [favorites, setFavorites] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const categories = ["الكل", "الإفطار", "الغداء", "العشاء", "وجبات خفيفة", "عصائر"];

  const recipes = [
    {
      id: 1,
      title: "شوفان بالتفاح والقرفة",
      category: "الإفطار",
      image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=500",
      time: "10 دقائق",
      calories: 350,
      rating: 4.5,
      difficulty: "سهل",
      ingredients: ["½ كوب شوفان", "1 تفاحة مقطعة", "1 ملعقة قرفة", "1 كوب حليب لوز", "1 ملعقة عسل"],
      instructions: ["ضع الشوفان والحليب في قدر على نار هادئة", "أضف التفاح والقرفة", "حرك لمدة 5-7 دقائق", "قدم مع العسل"],
    },
    {
      id: 2,
      title: "سلطة الكينوا بالخضار",
      category: "الغداء",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
      time: "20 دقائق",
      calories: 420,
      rating: 4.8,
      difficulty: "سهل",
      ingredients: ["1 كوب كينوا مطبوخة", "خيار مقطع", "طماطم كرزية", "بقدونس", "عصير ليمون", "زيت زيتون"],
      instructions: ["اخلط الكينوا مع الخضار", "أضف عصير الليمون وزيت الزيتون", "زين بالبقدونس وقدم"],
    },
    {
      id: 3,
      title: "سمك مشوي بالفرن",
      category: "العشاء",
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500",
      time: "30 دقائق",
      calories: 380,
      rating: 4.7,
      difficulty: "متوسط",
      ingredients: ["فيليه سمك سلمون", "ليمون", "ثوم مهروس", "زيت زيتون", "بهارات مشكلة"],
      instructions: ["تبل السمك بالبهارات والثوم", "أضف شرائح الليمون", "اخبز في الفرن على 180 درجة لمدة 20 دقيقة"],
    },
    {
      id: 4,
      title: "عصير الطاقة الأخضر",
      category: "عصائر",
      image: "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500",
      time: "5 دقائق",
      calories: 150,
      rating: 4.3,
      difficulty: "سهل",
      ingredients: ["سبانخ", "موزة", "تفاحة خضراء", "زنجبيل", "ماء جوز الهند"],
      instructions: ["اخلط جميع المكونات في الخلاط", "قدم بارداً"],
    },
  ];

  const toggleFavorite = (recipeId) => {
    if (favorites.includes(recipeId)) {
      setFavorites(favorites.filter((id) => id !== recipeId));
    } else {
      setFavorites([...favorites, recipeId]);
    }
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setOpenDialog(true);
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.includes(searchTerm);
    const matchesCategory =
      selectedCategory === "الكل" || recipe.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "100vh",
      }}
    >
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: "primary.main",
          color: "#fff",
          backgroundImage: "none",
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          وصفات غذائية صحية
        </Typography>

        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
          وصفات لذيذة ومغذية تناسب برنامجك الغذائي
        </Typography>
      </Paper>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          color: "text.primary",
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
        }}
      >
        <TextField
          fullWidth
          placeholder="ابحث عن وصفة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setSelectedCategory(cat)}
              color={selectedCategory === cat ? "primary" : "default"}
              variant={selectedCategory === cat ? "filled" : "outlined"}
            />
          ))}
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {filteredRecipes.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                cursor: "pointer",
                bgcolor: "background.paper",
                color: "text.primary",
                border: "1px solid",
                borderColor: "divider",
                backgroundImage: "none",
                transition:
                  "transform 0.2s ease, box-shadow 0.2s ease, background-color 0.25s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              <Box sx={{ position: "relative" }}>
                <CardMedia
                  component="img"
                  height="180"
                  image={recipe.image}
                  alt={recipe.title}
                  onClick={() => handleRecipeClick(recipe)}
                />

                <IconButton
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "background.paper",
                    color: favorites.includes(recipe.id)
                      ? "error.main"
                      : "text.primary",
                    "&:hover": {
                      bgcolor: "background.paper",
                    },
                  }}
                  onClick={() => toggleFavorite(recipe.id)}
                >
                  {favorites.includes(recipe.id) ? (
                    <FavoriteIcon color="error" />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </Box>

              <CardContent onClick={() => handleRecipeClick(recipe)}>
                <Typography variant="h6" fontWeight="bold">
                  {recipe.title}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, mt: 1, flexWrap: "wrap" }}>
                  <Chip
                    size="small"
                    icon={<TimeIcon />}
                    label={recipe.time}
                    variant="outlined"
                  />

                  <Chip
                    size="small"
                    icon={<CaloriesIcon />}
                    label={`${recipe.calories} سعرة`}
                    variant="outlined"
                  />

                  <Chip
                    size="small"
                    icon={<CategoryIcon />}
                    label={recipe.category}
                    variant="outlined"
                  />
                </Box>

                <Rating value={recipe.rating} readOnly size="small" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
            backgroundImage: "none",
          },
        }}
      >
        {selectedRecipe && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Typography variant="h5">{selectedRecipe.title}</Typography>

                <IconButton
                  onClick={() => setOpenDialog(false)}
                  sx={{ color: "text.primary" }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.title}
                    style={{ width: "100%", borderRadius: 12 }}
                  />

                  <Box sx={{ display: "flex", gap: 2, mt: 2, flexWrap: "wrap" }}>
                    <Chip icon={<TimeIcon />} label={selectedRecipe.time} />
                    <Chip
                      icon={<CaloriesIcon />}
                      label={`${selectedRecipe.calories} سعرة`}
                    />
                    <Chip label={selectedRecipe.difficulty} />
                    <Rating value={selectedRecipe.rating} readOnly />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    المكونات
                  </Typography>

                  <List>
                    {selectedRecipe.ingredients.map((ing, idx) => (
                      <ListItem key={idx} dense>
                        <ListItemIcon>
                          <NextIcon fontSize="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={ing} />
                      </ListItem>
                    ))}
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    طريقة التحضير
                  </Typography>

                  <List>
                    {selectedRecipe.instructions.map((step, idx) => (
                      <ListItem key={idx} dense>
                        <ListItemIcon>
                          <Chip label={idx + 1} size="small" color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={step} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

      {favorites.length > 0 && (
        <Fab color="primary" sx={{ position: "fixed", bottom: 16, right: 16 }}>
          <FavoriteIcon />
        </Fab>
      )}
    </Box>
  );
}

export default Recipes;
