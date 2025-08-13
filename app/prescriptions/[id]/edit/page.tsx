"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { PrescriptionForm } from "@/components/PrescriptionForm"
import { prescriptionsAPI, type Prescription } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"

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

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen pt-24 bg-gradient-to-br from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <DoctorNavbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="text-center py-12 bg-card/80 dark:bg-slate-800 border border-border/50 dark:border-slate-700 text-foreground dark:text-white">
              <CardContent>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading prescription...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!prescription) {
    return (
      <ProtectedRoute allowedRoles={["doctor"]}>
        <div className="min-h-screen pt-24 bg-gradient-to-br from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <DoctorNavbar />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <Card className="text-center py-12 bg-card/80 dark:bg-slate-800 border border-border/50 dark:border-slate-700 text-foreground dark:text-white">
              <CardContent>
                <h3 className="text-xl font-semibold text-foreground dark:text-white mb-2">Prescription not found</h3>
                <p className="text-muted-foreground">The prescription you're looking for doesn't exist.</p>
                <Button className="mt-4 bg-teal-600 hover:bg-teal-700" onClick={() => router.push("/doctor/prescriptions")}>
                  Back to Prescriptions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen pt-24 bg-gradient-to-br from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <DoctorNavbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="mr-4 border-border dark:border-slate-600 text-foreground dark:text-slate-300 hover:bg-muted/50 dark:hover:bg-slate-700/50 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-muted-foreground bg-clip-text text-transparent dark:from-white dark:via-slate-200 dark:to-slate-400">
              Edit Prescription
            </h1>
          </div>
          <PrescriptionForm
            appointmentId={prescription.appointmentId}
            patientId={prescription.patientId}
            patientName={prescription.patientName}
            doctorId={prescription.doctorId}
            doctorName={prescription.doctorName}
            initialData={prescription}
            onSuccess={handleSuccess}
            onClose={() => router.push("/doctor/prescriptions")}
          />
        </div>
      </div>
    </ProtectedRoute>
  )
}
