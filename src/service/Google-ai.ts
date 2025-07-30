import { GoogleGenerativeAI } from "@google/generative-ai";

export interface SentimentAnalysis {
  score: number; // -1 to +1
  summary: string;
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
}

export interface AIAnalysisResult {
  sentiment: SentimentAnalysis;
  isLoading: boolean;
  error: string | null;
}

class GoogleAIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GENAI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
  }

  async analyzeSentiment({
    text,
    title,
  }: {
    text: string;
    title: string;
  }): Promise<SentimentAnalysis> {
    if (!this.model) {
      throw new Error("Google AI API key not configured");
    }

    const prompt = `Analyze the sentiment of the following title and text and provide:
1. A sentiment score from -1 (very negative) to +1 (very positive)
2. A brief summary of the emotional tone

Title: "${title}
Text: "${text}"

Please respond in JSON format like:
{
  "score": 0.7,
  "summary": "The text expresses ..."
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);

      // Determine sentiment category based on score
      let sentiment: "positive" | "negative" | "neutral" = "neutral";
      if (parsedResponse.score > 0.1) {
        sentiment = "positive";
      } else if (parsedResponse.score < -0.1) {
        sentiment = "negative";
      }

      return {
        score: parsedResponse.score,
        summary: parsedResponse.summary,
        sentiment,
        confidence: Math.abs(parsedResponse.score),
      };
    } catch (error) {
      console.error("AI Analysis failed:", error);
      throw new Error("Failed to analyze sentiment");
    }
  }

  isConfigured(): boolean {
    return this.model !== null;
  }
}

export const googleAIService = new GoogleAIService();
