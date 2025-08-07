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
import { motion, AnimatePresence } from "framer-motion" // Import motion and AnimatePresence

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

export function formatDateTimeIfNeeded(dateString: string): string {
  // Try to parse it — if invalid, return as is
  const parsed = Date.parse(dateString)
  if (isNaN(parsed)) return dateString // Already formatted or invalid

  const date = new Date(parsed)
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }
  const formatted = date.toLocaleString("en-US", options)
  const parts = formatted.split(", ")
  const datePart = parts[0]
  const yearPart = parts[1]
  const timePart = parts[2]
  return `${datePart} ${yearPart} at ${timePart}`
}

// Framer Motion variants for animations
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } },
}

const buttonHoverTap = {
  whileHover: { scale: 1.02, transition: { duration: 0.1 } },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
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
  const [vitalsTemperature, setVitalsTemperature] = useState(initialData?.vitals?.temperature || "")
  const [vitalsBp, setVitalsBp] = useState(initialData?.vitals?.bp || "")
  const [vitalsPulse, setVitalsPulse] = useState(initialData?.vitals?.pulse || "")
  const [medicines, setMedicines] = useState<MedicineField[]>(
    initialData?.medicines || [{ name: "", dosage: "", frequency: "", duration: "", notes: "" }],
  )
  const [testsRecommended, setTestsRecommended] = useState(initialData?.testsRecommended || "")
  const [generalNotes, setGeneralNotes] = useState(initialData?.generalNotes || "")
  const [followUpDate, setFollowUpDate] = useState(initialData?.followUpDate || "")
  const [doctorSignatureText, setDoctorSignatureText] = useState(initialData?.doctorSignatureText || "")
  const [isLoading, setIsLoading] = useState(false)

  const commonDosages = ["10mg", "25mg", "50mg", "100mg", "250mg", "500mg", "1g", "as needed"]
  const commonFrequencies = ["1 time a day", "2 times a day", "3 times a day", "before meal", "after meal", "at bedtime"]
  const commonDurations = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month"]

  useEffect(() => {
    if (initialData) {
      setSymptoms(initialData.symptoms || "")
      setDiagnosis(initialData.diagnosis || "")
      setVitalsTemperature(initialData.vitals?.temperature || "")
      setVitalsBp(initialData.vitals?.bp || "")
      setVitalsPulse(initialData.vitals?.pulse || "")
      setMedicines(initialData.medicines)
      setTestsRecommended(initialData.testsRecommended || "")
      setGeneralNotes(initialData.generalNotes || "")
      setFollowUpDate(initialData.followUpDate || "")
      setDoctorSignatureText(initialData.doctorSignatureText || "")
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

    const prescriptionData: Omit<Prescription, "id"> = {
      appointmentId,
      patientId,
      patientName,
      doctorId,
      doctorName,
      datePrescribed: formatDateTimeIfNeeded(new Date().toISOString()),
      symptoms,
      diagnosis,
      vitals: {
        temperature: vitalsTemperature,
        bp: vitalsBp,
        pulse: vitalsPulse,
      },
      medicines: medicines.filter((m) => m.name || m.dosage || m.frequency || m.duration || m.notes),
      testsRecommended,
      generalNotes,
      followUpDate,
      doctorSignatureText,
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
    <Card className="bg-slate-900 border-slate-700 text-white w-full max-w-2xl mx-auto shadow-2xl rounded-xl">
      <CardHeader className="pb-4 border-b border-slate-700/50">
        <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
          {initialData ? "Edit Prescription" : "Create New Prescription"}
        </CardTitle>
        <CardDescription className="text-slate-400 text-md">
          For Appointment ID: <span className="font-semibold text-teal-300">{appointmentId}</span> (Patient:{" "}
          <span className="font-semibold text-teal-300">{patientName}</span>)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-3">
            <Label htmlFor="symptoms" className="text-slate-300 text-base">Symptoms</Label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Fever, sore throat, fatigue (comma-separated)"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-3">
            <Label htmlFor="diagnosis" className="text-slate-300 text-base">Diagnosis</Label>
            <Input
              id="diagnosis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g., Viral Fever"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              required
            />
          </motion.div>

          {/* Vitals Section with Dropdown + Other */}
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-3">
            <Label className="text-slate-300 text-base">Vitals</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Temperature */}
              <div>
                <Label className="text-slate-400 text-sm">Temperature</Label>
                {vitalsTemperature === "other" ? (
                  <Input
                    value={vitalsTemperature}
                    onChange={(e) => setVitalsTemperature(e.target.value)}
                    placeholder="Enter custom temp"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  />
                ) : (
                  <Select value={vitalsTemperature} onValueChange={(value) => setVitalsTemperature(value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200">
                      <SelectValue placeholder="Select temperature" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                      {["97.8°F", "98.6°F", "99.1°F", "100°F", "101°F", "102°F", "103°F"].map(temp => (
                        <SelectItem key={temp} value={temp}>{temp}</SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              {/* Blood Pressure */}
              <div>
                <Label className="text-slate-400 text-sm">BP</Label>
                {vitalsBp === "other" ? (
                  <Input
                    value={vitalsBp}
                    onChange={(e) => setVitalsBp(e.target.value)}
                    placeholder="Enter custom BP"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  />
                ) : (
                  <Select value={vitalsBp} onValueChange={(value) => setVitalsBp(value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200">
                      <SelectValue placeholder="Select BP" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                      {["90/60 mmHg", "100/70 mmHg", "110/80 mmHg", "120/80 mmHg", "130/85 mmHg", "140/90 mmHg"].map(bp => (
                        <SelectItem key={bp} value={bp}>{bp}</SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              {/* Pulse */}
              <div>
                <Label className="text-slate-400 text-sm">Pulse</Label>
                {vitalsPulse === "other" ? (
                  <Input
                    value={vitalsPulse}
                    onChange={(e) => setVitalsPulse(e.target.value)}
                    placeholder="Enter custom pulse"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                  />
                ) : (
                  <Select value={vitalsPulse} onValueChange={(value) => setVitalsPulse(value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200">
                      <SelectValue placeholder="Select pulse" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-white">
                      {["60 bpm", "72 bpm", "80 bpm", "88 bpm", "95 bpm", "100 bpm", "110 bpm"].map(pulse => (
                        <SelectItem key={pulse} value={pulse}>{pulse}</SelectItem>
                      ))}
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </motion.div>

          <h3 className="text-xl font-semibold text-white border-b border-slate-700/50 pb-2">Medicines</h3>
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {medicines.map((medicine, index) => (
                <motion.div
                  key={medicine.name + index} // Use a more stable key if possible, or just index if items are not reordered
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="border border-slate-700 p-4 rounded-lg space-y-3 relative bg-slate-800/50 shadow-md"
                >
                  <h4 className="text-lg font-medium text-slate-300">Medicine {index + 1}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                      <Label htmlFor={`medicine-name-${index}`} className="text-slate-400 text-sm">Medicine Name</Label>
                      <Input
                        id={`medicine-name-${index}`}
                        value={medicine.name}
                        onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`dosage-${index}`} className="text-slate-400 text-sm">Dosage</Label>
                      <Select value={medicine.dosage} onValueChange={(value) => handleMedicineChange(index, "dosage", value)}>
                        <SelectTrigger id={`dosage-${index}`} className="bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200">
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
                      <Label htmlFor={`frequency-${index}`} className="text-slate-400 text-sm">Frequency</Label>
                      <Select value={medicine.frequency} onValueChange={(value) => handleMedicineChange(index, "frequency", value)}>
                        <SelectTrigger id={`frequency-${index}`} className="bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200">
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
                      <Label htmlFor={`duration-${index}`} className="text-slate-400 text-sm">Duration</Label>
                      <Select value={medicine.duration} onValueChange={(value) => handleMedicineChange(index, "duration", value)}>
                        <SelectTrigger id={`duration-${index}`} className="bg-slate-700 border-slate-600 text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200">
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
                      <Label htmlFor={`notes-${index}`} className="text-slate-400 text-sm">Notes/Instructions</Label>
                      <Textarea
                        id={`notes-${index}`}
                        value={medicine.notes}
                        onChange={(e) => handleMedicineChange(index, "notes", e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
                        placeholder="e.g., Take after meals, complete the full course"
                      />
                    </div>
                  </div>
                  {medicines.length > 1 && (
                    <motion.div {...buttonHoverTap}>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeMedicineField(index)}
                        className="absolute top-2 right-2 h-8 w-8 bg-red-500/30 text-red-300 hover:bg-red-500/40 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove medicine</span>
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
          <motion.div {...buttonHoverTap}>
            <Button
              type="button"
              variant="outline"
              onClick={addMedicineField}
              className="w-full border-teal-600 text-teal-300 hover:bg-teal-900/20 hover:border-teal-500 transition-all duration-300"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Medicine
            </Button>
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-3">
            <Label htmlFor="tests-recommended" className="text-slate-300 text-base">Tests Recommended</Label>
            <Textarea
              id="tests-recommended"
              value={testsRecommended}
              onChange={(e) => setTestsRecommended(e.target.value)}
              placeholder="e.g., CBC, Covid Rapid Test (comma-separated)"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[80px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            />
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-3">
            <Label htmlFor="general-notes" className="text-slate-300 text-base">
              General Notes for Prescription
            </Label>
            <Textarea
              id="general-notes"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
              placeholder="Any overall instructions or notes for the patient, e.g., Drink plenty of water. Take rest."
            />
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-3">
            <Label htmlFor="follow-up-date" className="text-slate-300 text-base">Follow-up Date</Label>
            <Input
              id="follow-up-date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            />
          </motion.div>

          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="space-y-3">
            <Label htmlFor="doctor-signature-text" className="text-slate-300 text-base">Doctor's Name for Signature</Label>
            <Input
              id="doctor-signature-text"
              value={doctorSignatureText}
              onChange={(e) => setDoctorSignatureText(e.target.value)}
              placeholder="e.g., Dr. S. Mehta"
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200"
            />
          </motion.div>

          <div className="flex justify-end gap-3 pt-4">
            <motion.div {...buttonHoverTap}>
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-200">
                Cancel
              </Button>
            </motion.div>
            <motion.div {...buttonHoverTap}>
              <Button type="submit" disabled={isLoading} className="bg-teal-500 hover:bg-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Update Prescription" : "Create Prescription"}
              </Button>
            </motion.div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
