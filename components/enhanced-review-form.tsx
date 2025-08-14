"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Tag, ThumbsUp, ThumbsDown, MessageSquare, User } from "lucide-react"
import { Review } from "@/lib/api"

interface EnhancedReviewFormProps {
  onSubmit: (review: Omit<Review, "id" | "createdAt">) => Promise<void>
  onCancel: () => void
  existingReview?: Review | null
  doctorName?: string
  patientName?: string
}

export function EnhancedReviewForm({ 
  onSubmit, 
  onCancel, 
  existingReview, 
  doctorName, 
  patientName 
}: EnhancedReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [message, setMessage] = useState(existingReview?.message || "")
  const [selectedTags, setSelectedTags] = useState<string[]>(existingReview?.tags || [])
  const [positiveMentions, setPositiveMentions] = useState<string[]>(existingReview?.sentiment?.positive || [])
  const [negativeMentions, setNegativeMentions] = useState<string[]>(existingReview?.sentiment?.negative || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Predefined tag options
  const availableTags = [
    "Professional", "Friendly", "Clear Explanation", "Good Bedside Manner",
    "Long Waiting Time", "Rushed Consultation", "Clean Facility", "Good Communication",
    "Knowledgeable", "Patient", "Thorough", "Quick Service"
  ]

  // Predefined positive/negative mention options
  const positiveOptions = [
    "friendly", "professional", "clear explanation", "helpful", "patient", 
    "thorough", "knowledgeable", "good communication", "clean facility"
  ]

  const negativeOptions = [
    "long wait", "rushed consultation", "poor communication", "unprofessional", 
    "dirty facility", "expensive", "difficult to schedule"
  ]

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handlePositiveToggle = (mention: string) => {
    setPositiveMentions(prev => 
      prev.includes(mention) 
        ? prev.filter(m => m !== mention)
        : [...prev, mention]
    )
  }

  const handleNegativeToggle = (mention: string) => {
    setNegativeMentions(prev => 
      prev.includes(mention) 
        ? prev.filter(m => m !== mention)
        : [...prev, mention]
    )
  }

  const getOverallSentiment = (): "positive" | "neutral" | "negative" => {
    if (positiveMentions.length > negativeMentions.length) return "positive"
    if (negativeMentions.length > positiveMentions.length) return "negative"
    return "neutral"
  }

  const handleSubmit = async () => {
    if (rating === 0) return
    
    setIsSubmitting(true)
    try {
      const reviewData = {
        rating,
        message,
        tags: selectedTags,
        sentiment: {
          positive: positiveMentions,
          negative: negativeMentions,
          overall: getOverallSentiment()
        },
        status: "pending_reply" as const,
        patientProfile: {
          isRepeatPatient: false // This would be determined by the system
        }
      }

      await onSubmit({
        ...reviewData,
        doctorId: "", // These will be filled by the parent component
        patientId: "",
        appointmentId: "",
        patientName: patientName || ""
      })
    } catch (error) {
      console.error("Failed to submit review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = rating > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 bg-teal-500/10 text-teal-600 dark:text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-teal-500/20">
          <MessageSquare className="w-4 h-4" />
          <span>Share Your Experience</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review for Dr. {doctorName || "Doctor"}
        </h2>
        <p className="text-muted-foreground">
          Your feedback helps other patients and improves healthcare quality
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
              <button
                key={n}
                onClick={() => setRating(n)}
                className="p-2 hover:scale-110 transition-transform"
                aria-label={`Rate ${n} star`}
              >
                <Star 
                  className={`w-8 h-8 ${
                    rating >= n 
                      ? 'text-amber-500 fill-amber-500' 
                      : 'text-muted-foreground hover:text-amber-400'
                  }`} 
                />
              </button>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {rating === 0 && "Click to rate"}
            {rating === 1 && "Poor experience"}
            {rating === 2 && "Below average"}
            {rating === 3 && "Average experience"}
            {rating === 4 && "Good experience"}
            {rating === 5 && "Excellent experience"}
          </div>
        </CardContent>
      </Card>

      {/* Tags Section */}
      <Card className="border border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <Tag className="w-5 h-5" />
            What stood out? (Select all that apply)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {availableTags.map((tag) => (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => handleTagToggle(tag)}
                />
                <Label htmlFor={tag} className="text-sm cursor-pointer">
                  {tag}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Analysis Section */}
      <Card className="border border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <ThumbsUp className="w-5 h-5" />
            Detailed Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Positive Mentions */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              What did you like? (Select all that apply)
            </Label>
            <div className="flex flex-wrap gap-2">
              {positiveOptions.map((option) => (
                <Badge
                  key={option}
                  variant={positiveMentions.includes(option) ? "default" : "outline"}
                  className={`cursor-pointer hover:scale-105 transition-transform ${
                    positiveMentions.includes(option) 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "hover:bg-green-100 dark:hover:bg-green-900/20"
                  }`}
                  onClick={() => handlePositiveToggle(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>

          {/* Negative Mentions */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              What could be improved? (Select all that apply)
            </Label>
            <div className="flex flex-wrap gap-2">
              {negativeOptions.map((option) => (
                <Badge
                  key={option}
                  variant={negativeMentions.includes(option) ? "destructive" : "outline"}
                  className={`cursor-pointer hover:scale-105 transition-transform ${
                    negativeMentions.includes(option) 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "hover:bg-red-100 dark:hover:bg-red-900/20"
                  }`}
                  onClick={() => handleNegativeToggle(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Section */}
      <Card className="border border-border bg-card/80">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Additional Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] resize-none"
            placeholder="Share your detailed experience, suggestions, or any other feedback you'd like to provide..."
          />
          <div className="text-xs text-muted-foreground mt-2">
            Optional but helpful for other patients and your doctor
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Preview */}
      {(positiveMentions.length > 0 || negativeMentions.length > 0) && (
        <Card className="border border-border bg-card/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              Feedback Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {positiveMentions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-foreground">Positive Points</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {positiveMentions.map((mention) => (
                      <Badge key={mention} variant="outline" className="bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                        {mention}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {negativeMentions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-foreground">Areas for Improvement</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {negativeMentions.map((mention) => (
                      <Badge key={mention} variant="outline" className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800">
                        {mention}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Overall Sentiment:</span>
                  <Badge 
                    variant={getOverallSentiment() === "positive" ? "default" : getOverallSentiment() === "negative" ? "destructive" : "secondary"}
                  >
                    {getOverallSentiment().charAt(0).toUpperCase() + getOverallSentiment().slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          className="flex-1 bg-teal-600 hover:bg-teal-700"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>

      {/* Info Note */}
      <div className="text-center text-xs text-muted-foreground bg-muted/50 dark:bg-slate-800/50 rounded-lg p-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <User className="w-3 h-3" />
          <span className="font-medium">Review Policy</span>
        </div>
        <p>Your review will be visible to other patients and your doctor. You can edit or delete it within 24 hours of submission.</p>
      </div>
    </div>
  )
}
