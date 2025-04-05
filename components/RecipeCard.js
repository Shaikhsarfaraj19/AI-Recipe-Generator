import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RecipeCard({ recipe }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageUrl(null);
    setLoadingImage(true);
    setImageError(false);

    if (recipe?.title) {
      const generateImage = async () => {
        setLoadingImage(true);
        setImageError(false);
        try {
          const imagePrompt = `High-quality food photography of ${recipe.title}, beautifully plated, ${recipe.description}. Professional lighting, appetizing, high resolution.`;
          // Added a timestamp to try and bypass potential caching issues if the prompt is identical
          const url = `https://api.a0.dev/assets/image?text=${encodeURIComponent(imagePrompt)}&aspect=16:9&_=${Date.now()}`;
          const response = await fetch(url);
          if (response.ok) {
            // Check content type just in case API returns something else on error
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.startsWith("image")) {
                 setImageUrl(response.url);
            } else {
                 throw new Error('API did not return an image');
            }
          } else {
            throw new Error(`Failed to fetch image (status: ${response.status})`);
          }
        } catch (error) {
          console.error('Error generating image:', error);
          setImageError(true);
          setImageUrl(null);
        } finally {
          setLoadingImage(false);
        }
      };
      generateImage();
    } else {
      setLoadingImage(false);
    }
  }, [recipe]);

  if (!recipe?.title) return null;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95, translateY: 15 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
      style={styles.card}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        {loadingImage ? (
          <View style={styles.placeholder}>
            <ActivityIndicator size="large" color="#FF8E53" />
          </View>
        ) : imageError || !imageUrl ? ( // Combine error and no-URL state
          <View style={[styles.placeholder, styles.errorPlaceholder]}>
            <MaterialCommunityIcons name="image-off-outline" size={40} color="#AEB6BF" />
            <Text style={styles.errorText}>Image Unavailable</Text>
          </View>
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={(e) => {
              console.log("Image Component onError:", e.nativeEvent.error);
              setImageError(true);
              setImageUrl(null);
            }}
          />
        )}
      </View>

      {/* Recipe Info */}
      <View style={styles.infoContainer}>
         <Text style={styles.recipeTitle}>{recipe.title}</Text>
         {recipe.description && (
            <Text style={styles.description}>{recipe.description}</Text>
         )}
      </View>


      {/* Ingredients Section */}
      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
             // Added a view wrapper for potential future styling per ingredient
            <View key={index} style={styles.listItem}>
                 <Text style={styles.bulletPoint}>•</Text>
                 <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Instructions Section - Enhanced */}
      {recipe.instructions && recipe.instructions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to make it</Text>
          {recipe.instructions.map((step, index) => (
            <View key={index} style={styles.instructionStep}>
               {/* Step Number Circle */}
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
              </View>
              {/* Step Text */}
              <Text style={styles.instructionText}>{step}</Text>
            </View>
          ))}
        </View>
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // Pure white card
    borderRadius: 20, // More rounded
    marginHorizontal: 15,
    marginVertical: 12,
    paddingBottom: 10, // Reduce bottom padding slightly as sections have margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 }, // Slightly larger offset
    shadowOpacity: 0.1, // More subtle opacity
    shadowRadius: 15,
    elevation: 7,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#F0F3F4', // Lighter placeholder background
    borderTopLeftRadius: 20, // Match card radius
    borderTopRightRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorPlaceholder: {
    backgroundColor: '#F0F3F4',
  },
  errorText: {
    marginTop: 8,
    color: '#808B96', // Muted error text
    fontSize: 13,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    paddingHorizontal: 20, // Consistent horizontal padding
    paddingTop: 18, // Space below image
    paddingBottom: 10, // Space before sections
  },
  recipeTitle: {
    fontSize: 23,
    fontWeight: '700', // Bolder
    color: '#1C2833', // Darker title
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#566573', // Slightly muted description color
    marginBottom: 10, // Adjusted spacing
    lineHeight: 22,
    fontStyle: 'italic',
  },
  section: {
    marginVertical: 10, // Consistent vertical spacing for sections
    paddingHorizontal: 20, // Consistent horizontal padding
  },
  sectionTitle: {
    fontSize: 19, // Slightly larger section title
    fontWeight: '600',
    color: '#2C3E50', // Slightly softer dark blue/grey
    marginBottom: 12, // More space below title
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#EAECEE', // Subtle separator line
  },
  // Ingredient specific styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align bullet with top of text
    marginBottom: 6, // Spacing between ingredients
  },
  bulletPoint: {
    fontSize: 16,
    color: '#FF8E53', // Use accent color for bullet
    marginRight: 8,
    lineHeight: 24, // Match ingredient text line height
  },
  ingredientText: {
    fontSize: 15.5, // Slightly larger ingredient text
    color: '#34495E', // Dark grey for ingredients
    flex: 1, // Allow text to wrap
    lineHeight: 24, // Improve readability
  },
  // Instruction specific styles - Enhanced
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align number circle with top of text
    marginBottom: 18, // More space between steps
  },
  stepNumberContainer: {
    backgroundColor: '#FFDAB9', // Light accent background for number
    borderRadius: 12, // Make it circular
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12, // Space between number and text
    marginTop: 1, // Fine-tune vertical alignment
  },
  stepNumber: {
    color: '#D9534F', // Darker accent color for number text
    fontSize: 13,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 16, // Larger instruction text
    color: '#2C3E50', // Clear instruction text color
    flex: 1, // Allow text to wrap
    lineHeight: 25, // Increased line height for instructions
  },
});