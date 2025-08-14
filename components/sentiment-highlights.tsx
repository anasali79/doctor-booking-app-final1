"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown } from "lucide-react"

interface SentimentHighlightsProps {
  positive: string[]
  negative: string[]
  overall: "positive" | "neutral" | "negative"
}

export function SentimentHighlights({ positive, negative, overall }: SentimentHighlightsProps) {
  const getOverallColor = () => {
    switch (overall) {
      case "positive": return "text-green-600 dark:text-green-400"
      case "negative": return "text-red-600 dark:text-red-400"
      default: return "text-yellow-600 dark:text-yellow-400"
    }
  }

  const getOverallIcon = () => {
    switch (overall) {
      case "positive": return <TrendingUp className="w-4 h-4" />
      case "negative": return <TrendingDown className="w-4 h-4" />
      default: return <div className="w-4 h-4 border-2 border-current rounded-full" />
    }
  }

  return (
    <Card className="border border-border bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          {getOverallIcon()}
          Sentiment Analysis
          <Badge variant={overall === "positive" ? "default" : overall === "negative" ? "destructive" : "secondary"} className="ml-auto">
            {overall.charAt(0).toUpperCase() + overall.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Positive Mentions */}
        {positive.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-foreground">Positive Mentions</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {positive.map((mention, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                  {mention}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Negative Mentions */}
        {negative.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ThumbsDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-foreground">Areas for Improvement</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {negative.map((mention, index) => (
                <Badge key={index} variant="outline" className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                  {mention}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {positive.length === 0 && negative.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-4">
            No sentiment data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
