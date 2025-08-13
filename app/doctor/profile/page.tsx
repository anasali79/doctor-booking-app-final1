"use client"
import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { User, Star } from 'lucide-react'
import { reviewsAPI } from '@/lib/api'

export default function DoctorProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // New loading state
  const [reviews, setReviews] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialty: user?.specialty || "",
    qualifications: user?.qualifications || "",
    experience: user?.experience || "",
    clinicAddress: user?.clinicAddress || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true) // Set loading to true
    try {
      await updateUser(formData) // Await the update operation
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false) // Set loading to false
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <DoctorNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-teal-500/10 text-teal-600 dark:text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-teal-500/20">
              <User className="w-4 h-4" />
              <span>Doctor Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-muted-foreground/60 bg-clip-text text-transparent mb-4">
              Doctor Profile
            </h1>
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto">
              Manage your professional information and practice details
            </p>
          </div>

          <Card className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground dark:text-white">Personal Information</CardTitle>
              <CardDescription className="text-muted-foreground dark:text-slate-400">
                Update your personal and professional details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground dark:text-slate-300">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700 text-foreground dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground dark:text-slate-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700 text-foreground dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground dark:text-slate-300">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700 text-foreground dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialty" className="text-foreground dark:text-slate-300">
                      Medical Specialty
                    </Label>
                    <Input
                      id="specialty"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      className="bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700 text-foreground dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicAddress" className="text-foreground dark:text-slate-300">
                    Clinic Address
                  </Label>
                  <Input
                    id="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                    className="bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700 text-foreground dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                      phone: user?.phone || "",
                      specialty: user?.specialty || "",
                      qualifications: user?.qualifications || "",
                      experience: user?.experience || "",
                      clinicAddress: user?.clinicAddress || "",
                    })}
                    className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent"
                  >
                    Reset
                  </Button>
                  <Button type="submit" className="bg-teal-500 hover:bg-teal-600">
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card className="mt-8 border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground dark:text-white flex items-center"><Star className="w-5 h-5 text-amber-500 mr-2"/> Patient Reviews</CardTitle>
              <CardDescription className="text-muted-foreground">Recent feedback from your patients</CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-muted-foreground">No reviews yet.</div>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0,5).map((r) => (
                    <div key={r.id} className="p-3 rounded-lg border border-border bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-foreground">{r.patientName || 'Patient'}</div>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((n) => (
                            <Star key={n} className={`w-4 h-4 ${n <= (r.rating||0) ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                      </div>
                      {r.message && <div className="text-sm text-muted-foreground mt-1">{r.message}</div>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
