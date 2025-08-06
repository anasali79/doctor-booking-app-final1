"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { prescriptionsAPI, type Prescription } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MedicineField {
  name: string
  dosage: string
  frequency: string
  duration: string
  notes: string
}

interface PrescriptionFormProps {
  appointmentId: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  initialData?: Prescription
  onSuccess: (prescription: Prescription) => void
  onClose: () => void
}

export function PrescriptionForm({
  appointmentId,
  patientId,
  patientName,
  doctorId,
  doctorName,
  initialData,
  onSuccess,
  onClose,
}: PrescriptionFormProps) {
  const { toast } = useToast()
  const [symptoms, setSymptoms] = useState(initialData?.symptoms || "")
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || "")
  const [medicines, setMedicines] = useState<MedicineField[]>(
    initialData?.medicines || [{ name: "", dosage: "", frequency: "", duration: "", notes: "" }],
  )
  const [generalNotes, setGeneralNotes] = useState(initialData?.generalNotes || "")
  const [isLoading, setIsLoading] = useState(false)

  const commonDosages = ["10mg", "25mg", "50mg", "100mg", "250mg", "500mg", "1g", "as needed"]
  const commonFrequencies = ["1 time a day", "2 times a day", "3 times a day", "before meal", "after meal", "at bedtime"]
  const commonDurations = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month"]

  useEffect(() => {
    if (initialData) {
      setSymptoms(initialData.symptoms || "")
      setDiagnosis(initialData.diagnosis || "")
      setMedicines(initialData.medicines)
      setGeneralNotes(initialData.generalNotes || "")
    }
  }, [initialData])

  const handleMedicineChange = (index: number, field: keyof MedicineField, value: string) => {
    const newMedicines = [...medicines]
    newMedicines[index][field] = value
    setMedicines(newMedicines)
  }

  const addMedicineField = () => {
    setMedicines([...medicines, { name: "", dosage: "", frequency: "", duration: "", notes: "" }])
  }

  const removeMedicineField = (index: number) => {
    const newMedicines = medicines.filter((_, i) => i !== index)
    setMedicines(newMedicines)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const prescriptionData = {
      appointmentId,
      patientId,
      patientName,
      doctorId,
      doctorName,
      datePrescribed: new Date().toISOString().split("T")[0],
      symptoms,
      diagnosis,
      medicines: medicines.filter((m) => m.name || m.dosage || m.frequency || m.duration || m.notes),
      generalNotes,
    }

    try {
      let result: Prescription
      if (initialData) {
        result = await prescriptionsAPI.update(initialData.id, prescriptionData)
        toast({ title: "Success", description: "Prescription updated successfully!" })
      } else {
        result = await prescriptionsAPI.create(prescriptionData)
        toast({ title: "Success", description: "Prescription created successfully!" })
      }
      onSuccess(result)
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save prescription: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-slate-800 border-slate-700 text-white w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-white">
          {initialData ? "Edit Prescription" : "Create Prescription"}
        </CardTitle>
        <CardDescription className="text-slate-400">
          For Appointment ID: {appointmentId} (Patient: {patientName})
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="symptoms" className="text-slate-300">Symptoms</Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Fever, sore throat, fatigue"
              className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="diagnosis" className="text-slate-300">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g., Viral Fever"
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
          </div>

          <h3 className="text-lg font-semibold text-white">Medicines</h3>
          <div className="space-y-4">
            {medicines.map((medicine, index) => (
              <div key={index} className="border border-slate-700 p-4 rounded-lg space-y-3 relative bg-slate-700/30">
                <h4 className="text-md font-medium text-slate-300">Medicine {index + 1}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <Label htmlFor={`medicine-name-${index}`} className="text-slate-300">Medicine Name</Label>
                    <Input
                      id={`medicine-name-${index}`}
                      value={medicine.name}
                      onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`dosage-${index}`} className="text-slate-300">Dosage</Label>
                    <Select value={medicine.dosage} onValueChange={(value) => handleMedicineChange(index, "dosage", value)}>
                      <SelectTrigger id={`dosage-${index}`} className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select dosage" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 text-white">
                        {commonDosages.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                        {medicine.dosage && !commonDosages.includes(medicine.dosage) && (
                          <SelectItem value={medicine.dosage} className="italic">{medicine.dosage}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`frequency-${index}`} className="text-slate-300">Frequency</Label>
                    <Select value={medicine.frequency} onValueChange={(value) => handleMedicineChange(index, "frequency", value)}>
                      <SelectTrigger id={`frequency-${index}`} className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 text-white">
                        {commonFrequencies.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                        {medicine.frequency && !commonFrequencies.includes(medicine.frequency) && (
                          <SelectItem value={medicine.frequency} className="italic">{medicine.frequency}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`duration-${index}`} className="text-slate-300">Duration</Label>
                    <Select value={medicine.duration} onValueChange={(value) => handleMedicineChange(index, "duration", value)}>
                      <SelectTrigger id={`duration-${index}`} className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 text-white">
                        {commonDurations.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                        {medicine.duration && !commonDurations.includes(medicine.duration) && (
                          <SelectItem value={medicine.duration} className="italic">{medicine.duration}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="lg:col-span-4">
                    <Label htmlFor={`notes-${index}`} className="text-slate-300">Notes/Instructions</Label>
                    <Textarea
                      id={`notes-${index}`}
                      value={medicine.notes}
                      onChange={(e) => handleMedicineChange(index, "notes", e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white min-h-[80px]"
                      placeholder="e.g., Take after meals, complete the full course"
                    />
                  </div>
                </div>
                {medicines.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeMedicineField(index)}
                    className="absolute top-2 right-2 h-7 w-7 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove medicine</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" onClick={addMedicineField} className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50">
            <Plus className="mr-2 h-4 w-4" /> Add Another Medicine
          </Button>

          <div className="space-y-3">
            <Label htmlFor="general-notes" className="text-slate-300">
              General Notes for Prescription
            </Label>
            <Textarea
              id="general-notes"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
              placeholder="Any overall instructions or notes for the patient, e.g., Drink plenty of water. Take rest."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-teal-500 hover:bg-teal-600">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update Prescription" : "Create Prescription"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
