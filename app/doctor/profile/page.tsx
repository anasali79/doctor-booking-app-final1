"use client"
import type React from "react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { User, Phone, Mail, Stethoscope, GraduationCap, MapPin, Clock, Loader2 } from 'lucide-react'

export default function DoctorProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // New loading state
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
              Doctor Profile
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl">Manage your professional information</p>
          </div>
          <Card className="mb-6 border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl">
            <CardHeader className="border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center">
                    <User className="w-6 h-6 mr-2 text-teal-400" />
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-slate-400 mt-2 text-sm sm:text-base">
                    Update your basic details
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-teal-500/30 text-teal-300 hover:bg-teal-500/10 bg-transparent"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        disabled={!isEditing}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-slate-300">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        disabled={!isEditing}
                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      disabled={!isEditing}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      required
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading} className="bg-teal-500 hover:bg-teal-600 text-white">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
          {/* Professional Information */}
          <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <Stethoscope className="w-6 h-6 mr-2 text-blue-400" />
                Professional Information
              </CardTitle>
              <CardDescription className="text-slate-400 mt-2 text-sm sm:text-base">
                Your medical credentials and practice details
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="specialty" className="text-slate-300">Specialty</Label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    {isEditing ? (
                      <Select value={formData.specialty} onValueChange={(value) => handleInputChange("specialty", value)}>
                        <SelectTrigger className="pl-10 bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder={formData.specialty || "Select specialty"} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600 text-white">
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="dermatology">Dermatology</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="orthopedics">Orthopedics</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="psychiatry">Psychiatry</SelectItem>
                          <SelectItem value="general">General Medicine</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={formData.specialty} disabled className="pl-10 bg-slate-700 border-slate-600 text-white capitalize" />
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="experience" className="text-slate-300">Experience</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      id="experience"
                      type="text"
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      disabled={!isEditing}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      placeholder="e.g., 5 years"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Label htmlFor="qualifications" className="text-slate-300">Qualifications</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    id="qualifications"
                    type="text"
                    value={formData.qualifications}
                    onChange={(e) => handleInputChange("qualifications", e.target.value)}
                    disabled={!isEditing}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    placeholder="e.g., MD, MBBS, Specialist"
                    required
                  />
                </div>
              </div>
              <div className="mt-6">
                <Label htmlFor="clinicAddress" className="text-slate-300">Clinic Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Textarea
                    id="clinicAddress"
                    value={formData.clinicAddress}
                    onChange={(e) => handleInputChange("clinicAddress", e.target.value)}
                    disabled={!isEditing}
                    className="pl-10 min-h-[80px] bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    placeholder="Enter your clinic address"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
