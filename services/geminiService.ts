
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Sentiment } from "../types";
import { CATEGORIES } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      enum: ['Positive', 'Neutral', 'Negative'],
      description: 'The overall sentiment of the suggestion.'
    },
    category: {
      type: Type.STRING,
      enum: CATEGORIES,
      description: 'The most relevant category for the suggestion.'
    },
    tags: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'A list of 3-5 relevant lowercase tags for the suggestion.'
    }
  },
  required: ['sentiment', 'category', 'tags']
};

interface GeminiAnalysisResult {
    sentiment: Sentiment;
    category: Category;
    tags: string[];
}

export const analyzeSuggestion = async (title: string, description: string): Promise<GeminiAnalysisResult> => {
  if (!API_KEY) {
    // Fallback if API key is not available
    return {
      sentiment: 'Neutral',
      category: Category.OTHER,
      tags: ['general'],
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following student suggestion and provide a sentiment, a category, and relevant tags. Suggestion Title: "${title}". Description: "${description}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString) as GeminiAnalysisResult;
    
    // Ensure category is a valid one, otherwise fallback
    if (!CATEGORIES.includes(result.category)) {
      result.category = Category.OTHER;
    }

    return result;

  } catch (error) {
    console.error("Error analyzing suggestion with Gemini API:", error);
    // Return a default object on error
    return {
      sentiment: 'Neutral',
      category: Category.OTHER,
      tags: ['general', 'analysis-failed'],
    };
  }
};
