"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, User, Calendar, Tag, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { Review } from "@/lib/api"
import { SentimentHighlights } from "./sentiment-highlights"
import { EnhancedDoctorResponse } from "./enhanced-doctor-response"

interface EnhancedReviewCardProps {
  review: Review
  onRespond: (reviewId: string, response: { message: string; isPublic: boolean }) => Promise<void>
  onUpdateStatus?: (reviewId: string, status: "pending_reply" | "replied" | "resolved") => Promise<void>
}

export function EnhancedReviewCard({ review, onRespond, onUpdateStatus }: EnhancedReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getPatientInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-600 dark:text-green-400"
    if (rating >= 3) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  return (
    <Card className="border border-border bg-card/80 dark:bg-slate-900/80 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        {/* Patient Info & Rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-border">
              <AvatarImage src={review.patientProfile?.image} alt={review.patientName} />
              <AvatarFallback className="bg-muted text-foreground font-medium">
                {review.patientProfile?.initials || getPatientInitials(review.patientName || 'Patient')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                {review.patientName || 'Patient'}
                {review.patientProfile?.isRepeatPatient && (
                  <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    <User className="w-3 h-3 mr-1" />
                    Repeat Patient
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-2xl font-bold ${getRatingColor(review.rating)}`}>
              {review.rating}
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map((n) => (
                <Star key={n} className={`w-4 h-4 ${n <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-muted-foreground" />
            <div className="flex flex-wrap gap-2">
              {review.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Review Message */}
        <div className="text-foreground text-sm whitespace-pre-wrap leading-relaxed">
          {review.message || '—'}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          <span>{isExpanded ? 'Show Less' : 'Show Details'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-border">
            {/* Sentiment Analysis */}
            {review.sentiment && (
              <SentimentHighlights
                positive={review.sentiment.positive}
                negative={review.sentiment.negative}
                overall={review.sentiment.overall}
              />
            )}

            {/* Doctor Response */}
            <EnhancedDoctorResponse review={review} onRespond={onRespond} onUpdateStatus={onUpdateStatus} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
