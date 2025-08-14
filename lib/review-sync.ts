// Review Synchronization System
// This file handles real-time updates between doctor and user sides

import { Review } from "./api"

// Event types for review updates
export type ReviewUpdateEvent = 
  | { type: "doctor_response"; review: Review }
  | { type: "status_change"; review: Review }
  | { type: "review_edited"; review: Review }

// Event listeners for real-time updates
type ReviewUpdateListener = (event: ReviewUpdateEvent) => void

class ReviewSyncManager {
  private listeners: ReviewUpdateListener[] = []
  private static instance: ReviewSyncManager

  private constructor() {}

  static getInstance(): ReviewSyncManager {
    if (!ReviewSyncManager.instance) {
      ReviewSyncManager.instance = new ReviewSyncManager()
    }
    return ReviewSyncManager.instance
  }

  // Subscribe to review updates
  subscribe(listener: ReviewUpdateListener): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Notify all listeners of a review update
  notify(event: ReviewUpdateEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error("Error in review update listener:", error)
      }
    })
  }

  // Doctor sends response - notify all users
  notifyDoctorResponse(review: Review): void {
    this.notify({
      type: "doctor_response",
      review
    })
  }

  // Review status changes - notify all users
  notifyStatusChange(review: Review): void {
    this.notify({
      type: "status_change",
      review
    })
  }

  // Review is edited - notify all users
  notifyReviewEdit(review: Review): void {
    this.notify({
      type: "review_edit",
      review
    })
  }
}

// Export singleton instance
export const reviewSyncManager = ReviewSyncManager.getInstance()

// Helper functions for common operations
export const notifyDoctorResponse = (review: Review) => {
  reviewSyncManager.notifyDoctorResponse(review)
}

export const notifyStatusChange = (review: Review) => {
  reviewSyncManager.notifyStatusChange(review)
}

export const notifyReviewEdit = (review: Review) => {
  reviewSyncManager.notifyReviewEdit(review)
}
