"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { isValid } from "date-fns";
import {
  appointmentsAPI,
  patientsAPI,
  prescriptionsAPI,
  type Appointment,
  type Prescription,
  type Patient,
  doctorsAPI,
  type Doctor,
} from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import type { DateRange } from "react-day-picker"
import { Calendar as CalendarIcon, ArrowLeft, FileText, Filter, Download, Pill, Stethoscope, UserCircle2, Phone, Video, Building2, Search as SearchIcon, UploadCloud, AlertTriangle, Eye, User, Mail, Phone as PhoneIcon, MapPin, CalendarDays, Heart, Activity } from "lucide-react"
import jsPDF from "jspdf"
// html2canvas was tried for exact snapshot export, but the user prefers the print-format PDF
import { format, isAfter, isBefore, parseISO, parse } from "date-fns"
import Link from "next/link"
import { PrescriptionDetailView } from "@/components/PrescriptionDetailView"
import { useToast } from "@/hooks/use-toast"

export default function PatientMedicalHistoryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const patientId = params?.id
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)
  const [showPatientProfileDialog, setShowPatientProfileDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Filters
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [searchText, setSearchText] = useState<string>("") // doctor/diagnosis
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Hoisted parser to avoid temporal dead zone when used in hooks below
  function parsePrescriptionDate(value?: string | null): Date | null {
    if (!value) return null
    // Try ISO first
    try {
      const iso = parseISO(value)
      if (!isNaN(iso.getTime())) return iso
    } catch {}
    // Try common display formats
    const tryFormats = [
      "MMM dd yyyy 'at' hh:mm a",
      "dd MMM yyyy 'at' hh:mm a",
      "MMM dd yyyy",
      "dd MMM yyyy",
    ] as const
    for (const fmt of tryFormats) {
      try {
        const d = parse(value, fmt, new Date())
        if (!isNaN(d.getTime())) return d
      } catch {}
    }
    // Fallback to Date constructor
    try {
      const d = new Date(value)
      if (!isNaN(d.getTime())) return d
    } catch {}
    return null
  }

  useEffect(() => {
    const load = async () => {
      if (!patientId) return
      setIsLoading(true)
      try {
        const [p, apts, pres, docs] = await Promise.all([
          patientsAPI.getById(patientId),
          appointmentsAPI.getByPatientId(patientId),
          prescriptionsAPI.getByPatientId(patientId),
          doctorsAPI.getAll(),
        ])
        // Sort appointments newest first
        apts.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
        // Sort prescriptions newest first (robust parse)
        pres.sort((a, b) => {
          const db = parsePrescriptionDate(b.datePrescribed)?.getTime() ?? 0
          const da = parsePrescriptionDate(a.datePrescribed)?.getTime() ?? 0
          return db - da
        })

        setPatient(p)
        setAppointments(apts)
        setPrescriptions(pres)
        setDoctors(docs)
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [patientId])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const date = parseISO(apt.date)
      if (fromDate && isBefore(date, parseISO(fromDate))) return false
      if (toDate && isAfter(date, parseISO(toDate))) return false
      if (typeFilter !== "all" && apt.consultationType !== typeFilter) return false
      if (searchText) {
        const q = searchText.toLowerCase()
        const pre = prescriptions.find(p => p.appointmentId === apt.id)
        const diagnosis = pre?.diagnosis || pre?.symptoms || ""
        if (!apt.doctorName.toLowerCase().includes(q) && !diagnosis.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [appointments, fromDate, toDate, typeFilter, searchText, prescriptions])

  const filteredPrescriptions = useMemo(() => {
    return prescriptions.filter((pre) => {
      const date = parsePrescriptionDate(pre.datePrescribed) ?? new Date(0)
      if (fromDate && isBefore(date, parseISO(fromDate))) return false
      if (toDate && isAfter(date, parseISO(toDate))) return false
      if (searchText) {
        const q = searchText.toLowerCase()
        if (!(pre.doctorName?.toLowerCase().includes(q) || pre.diagnosis?.toLowerCase().includes(q) || pre.symptoms?.toLowerCase().includes(q))) return false
      }
      return true
    })
  }, [prescriptions, fromDate, toDate, searchText])

  const totals = useMemo(() => ({
    appointments: filteredAppointments.length,
    prescriptions: filteredPrescriptions.length,
  }), [filteredAppointments.length, filteredPrescriptions.length])

  const appointmentIdToPrescription = useMemo(() => {
    const map: Record<string, Prescription> = {}
    prescriptions.forEach((pre) => {
      if (pre.appointmentId) map[pre.appointmentId] = pre
    })
    return map
  }, [prescriptions])

  // Robust parser to handle ISO and formatted strings like "Aug 08 2025 at 03:05 PM"
  // (Hoisted version above is the one used)

  const getStatusBadge = (status: Appointment["status"]) => {
    const classes = {
      completed: "bg-green-500/15 text-green-300 border-green-500/25",
      cancelled: "bg-red-500/15 text-red-300 border-red-500/25",
      confirmed: "bg-blue-500/15 text-blue-300 border-blue-500/25",
      pending: "bg-yellow-500/15 text-yellow-300 border-yellow-500/25",
      approved: "bg-blue-500/15 text-blue-300 border-blue-500/25",
    } as const
    return classes[status] || "bg-slate-500/15 text-slate-300 border-slate-500/25"
  }

  const exportCsv = () => {
    const header = [
      "Date",
      "Time",
      "Type",
      "Doctor",
      "Specialty",
      "Status",
      "Diagnosis",
      "Medicines",
    ]
    const rows = filteredAppointments.map((apt) => {
      const pre = appointmentIdToPrescription[apt.id]
      const diagnosis = pre?.diagnosis || pre?.symptoms || ""
      const meds = pre?.medicines?.map((m) => `${m.name} (${m.dosage})`).join("; ") || ""
      return [apt.date, apt.time, apt.consultationType ?? "", apt.doctorName, apt.specialty, apt.status, diagnosis, meds]
    })
    const csv = [header, ...rows].map((r) => r.map((c) => `"${(c ?? "").toString().replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `medical-history-${patientId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAttachmentUpload = async (pre: Prescription, files: FileList | null) => {
    if (!files || files.length === 0) return
    try {
      setIsUploading(true)
      const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const newAttachments: { id: string; name: string; type: "image" | "pdf"; url: string }[] = await Promise.all(
        Array.from(files).map(async (f, idx) => ({
          id: `${Date.now()}-${idx}`,
          name: f.name,
          type: f.type.startsWith("image/") ? "image" : "pdf",
          url: await toDataUrl(f),
        }))
      )
      const updated = await prescriptionsAPI.update(pre.id, { attachments: [...(pre.attachments ?? []), ...newAttachments] })
      setPrescriptions((prev) => prev.map((p) => (p.id === pre.id ? updated : p)))
      toast({ title: "Uploaded", description: `${newAttachments.length} file(s) attached to prescription.` })
    } catch (e) {
      toast({ title: "Upload failed", description: "Could not attach files.", variant: "destructive" })
    } finally {
      setIsUploading(false)
    }
  }

  const TypeIcon = ({ type }: { type?: Appointment["consultationType"] }) => {
    if (type === "video") return <Video className="w-4 h-4 text-green-400" />
    if (type === "call") return <Phone className="w-4 h-4 text-blue-400" />
    return <Building2 className="w-4 h-4 text-purple-400" />
  }

  const handleDownloadPdf = async () => {
    // Use the browser's print dialog to leverage print CSS (best "print format")
    // Users can choose "Save as PDF" to get the exact print preview style
    window.print()
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <DoctorNavbar />
        <div className="h-20 sm:h-24" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:px-0">
          <div className="flex items-center gap-3 mb-6 no-print">
            <Button variant="outline" className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-muted-foreground dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
              Medical History
            </h1>
          </div>

          {/* Patient Header */}
          <Card className="mb-6 border border-border/50 dark:border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
                    <UserCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground dark:text-white">{patient?.name ?? "Patient"}</CardTitle>
                    <CardDescription className="text-muted-foreground dark:text-slate-400">{patient?.email} • {patient?.phone}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/doctor/patients`}>
                    <Button variant="outline" className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent no-print">Patients</Button>
                  </Link>
                  <Button 
                    className="bg-teal-600 hover:bg-teal-700 no-print"
                    onClick={() => setShowPatientProfileDialog(true)}
                  >
                    <User className="w-4 h-4 mr-2" /> View Profile
                  </Button>
                  <div className="flex gap-2">
                    <Button onClick={handleDownloadPdf} variant="outline" className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent no-print">
                      <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <Button onClick={exportCsv} variant="outline" className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent no-print">
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Filters, search, stats, view toggle */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 no-print">
            <Card className="border border-border/50 dark:border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-white text-lg flex items-center"><Filter className="w-4 h-4 mr-2" /> Filters</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="from" className="text-foreground dark:text-slate-300">From</Label>
                  <Input id="from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-600/50 text-foreground dark:text-white" />
                </div>
                <div>
                  <Label htmlFor="to" className="text-foreground dark:text-slate-300">To</Label>
                  <Input id="to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-600/50 text-foreground dark:text-white" />
                </div>
                <div>
                  <Label className="text-foreground dark:text-slate-300">Type</Label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-600/50 text-foreground dark:text-white"><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent className="bg-muted dark:bg-slate-800 border-border dark:border-slate-600 text-foreground dark:text-white">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-foreground dark:text-slate-300">Pick date range</Label>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {dateRange?.from && dateRange?.to
                            ? `${format(dateRange.from, "dd MMM yyyy")} - ${format(dateRange.to, "dd MMM yyyy")}`
                            : "Select range"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 bg-background dark:bg-slate-900 border border-border dark:border-slate-700" align="start">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => {
                            setDateRange(range)
                            if (range?.from) setFromDate(format(range.from,"yyyy-MM-dd"))
                            if (range?.to) setToDate(format(range.to,"yyyy-MM-dd"))
                          }}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="outline"
                      className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent"
                      onClick={() => { setFromDate(""); setToDate(""); setDateRange(undefined) }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <Label className="text-foreground dark:text-slate-300">Search by doctor or diagnosis</Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-slate-400 w-4 h-4" />
                    <Input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Dr. Sarah or Back Pain..."
                      className="pl-9 bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-600/50 text-foreground dark:text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 dark:border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80">
              <CardHeader>
                <CardTitle className="text-foreground dark:text-white text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div 
                  className="group p-4 rounded-xl bg-muted/30 dark:bg-white/5 border border-border/30 dark:border-white/10 cursor-pointer transition-all duration-200 hover:bg-teal-500/15 hover:border-teal-400/30 hover:ring-1 hover:ring-teal-400/20 hover:-translate-y-0.5"
                  onClick={() => scrollToSection('appointments-section')}
                >
                  <div className="text-muted-foreground dark:text-slate-400 text-sm flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-teal-300" />
                    <span className="transition-colors duration-200 group-hover:text-teal-200">Appointments</span>
                  </div>
                  <div className="text-2xl font-semibold text-foreground dark:text-white transition-colors duration-200 group-hover:text-teal-200">{totals.appointments}</div>
                </div>
                <div 
                  className="group p-4 rounded-xl bg-muted/30 dark:bg-white/5 border border-border/30 dark:border-white/10 cursor-pointer transition-all duration-200 hover:bg-emerald-500/15 hover:border-emerald-400/30 hover:ring-1 hover:ring-emerald-400/20 hover:-translate-y-0.5"
                  onClick={() => scrollToSection('prescriptions-section')}
                >
                  <div className="text-muted-foreground dark:text-slate-400 text-sm flex items-center gap-2">
                    <Pill className="w-4 h-4 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-emerald-300" />
                    <span className="transition-colors duration-200 group-hover:text-emerald-200">Prescriptions</span>
                  </div>
                  <div className="text-2xl font-semibold text-foreground dark:text-white transition-colors duration-200 group-hover:text-emerald-200">{totals.prescriptions}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
              <CardHeader>
                <CardTitle className="text-white text-lg">About</CardTitle>
                <CardDescription className="text-slate-400">Patient medical history overview</CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300 space-y-2">
                <div>View past appointments, diagnoses, and prescriptions grouped by date (newest first).</div>
                <div>Use filters to narrow down by date range and consultation type.</div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">View:</span>
                  <Button size="sm" variant={viewMode === "grid" ? "default" : "outline"} className={viewMode === "grid" ? "bg-teal-600 hover:bg-teal-700" : "border-slate-600 text-slate-300 bg-transparent"} onClick={() => setViewMode("grid")}>Grid</Button>
                  <Button size="sm" variant={viewMode === "timeline" ? "default" : "outline"} className={viewMode === "timeline" ? "bg-teal-600 hover:bg-teal-700" : "border-slate-600 text-slate-300 bg-transparent"} onClick={() => setViewMode("timeline")}>Timeline</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <div id="history-card-export" className="space-y-8">
            {/* Appointments */}
            <div id="appointments-section">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-5 h-5 text-teal-400" />
                <h2 className="text-xl font-semibold text-foreground dark:text-white">Appointments</h2>
              </div>
              <div className={viewMode === "timeline" ? "relative pl-6 space-y-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse bg-muted/50 dark:bg-slate-800/50">
                      <CardHeader>
                        <div className="h-6 bg-muted dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-muted dark:bg-slate-700 rounded w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-muted dark:bg-slate-700 rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <Card className="border border-border dark:border-slate-200 bg-card dark:bg-white">
                    <CardContent className="p-6 text-center">
                      <CalendarIcon className="w-12 h-12 text-muted-foreground dark:text-slate-500 mx-auto mb-3" />
                      <div className="text-foreground dark:text-black font-medium">No appointments found</div>
                      <div className="text-muted-foreground dark:text-black/70 text-sm">No appointments match your current filters.</div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredAppointments.map((apt, idx) => {
                    const pre = appointmentIdToPrescription[apt.id]
                    const diagnosis = pre?.diagnosis || pre?.symptoms
                    const hasPrescription = !!pre
                    const hasDiagnosis = !!diagnosis
                    const hasMedicines = pre?.medicines && pre.medicines.length > 0
                    const hasAttachments = pre?.attachments && pre.attachments.length > 0
                    
                    return (
                    <div key={apt.id} className={viewMode === "timeline" ? "relative" : ""}>
                      {viewMode === "timeline" && (
                        <>
                          <span className="absolute left-[-1.25rem] top-4 w-2 h-2 rounded-full bg-cyan-400" />
                          <span className="absolute left-[-1.02rem] top-4 -z-10 h-full w-0.5 bg-muted dark:bg-slate-700" />
                        </>
                      )}
                      <Card className={`border border-border/50 dark:border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 ${hasPrescription ? 'ring-1 ring-teal-500/20' : ''}`}>
                      <CardHeader>
                        <CardTitle className="text-foreground dark:text-white flex items-center justify-between">
                          <span>{format(parseISO(apt.date), "dd MMM yyyy")} • {apt.time}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusBadge(apt.status)} capitalize`}>{apt.status}</Badge>
                            <Badge className="bg-muted/20 dark:bg-white/10 text-foreground dark:text-slate-100 border-border/30 dark:border-white/20 capitalize flex items-center gap-1">
                              <TypeIcon type={apt.consultationType} /> {apt.consultationType}
                            </Badge>
                          </div>
                        </CardTitle>
                        <CardDescription className="text-muted-foreground dark:text-slate-400">
                          {apt.doctorName} • {apt.specialty}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-foreground dark:text-slate-300 space-y-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-cyan-400" />
                          <span>Status: {apt.status}</span>
                        </div>
                        
                        {/* Diagnosis Section */}
                        <div className={`rounded-lg p-3 ${hasDiagnosis ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-muted/20 dark:bg-slate-500/10 border border-border/30 dark:border-slate-500/20'}`}>
                          <div className="text-muted-foreground dark:text-slate-400 text-sm mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4" />
                            Diagnosis & Symptoms
                          </div>
                          {hasDiagnosis ? (
                            <div className="flex flex-wrap gap-2">
                              {diagnosis.split(",").map(d => d.trim()).filter(Boolean).slice(0,6).map((tag, i) => (
                                <Badge key={i} className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{tag}</Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-muted-foreground dark:text-slate-400 text-sm italic">No diagnosis recorded</div>
                          )}
                        </div>

                        {/* Prescription Section */}
                        <div className={`rounded-lg p-3 ${hasPrescription ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-muted/20 dark:bg-slate-500/10 border border-border/30 dark:border-slate-500/20'}`}>
                          <div className="text-muted-foreground dark:text-slate-400 text-sm mb-2 flex items-center gap-2">
                            <Pill className="w-4 h-4" />
                            Prescription Details
                          </div>
                          {hasPrescription ? (
                            <div className="space-y-2">
                              {/* Medicines */}
                              <div>
                                <div className="text-foreground dark:text-slate-300 text-sm font-medium mb-1">Medicines:</div>
                                {hasMedicines ? (
                                  <div className="flex flex-wrap gap-1">
                                    {pre.medicines!.map((med, idx) => (
                                      <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                        {med.name} ({med.dosage})
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground dark:text-slate-400 text-sm italic">No medicines prescribed</div>
                                )}
                              </div>

                              {/* Follow-up */}
                              {pre.followUpDate && (
                                <div>
                                  <div className="text-foreground dark:text-slate-300 text-sm font-medium mb-1">Follow-up:</div>
                                  <div className="text-foreground dark:text-slate-300 text-sm">
                                    {(() => {
                                      try {
                                        const d = parseISO(pre.followUpDate)
                                        return isNaN(d.getTime()) ? "Invalid date" : format(d, "dd MMM yyyy")
                                      } catch {
                                        return "Invalid date"
                                      }
                                    })()}
                                  </div>
                                </div>
                              )}

                              {/* Attachments */}
                              {hasAttachments && (
                                <div>
                                  <div className="text-foreground dark:text-slate-300 text-sm font-medium mb-1">Attachments:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {pre.attachments!.map(att => (
                                      <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 rounded border border-border/30 dark:border-white/20 text-foreground dark:text-slate-200 hover:bg-muted/20 dark:hover:bg-white/10">
                                        {att.type === "pdf" ? "📄 PDF" : "🖼️ Image"}: {att.name}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Upload and View Buttons */}
                              <div className="flex items-center gap-2 pt-2">
                                <label className="inline-flex items-center gap-2 text-xs cursor-pointer text-muted-foreground dark:text-slate-300 hover:text-foreground dark:hover:text-slate-200">
                                  <UploadCloud className="w-4 h-4" />
                                  <span>{isUploading ? "Uploading..." : "Attach report"}</span>
                                  <input type="file" className="hidden" multiple accept="image/*,application/pdf" onChange={(e) => handleAttachmentUpload(pre, e.target.files)} />
                                </label>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-500/40 text-blue-200 hover:bg-blue-500/20"
                                  onClick={() => { setSelectedPrescription(pre); setShowPrescriptionDialog(true) }}
                                >
                                  <Eye className="w-4 h-4 mr-2" /> View Full Prescription
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-muted-foreground dark:text-slate-400 text-sm italic">No prescription recorded for this appointment</div>
                          )}
                        </div>
                      </CardContent>
                      </Card>
                    </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Prescriptions */}
            <div id="prescriptions-section">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold text-foreground dark:text-white">Prescriptions</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse bg-muted/50 dark:bg-slate-800/50">
                      <CardHeader>
                        <div className="h-6 bg-muted dark:bg-slate-700 rounded w-3/4" />
                        <div className="h-4 bg-muted dark:bg-slate-700 rounded w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <div className="h-20 bg-muted dark:bg-slate-700 rounded" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredPrescriptions.length === 0 ? (
                  <Card className="border border-slate-200 bg-white">
                    <CardContent className="p-6 text-center">
                      <Pill className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <div className="text-black font-medium">No prescriptions found</div>
                      <div className="text-black/70 text-sm">No prescriptions match your current filters.</div>
                    </CardContent>
                  </Card>
                ) : (
                  filteredPrescriptions.map((pre) => {
                    const prescriptionDate = parsePrescriptionDate(pre.datePrescribed)
                    
                    return (
                    <Card key={pre.id} className="border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>
                            {prescriptionDate ? format(prescriptionDate, "dd MMM yyyy") : "Date not available"}
                            {pre.timePrescribed ? ` • ${pre.timePrescribed}` : ""}
                          </span>
                          <Badge className="bg-white/10 text-slate-100 border-white/20 capitalize">{pre.doctorName}</Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {pre.diagnosis || pre.symptoms || "No diagnosis recorded"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-slate-300 space-y-3">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <div className="text-slate-300 text-sm font-medium mb-2">Medicines</div>
                          {pre.medicines && pre.medicines.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {pre.medicines.map((med, idx) => (
                                <Badge key={idx} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                  {med.name} ({med.dosage})
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="text-slate-400 text-sm italic">No medicines prescribed</div>
                          )}
                        </div>
                        
                        {pre.followUpDate && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                            <div className="text-slate-300 text-sm font-medium mb-1">Follow-up Date</div>
                            <div className="text-slate-300 text-sm">
                              {(() => {
                                try {
                                  const d = parseISO(pre.followUpDate)
                                  return isNaN(d.getTime()) ? "Invalid date" : format(d, "dd MMM yyyy")
                                } catch {
                                  return "Invalid date"
                                }
                              })()}
                            </div>
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-blue-500/40 text-blue-200 hover:bg-blue-500/20"
                          onClick={() => { setSelectedPrescription(pre); setShowPrescriptionDialog(true) }}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View Full Prescription
                        </Button>
                      </CardContent>
                    </Card>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Patient context: allergies and chronic conditions */}
          {patient && (patient.allergies?.length || patient.chronicConditions?.length) ? (
            <Card className="mt-8 border-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-400" /> Patient Notes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {patient.allergies?.length ? (
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Allergies</div>
                    <div className="flex flex-wrap gap-2">
                    {Array.isArray(patient.allergies) ? (
  patient.allergies.map((a, i) => (
    <Badge key={i} className="bg-amber-500/15 text-amber-300 border-amber-500/20">{a}</Badge>
  ))
) : patient.allergies ? (
  <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/20">{patient.allergies}</Badge>
) : (
  <span className="text-slate-500">No allergies recorded</span>
)}
                    </div>
                  </div>
                ) : null}
                {patient.chronicConditions?.length ? (
                  <div>
                    <div className="text-slate-400 text-sm mb-1">Chronic Conditions</div>
                    <div className="flex flex-wrap gap-2">
                    {Array.isArray(patient.chronicConditions) ? (
  patient.chronicConditions.map((c, i) => (
    <Badge key={i} className="bg-pink-500/15 text-pink-300 border-pink-500/20">{c}</Badge>
  ))
) : patient.chronicConditions ? (
  <Badge className="bg-pink-500/15 text-pink-300 border-pink-500/20">{patient.chronicConditions}</Badge>
) : (
  <span className="text-slate-500">No chronic conditions recorded</span>
)}
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          {/* Follow-up reminder card */}
          {filteredPrescriptions.length > 0 && (() => {
            const upcoming = filteredPrescriptions
              .map(p => ({ p, d: (() => { try { const _d = parseISO(p.followUpDate || ""); return isNaN(_d.getTime()) ? null : _d } catch { return null } })() }))
              .filter(x => x.d && x.d.getTime() >= new Date().setHours(0,0,0,0))
              .sort((a,b) => (a.d!.getTime() - b.d!.getTime()))
            if (!upcoming.length) return null
            const next = upcoming[0]
            return (
              <Card className="mt-6 border border-teal-200/40 bg-white text-slate-800">
                <CardContent className="py-4">
                  <div className="text-sm text-slate-600">Next follow-up</div>
                  <div className="text-lg font-semibold">
                    {format(next.d!, "dd MMM yyyy")} with {next.p.doctorName}
                  </div>
                </CardContent>
              </Card>
            )
          })()}

          {/* Patient Profile Dialog */}
          {patient && (
            <Dialog open={showPatientProfileDialog} onOpenChange={setShowPatientProfileDialog}>
              <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white text-xl flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Patient Profile
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Full Name</div>
                      <div className="text-white font-medium">{patient.name}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Email</div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {patient.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Phone</div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" />
                        {patient.phone}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Date of Birth</div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        {patient.dateOfBirth || "Not provided"}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {patient.address && (
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Address</div>
                      <div className="text-white font-medium flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {patient.address}
                      </div>
                    </div>
                  )}

                  {/* Medical Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Blood Group</div>
                      <div className="text-white font-medium">{patient.bloodGroup || "Not provided"}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Height</div>
                      <div className="text-white font-medium">{patient.heightCm ? `${patient.heightCm} cm` : "Not provided"}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Weight</div>
                      <div className="text-white font-medium">{patient.weightKg ? `${patient.weightKg} kg` : "Not provided"}</div>
                    </div>
                  </div>

                  {/* Insurance */}
                  {patient.insuranceProvider && (
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm">Insurance Provider</div>
                      <div className="text-white font-medium">{patient.insuranceProvider}</div>
                      {patient.policyNumber && (
                        <div className="text-slate-400 text-sm">Policy Number: {patient.policyNumber}</div>
                      )}
                    </div>
                  )}

                  {/* Allergies */}
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Allergies
                      </div>
                      <div className="flex flex-wrap gap-2">
                      {Array.isArray(patient.chronicConditions) ? (
  patient.chronicConditions.map((c, i) => (
    <Badge key={i} className="bg-pink-500/15 text-pink-300 border-pink-500/20">{c}</Badge>
  ))
) : patient.chronicConditions ? (
  <Badge className="bg-pink-500/15 text-pink-300 border-pink-500/20">{patient.chronicConditions}</Badge>
) : (
  <span className="text-slate-500">No chronic conditions recorded</span>
)}
                      </div>
                    </div>
                  )}

                  {/* Chronic Conditions */}
                  {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-slate-400 text-sm flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Chronic Conditions
                      </div>
                      <div className="flex flex-wrap gap-2">
                      {Array.isArray(patient.chronicConditions) ? (
  patient.chronicConditions.map((condition, idx) => (
    <Badge key={idx} className="bg-pink-500/15 text-pink-300 border-pink-500/20">
      {condition}
    </Badge>
  ))
) : patient.chronicConditions ? (
  <Badge className="bg-pink-500/15 text-pink-300 border-pink-500/20">
    {patient.chronicConditions}
  </Badge>
) : (
  <span className="text-slate-500">No chronic conditions recorded</span>
)}
                      </div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Prescription Viewer */}
          {selectedPrescription && (
            <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
              <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[90vh] bg-slate-800 border-slate-700">
                <DialogHeader className="p-6 pb-0">
                  <DialogTitle className="sr-only">Prescription Details</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[calc(90vh-64px)]">
                  <PrescriptionDetailView
                    prescription={selectedPrescription}
                    patient={patient as Patient}
                    doctor={doctors.find(d => d.id === selectedPrescription.doctorId) || undefined}
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}


