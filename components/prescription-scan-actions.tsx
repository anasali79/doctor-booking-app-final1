"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  ShoppingCart,
  Shield,
  Heart,
  Stethoscope,
  CheckCircle,
  User,
  Clock,
  AlertCircle,
  Loader2,
} from "lucide-react"
import type { Prescription, Patient, Doctor } from "@/lib/api"

type Props = {
  prescription: Prescription
  patient?: Patient
  doctor?: Doctor
}

export function PrescriptionScanActions({ prescription, patient, doctor }: Props) {
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [showVerifyForm, setShowVerifyForm] = useState(false)
  const [showVerifyError, setShowVerifyError] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)

  // Form states
  const [prescriptionId, setPrescriptionId] = useState("")
  const [appointmentId, setAppointmentId] = useState("")

  const handleBookFollowUp = () => {
    // Redirect to local booking page with 's'
    window.open(`https://doctor-booking-app-orpin.vercel.app/${prescription.doctorId}?type=clinic`, "_blank")
  }

  const handleOrderMedicine = () => {
    // Redirect to pharmacy or medicine ordering page
    window.open("https://www.1mg.com/", "_blank")
  }

  const handleVerifyPrescription = () => {
    setShowVerifyForm(true)
  }

  const handleVerifySubmit = async () => {
    setVerifyLoading(true)

    // Simulate verification process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Check if both IDs match
    const prescriptionMatches = prescriptionId.trim() === prescription.id
    const appointmentMatches = appointmentId.trim() === prescription.appointmentId

    setVerifyLoading(false)
    setShowVerifyForm(false)

    if (prescriptionMatches && appointmentMatches) {
      // Both match - show success
      setShowVerifyDialog(true)
    } else {
      // Either one is wrong - show error
      setShowVerifyError(true)
    }

    // Reset form
    setPrescriptionId("")
    setAppointmentId("")
  }

  const resetVerifyForm = () => {
    setShowVerifyForm(false)
    setPrescriptionId("")
    setAppointmentId("")
    setVerifyLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-sky-900">MediCare</h1>
          </div>
          <p className="text-slate-600">Digital Prescription Portal</p>
        </div>

        {/* Prescription Info Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-sky-900 flex items-center justify-center gap-2">
              <Stethoscope className="h-6 w-6" />
              Prescription Details
            </CardTitle>
            <CardDescription>
              Issued by {doctor?.name || prescription.doctorName} on{" "}
              {new Date(prescription.datePrescribed).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-sky-600" />
                  <span className="font-medium">Patient:</span>
                  <span>{prescription.patientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-sky-600" />
                  <span className="font-medium">Doctor:</span>
                  <span>{doctor?.name || prescription.doctorName}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-sky-600" />
                  <span className="font-medium">Appointment ID:</span>
                  <span>{prescription.appointmentId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    ✓ Verified Prescription
                  </Badge>
                </div>
              </div>
            </div>

            {/* Medicines Summary */}
            {prescription.medicines && prescription.medicines.length > 0 && (
              <div className="bg-sky-50 rounded-lg p-4">
                <h3 className="font-semibold text-sky-900 mb-2">Prescribed Medicines:</h3>
                <div className="space-y-1">
                  {prescription.medicines.slice(0, 3).map((medicine, index) => (
                    <div key={index} className="text-sm text-slate-700">
                      • {medicine.name} - {medicine.dosage}
                    </div>
                  ))}
                  {prescription.medicines.length > 3 && (
                    <div className="text-sm text-slate-500">+{prescription.medicines.length - 3} more medicines...</div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Book Follow-up */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white">
            <CardContent className="p-6 text-center" onClick={handleBookFollowUp}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors mx-auto mb-4">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Book Follow-up</h3>
              <p className="text-slate-600 mb-4">Schedule your next appointment with {doctor?.name || "your doctor"}</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Book Appointment</Button>
            </CardContent>
          </Card>

          {/* Order Medicine */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white">
            <CardContent className="p-6 text-center" onClick={handleOrderMedicine}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Order Medicine</h3>
              <p className="text-slate-600 mb-4">Get your prescribed medicines delivered to your doorstep</p>
              <Button className="w-full bg-green-600 hover:bg-green-700">Order Online</Button>
            </CardContent>
          </Card>

          {/* Verify Prescription */}
          <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white">
            <CardContent className="p-6 text-center" onClick={handleVerifyPrescription}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Verify Prescription</h3>
              <p className="text-slate-600 mb-4">Confirm the authenticity and validity of this prescription</p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Verify Now</Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500">
          <p className="text-sm">
            Powered by <span className="font-semibold text-sky-600">MediCare</span> - Your trusted healthcare companion
          </p>
          <p className="text-xs">
            Contact us at <a href="mailto:support@medicare.com">support@medicare.com</a> | Visit us at{" "}
            <span>{"https://doctor-booking-app-orpin.vercel.app"}</span>
          </p>
        </div>
      </div>

      {/* Verification Form Dialog */}
      <Dialog open={showVerifyForm} onOpenChange={resetVerifyForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-purple-700">Verify Prescription</DialogTitle>
            <DialogDescription className="text-center">
              Please enter the prescription details to verify authenticity
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="prescriptionId">Prescription ID</Label>
              <Input
                id="prescriptionId"
                placeholder="Enter prescription ID"
                value={prescriptionId}
                onChange={(e) => setPrescriptionId(e.target.value)}
                disabled={verifyLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentId">Appointment ID</Label>
              <Input
                id="appointmentId"
                placeholder="Enter appointment ID"
                value={appointmentId}
                onChange={(e) => setAppointmentId(e.target.value)}
                disabled={verifyLoading}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={resetVerifyForm}
              disabled={verifyLoading}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifySubmit}
              disabled={verifyLoading || !prescriptionId.trim() || !appointmentId.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {verifyLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-green-700">Prescription Verified!</DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p className="text-lg font-medium text-slate-900">Hello, {prescription.patientName}</p>
              <p className="text-slate-600">
                Your prescription is <span className="font-semibold text-green-600">verified and original</span>.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mt-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prescription ID:</span>
                    <span className="font-mono">{prescription.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issued by:</span>
                    <span>{doctor?.name || prescription.doctorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(prescription.datePrescribed).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge className="bg-green-600">✓ Authentic</Badge>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-6">
            <Button onClick={() => setShowVerifyDialog(false)} className="bg-green-600 hover:bg-green-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Verification Dialog */}
      <Dialog open={showVerifyError} onOpenChange={setShowVerifyError}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-red-700">Prescription Not Verified</DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <p className="text-slate-600">The prescription details you entered do not match our records.</p>
              <div className="bg-red-50 rounded-lg p-4 mt-4">
                <div className="space-y-2 text-sm text-red-800">
                  <p className="font-medium">Possible reasons:</p>
                  <ul className="list-disc list-inside space-y-1 text-left">
                    <li>Incorrect Prescription ID</li>
                    <li>Incorrect Appointment ID</li>
                    <li>Prescription may be fraudulent</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Please double-check the details or contact the issuing doctor.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowVerifyError(false)} className="flex-1">
              Close
            </Button>
            <Button
              onClick={() => {
                setShowVerifyError(false)
                setShowVerifyForm(true)
              }}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
