"use client"

import { useEffect, useMemo, useState } from "react"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { useAuth } from "@/contexts/AuthContext"
import { reviewsAPI, type Review } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Filter, Search, BarChart3, MessageSquare, TrendingUp } from "lucide-react"
import { EnhancedReviewCard } from "@/components/enhanced-review-card"
import { ReviewAnalytics } from "@/components/review-analytics"
import { notifyDoctorResponse, notifyStatusChange } from "@/lib/review-sync"

export default function DoctorReviewsPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [reviews, setReviews] = useState<Review[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(12)
  const [total, setTotal] = useState(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [query, setQuery] = useState("")
  const [minStars, setMinStars] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [activeTab, setActiveTab] = useState("reviews")

  // Generate sample enhanced review data for demonstration
  const generateSampleData = (reviews: Review[]): Review[] => {
    return reviews.map((review, index) => ({
      ...review,
      tags: [
        ["Polite", "Professional", "Clear Explanation"][index % 3],
        ["Long Waiting Time", "Rushed Consultation", "Good Bedside Manner"][index % 3]
      ].filter(Boolean),
      sentiment: {
        positive: ["friendly", "clear explanation", "professional", "helpful"][index % 4] ? 
          ["friendly", "clear explanation", "professional", "helpful"].slice(0, index % 4 + 1) : [],
        negative: ["long wait", "rushed consultation"][index % 2] ? 
          ["long wait", "rushed consultation"].slice(0, index % 2 + 1) : [],
        overall: index % 3 === 0 ? "positive" : index % 3 === 1 ? "neutral" : "negative" as const
      },
      status: index % 3 === 0 ? "pending_reply" : index % 3 === 1 ? "replied" : "resolved" as const,
      patientProfile: {
        image: undefined,
        initials: review.patientName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        isRepeatPatient: index % 2 === 0
      },
      doctorResponse: index % 3 === 1 ? {
        message: "Thank you for your feedback. We appreciate your input and will work to improve our services.",
        isPublic: true,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      } : undefined
    }))
  }

  async function fetchPage(p = 1, append = false) {
    if (!user) return
    if (append) setIsLoadingMore(true); else setIsLoading(true)
    try {
      const { items, total } = await reviewsAPI.searchByDoctor({
        doctorId: user.id,
        page: p,
        limit,
        minStars: minStars === "all" ? undefined : Number(minStars),
        query,
        sortBy: sortBy as any,
      })
      setTotal(total)
      setPage(p)
      const enhancedItems = generateSampleData(items)
      setReviews((prev) => (append ? [...prev, ...enhancedItems] : enhancedItems))
    } finally {
      if (append) setIsLoadingMore(false); else setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(1, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, query, minStars, sortBy])

  const stats = useMemo(() => {
    const total = reviews.length
    const counts = [1,2,3,4,5].reduce((acc, n) => ({ ...acc, [n]: reviews.filter(r => r.rating === n).length }), {} as Record<number, number>)
    const average = total ? Number((reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(2)) : 0
    const distribution = [5,4,3,2,1].map(n => ({ stars: n, count: counts[n] || 0, pct: total ? Math.round(((counts[n] || 0) / total) * 100) : 0 }))
    return { total, average, distribution }
  }, [reviews])

  const filtered = reviews

  const handleRespondToReview = async (reviewId: string, response: { message: string; isPublic: boolean }) => {
    try {
      // Here you would typically call an API to save the doctor's response
      // For now, we'll simulate it by updating the local state
      const updatedReview = reviews.find(r => r.id === reviewId)
      if (!updatedReview) return

      const newReview = {
        ...updatedReview,
        doctorResponse: {
          message: response.message,
          isPublic: response.isPublic,
          createdAt: new Date().toISOString()
        },
        status: "replied" as const
      }

      setReviews(prev => prev.map(review => 
        review.id === reviewId ? newReview : review
      ))

      // Notify user side about the doctor's response
      notifyDoctorResponse(newReview)
    } catch (error) {
      console.error("Failed to respond to review:", error)
      throw error
    }
  }

  const handleUpdateReviewStatus = async (reviewId: string, status: "pending_reply" | "replied" | "resolved") => {
    try {
      // Here you would typically call an API to update the review status
      // For now, we'll simulate it by updating the local state
      const updatedReview = reviews.find(r => r.id === reviewId)
      if (!updatedReview) return

      const newReview = {
        ...updatedReview,
        status
      }

      setReviews(prev => prev.map(review => 
        review.id === reviewId ? newReview : review
      ))

      // Notify user side about the status change
      notifyStatusChange(newReview)
    } catch (error) {
      console.error("Failed to update review status:", error)
      throw error
    }
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen pt-24 bg-gradient-to-br from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <DoctorNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-teal-500/10 text-teal-600 dark:text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-teal-500/20">
              <Star className="w-4 h-4" />
              <span>Doctor Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-muted-foreground/60 bg-clip-text text-transparent mb-4">
              Patient Reviews & Analytics
            </h1>
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto">
              Comprehensive feedback management with sentiment analysis and insights
            </p>
          
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Average Rating</CardTitle>
                <CardDescription className="text-muted-foreground">Across all reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
                  {stats.average}
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Total Reviews</CardTitle>
                <CardDescription className="text-muted-foreground">From patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Pending Replies</CardTitle>
                <CardDescription className="text-muted-foreground">Need response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {reviews.filter(r => r.status === "pending_reply").length}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Rating Distribution</CardTitle>
                <CardDescription className="text-muted-foreground">5-star percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stats.distribution.find(d => d.stars === 5)?.pct || 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-card/80 dark:bg-slate-900/80 border border-border">
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Reviews List
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics & Insights
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Rating Trends
              </TabsTrigger>
            </TabsList>

            {/* Reviews List Tab */}
            <TabsContent value="reviews" className="space-y-6">
              {/* Filters */}
              <Card className="border border-border/50 bg-card/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg flex items-center">
                    <Filter className="w-4 h-4 mr-2"/> Filters & Search
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-foreground">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input 
                        className="pl-9 bg-muted/50 dark:bg-slate-800/50 border-border" 
                        placeholder="Search message or patient" 
                        value={query} 
                        onChange={(e) => setQuery(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-foreground">Minimum Stars</Label>
                    <Select value={minStars} onValueChange={setMinStars}>
                      <SelectTrigger className="bg-card text-foreground dark:bg-slate-800 dark:text-slate-200 border-border dark:border-slate-700 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50">
                        <SelectValue placeholder="All"/>
                      </SelectTrigger>
                      <SelectContent className="bg-card text-foreground dark:bg-slate-800 dark:text-slate-200 border-border dark:border-slate-700 shadow-xl">
                        <SelectItem value="all" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">All</SelectItem>
                        <SelectItem value="5" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">5+</SelectItem>
                        <SelectItem value="4" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">4+</SelectItem>
                        <SelectItem value="3" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">3+</SelectItem>
                        <SelectItem value="2" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">2+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-foreground">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="bg-card text-foreground dark:bg-slate-800 dark:text-slate-200 border-border dark:border-slate-700 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50">
                        <SelectValue placeholder="Newest"/>
                      </SelectTrigger>
                      <SelectContent className="bg-card text-foreground dark:text-slate-200 border-border dark:border-slate-700 shadow-xl">
                        <SelectItem value="newest" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Newest</SelectItem>
                        <SelectItem value="oldest" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Oldest</SelectItem>
                        <SelectItem value="highest" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Highest Rated</SelectItem>
                        <SelectItem value="lowest" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Lowest Rated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Reviews List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse bg-muted/50 dark:bg-slate-800/50">
                      <CardHeader>
                        <div className="h-5 bg-muted dark:bg-slate-700 rounded w-2/3 mb-2" />
                        <div className="h-4 bg-muted dark:bg-slate-700 rounded w-1/3" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-16 bg-muted dark:bg-slate-700 rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : filtered.length === 0 ? (
                  <Card className="lg:col-span-2 border border-border bg-card">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No reviews found matching your criteria
                    </CardContent>
                  </Card>
                ) : (
                  filtered.map((review) => (
                    <EnhancedReviewCard 
                      key={review.id} 
                      review={review} 
                      onRespond={handleRespondToReview}
                      onUpdateStatus={handleUpdateReviewStatus}
                    />
                  ))
                )}
              </div>

              {/* Pagination */}
              {filtered.length > 0 && reviews.length < total && (
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={() => fetchPage(page + 1, true)}
                    disabled={isLoadingMore}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    {isLoadingMore ? "Loading..." : "Load more reviews"}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <ReviewAnalytics reviews={reviews} />
            </TabsContent>

            {/* Rating Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <Card className="border border-border bg-card/80">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Detailed Rating Distribution
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Breakdown of ratings by star count
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.distribution.map((d) => (
                    <div key={d.stars} className="flex items-center gap-4">
                      <div className="w-16 flex items-center gap-1 text-sm text-foreground">
                        <span>{d.stars}</span>
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </div>
                      <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-500" 
                          style={{ width: `${d.pct}%` }} 
                        />
                      </div>
                      <div className="w-20 text-right">
                        <div className="text-sm font-medium text-foreground">{d.count}</div>
                        <div className="text-xs text-muted-foreground">{d.pct}%</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}


