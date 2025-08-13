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
import { Star, Filter, Search } from "lucide-react"

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
      setReviews((prev) => (append ? [...prev, ...items] : items))
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
              Patient Reviews
            </h1>
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto">
              Read your latest feedback and track your average rating
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Average Rating</CardTitle>
                <CardDescription className="text-muted-foreground">Across all patient reviews</CardDescription>
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
                <CardDescription className="text-muted-foreground">From your patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Rating Distribution</CardTitle>
                <CardDescription className="text-muted-foreground">Percentage by stars</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.distribution.map((d) => (
                  <div key={d.stars} className="flex items-center gap-2">
                    <div className="w-16 flex items-center gap-1 text-sm text-foreground">
                      <span>{d.stars}</span>
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${d.pct}%` }} />
                    </div>
                    <div className="w-10 text-right text-sm text-muted-foreground">{d.pct}%</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border border-border/50 bg-card/80 dark:bg-slate-900/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-foreground text-lg flex items-center"><Filter className="w-4 h-4 mr-2"/> Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-foreground">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input className="pl-9 bg-muted/50 dark:bg-slate-800/50 border-border" placeholder="Search message or patient" value={query} onChange={(e) => setQuery(e.target.value)} />
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
                  <SelectContent className="bg-card text-foreground dark:bg-slate-800 dark:text-slate-200 border-border dark:border-slate-700 shadow-xl">
                    <SelectItem value="newest" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Newest</SelectItem>
                    <SelectItem value="oldest" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Oldest</SelectItem>
                    <SelectItem value="highest" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Highest Rated</SelectItem>
                    <SelectItem value="lowest" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Lowest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
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
              <Card className="md:col-span-2 lg:col-span-3 border border-border bg-card">
                <CardContent className="p-6 text-center text-muted-foreground">No reviews found</CardContent>
              </Card>
            ) : (
              filtered.map((r) => (
                <Card key={r.id} className="border border-border bg-card/80 dark:bg-slate-900/80">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-foreground text-lg">{r.patientName || 'Patient'}</CardTitle>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map((n) => (
                          <Star key={n} className={`w-4 h-4 ${n <= r.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                        ))}
                      </div>
                    </div>
                    <CardDescription className="text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-foreground text-sm whitespace-pre-wrap">{r.message || '—'}</div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination / Infinite Scroll Controls */}
          {filtered.length > 0 && reviews.length < total && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={() => fetchPage(page + 1, true)}
                disabled={isLoadingMore}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}


