"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, Clock, CheckCircle, X, Bell } from "lucide-react"
import { Review } from "@/lib/api"

interface ReviewNotificationProps {
  review: Review
  onDismiss: () => void
  onViewReview: () => void
}

export function ReviewNotification({ review, onDismiss, onViewReview }: ReviewNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(onDismiss, 300) // Wait for animation
  }

  const getNotificationTitle = () => {
    if (review.doctorResponse) {
      return "Doctor Responded to Your Review"
    }
    switch (review.status) {
      case "replied": return "Review Status Updated"
      case "resolved": return "Review Marked as Resolved"
      default: return "Review Update"
    }
  }

  const getNotificationDescription = () => {
    if (review.doctorResponse) {
      return `Your doctor has responded to your review. Click to view the response.`
    }
    switch (review.status) {
      case "replied": return "Your review has been marked as replied to."
      case "resolved": return "Your review has been marked as resolved."
      default: return "Your review status has been updated."
    }
  }

  const getStatusIcon = () => {
    if (review.doctorResponse) return <MessageSquare className="w-4 h-4 text-green-600 dark:text-green-400" />
    switch (review.status) {
      case "replied": return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      case "resolved": return <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      default: return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
    }
  }

  const getStatusColor = () => {
    if (review.doctorResponse) return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
    switch (review.status) {
      case "replied": return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800"
      case "resolved": return "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800"
      default: return "bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800"
    }
  }

  if (!isVisible) return null

  return (
    <Card className="border border-border bg-card/80 shadow-lg animate-in slide-in-from-right duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {getNotificationTitle()}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
            {getStatusIcon()}
            {review.status === "pending_reply" ? "Pending Reply" : 
             review.status === "replied" ? "Replied" : "Resolved"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
        
        <p className="text-sm text-foreground">
          {getNotificationDescription()}
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={onViewReview}
            className="flex-1"
          >
            <MessageSquare className="w-3 h-3 mr-1" />
            View Review
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
