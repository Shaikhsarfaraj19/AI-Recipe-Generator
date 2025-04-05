export const generateRecipe = async (ingredients: string) => {
    const prompt = `Generate a recipe using these ingredients: ${ingredients}. 
    Return ONLY a JSON object (no markdown, no backticks) with this structure:
    {
      "title": "Recipe Name",
      "description": "Brief appetizing description of the dish",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"]
    }`;
  
    try {
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a helpful recipe generator. Only respond with valid JSON, no markdown or explanation needed.' },
            { role: 'user', content: prompt }
          ]
        })
      });
  
      const data = await response.json();
      
      // Clean the response by removing any markdown or code blocks
      let cleanJson = data.completion
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
  
      try {
        return JSON.parse(cleanJson);
      } catch (parseError) {
        // If parsing fails, try to extract JSON from the string
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw parseError;
      }
    } catch (error) {
      console.error('Error:', error);
      throw new Error('Failed to generate recipe. Please try again.');
    }
  };