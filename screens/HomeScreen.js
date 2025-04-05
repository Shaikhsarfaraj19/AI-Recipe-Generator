import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Keyboard,
  Dimensions, // Import Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import RecipeCard from '../components/RecipeCard';
import { generateRecipe } from '../utils/recipeGenerator';
import { toast } from 'sonner-native';

const { height } = Dimensions.get('window'); // Get screen height

export default function HomeScreen() {
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const scrollViewRef = useRef(null);

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      toast.error("Psst... need some ingredients first!", {
          description: "Tell me what you have in your kitchen.",
      });
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setRecipe(null);

    try {
      const generatedRecipe = await generateRecipe(ingredients);

      if (
        !generatedRecipe ||
        !generatedRecipe.title?.trim() || // Also check if title is just spaces
        !generatedRecipe.ingredients ||
        generatedRecipe.ingredients.length === 0 ||
        !generatedRecipe.instructions ||
        generatedRecipe.instructions.length === 0
      ) {
         toast.error("Hmm, couldn't whip up a recipe.", {
             description: "Try being more specific or check your ingredients.",
         });
         setRecipe(null);
      } else {
        setRecipe(generatedRecipe);
        // Slightly smarter scroll: scrolls more if recipe card is likely off-screen
        setTimeout(() => {
            const scrollToY = height * 0.25; // Scroll down about 25% of screen height
             scrollViewRef.current?.scrollTo({ y: scrollToY, animated: true });
        }, 150);
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast.error("Uh oh! Something went wrong.", {
          description: error.message || 'Failed to connect. Please try again.'
      });
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Use LinearGradient for the background of the entire screen
    <LinearGradient
       colors={['#EBF5FB', '#FEF9E7', '#F7F8FC']} // Subtle gradient: light blue -> light yellow -> light grey
      // colors={['#f8f9fa', '#e9ecef']} // Alternative simpler grey gradient
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false} // Hide scrollbar for cleaner look
        >
          {/* Header Section */}
          <MotiView
            from={{ opacity: 0, translateY: -30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 700, delay: 100 }} // Slightly longer animation
          >
             <Text style={styles.title}>AI Recipe Chef</Text>
             <Text style={styles.subtitle}>Turn your pantry finds into culinary delights!</Text>
          </MotiView>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="silverware-fork-knife" size={22} color="#7D8A9C" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Chicken, broccoli, soy sauce, garlic..."
                placeholderTextColor="#AAB7B8" // Lighter placeholder
                value={ingredients}
                onChangeText={setIngredients}
                multiline
              />
            </View>
            <TouchableOpacity
              onPress={handleGenerateRecipe}
              disabled={loading}
              style={styles.generateButtonContainer}
              activeOpacity={0.7} // Feedback on press
            >
              <LinearGradient
                colors={loading ? ['#B0BEC5', '#90A4AE'] : ['#FF6B6B', '#FF8E53']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="magic-staff" size={20} color="white" style={{marginRight: 8}} />
                    <Text style={styles.buttonText}>Generate Magic</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Recipe Display Area */}
          <View style={styles.recipeArea}>
            {/* Loading Indicator (Centered) */}
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FF6B6B" />
                    <Text style={styles.loadingText}>Cooking up ideas...</Text>
                </View>
            )}

            {/* Show recipe card if available */}
            {!loading && recipe && <RecipeCard recipe={recipe} />}

            {/* Enhanced Empty State */}
            {!loading && !recipe && (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', delay: 100 }} // Spring animation
                style={styles.emptyStateContainer}
              >
                <MaterialCommunityIcons name="fridge-outline" size={65} color="#B0BEC5" />
                <Text style={styles.emptyStateTitle}>Ready to Cook?</Text>
                <Text style={styles.emptyStateText}>
                  List the ingredients you have,{"\n"}and let's create something tasty!
                </Text>
              </MotiView>
            )}
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { // Style for the main background gradient
      flex: 1,
  },
  container: {
    flex: 1,
    // backgroundColor: 'transparent', // Make SafeAreaView transparent to see gradient
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
     paddingHorizontal: 15, // Use horizontal padding on container
     paddingTop: 20, // Add top padding
     paddingBottom: 60, // Ensure space at the bottom
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A5276', // Darker blue for title
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16.5, // Slightly larger subtitle
    color: '#5D6D7E', // Softer grey/blue
    textAlign: 'center',
    marginBottom: 35, // More space below subtitle
    lineHeight: 23,
  },
  inputSection: {
     marginBottom: 25,
  },
  inputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Slightly transparent white
    borderRadius: 15, // More rounded input
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#EAECEE', // Subtle border
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 15, // Adjust icon position
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#34495E', // Dark input text
    paddingTop: 13, // Adjust text position
    paddingBottom: 10,
    textAlignVertical: 'top',
    lineHeight: 23,
  },
  generateButtonContainer: {
    borderRadius: 15, // Match input radius
    overflow: 'hidden',
    shadowColor: '#FF8E53', // Match button end color
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  gradientButton: { // Renamed from gradient
    paddingVertical: 16, // Taller button
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18, // Slightly larger button text
    fontWeight: '600',
    marginLeft: 5, // Adjust spacing from new icon
    textAlign: 'center',
  },
  recipeArea: {
    marginTop: 15,
    minHeight: height * 0.4, // Ensure this area takes up some space
    justifyContent: 'center' // Center loading/empty state vertically if no card
  },
  // Centered loading indicator
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#566573',
  },
  // Enhanced Empty State
  emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 30, // Add vertical padding
      paddingHorizontal: 20,
      opacity: 0.9, // Slightly less opaque
  },
  emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#5D6D7E',
      marginTop: 15,
      marginBottom: 8,
  },
  emptyStateText: {
      fontSize: 15,
      color: '#7F8C8D',
      textAlign: 'center',
      lineHeight: 22,
  },
});