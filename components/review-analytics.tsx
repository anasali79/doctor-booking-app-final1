"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, TrendingUp, Users, Star, MessageSquare, Calendar, Tag } from "lucide-react"
import { Review } from "@/lib/api"

interface ReviewAnalyticsProps {
  reviews: Review[]
}

export function ReviewAnalytics({ reviews }: ReviewAnalyticsProps) {
  const analytics = useMemo(() => {
    if (reviews.length === 0) return null

    // Month-wise rating trends
    const monthlyTrends = reviews.reduce((acc, review) => {
      const date = new Date(review.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!acc[monthKey]) {
        acc[monthKey] = { total: 0, sum: 0, count: 0 }
      }
      
      acc[monthKey].total += review.rating
      acc[monthKey].count += 1
      acc[monthKey].sum += review.rating
      
      return acc
    }, {} as Record<string, { total: number; sum: number; count: number }>)

    // Convert to array and sort by date
    const trends = Object.entries(monthlyTrends)
      .map(([month, data]) => ({
        month,
        average: Number((data.sum / data.count).toFixed(1)),
        count: data.count
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months

    // Repeat patient statistics
    const patientCounts = reviews.reduce((acc, review) => {
      acc[review.patientId] = (acc[review.patientId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const repeatPatients = Object.values(patientCounts).filter(count => count > 1).length
    const totalUniquePatients = Object.keys(patientCounts).length
    const repeatPatientPercentage = totalUniquePatients > 0 ? Math.round((repeatPatients / totalUniquePatients) * 100) : 0

    // Common feedback patterns
    const allTags = reviews.flatMap(review => review.tags || [])
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }))

    // Sentiment distribution
    const sentimentCounts = reviews.reduce((acc, review) => {
      const sentiment = review.sentiment?.overall || 'neutral'
      acc[sentiment] = (acc[sentiment] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalReviews = reviews.length
    const positivePercentage = Math.round(((sentimentCounts.positive || 0) / totalReviews) * 100)
    const negativePercentage = Math.round(((sentimentCounts.negative || 0) / totalReviews) * 100)
    const neutralPercentage = Math.round(((sentimentCounts.neutral || 0) / totalReviews) * 100)

    return {
      trends,
      repeatPatientPercentage,
      totalUniquePatients,
      repeatPatients,
      topTags,
      sentimentDistribution: {
        positive: positivePercentage,
        negative: negativePercentage,
        neutral: neutralPercentage
      }
    }
  }, [reviews])

  if (!analytics) {
    return (
      <Card className="border border-border bg-card/80">
        <CardContent className="p-6 text-center text-muted-foreground">
          No analytics available yet
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Month-wise Rating Trends */}
      <Card className="border border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Rating Trends (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.trends.map((trend) => (
              <div key={trend.month} className="flex items-center gap-4">
                <div className="w-24 text-sm text-muted-foreground">
                  {new Date(trend.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </div>
                <div className="flex-1">
                  <Progress value={trend.average * 20} className="h-2" />
                </div>
                <div className="w-16 text-right">
                  <div className="text-sm font-medium text-foreground">{trend.average}</div>
                  <div className="text-xs text-muted-foreground">({trend.count} reviews)</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Users className="w-5 h-5" />
              Patient Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Repeat Patients</span>
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                {analytics.repeatPatientPercentage}%
              </Badge>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {analytics.repeatPatients} / {analytics.totalUniquePatients}
            </div>
            <div className="text-sm text-muted-foreground">
              patients who gave multiple reviews
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Sentiment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Positive</span>
                <span className="text-sm font-medium text-foreground">{analytics.sentimentDistribution.positive}%</span>
              </div>
              <Progress value={analytics.sentimentDistribution.positive} className="h-2 bg-red-100 dark:bg-red-900/20" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Neutral</span>
                <span className="text-sm font-medium text-foreground">{analytics.sentimentDistribution.neutral}%</span>
              </div>
              <Progress value={analytics.sentimentDistribution.neutral} className="h-2 bg-yellow-100 dark:bg-yellow-900/20" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Negative</span>
                <span className="text-sm font-medium text-foreground">{analytics.sentimentDistribution.negative}%</span>
              </div>
              <Progress value={analytics.sentimentDistribution.negative} className="h-2 bg-red-100 dark:bg-red-900/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tags */}
      <Card className="border border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Most Common Feedback Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analytics.topTags.map((tag) => (
              <Badge key={tag.tag} variant="outline" className="text-sm">
                {tag.tag}
                <span className="ml-2 text-xs bg-muted px-2 py-1 rounded-full">
                  {tag.count}
                </span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
