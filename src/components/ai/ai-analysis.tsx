import type React from "react"
import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Fade,
  Paper,
} from "@mui/material"
import {
  Psychology,
  SentimentVeryDissatisfied,
  SentimentNeutral,
  SentimentVerySatisfied,
  Refresh,
  AutoAwesome,
} from "@mui/icons-material"
import { googleAIService, type SentimentAnalysis } from "../../service/Google-ai"

interface AIAnalysisProps {
  text: string
  title?: string
  autoAnalyze?: boolean
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ text, title, autoAnalyze = false }) => {
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeSentiment = async () => {
    if (!text.trim()) {
      setError("No text to analyze")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await googleAIService.analyzeSentiment(text)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (autoAnalyze && text.trim() && googleAIService.isConfigured()) {
      // Debounce the analysis
      const timer = setTimeout(() => {
        analyzeSentiment()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [text, autoAnalyze])

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <SentimentVerySatisfied sx={{ color: "#4caf50" }} />
      case "negative":
        return <SentimentVeryDissatisfied sx={{ color: "#f44336" }} />
      default:
        return <SentimentNeutral sx={{ color: "#ff9800" }} />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "#4caf50"
      case "negative":
        return "#f44336"
      default:
        return "#ff9800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score > 0.3) return "#4caf50"
    if (score < -0.3) return "#f44336"
    return "#ff9800"
  }

  if (!googleAIService.isConfigured()) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Alert severity="info">
            <Typography variant="body2">
              AI Analysis is not configured. Add your Google AI API key to enable sentiment analysis.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      sx={{
        mb: 2,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 100,
          height: 100,
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          transform: "translate(30px, -30px)",
        }}
      />

      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <AutoAwesome />
            <Typography variant="h6" fontWeight={600}>
              AI Sentiment Analysis
            </Typography>
          </Box>

          <Tooltip title="Analyze sentiment">
            <IconButton onClick={analyzeSentiment} disabled={isLoading || !text.trim()} sx={{ color: "white" }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {isLoading && (
          <Box display="flex" alignItems="center" gap={2} py={2}>
            <CircularProgress size={20} sx={{ color: "white" }} />
            <Typography variant="body2">Analyzing sentiment...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, backgroundColor: "rgba(244, 67, 54, 0.1)" }}>
            {error}
          </Alert>
        )}

        {analysis && (
          <Fade in={true}>
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {getSentimentIcon(analysis.sentiment)}
                <Box flexGrow={1}>
                  <Typography variant="body1" fontWeight={500} mb={1}>
                    Sentiment: {analysis.sentiment.charAt(0).toUpperCase() + analysis.sentiment.slice(1)}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      Score: {analysis.score.toFixed(2)}
                    </Typography>
                    <Box flexGrow={1}>
                      <LinearProgress
                        variant="determinate"
                        value={((analysis.score + 1) / 2) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: "rgba(255,255,255,0.3)",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: getScoreColor(analysis.score),
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography variant="body2" sx={{ fontStyle: "italic", color: "#fff" }}>
                  "{analysis.summary}"
                </Typography>
              </Paper>

              <Box display="flex" gap={1} mt={2}>
                <Chip
                  label={`Confidence: ${Math.round(analysis.confidence * 100)}%`}
                  size="small"
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                />
                <Chip
                  label={analysis.sentiment}
                  size="small"
                  sx={{
                    backgroundColor: getSentimentColor(analysis.sentiment),
                    color: "white",
                  }}
                />
              </Box>
            </Box>
          </Fade>
        )}

        {!analysis && !isLoading && !error && (
          <Box textAlign="center" py={2}>
            <Psychology sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Click the refresh button to analyze the sentiment of this note
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default AIAnalysis
