"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { PrescriptionForm } from "@/components/PrescriptionForm"
import { prescriptionsAPI, type Prescription } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import {
  Card as CardUI,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent as CardContentUI,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Edit, FileText } from "lucide-react"
import { DoctorNavbar } from "@/components/DoctorNavbar"

export default function EditPrescriptionPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const prescriptionId = params.id as string

  useEffect(() => {
    if (prescriptionId) {
      loadPrescription()
    }
  }, [prescriptionId])

  const loadPrescription = async () => {
    setIsLoading(true)
    try {
      const data = await prescriptionsAPI.getById(prescriptionId)
      setPrescription(data)
    } catch (error) {
      console.error("Failed to load prescription for editing:", error)
      toast({
        title: "Error",
        description: "Failed to load prescription. Please try again.",
        variant: "destructive",
      })
      router.push("/doctor/prescriptions") // Redirect if not found or error
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuccess = (updatedPrescription: Prescription) => {
    toast({
      title: "Success",
      description: "Prescription updated successfully!",
    })
    router.push("/doctor/prescriptions") // Navigate back to list after update
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen pt-24 bg-gradient-to-br  from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <DoctorNavbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-teal-500/10 text-teal-600 dark:text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-teal-500/20">
              <FileText className="w-4 h-4" />
              <span>Doctor Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-muted-foreground/60 bg-clip-text text-transparent mb-4">
              Prescription Details
            </h1>
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto">
              View and manage prescription information
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted dark:bg-slate-700 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading prescription...</p>
            </div>
          ) : prescription ? (
            <div className="space-y-6">
              {/* Prescription Header */}
              <CardUI className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-foreground dark:text-white text-xl">
                        Prescription #{prescription.id}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground dark:text-slate-400">
                        Created on {format(new Date(prescription.datePrescribed), "PPP")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30">
                        Active
                      </Badge>
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/doctor/prescriptions/${prescription.id}/edit`)}
                        className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </CardUI>

              {/* Patient Information */}
              <CardUI className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-foreground dark:text-white">Patient Information</CardTitle>
                </CardHeader>
                <CardContentUI>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground dark:text-slate-400 text-sm">Patient Name</Label>
                      <p className="text-foreground dark:text-white font-medium">{prescription.patientName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground dark:text-slate-400 text-sm">Patient ID</Label>
                      <p className="text-foreground dark:text-white font-medium">{prescription.patientId}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground dark:text-slate-400 text-sm">Doctor Name</Label>
                      <p className="text-foreground dark:text-white font-medium">{prescription.doctorName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground dark:text-slate-400 text-sm">Date</Label>
                      <p className="text-foreground dark:text-white font-medium">
                        {format(new Date(prescription.datePrescribed), "PPP")}
                      </p>
                    </div>
                  </div>
                </CardContentUI>
              </CardUI>

              {/* Prescription Content */}
              <CardUI className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-foreground dark:text-white">Prescription Details</CardTitle>
                </CardHeader>
                <CardContentUI>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground dark:text-slate-400 text-sm">Diagnosis</Label>
                      <p className="text-foreground dark:text-white">{prescription.diagnosis || "Not specified"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground dark:text-slate-400 text-sm">Notes</Label>
                      <p className="text-foreground dark:text-white">{prescription.generalNotes || "No additional notes"}</p>
                    </div>
                  </div>
                </CardContentUI>
              </CardUI>

              {/* Actions */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => router.push(`/doctor/prescriptions/${prescription.id}/edit`)}
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Prescription
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/doctor/prescriptions")}
                  className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent"
                >
                  Back to List
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Prescription not found</h3>
              <p className="text-muted-foreground mb-4">
                The prescription you're looking for doesn't exist or has been removed.
              </p>
              <Button
                onClick={() => router.push("/doctor/prescriptions")}
                className="bg-teal-500 hover:bg-teal-600"
              >
                Back to Prescriptions
              </Button>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
