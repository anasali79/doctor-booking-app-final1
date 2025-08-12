"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Navbar } from "@/components/Navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  Shield,
  Calendar,
  Star,
  Heart,
  Activity,
  Clock,
  MapPin,
  Camera,
  UserCheck,
  Stethoscope,
  Cigarette,
  Wine,
  Dumbbell,
  Utensils,
  Briefcase,
  Brain,
  Users,
  Home,
  Globe,
  Languages,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  appointmentsAPI,
  patientsAPI,
  prescriptionsAPI,
  type Appointment,
  type Patient,
  type Prescription,
} from "@/lib/api"
import { format, parseISO } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PrescriptionDetailView } from "@/components/PrescriptionDetailView"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patient, setPatient] = useState<Patient | null>(null)
  const [historyFilter, setHistoryFilter] = useState<"all" | "clinic" | "video" | "call">("all")
  const [searchText, setSearchText] = useState("")
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)
  const [showAddVisitDialog, setShowAddVisitDialog] = useState(false)
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false)
  const [visitForm, setVisitForm] = useState({
    doctorName: "",
    specialty: "",
    date: "",
    time: "",
    type: "clinic" as "clinic" | "video" | "call",
    diagnosis: "",
    symptoms: "",
    medicinesText: "",
    followUpDate: "",
    attachments: [] as { id: string; name: string; type: "image" | "pdf"; url: string }[],
  })
  const [formData, setFormData] = useState({
    // Personal Information
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    secondaryPhone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    nationality: "",
    preferredLanguage: "",

    // Medical Information
    bloodGroup: "",
    heightCm: "",
    weightKg: "",
    insuranceProvider: "",
    policyNumber: "",
    groupNumber: "",
    coverageDetails: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    primaryCarePhysician: "",
    medicalIdNumber: "",
    currentMedications: "",
    allergies: "",
    chronicConditions: "",
    pastSurgeries: "",
    familyMedicalHistory: "",
    vaccinationRecords: "",

    // Lifestyle Information
    smokingStatus: "",
    alcoholConsumption: "",
    exerciseHabits: "",
    dietaryPreferences: "",
    occupation: "",
    stressLevel: "",
    sleepHours: "",
    physicalActivityLevel: "",
  })

  // Update the useEffect to handle API errors gracefully and show loading states
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }))

      const load = async () => {
        try {
          setIsLoading(true)

          // Fetch patient data first
          const patientData = await patientsAPI.getById(user.id)
          setPatient(patientData)

          // Populate form with all patient data
          setFormData((prev) => ({
            ...prev,
            // Personal Information
            address: patientData.address ?? "",
            city: patientData.city ?? "",
            state: patientData.state ?? "",
            zipCode: patientData.zipCode ?? "",
            country: patientData.country ?? "",
            dateOfBirth: patientData.dateOfBirth ?? "",
            gender: patientData.gender ?? "",
            maritalStatus: patientData.maritalStatus ?? "",
            nationality: patientData.nationality ?? "",
            preferredLanguage: patientData.preferredLanguage ?? "",
            secondaryPhone: patientData.secondaryPhone ?? "",

            // Medical Information
            bloodGroup: patientData.bloodGroup ?? "",
            heightCm: patientData.heightCm != null ? String(patientData.heightCm) : "",
            weightKg: patientData.weightKg != null ? String(patientData.weightKg) : "",
            insuranceProvider: patientData.insuranceProvider ?? "",
            policyNumber: patientData.policyNumber ?? "",
            groupNumber: patientData.groupNumber ?? "",
            coverageDetails: patientData.coverageDetails ?? "",
            emergencyContactName: patientData.emergencyContactName ?? "",
            emergencyContactPhone: patientData.emergencyContactPhone ?? "",
            emergencyContactRelation: patientData.emergencyContactRelation ?? "",
            primaryCarePhysician: patientData.primaryCarePhysician ?? "",
            medicalIdNumber: patientData.medicalIdNumber ?? "",
            currentMedications: patientData.currentMedications ?? "",
            allergies: patientData.allergies ?? "",
            chronicConditions: patientData.chronicConditions ?? "",
            pastSurgeries: patientData.pastSurgeries ?? "",
            familyMedicalHistory: patientData.familyMedicalHistory ?? "",
            vaccinationRecords: patientData.vaccinationRecords ?? "",

            // Lifestyle Information
            smokingStatus: patientData.smokingStatus ?? "",
            alcoholConsumption: patientData.alcoholConsumption ?? "",
            exerciseHabits: patientData.exerciseHabits ?? "",
            dietaryPreferences: patientData.dietaryPreferences ?? "",
            occupation: patientData.occupation ?? "",
            stressLevel: patientData.stressLevel ?? "",
            sleepHours: patientData.sleepHours ?? "",
            physicalActivityLevel: patientData.physicalActivityLevel ?? "",
          }))

          // Fetch appointments and prescriptions in parallel
          const [appointmentsData, prescriptionsData] = await Promise.allSettled([
            appointmentsAPI.getByPatientId(user.id),
            prescriptionsAPI.getByPatientId(user.id),
          ])

          if (appointmentsData.status === "fulfilled") {
            setAppointments(
              appointmentsData.value.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()),
            )
          } else {
            console.error("Failed to fetch appointments:", appointmentsData.reason)
            toast({
              title: "Warning",
              description: "Could not load appointment history",
              variant: "destructive",
            })
          }

          if (prescriptionsData.status === "fulfilled") {
            setPrescriptions(
              prescriptionsData.value.sort(
                (a, b) => parseISO(b.datePrescribed).getTime() - parseISO(a.datePrescribed).getTime(),
              ),
            )
          } else {
            console.error("Failed to fetch prescriptions:", prescriptionsData.reason)
            toast({
              title: "Warning",
              description: "Could not load prescription history",
              variant: "destructive",
            })
          }
        } catch (error) {
          console.error("Error loading profile data:", error)
          toast({
            title: "Error",
            description: "Failed to load profile data. Please refresh the page.",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      void load()
    }
  }, [user, toast])

  // Update the handleSubmit function to handle API responses better
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (user?.id) {
        const toNumber = (v: string) => (v ? Number(v) : undefined)

        // Prepare update data with all fields
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,

          // Personal Information
          secondaryPhone: formData.secondaryPhone || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          country: formData.country || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender || undefined,
          maritalStatus: formData.maritalStatus || undefined,
          nationality: formData.nationality || undefined,
          preferredLanguage: formData.preferredLanguage || undefined,

          // Medical Information
          bloodGroup: formData.bloodGroup || undefined,
          heightCm: toNumber(formData.heightCm),
          weightKg: toNumber(formData.weightKg),
          insuranceProvider: formData.insuranceProvider || undefined,
          policyNumber: formData.policyNumber || undefined,
          groupNumber: formData.groupNumber || undefined,
          coverageDetails: formData.coverageDetails || undefined,
          emergencyContactName: formData.emergencyContactName || undefined,
          emergencyContactPhone: formData.emergencyContactPhone || undefined,
          emergencyContactRelation: formData.emergencyContactRelation || undefined,
          primaryCarePhysician: formData.primaryCarePhysician || undefined,
          medicalIdNumber: formData.medicalIdNumber || undefined,
          currentMedications: formData.currentMedications || undefined,
          allergies: formData.allergies || undefined,
          chronicConditions: formData.chronicConditions || undefined,
          pastSurgeries: formData.pastSurgeries || undefined,
          familyMedicalHistory: formData.familyMedicalHistory || undefined,
          vaccinationRecords: formData.vaccinationRecords || undefined,

          // Lifestyle Information
          smokingStatus: formData.smokingStatus || undefined,
          alcoholConsumption: formData.alcoholConsumption || undefined,
          exerciseHabits: formData.exerciseHabits || undefined,
          dietaryPreferences: formData.dietaryPreferences || undefined,
          occupation: formData.occupation || undefined,
          stressLevel: formData.stressLevel || undefined,
          sleepHours: formData.sleepHours || undefined,
          physicalActivityLevel: formData.physicalActivityLevel || undefined,
        }

        console.log("Updating patient data:", updateData) // Debug log

        const updated = await patientsAPI.update(user.id, updateData)
        setPatient(updated)

        // Update local auth context
        updateUser({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        })

        setIsEditing(false)
        toast({
          title: "Success! ✅",
          description: "Profile updated successfully!",
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error ❌",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    }))
    setIsEditing(false)
  }

  const stats = useMemo(
    () => [
      {
        icon: Calendar,
        label: "Appointments",
        value: String(appointments.length),
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      { icon: Heart, label: "Health Score", value: "—", color: "text-green-500", bg: "bg-green-500/10" },
      { icon: Activity, label: "Active Days", value: "—", color: "text-purple-500", bg: "bg-purple-500/10" },
      { icon: Star, label: "Rating", value: "—", color: "text-yellow-500", bg: "bg-yellow-500/10" },
    ],
    [appointments.length],
  )

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (historyFilter !== "all" && apt.consultationType !== historyFilter) return false
      if (searchText) {
        const q = searchText.toLowerCase()
        return apt.doctorName.toLowerCase().includes(q) || apt.specialty.toLowerCase().includes(q)
      }
      return true
    })
  }, [appointments, historyFilter, searchText])

  const appointmentIdToPrescription = useMemo(() => {
    const map: Record<string, Prescription> = {}
    prescriptions.forEach((p) => {
      if (p.appointmentId) map[p.appointmentId] = p
    })
    return map
  }, [prescriptions])

  const getStatusClasses = (status: Appointment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/15 text-green-300 border-green-500/30"
      case "cancelled":
        return "bg-red-500/15 text-red-300 border-red-500/30"
      case "confirmed":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30"
      case "pending":
        return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30"
      default:
        return "bg-slate-500/15 text-slate-300 border-slate-500/30"
    }
  }

  const [showAttachmentsDialog, setShowAttachmentsDialog] = useState(false)
  const [attachmentsToView, setAttachmentsToView] = useState<
    { id: string; name: string; type: "image" | "pdf"; url: string }[]
  >([])
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)
  const [selectedAppointmentForView, setSelectedAppointmentForView] = useState<Appointment | null>(null)

  const handleVisitInput = (field: keyof typeof visitForm, value: string | any) => {
    setVisitForm((prev) => ({ ...prev, [field]: value }))
  }

  const toDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleVisitAttachmentUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const list: { id: string; name: string; type: "image" | "pdf"; url: string }[] = await Promise.all(
      Array.from(files).map(async (f, idx) => ({
        id: `${Date.now()}-${idx}`,
        name: f.name,
        type: f.type.startsWith("image/") ? "image" : "pdf",
        url: await toDataUrl(f),
      })),
    )
    setVisitForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...list] }))
  }

  const handleSubmitOfflineVisit = async () => {
    if (!user || !patient) return
    if (!visitForm.doctorName || !visitForm.specialty || !visitForm.date || !visitForm.time) {
      toast({
        title: "Missing info",
        description: "Doctor, specialty, date and time are required.",
        variant: "destructive",
      })
      return
    }
    setIsSubmittingVisit(true)
    try {
      const offlineDoctorId = `offline-${Date.now()}`
      // 1) Create appointment
      const newAppointment = await appointmentsAPI.create({
        doctorId: offlineDoctorId,
        patientId: user.id,
        date: visitForm.date,
        time: visitForm.time,
        status: "completed",
        doctorName: visitForm.doctorName,
        patientName: patient.name,
        specialty: visitForm.specialty,
        consultationType: visitForm.type,
        fee: 0,
      })

      // 2) Create prescription linked to appointment
      const medicines = visitForm.medicinesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [name, dosage] = line.split(" - ").map((s) => s.trim())
          return { name: name || line, dosage: dosage || "", duration: "", notes: "", frequency: "" }
        })

      const newPrescription = await prescriptionsAPI.create({
        appointmentId: newAppointment.id,
        patientId: user.id,
        doctorId: offlineDoctorId,
        datePrescribed: visitForm.date,
        timePrescribed: visitForm.time,
        medicines,
        generalNotes: undefined,
        patientName: patient.name,
        doctorName: visitForm.doctorName,
        symptoms: visitForm.symptoms || undefined,
        diagnosis: visitForm.diagnosis || undefined,
        followUpDate: visitForm.followUpDate || undefined,
        attachments: visitForm.attachments,
      })

      // 3) Attach prescription to appointment (status already completed)
      await appointmentsAPI.updateStatus(newAppointment.id, "completed", newPrescription.id)

      // 4) Update local state to reflect immediately
      setAppointments((prev) => [newAppointment, ...prev])
      setPrescriptions((prev) => [newPrescription, ...prev])
      toast({ title: "Saved", description: "Offline visit added to your history." })
      setShowAddVisitDialog(false)
      setVisitForm({
        doctorName: "",
        specialty: "",
        date: "",
        time: "",
        type: "clinic",
        diagnosis: "",
        symptoms: "",
        medicinesText: "",
        followUpDate: "",
        attachments: [],
      })
    } catch (e) {
      console.error(e)
      toast({ title: "Failed", description: "Could not save offline visit.", variant: "destructive" })
    } finally {
      setIsSubmittingVisit(false)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["patient"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 bg-green-500 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-500 rounded-full blur-2xl animate-pulse delay-3000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 sm:pb-12">
          {/* Header Section */}
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-500/20 backdrop-blur-sm">
              <User className="w-4 h-4" />
              <span>Patient Profile</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent mb-4 sm:mb-6">
              My Profile
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
              Manage your personal information and track your health journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Profile Card - Spans 2 columns on xl screens */}
            <motion.div
              className="xl:col-span-2"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="relative border-b border-slate-700/50 pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4 sm:space-x-6">
                      {/* Profile Avatar */}
                      <motion.div
                        className="relative group cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                          <span className="text-white text-2xl sm:text-3xl font-bold">
                            {user?.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "U"}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
                        <motion.div
                          className="absolute -bottom-1 -right-1 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ scale: 1.1 }}
                        >
                          <Camera className="w-4 h-4 text-blue-400" />
                        </motion.div>
                      </motion.div>

                      <div>
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-2">
                          {formData.name || user?.name || "User"}
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                          <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified Patient
                          </Badge>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                            <Star className="w-3 h-3 mr-1" />
                            Premium Member
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(!isEditing)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent backdrop-blur-sm shadow-lg"
                        disabled={isLoading}
                      >
                        {isEditing ? (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </CardHeader>

                <CardContent className="relative p-6 sm:p-8">
                  <AnimatePresence mode="wait">
                    <motion.form
                      key={isEditing ? "editing" : "viewing"}
                      onSubmit={handleSubmit}
                      className="space-y-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Personal Information Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="w-5 h-5 text-blue-400" />
                          <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                        </div>
                        <Separator className="bg-slate-700/50" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Full Name */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label htmlFor="name" className="text-slate-300 font-medium">
                              Full Name *
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                disabled={!isEditing || isLoading}
                                className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 transition-all duration-300 ${
                                  isEditing
                                    ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                                    : "cursor-default"
                                }`}
                                required
                              />
                            </div>
                          </motion.div>

                          {/* Email */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label htmlFor="email" className="text-slate-300 font-medium">
                              Email Address *
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                disabled={!isEditing || isLoading}
                                className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 transition-all duration-300 ${
                                  isEditing
                                    ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                                    : "cursor-default"
                                }`}
                                required
                              />
                            </div>
                          </motion.div>

                          {/* Primary Phone */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label htmlFor="phone" className="text-slate-300 font-medium">
                              Primary Phone *
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                disabled={!isEditing || isLoading}
                                className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 transition-all duration-300 ${
                                  isEditing
                                    ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                                    : "cursor-default"
                                }`}
                                required
                              />
                            </div>
                          </motion.div>

                          {/* Secondary Phone */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Secondary Phone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="tel"
                                value={formData.secondaryPhone}
                                onChange={(e) => handleInputChange("secondaryPhone", e.target.value)}
                                disabled={!isEditing || isLoading}
                                className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              />
                            </div>
                          </motion.div>

                          {/* Date of Birth */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Date of Birth</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                                disabled={!isEditing || isLoading}
                                className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              />
                            </div>
                          </motion.div>

                          {/* Gender */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Gender</Label>
                            <Select
                              value={formData.gender}
                              onValueChange={(value) => handleInputChange("gender", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Address */}
                          <motion.div
                            className="md:col-span-2 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Street Address</Label>
                            <div className="relative">
                              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                value={formData.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                disabled={!isEditing || isLoading}
                                className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              />
                            </div>
                          </motion.div>

                          {/* City */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">City</Label>
                            <Input
                              value={formData.city}
                              onChange={(e) => handleInputChange("city", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                            />
                          </motion.div>

                          {/* State */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">State</Label>
                            <Input
                              value={formData.state}
                              onChange={(e) => handleInputChange("state", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                            />
                          </motion.div>

                          {/* ZIP Code */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">ZIP Code</Label>
                            <Input
                              value={formData.zipCode}
                              onChange={(e) => handleInputChange("zipCode", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                            />
                          </motion.div>

                          {/* Country */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Country</Label>
                            <Select
                              value={formData.country}
                              onValueChange={(value) => handleInputChange("country", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <div className="flex items-center">
                                  <Globe className="w-4 h-4 mr-2 text-slate-400" />
                                  <SelectValue placeholder="Select country" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="india">India</SelectItem>
                                <SelectItem value="usa">United States</SelectItem>
                                <SelectItem value="uk">United Kingdom</SelectItem>
                                <SelectItem value="canada">Canada</SelectItem>
                                <SelectItem value="australia">Australia</SelectItem>
                                <SelectItem value="germany">Germany</SelectItem>
                                <SelectItem value="france">France</SelectItem>
                                <SelectItem value="japan">Japan</SelectItem>
                                <SelectItem value="singapore">Singapore</SelectItem>
                                <SelectItem value="uae">UAE</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Marital Status */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Marital Status</Label>
                            <Select
                              value={formData.maritalStatus}
                              onValueChange={(value) => handleInputChange("maritalStatus", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="married">Married</SelectItem>
                                <SelectItem value="divorced">Divorced</SelectItem>
                                <SelectItem value="widowed">Widowed</SelectItem>
                                <SelectItem value="separated">Separated</SelectItem>
                                <SelectItem value="domestic-partnership">Domestic Partnership</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Nationality */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Nationality</Label>
                            <Input
                              value={formData.nationality}
                              onChange={(e) => handleInputChange("nationality", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white placeholder-slate-400 ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                            />
                          </motion.div>

                          {/* Preferred Language */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Preferred Language</Label>
                            <Select
                              value={formData.preferredLanguage}
                              onValueChange={(value) => handleInputChange("preferredLanguage", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <div className="flex items-center">
                                  <Languages className="w-4 h-4 mr-2 text-slate-400" />
                                  <SelectValue placeholder="Select language" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="english">English</SelectItem>
                                <SelectItem value="hindi">Hindi</SelectItem>
                                <SelectItem value="spanish">Spanish</SelectItem>
                                <SelectItem value="french">French</SelectItem>
                                <SelectItem value="german">German</SelectItem>
                                <SelectItem value="chinese">Chinese</SelectItem>
                                <SelectItem value="japanese">Japanese</SelectItem>
                                <SelectItem value="arabic">Arabic</SelectItem>
                                <SelectItem value="portuguese">Portuguese</SelectItem>
                                <SelectItem value="russian">Russian</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>
                      </div>

                      {/* Medical Information Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="w-5 h-5 text-green-400" />
                          <h3 className="text-xl font-semibold text-white">Medical Information</h3>
                        </div>
                        <Separator className="bg-slate-700/50" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Blood Group */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Blood Group</Label>
                            <Select
                              value={formData.bloodGroup}
                              onValueChange={(value) => handleInputChange("bloodGroup", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <SelectValue placeholder="Select blood group" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="A+">A+</SelectItem>
                                <SelectItem value="A-">A-</SelectItem>
                                <SelectItem value="B+">B+</SelectItem>
                                <SelectItem value="B-">B-</SelectItem>
                                <SelectItem value="AB+">AB+</SelectItem>
                                <SelectItem value="AB-">AB-</SelectItem>
                                <SelectItem value="O+">O+</SelectItem>
                                <SelectItem value="O-">O-</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Height */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Height (cm)</Label>
                            <Input
                              type="number"
                              value={formData.heightCm}
                              onChange={(e) => handleInputChange("heightCm", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                            />
                          </motion.div>

                          {/* Weight */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Weight (kg)</Label>
                            <Input
                              type="number"
                              value={formData.weightKg}
                              onChange={(e) => handleInputChange("weightKg", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                            />
                          </motion.div>

                          {/* Insurance Provider */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Insurance Provider</Label>
                            <Select
                              value={formData.insuranceProvider}
                              onValueChange={(value) => handleInputChange("insuranceProvider", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <SelectValue placeholder="Select provider" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="aetna">Aetna</SelectItem>
                                <SelectItem value="blue-cross">Blue Cross Blue Shield</SelectItem>
                                <SelectItem value="cigna">Cigna</SelectItem>
                                <SelectItem value="humana">Humana</SelectItem>
                                <SelectItem value="united-health">United Health</SelectItem>
                                <SelectItem value="kaiser">Kaiser Permanente</SelectItem>
                                <SelectItem value="anthem">Anthem</SelectItem>
                                <SelectItem value="medicare">Medicare</SelectItem>
                                <SelectItem value="medicaid">Medicaid</SelectItem>
                                <SelectItem value="star-health">Star Health (India)</SelectItem>
                                <SelectItem value="hdfc-ergo">HDFC ERGO (India)</SelectItem>
                                <SelectItem value="icici-lombard">ICICI Lombard (India)</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Policy Number */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Policy Number</Label>
                            <Input
                              value={formData.policyNumber}
                              onChange={(e) => handleInputChange("policyNumber", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                            />
                          </motion.div>

                          {/* Group Number */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Group Number</Label>
                            <Input
                              value={formData.groupNumber}
                              onChange={(e) => handleInputChange("groupNumber", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                            />
                          </motion.div>

                          {/* Emergency Contact Name */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Emergency Contact Name</Label>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                value={formData.emergencyContactName}
                                onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                                disabled={!isEditing || isLoading}
                                className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              />
                            </div>
                          </motion.div>

                          {/* Emergency Contact Phone */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Emergency Contact Phone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="tel"
                                value={formData.emergencyContactPhone}
                                onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                                disabled={!isEditing || isLoading}
                                className={`pl-10 bg-slate-800/50 border-slate-600/50 text-white ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              />
                            </div>
                          </motion.div>

                          {/* Emergency Contact Relation */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Relationship</Label>
                            <Select
                              value={formData.emergencyContactRelation}
                              onValueChange={(value) => handleInputChange("emergencyContactRelation", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <SelectValue placeholder="Select relationship" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="spouse">Spouse</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                                <SelectItem value="friend">Friend</SelectItem>
                                <SelectItem value="partner">Partner</SelectItem>
                                <SelectItem value="guardian">Guardian</SelectItem>
                                <SelectItem value="relative">Relative</SelectItem>
                                <SelectItem value="colleague">Colleague</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Primary Care Physician */}
                          <motion.div
                            className="md:col-span-2 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Primary Care Physician</Label>
                            <Input
                              value={formData.primaryCarePhysician}
                              onChange={(e) => handleInputChange("primaryCarePhysician", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                            />
                          </motion.div>

                          {/* Medical ID Number */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Medical ID Number</Label>
                            <Input
                              value={formData.medicalIdNumber}
                              onChange={(e) => handleInputChange("medicalIdNumber", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                            />
                          </motion.div>

                          {/* Coverage Details */}
                          <motion.div
                            className="md:col-span-3 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Coverage Details</Label>
                            <Textarea
                              value={formData.coverageDetails}
                              onChange={(e) => handleInputChange("coverageDetails", e.target.value)}
                              disabled={!isEditing || isLoading}
                              className={`bg-slate-800/50 border-slate-600/50 text-white resize-none ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              rows={2}
                            />
                          </motion.div>

                          {/* Current Medications */}
                          <motion.div
                            className="md:col-span-3 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Current Medications</Label>
                            <Textarea
                              value={formData.currentMedications}
                              onChange={(e) => handleInputChange("currentMedications", e.target.value)}
                              disabled={!isEditing || isLoading}
                              placeholder="List your current medications, dosages, and frequency"
                              className={`bg-slate-800/50 border-slate-600/50 text-white resize-none ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              rows={3}
                            />
                          </motion.div>

                          {/* Allergies */}
                          <motion.div
                            className="md:col-span-3 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Allergies</Label>
                            <Textarea
                              value={formData.allergies}
                              onChange={(e) => handleInputChange("allergies", e.target.value)}
                              disabled={!isEditing || isLoading}
                              placeholder="List any drug, food, or environmental allergies"
                              className={`bg-slate-800/50 border-slate-600/50 text-white resize-none ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              rows={2}
                            />
                          </motion.div>

                          {/* Chronic Conditions */}
                          <motion.div
                            className="md:col-span-3 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Chronic Conditions</Label>
                            <Textarea
                              value={formData.chronicConditions}
                              onChange={(e) => handleInputChange("chronicConditions", e.target.value)}
                              disabled={!isEditing || isLoading}
                              placeholder="List any chronic medical conditions"
                              className={`bg-slate-800/50 border-slate-600/50 text-white resize-none ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              rows={2}
                            />
                          </motion.div>

                          {/* Past Surgeries */}
                          <motion.div
                            className="md:col-span-3 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Past Surgeries</Label>
                            <Textarea
                              value={formData.pastSurgeries}
                              onChange={(e) => handleInputChange("pastSurgeries", e.target.value)}
                              disabled={!isEditing || isLoading}
                              placeholder="List any previous surgeries with dates"
                              className={`bg-slate-800/50 border-slate-600/50 text-white resize-none ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              rows={2}
                            />
                          </motion.div>

                          {/* Family Medical History */}
                          <motion.div
                            className="md:col-span-3 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Family Medical History</Label>
                            <Textarea
                              value={formData.familyMedicalHistory}
                              onChange={(e) => handleInputChange("familyMedicalHistory", e.target.value)}
                              disabled={!isEditing || isLoading}
                              placeholder="List relevant family medical history"
                              className={`bg-slate-800/50 border-slate-600/50 text-white resize-none ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              rows={2}
                            />
                          </motion.div>

                          {/* Vaccination Records */}
                          <motion.div
                            className="md:col-span-3 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Vaccination Records</Label>
                            <Textarea
                              value={formData.vaccinationRecords}
                              onChange={(e) => handleInputChange("vaccinationRecords", e.target.value)}
                              disabled={!isEditing || isLoading}
                              placeholder="List recent vaccinations and dates"
                              className={`bg-slate-800/50 border-slate-600/50 text-white resize-none ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              rows={2}
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Lifestyle Information Section */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-2">
                          <Activity className="w-5 h-5 text-purple-400" />
                          <h3 className="text-xl font-semibold text-white">Lifestyle Information</h3>
                        </div>
                        <Separator className="bg-slate-700/50" />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Smoking Status */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Smoking Status</Label>
                            <Select
                              value={formData.smokingStatus}
                              onValueChange={(value) => handleInputChange("smokingStatus", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <div className="flex items-center">
                                  <Cigarette className="w-4 h-4 mr-2 text-slate-400" />
                                  <SelectValue placeholder="Select status" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="never">Never</SelectItem>
                                <SelectItem value="former">Former</SelectItem>
                                <SelectItem value="current">Current</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Alcohol Consumption */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Alcohol Consumption</Label>
                            <Select
                              value={formData.alcoholConsumption}
                              onValueChange={(value) => handleInputChange("alcoholConsumption", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <div className="flex items-center">
                                  <Wine className="w-4 h-4 mr-2 text-slate-400" />
                                  <SelectValue placeholder="Select frequency" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="never">Never</SelectItem>
                                <SelectItem value="occasionally">Occasionally</SelectItem>
                                <SelectItem value="moderately">Moderately</SelectItem>
                                <SelectItem value="frequently">Frequently</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Physical Activity Level */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Physical Activity Level</Label>
                            <Select
                              value={formData.physicalActivityLevel}
                              onValueChange={(value) => handleInputChange("physicalActivityLevel", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <div className="flex items-center">
                                  <Dumbbell className="w-4 h-4 mr-2 text-slate-400" />
                                  <SelectValue placeholder="Select level" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="sedentary">Sedentary</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="very-active">Very Active</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Occupation */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Occupation</Label>
                            <Select
                              value={formData.occupation}
                              onValueChange={(value) => handleInputChange("occupation", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <div className="flex items-center">
                                  <Briefcase className="w-4 h-4 mr-2 text-slate-400" />
                                  <SelectValue placeholder="Select occupation" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="software-engineer">Software Engineer</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="teacher">Teacher</SelectItem>
                                <SelectItem value="nurse">Nurse</SelectItem>
                                <SelectItem value="business-owner">Business Owner</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="consultant">Consultant</SelectItem>
                                <SelectItem value="student">Student</SelectItem>
                                <SelectItem value="retired">Retired</SelectItem>
                                <SelectItem value="homemaker">Homemaker</SelectItem>
                                <SelectItem value="freelancer">Freelancer</SelectItem>
                                <SelectItem value="artist">Artist</SelectItem>
                                <SelectItem value="lawyer">Lawyer</SelectItem>
                                <SelectItem value="accountant">Accountant</SelectItem>
                                <SelectItem value="sales">Sales Professional</SelectItem>
                                <SelectItem value="marketing">Marketing Professional</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Dietary Preferences */}
                          <motion.div
                            className="md:col-span-2 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Dietary Preferences & Restrictions</Label>
                            <div className="space-y-2">
                              <Label className="text-slate-300 font-medium">Dietary Type</Label>
                              <Select
                                value={formData.dietaryPreferences?.split(" - ")[0] || ""}
                                onValueChange={(value) => {
                                  const currentNotes = formData.dietaryPreferences?.split(" - ")[1] || ""
                                  handleInputChange(
                                    "dietaryPreferences",
                                    currentNotes ? `${value} - ${currentNotes}` : value,
                                  )
                                }}
                                disabled={!isEditing || isLoading}
                              >
                                <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                  <div className="flex items-center">
                                    <Utensils className="w-4 h-4 mr-2 text-slate-400" />
                                    <SelectValue placeholder="Select dietary type" />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                                  <SelectItem value="vegan">Vegan</SelectItem>
                                  <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                                  <SelectItem value="pescatarian">Pescatarian</SelectItem>
                                  <SelectItem value="keto">Keto</SelectItem>
                                  <SelectItem value="paleo">Paleo</SelectItem>
                                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                                  <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                                  <SelectItem value="dairy-free">Dairy-Free</SelectItem>
                                  <SelectItem value="low-carb">Low-Carb</SelectItem>
                                  <SelectItem value="diabetic">Diabetic Diet</SelectItem>
                                  <SelectItem value="no-restrictions">No Restrictions</SelectItem>
                                </SelectContent>
                              </Select>
                              <Textarea
                                value={formData.dietaryPreferences?.split(" - ")[1] || ""}
                                onChange={(e) => {
                                  const dietType = formData.dietaryPreferences?.split(" - ")[0] || ""
                                  handleInputChange(
                                    "dietaryPreferences",
                                    dietType ? `${dietType} - ${e.target.value}` : e.target.value,
                                  )
                                }}
                                disabled={!isEditing || isLoading}
                                placeholder="Additional dietary restrictions or notes..."
                                className={`bg-slate-800/50 border-slate-600/50 text-white resize-none ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                                rows={2}
                              />
                            </div>
                          </motion.div>

                          {/* Stress Level */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Stress Level</Label>
                            <Select
                              value={formData.stressLevel}
                              onValueChange={(value) => handleInputChange("stressLevel", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <div className="flex items-center">
                                  <Brain className="w-4 h-4 mr-2 text-slate-400" />
                                  <SelectValue placeholder="Select level" />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="very-high">Very High</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Sleep Hours */}
                          <motion.div
                            className="space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Sleep Hours (per night)</Label>
                            <Select
                              value={formData.sleepHours}
                              onValueChange={(value) => handleInputChange("sleepHours", value)}
                              disabled={!isEditing || isLoading}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
                                <SelectValue placeholder="Select hours" />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                <SelectItem value="less-than-5">Less than 5 hours</SelectItem>
                                <SelectItem value="5-6">5-6 hours</SelectItem>
                                <SelectItem value="7-8">7-8 hours</SelectItem>
                                <SelectItem value="9-10">9-10 hours</SelectItem>
                                <SelectItem value="more-than-10">More than 10 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>

                          {/* Exercise Habits */}
                          <motion.div
                            className="md:col-span-2 space-y-2"
                            whileHover={{ scale: isEditing ? 1.02 : 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Label className="text-slate-300 font-medium">Exercise Habits</Label>
                            <Textarea
                              value={formData.exerciseHabits}
                              onChange={(e) => handleInputChange("exerciseHabits", e.target.value)}
                              disabled={!isEditing || isLoading}
                              placeholder="Describe your exercise routine and frequency"
                              className={`bg-slate-800/50 border-slate-600/50 text-white resize-none ${isEditing ? "focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20" : "cursor-default"}`}
                              rows={2}
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-700/50"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-700/50 bg-transparent"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                              >
                                {isLoading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.form>
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar - Stats and Account Info */}
            <div className="xl:col-span-1 space-y-6">
              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-blue-400" />
                      Health Stats
                    </CardTitle>
                    <CardDescription className="text-slate-400">Your health journey overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-700/30 transition-colors duration-300"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                          </div>
                          <span className="text-slate-300 font-medium">{stat.label}</span>
                        </div>
                        <span className="text-white font-bold text-lg">{stat.value}</span>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Account Info Card */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.35 }}
              >
                <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-green-400" />
                      Account Information
                    </CardTitle>
                    <CardDescription className="text-slate-400">Your account details and status</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <motion.div
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <User className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-slate-300 font-medium">Account Type</span>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 capitalize">
                        {user?.role || "Patient"}
                      </Badge>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Calendar className="w-4 h-4 text-green-400" />
                        </div>
                        <span className="text-slate-300 font-medium">Member Since</span>
                      </div>
                      <span className="text-white font-semibold">January 2024</span>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Clock className="w-4 h-4 text-purple-400" />
                        </div>
                        <span className="text-slate-300 font-medium">Last Active</span>
                      </div>
                      <span className="text-white font-semibold">Just now</span>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <MapPin className="w-4 h-4 text-yellow-400" />
                        </div>
                        <span className="text-slate-300 font-medium">Location</span>
                      </div>
                      <span className="text-white font-semibold">{patient?.address || formData.address || "—"}</span>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Medical History - Full width below profile */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="xl:col-span-3"
            >
              <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white">My Medical History</CardTitle>
                  <CardDescription className="text-slate-400">
                    View all appointments and prescriptions; add offline visits
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Search doctor or specialty..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="bg-slate-800/50 border-slate-600/50 text-white"
                    />
                    <Select value={historyFilter} onValueChange={(v) => setHistoryFilter(v as any)}>
                      <SelectTrigger className="sm:w-48 bg-slate-800/50 border-slate-600/50 text-white">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 text-white">
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="clinic">Clinic</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      className="border-slate-600 text-slate-300 bg-transparent"
                      onClick={() => setShowAddVisitDialog(true)}
                    >
                      Add Offline Visit
                    </Button>
                  </div>
                  {filteredAppointments.length === 0 ? (
                    <div className="text-slate-300 text-center py-8">No records found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {filteredAppointments.map((apt) => {
                        const pre = appointmentIdToPrescription[apt.id]
                        return (
                          <div
                            key={apt.id}
                            className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer"
                            onClick={() => {
                              setSelectedAppointmentForView(apt)
                              setShowAppointmentDialog(true)
                            }}
                          >
                            <div className="flex items-center justify-between text-white">
                              <div className="font-semibold mr-2 line-clamp-1">
                                {apt.doctorName} • {apt.specialty}
                              </div>
                              <div className="text-xs text-slate-300 whitespace-nowrap">
                                {format(parseISO(apt.date), "dd MMM yyyy")} • {apt.time}
                              </div>
                            </div>
                            <div className="text-xs text-slate-300 mt-2 flex items-center gap-2">
                              <Badge className={`${getStatusClasses(apt.status)} capitalize`}>{apt.status}</Badge>
                              {pre && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 border-slate-600 text-slate-300 bg-transparent"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedPrescription(pre)
                                    setShowPrescriptionDialog(true)
                                  }}
                                >
                                  View
                                </Button>
                              )}
                            </div>
                            {pre && (
                              <div className="mt-3 text-xs text-slate-300 space-y-1">
                                <div>Dx: {pre.diagnosis || pre.symptoms || "—"}</div>
                                <div className="line-clamp-2">
                                  Rx: {pre.medicines?.map((m) => `${m.name} (${m.dosage})`).join(", ") || "—"}
                                </div>
                                {pre.followUpDate && (
                                  <div>Follow-up: {format(parseISO(pre.followUpDate), "dd MMM yyyy")}</div>
                                )}
                                {pre.attachments?.length ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 mt-1 border-slate-600 text-slate-300 bg-transparent"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setAttachmentsToView(pre.attachments!)
                                      setShowAttachmentsDialog(true)
                                    }}
                                  >
                                    View Attachments
                                  </Button>
                                ) : null}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {selectedPrescription && (
        <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] bg-slate-800 border-slate-700">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="sr-only">Prescription Details</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-64px)]">
              <PrescriptionDetailView prescription={selectedPrescription} patient={patient as any} doctor={undefined} />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Attachments Light Viewer */}
      <Dialog open={showAttachmentsDialog} onOpenChange={setShowAttachmentsDialog}>
        <DialogContent className="max-w-4xl bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Attachments</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
            {attachmentsToView.map((att) => (
              <div key={att.id} className="rounded-lg border border-white/10 p-3 bg-white/5">
                <div className="text-slate-300 text-sm mb-2 line-clamp-1">{att.name}</div>
                {att.type === "image" ? (
                  <img src={att.url || "/placeholder.svg"} alt={att.name} className="w-full h-auto rounded" />
                ) : (
                  <iframe src={att.url} className="w-full h-[360px] rounded" />
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Appointment Detail Viewer */}
      {selectedAppointmentForView && (
        <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] bg-slate-800 border-slate-700">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-white">Appointment Details</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-64px)] p-6">
              <div className="text-white text-lg font-semibold mb-2">
                {selectedAppointmentForView.doctorName} • {selectedAppointmentForView.specialty}
              </div>
              <div className="text-slate-300 mb-4">
                {format(parseISO(selectedAppointmentForView.date), "dd MMM yyyy")} • {selectedAppointmentForView.time} •{" "}
                <span className="capitalize">{selectedAppointmentForView.consultationType}</span>
              </div>
              <div className="mb-4">
                <Badge className={`${getStatusClasses(selectedAppointmentForView.status)} capitalize`}>
                  {selectedAppointmentForView.status}
                </Badge>
              </div>
              {(() => {
                const pre = appointmentIdToPrescription[selectedAppointmentForView.id]
                if (!pre) {
                  return <div className="text-slate-300">No prescription recorded.</div>
                }
                return (
                  <div className="space-y-3 text-slate-300">
                    <div>
                      <span className="text-slate-400">Diagnosis:</span> {pre.diagnosis || pre.symptoms || "—"}
                    </div>
                    <div>
                      <div className="text-slate-400">Medicines:</div>
                      <div>{pre.medicines?.map((m) => `${m.name} (${m.dosage})`).join(", ") || "—"}</div>
                    </div>
                    {pre.followUpDate && (
                      <div>
                        <span className="text-slate-400">Follow-up:</span>{" "}
                        {format(parseISO(pre.followUpDate), "dd MMM yyyy")}
                      </div>
                    )}
                    {pre.attachments?.length ? (
                      <div>
                        <div className="text-slate-400 mb-1">Attachments:</div>
                        <div className="flex flex-wrap gap-2">
                          {pre.attachments.map((att) => (
                            <Button
                              key={att.id}
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 border-slate-600 text-slate-300 bg-transparent"
                              onClick={() => {
                                setAttachmentsToView(pre.attachments!)
                                setShowAttachmentsDialog(true)
                              }}
                            >
                              {att.type.toUpperCase()} • {att.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })()}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Offline Visit Dialog */}
      <Dialog open={showAddVisitDialog} onOpenChange={setShowAddVisitDialog}>
        <DialogContent className="max-w-2xl bg-slate-800 border-slate-700 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-white">Add Offline Visit</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300">Doctor Name</Label>
                <Input
                  value={visitForm.doctorName}
                  onChange={(e) => handleVisitInput("doctorName", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Specialty</Label>
                <Input
                  value={visitForm.specialty}
                  onChange={(e) => handleVisitInput("specialty", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Date</Label>
                <Input
                  type="date"
                  value={visitForm.date}
                  onChange={(e) => handleVisitInput("date", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Time</Label>
                <Input
                  type="time"
                  value={visitForm.time}
                  onChange={(e) => handleVisitInput("time", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-300">Type</Label>
                <Select value={visitForm.type} onValueChange={(v) => handleVisitInput("type", v as any)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="clinic">Clinic</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-slate-300">Diagnosis</Label>
                <Input
                  value={visitForm.diagnosis}
                  onChange={(e) => handleVisitInput("diagnosis", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-slate-300">Symptoms</Label>
                <Input
                  value={visitForm.symptoms}
                  onChange={(e) => handleVisitInput("symptoms", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-slate-300">Medicines (one per line, format: Name - Dosage)</Label>
                <Textarea
                  value={visitForm.medicinesText}
                  onChange={(e) => handleVisitInput("medicinesText", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white min-h-28"
                />
              </div>
              <div>
                <Label className="text-slate-300">Follow-up Date</Label>
                <Input
                  type="date"
                  value={visitForm.followUpDate}
                  onChange={(e) => handleVisitInput("followUpDate", e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-slate-300">Attach Reports (images/PDF)</Label>
                <Input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(e) => handleVisitAttachmentUpload(e.target.files)}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                {visitForm.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-slate-300 text-xs">
                    {visitForm.attachments.map((att) => (
                      <span key={att.id} className="px-2 py-1 rounded border border-white/20">
                        {att.type.toUpperCase()} • {att.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 bg-transparent"
                onClick={() => setShowAddVisitDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitOfflineVisit}
                disabled={isSubmittingVisit}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isSubmittingVisit ? "Saving..." : "Save Visit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  )
}
