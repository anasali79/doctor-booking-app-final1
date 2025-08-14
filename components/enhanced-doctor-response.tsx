"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MessageSquare, Clock, CheckCircle, Send, Edit, Trash2, AlertCircle } from "lucide-react"
import { Review } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface EnhancedDoctorResponseProps {
  review: Review
  onRespond: (reviewId: string, response: { message: string; isPublic: boolean }) => Promise<void>
  onUpdateStatus?: (reviewId: string, status: "pending_reply" | "replied" | "resolved") => Promise<void>
}

export function EnhancedDoctorResponse({ review, onRespond, onUpdateStatus }: EnhancedDoctorResponseProps) {
  const { toast } = useToast()
  const [isResponding, setIsResponding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [response, setResponse] = useState(review.doctorResponse?.message || "")
  const [isPublic, setIsPublic] = useState(review.doctorResponse?.isPublic ?? true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Reset form when review changes
  useEffect(() => {
    if (review.doctorResponse) {
      setResponse(review.doctorResponse.message)
      setIsPublic(review.doctorResponse.isPublic)
    }
  }, [review.doctorResponse])

  const handleSubmit = async () => {
    if (!response.trim()) return
    
    setIsSubmitting(true)
    try {
      await onRespond(review.id, { message: response, isPublic })
      setResponse("")
      setIsResponding(false)
      setIsEditing(false)
      
      toast({
        title: "Response Submitted",
        description: "Your response has been sent successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to submit response:", error)
      toast({
        title: "Error",
        description: "Failed to submit response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStatus = async (newStatus: "pending_reply" | "replied" | "resolved") => {
    if (!onUpdateStatus) return
    
    setIsUpdatingStatus(true)
    try {
      await onUpdateStatus(review.id, newStatus)
      toast({
        title: "Status Updated",
        description: `Review status changed to ${newStatus.replace('_', ' ')}.`,
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingStatus(false)
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

  const getStatusDescription = () => {
    switch (review.status) {
      case "pending_reply": return "Patient is waiting for your response"
      case "replied": return "You have responded to this review"
      case "resolved": return "This review has been marked as resolved"
      default: return ""
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
        {/* Status Management */}
        {onUpdateStatus && (
          <div className="bg-muted/30 dark:bg-slate-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Review Status</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={review.status === "pending_reply" ? "default" : "outline"}
                onClick={() => handleUpdateStatus("pending_reply")}
                disabled={isUpdatingStatus || review.status === "pending_reply"}
              >
                Pending Reply
              </Button>
              <Button
                size="sm"
                variant={review.status === "replied" ? "default" : "outline"}
                onClick={() => handleUpdateStatus("replied")}
                disabled={isUpdatingStatus || review.status === "replied"}
              >
                Replied
              </Button>
              <Button
                size="sm"
                variant={review.status === "resolved" ? "default" : "outline"}
                onClick={() => handleUpdateStatus("resolved")}
                disabled={isUpdatingStatus || review.status === "resolved"}
              >
                Resolved
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {getStatusDescription()}
            </p>
          </div>
        )}

        {/* Existing Response */}
        {review.doctorResponse && (
          <div className="bg-muted/50 dark:bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {review.doctorResponse.isPublic ? "Public" : "Private"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.doctorResponse.createdAt).toLocaleDateString()}
                </span>
              </div>
              {!isEditing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-6 px-2"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
            </div>
            {!isEditing ? (
              <p className="text-sm text-foreground">{review.doctorResponse.message}</p>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-[80px] resize-none"
                  placeholder="Update your response..."
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-public-response"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="edit-public-response" className="text-xs text-foreground">
                    Make response public
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={!response.trim() || isSubmitting}
                    className="flex-1"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {isSubmitting ? "Updating..." : "Update Response"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setResponse(review.doctorResponse?.message || "")
                      setIsPublic(review.doctorResponse?.isPublic ?? true)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Response Form */}
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

        {/* Response Guidelines */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Response Guidelines:</p>
              <ul className="space-y-1">
                <li>• Be professional and empathetic</li>
                <li>• Address specific concerns mentioned</li>
                <li>• Public responses are visible to all patients</li>
                <li>• Private responses are only visible to the patient</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
