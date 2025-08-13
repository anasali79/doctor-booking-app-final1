"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { appointmentsAPI, prescriptionsAPI, patientsAPI, doctorsAPI, type Appointment, type Prescription, type Patient, type Doctor } from "@/lib/api"
import { CalendarIcon, Clock, User, CheckCircle, XCircle, Filter, Search, Phone, Mail, Edit, X, Video, Building, FileText, Eye, List, Calendar } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"

import DoctorCalendarView from "@/components/doctor-calendar-view"
import { PrescriptionForm } from "@/components/PrescriptionForm"
import { PrescriptionDetailView } from "@/components/PrescriptionDetailView"
 



export default function DoctorAppointmentsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState(searchParams?.get("filter") || "all")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [isRescheduling, setIsRescheduling] = useState(false)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("all")

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  // State for Prescription Form Dialog
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)
  const [appointmentToPrescribe, setAppointmentToPrescribe] = useState<Appointment | null>(null)

  // State for Prescription Detail View Dialog
  const [showPrescriptionDetailDialog, setShowPrescriptionDetailDialog] = useState(false)
  const [selectedPrescriptionForView, setSelectedPrescriptionForView] = useState<Prescription | null>(null)

  

  useEffect(() => {
    if (user) {
      loadAppointmentsAndRelatedData()
    }
  }, [user])

  useEffect(() => {
    if (viewMode === "list") {
      filterAppointments()
    } else {
      setFilteredAppointments(appointments)
    }
  }, [appointments, searchTerm, statusFilter, selectedDate, selectedTimeSlot, viewMode])

  const loadAppointmentsAndRelatedData = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const [appointmentsData, patientsData, doctorsData] = await Promise.all([
        appointmentsAPI.getByDoctorId(user.id),
        patientsAPI.getAll(),
        doctorsAPI.getAll(),
      ])
      setAppointments(appointmentsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
      setPatients(patientsData)
      setDoctors(doctorsData)
      console.log("Appointments, Patients, Doctors loaded.")
    } catch (error) {
      console.error("Failed to load data:", error)
      toast({
        title: "Error",
        description: "Failed to load appointments or related data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAppointments = () => {
    let currentFiltered = appointments
    if (selectedDate) {
      const selectedDateString = format(selectedDate, "yyyy-MM-dd")
      currentFiltered = currentFiltered.filter((apt) => apt.date === selectedDateString)
    }
    if (selectedTimeSlot !== "all") {
      currentFiltered = currentFiltered.filter((apt) => {
        const [hours, minutes] = apt.time.split(":").map(Number)
        const totalMinutes = hours * 60 + minutes
        if (selectedTimeSlot === "morning") {
          return totalMinutes >= 9 * 60 && totalMinutes < 12 * 60
        } else if (selectedTimeSlot === "afternoon") {
          return totalMinutes >= 12 * 60 && totalMinutes < 17 * 60
        } else if (selectedTimeSlot === "evening") {
          return totalMinutes >= 17 * 60 && totalMinutes < 22 * 60
        }
        return true
      })
    }
    if (searchTerm) {
      currentFiltered = currentFiltered.filter((apt) =>
        apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    if (statusFilter !== "all") {
      currentFiltered = currentFiltered.filter((apt) => apt.status === statusFilter)
    }
    setFilteredAppointments(currentFiltered)
  }

  const handleReschedule = async (appointmentId: string, newDate: string, newTime: string) => {
    setIsRescheduling(true)
    console.log("Calling appointmentsAPI.reschedule with:", { appointmentId, newDate, newTime })
    try {
      await appointmentsAPI.reschedule(appointmentId, newDate, newTime)
      // Set status to pending after rescheduling so it can be approved
      await appointmentsAPI.updateStatus(appointmentId, "pending")
      await loadAppointmentsAndRelatedData()
      toast({
        title: "Success",
        description: "Appointment rescheduled successfully! Please approve the new time.",
      })
      setSelectedAppointment(null)
      setRescheduleDate("")
      setRescheduleTime("")
    } catch (error) {
      console.error("Error rescheduling appointment via API:", error)
      toast({
        title: "Error",
        description: "Failed to reschedule appointment. Please check your network and API.",
        variant: "destructive",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const handlePrescriptionSuccess = async (prescription: Prescription) => {
    if (!appointmentToPrescribe || !user) return

    try {
      await appointmentsAPI.updateStatus(appointmentToPrescribe.id, "completed", prescription.id)
      toast({
        title: "Success",
        description: "Prescription saved and appointment marked as completed!",
      })
      setShowPrescriptionDialog(false)
      setAppointmentToPrescribe(null)
      await loadAppointmentsAndRelatedData()
    } catch (error) {
      console.error("Error linking prescription to appointment:", error)
      toast({
        title: "Error",
        description: "Failed to link prescription to appointment.",
        variant: "destructive",
      })
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment["status"]) => {
    console.log("Calling appointmentsAPI.updateStatus with:", { appointmentId, status })
    try {
      await appointmentsAPI.updateStatus(appointmentId, status)
      await loadAppointmentsAndRelatedData()
      toast({
        title: "Success",
        description: `Appointment ${status} successfully!`,
      })
    } catch (error) {
      console.error("Error updating appointment status via API:", error)
      toast({
        title: "Error",
        description: "Failed to update appointment. Please check your network and API.",
        variant: "destructive",
      })
    }
  }

  // Add missing handler functions
  const handleStatusUpdate = async (appointmentId: string, status: Appointment["status"]) => {
    await updateAppointmentStatus(appointmentId, status)
  }

  const handleCancel = async (appointmentId: string) => {
    await updateAppointmentStatus(appointmentId, "cancelled")
  }

  const handlePrescribe = (appointment: Appointment) => {
    setAppointmentToPrescribe(appointment)
    setShowPrescriptionDialog(true)
  }

  const handleViewPrescription = async (prescriptionId: string) => {
    try {
      const prescriptionData = await prescriptionsAPI.getById(prescriptionId)
      setSelectedPrescriptionForView(prescriptionData)
      setShowPrescriptionDetailDialog(true)
    } catch (error) {
      console.error("Failed to load prescription for view:", error)
      toast({
        title: "Error",
        description: `Failed to load prescription: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    }
  }

  // New handler to pass to DoctorCalendarView for opening prescription form
  const handlePrescribeAppointmentFromCalendar = (appointment: Appointment) => {
    setAppointmentToPrescribe(appointment);
    setShowPrescriptionDialog(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-300"
      case "completed":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  const groupAppointmentsByDate = (appointments: Appointment[]) => {
    const grouped: { [key: string]: Appointment[] } = {}
    appointments.forEach((appointment) => {
      const date = appointment.date
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(appointment)
    })
    return grouped
  }
  const groupedAppointments = groupAppointmentsByDate(filteredAppointments)

  const AppointmentCard = ({ 
    appointment, 
    index,
    onStatusUpdate,
    onReschedule,
    onCancel,
    onPrescribe,
    onViewPrescription
  }: { 
    appointment: Appointment; 
    index: number;
    onStatusUpdate: (appointmentId: string, status: Appointment["status"]) => Promise<void>;
    onReschedule: (appointmentId: string, newDate: string, newTime: string) => Promise<void>;
    onCancel: (appointmentId: string) => Promise<void>;
    onPrescribe: (appointment: Appointment) => void;
    onViewPrescription: (prescriptionId: string) => Promise<void>;
  }) => (
    <Card
      className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/50 bg-card/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-foreground dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="truncate">{appointment.patientName}</span>
          </CardTitle>
          <Badge className={`${getStatusColor(appointment.status)} text-sm transition-all duration-300 group-hover:scale-105`}>
            {appointment.status}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-sm text-muted-foreground dark:text-slate-400">
          <Clock className="w-4 h-4 mr-2" />
          {appointment.time}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="space-y-4">
          {/* Consultation Type */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-slate-400">
            {appointment.consultationType === "video" && <Video className="w-4 h-4 text-green-500" />}
            {appointment.consultationType === "call" && <Phone className="w-4 h-4 text-blue-500" />}
            {appointment.consultationType === "clinic" && <Building className="w-4 h-4 text-purple-500" />}
            <span className="capitalize">{appointment.consultationType} Consultation</span>
          </div>
          
          {/* Patient Contact Details */}
          <div className="space-y-2 p-3 bg-muted/30 dark:bg-slate-700/30 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-slate-400">
              <Phone className="w-4 h-4 text-blue-500" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground dark:text-slate-400">
              <Mail className="w-4 h-4 text-green-500" />
              <span>patient@example.com</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Mark as Complete Button - Opens Prescription Form */}
            {appointment.status === "confirmed" && (
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => onPrescribe(appointment)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Mark as Complete
              </Button>
            )}
            
            {/* Reschedule Button */}
            {appointment.status === "confirmed" && (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-teal-500/30 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 hover:border-teal-500/50"
                onClick={() => {
                  setSelectedAppointment(appointment)
                  setRescheduleDate(appointment.date)
                  setRescheduleTime(appointment.time)
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
            )}
            
            {/* Approve Button for Rescheduled Appointments */}
            {appointment.status === "pending" && (
              <Button
                size="sm"
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => onStatusUpdate(appointment.id, "confirmed")}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
            )}
            
            {/* Cancel Button */}
            <Button
              size="sm"
              variant="outline"
              className="w-full border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              onClick={() => onCancel(appointment.id)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            
            {/* View History Button */}
            <Link href={`/doctor/patients/${appointment.patientId}/history`}>
              <Button
                size="sm"
                variant="outline"
                className="w-full border-slate-500/30 text-slate-600 dark:text-slate-400 hover:bg-slate-500/10 hover:border-slate-500/50"
              >
                <Eye className="w-4 h-4 mr-2" />
                View History
              </Button>
            </Link>
            
            {/* View Prescription Button for Completed Appointments */}
            {appointment.status === "completed" && appointment.prescriptionId && (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50"
                onClick={() => onViewPrescription(appointment.prescriptionId!)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Prescription
              </Button>
            )}

            
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen pt-24 bg-gradient-to-br from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <DoctorNavbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-teal-500/10 text-teal-600 dark:text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-teal-500/20">
              <CalendarIcon className="w-4 h-4" />
              <span>Doctor Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-muted-foreground/60 bg-clip-text text-transparent mb-4">
              Manage Appointments
            </h1>
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto">
              View, manage, and schedule patient appointments efficiently
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-muted/50 dark:bg-slate-800/50 rounded-lg p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-md"
              >
                <List className="w-4 h-4 mr-2" />
                List View
              </Button>
              <Button
                variant={viewMode === "calendar" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendar")}
                className="rounded-md"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </div>

          {viewMode === "list" ? (
            <>
              {/* Search and Filters */}
              <div className="bg-card/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="search" className="text-foreground dark:text-slate-300">
                      Search Patients
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="search"
                        placeholder="Search by patient name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-foreground dark:text-slate-300">
                      Status Filter
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="bg-card text-foreground dark:bg-slate-800 dark:text-slate-200 border-border dark:border-slate-700 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-card text-foreground dark:bg-slate-800 dark:text-slate-200 border-border dark:border-slate-700 shadow-xl">
                        <SelectItem value="all" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">All Statuses</SelectItem>
                        <SelectItem value="pending" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Pending</SelectItem>
                        <SelectItem value="confirmed" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Confirmed</SelectItem>
                        <SelectItem value="completed" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Completed</SelectItem>
                        <SelectItem value="cancelled" className="text-foreground dark:text-slate-200 data-[highlighted]:bg-muted data-[highlighted]:text-foreground">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date" className="text-foreground dark:text-slate-300">
                      Date Filter
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
                      onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : undefined)}
                      className="bg-muted/50 dark:bg-slate-800/50 border-border dark:border-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Appointments List */}
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-muted/50 dark:bg-slate-800/50 rounded-xl p-6 animate-pulse"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-muted dark:bg-slate-700 rounded-full" />
                          <div className="flex-1">
                            <div className="h-4 bg-muted dark:bg-slate-700 rounded w-1/3 mb-2" />
                            <div className="h-3 bg-muted dark:bg-slate-700 rounded w-1/4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CalendarIcon className="w-12 h-12 text-teal-500 dark:text-teal-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No appointments found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm || statusFilter !== "all" || selectedDate
                        ? "Try adjusting your search criteria"
                        : "No appointments scheduled yet"}
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedAppointments).map(([date, dateAppointments]) => (
                    <div key={date} className="space-y-3">
                      {/* Date Header */}
                      <div className="flex items-center space-x-3">
                        <div className="w-1 h-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-foreground dark:text-white">
                          {format(new Date(date), "EEEE, MMMM d, yyyy")}
                        </h3>
                        <Badge variant="secondary" className="bg-muted/50 dark:bg-slate-700/50 text-muted-foreground dark:text-slate-300">
                          {dateAppointments.length} appointment{dateAppointments.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      {/* Appointments for this date */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                        {dateAppointments.map((appointment, index) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            index={index}
                            onStatusUpdate={handleStatusUpdate}
                            onReschedule={handleReschedule}
                            onCancel={handleCancel}
                            onPrescribe={handlePrescribe}
                            onViewPrescription={handleViewPrescription}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="bg-card/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-border/50">
              <DoctorCalendarView
                appointments={appointments}
                onReschedule={handleReschedule}
                onUpdateStatus={updateAppointmentStatus}
                onPrescribeAppointment={handlePrescribeAppointmentFromCalendar}
              />
            </div>
          )}
        </div>

        {/* Prescription Dialog */}
        {appointmentToPrescribe && (
          <Dialog open={showPrescriptionDialog} onOpenChange={setShowPrescriptionDialog}>
            <DialogContent className="max-w-xl md:max-w-2xl p-6 overflow-y-auto max-h-[90vh] bg-background dark:bg-slate-800 border-border dark:border-slate-700">
              <PrescriptionForm
                appointmentId={appointmentToPrescribe.id}
                patientId={appointmentToPrescribe.patientId}
                patientName={appointmentToPrescribe.patientName}
                doctorId={appointmentToPrescribe.doctorId}
                doctorName={appointmentToPrescribe.doctorName}
                onSuccess={handlePrescriptionSuccess}
                onClose={() => setShowPrescriptionDialog(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Reschedule Dialog */}
        {selectedAppointment && (
          <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
            <DialogContent className="max-w-md p-6 bg-background dark:bg-slate-800 border-border dark:border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-foreground dark:text-white">Reschedule Appointment</DialogTitle>
                <DialogDescription className="text-muted-foreground dark:text-slate-400">
                  Change the date and time for {selectedAppointment.patientName}'s appointment
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date" className="text-foreground dark:text-slate-300">
                    New Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="bg-muted/50 dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-foreground dark:text-slate-300">
                    New Time
                  </Label>
                  <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                    <SelectTrigger className="bg-muted/50 dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent className="bg-muted/50 dark:bg-slate-700 border-border dark:border-slate-600">
                      <SelectItem value="09:00">09:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="14:00">02:00 PM</SelectItem>
                      <SelectItem value="15:00">03:00 PM</SelectItem>
                      <SelectItem value="16:00">04:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleReschedule(selectedAppointment.id, rescheduleDate, rescheduleTime)}
                    disabled={isRescheduling || !rescheduleDate || !rescheduleTime}
                    className="flex-1 bg-teal-500 hover:bg-teal-600"
                  >
                    {isRescheduling ? "Rescheduling..." : "Reschedule"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Prescription Detail Dialog */}
        {selectedPrescriptionForView && (
          <Dialog open={showPrescriptionDetailDialog} onOpenChange={setShowPrescriptionDetailDialog}>
            <DialogContent className="max-w-4xl p-6 overflow-y-auto max-h-[90vh] bg-background dark:bg-slate-800 border-border dark:border-slate-700">
              <PrescriptionDetailView
                prescription={selectedPrescriptionForView}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ProtectedRoute>
  )
}
