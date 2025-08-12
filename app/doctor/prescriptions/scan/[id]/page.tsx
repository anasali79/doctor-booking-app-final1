"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { prescriptionsAPI, doctorsAPI, patientsAPI, type Prescription, type Doctor, type Patient } from "@/lib/api"
import { PrescriptionScanActions } from "@/components/prescription-scan-actions"
import { Loader2 } from "lucide-react"

export default function PrescriptionScanPage() {
  const params = useParams()
  const id = params.id as string

  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [doctor, setDoctor] = useState<Doctor | undefined>(undefined)
  const [patient, setPatient] = useState<Patient | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch prescription
        const prescriptionData = await prescriptionsAPI.getById(id)
        setPrescription(prescriptionData)

        // Fetch doctor and patient data
        const [doctorData, patientData] = await Promise.allSettled([
          doctorsAPI.getById(prescriptionData.doctorId),
          patientsAPI.getById(prescriptionData.patientId),
        ])

        if (doctorData.status === "fulfilled") {
          setDoctor(doctorData.value)
        }

        if (patientData.status === "fulfilled") {
          setPatient(patientData.value)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load prescription")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading prescription...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Prescription Not Found</h1>
          <p className="text-slate-600">The prescription you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return <PrescriptionScanActions prescription={prescription} doctor={doctor} patient={patient} />
}
