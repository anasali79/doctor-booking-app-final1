"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MessageSquare, Clock, CheckCircle, Send } from "lucide-react"
import { Review } from "@/lib/api"

interface DoctorResponseProps {
  review: Review
  onRespond: (reviewId: string, response: { message: string; isPublic: boolean }) => Promise<void>
}

export function DoctorResponse({ review, onRespond }: DoctorResponseProps) {
  const [isResponding, setIsResponding] = useState(false)
  const [response, setResponse] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!response.trim()) return
    
    setIsSubmitting(true)
    try {
      await onRespond(review.id, { message: response, isPublic })
      setResponse("")
      setIsResponding(false)
    } catch (error) {
      console.error("Failed to submit response:", error)
    } finally {
      setIsSubmitting(false)
    }
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
    <Card className="border border-border bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Doctor Response
          <Badge variant="outline" className={`ml-auto ${getStatusColor()}`}>
            {getStatusIcon()}
            {review.status === "pending_reply" ? "Pending Reply" : 
             review.status === "replied" ? "Replied" : "Resolved"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Response */}
        {review.doctorResponse && (
          <div className="bg-muted/50 dark:bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {review.doctorResponse.isPublic ? "Public" : "Private"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {new Date(review.doctorResponse.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-foreground">{review.doctorResponse.message}</p>
          </div>
        )}

        {/* Response Form */}
        {!review.doctorResponse && !isResponding && (
          <Button 
            onClick={() => setIsResponding(true)}
            variant="outline" 
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Respond to Review
          </Button>
        )}

        {isResponding && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="response" className="text-sm text-foreground">Your Response</Label>
              <Textarea
                id="response"
                placeholder="Write your response to this review..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="public-response"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="public-response" className="text-sm text-foreground">
                Make response public
              </Label>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!response.trim() || isSubmitting}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Response"}
              </Button>
              <Button
                onClick={() => {
                  setIsResponding(false)
                  setResponse("")
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
