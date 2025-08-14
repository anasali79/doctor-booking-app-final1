"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Tag, ThumbsUp, ThumbsDown, MessageSquare, Calendar, Edit, Trash2, Clock, CheckCircle } from "lucide-react"
import { Review } from "@/lib/api"

interface EnhancedReviewViewProps {
  review: Review
  onEdit: () => void
  onDelete: () => Promise<void>
  canEdit: boolean
  canDelete: boolean
  doctorName?: string
}

export function EnhancedReviewView({ 
  review, 
  onEdit, 
  onDelete, 
  canEdit, 
  canDelete, 
  doctorName 
}: EnhancedReviewViewProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!canDelete) return
    setIsDeleting(true)
    try {
      await onDelete()
    } finally {
      setIsDeleting(false)
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 dark:text-green-400"
    if (rating >= 3) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getRatingLabel = (rating: number) => {
    if (rating === 1) return "Poor experience"
    if (rating === 2) return "Below average"
    if (rating === 3) return "Average experience"
    if (rating === 4) return "Good experience"
    if (rating === 5) return "Excellent experience"
    return ""
  }

  const getStatusIcon = () => {
    switch (review.status) {
      case "replied": return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      case "resolved": return <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      default: return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
    }
  }

  const getStatusColor = () => {
    switch (review.status) {
      case "replied": return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
      case "resolved": return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800"
      default: return "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-teal-500/10 text-teal-600 dark:text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-teal-500/20">
          <MessageSquare className="w-4 h-4" />
          <span>Your Review</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review for Dr. {doctorName || "Doctor"}
        </h2>
        <p className="text-muted-foreground">
          Submitted on {new Date(review.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Rating Section */}
      <Card className="border border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Overall Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star 
                key={n}
                className={`w-8 h-8 ${
                  n <= review.rating 
                    ? 'text-amber-500 fill-amber-500' 
                    : 'text-muted-foreground'
                }`} 
              />
            ))}
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getRatingColor(review.rating)} mb-1`}>
              {review.rating}/5
            </div>
            <div className="text-sm text-muted-foreground">
              {getRatingLabel(review.rating)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tags Section */}
      {review.tags && review.tags.length > 0 && (
        <Card className="border border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Tag className="w-5 h-5" />
              What Stood Out
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {review.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sentiment Analysis Section */}
      {review.sentiment && (review.sentiment.positive.length > 0 || review.sentiment.negative.length > 0) && (
        <Card className="border border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              Sentiment Analysis
              <Badge 
                variant={review.sentiment.overall === "positive" ? "default" : review.sentiment.overall === "negative" ? "destructive" : "secondary"}
                className="ml-auto"
              >
                {review.sentiment.overall.charAt(0).toUpperCase() + review.sentiment.overall.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Positive Mentions */}
            {review.sentiment.positive.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-foreground">Positive Points</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {review.sentiment.positive.map((mention, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                      {mention}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Negative Mentions */}
            {review.sentiment.negative.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-foreground">Areas for Improvement</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {review.sentiment.negative.map((mention, index) => (
                    <Badge key={index} variant="outline" className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                      {mention}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Message Section */}
      {review.message && (
        <Card className="border border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Additional Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-sm whitespace-pre-wrap leading-relaxed p-3 bg-muted/50 dark:bg-slate-800/50 rounded-lg">
              {review.message}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctor Response Section */}
      {review.doctorResponse && (
        <Card className="border border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Doctor's Response
              <Badge variant="outline" className="ml-auto">
                {review.doctorResponse.isPublic ? "Public" : "Private"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(review.doctorResponse.createdAt).toLocaleDateString()}
              </div>
              <div className="text-foreground text-sm whitespace-pre-wrap leading-relaxed p-3 bg-muted/50 dark:bg-slate-800/50 rounded-lg">
                {review.doctorResponse.message}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Status */}
      <Card className="border border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            Review Status
            <Badge variant="outline" className={`ml-auto ${getStatusColor()}`}>
              {getStatusIcon()}
              {review.status === "pending_reply" ? "Pending Reply" : 
               review.status === "replied" ? "Replied" : "Resolved"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {review.status === "pending_reply" && "Your doctor hasn't responded yet."}
            {review.status === "replied" && "Your doctor has responded to your review."}
            {review.status === "resolved" && "This review has been marked as resolved."}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        {canEdit && (
          <Button
            onClick={onEdit}
            variant="outline"
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Review
          </Button>
        )}
        {canDelete && (
          <Button
            onClick={handleDelete}
            variant="destructive"
            disabled={isDeleting}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Review"}
          </Button>
        )}
      </div>

      {/* Info Note */}
      <div className="text-center text-xs text-muted-foreground bg-muted/50 dark:bg-slate-800/50 rounded-lg p-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Clock className="w-3 h-3" />
          <span className="font-medium">Review Policy</span>
        </div>
        <p>
          {canEdit || canDelete 
            ? "You can edit or delete this review within 24 hours of submission."
            : "The edit/delete window has expired. You can only view this review now."
          }
        </p>
      </div>
    </div>
  )
}
