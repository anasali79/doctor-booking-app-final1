"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { appointmentsAPI, type Appointment } from "@/lib/api"
import { Calendar, Users, Clock, TrendingUp, Activity, Bell, ChevronRight, Eye, Edit, X, Phone, Video, Building, FileText } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { PrescriptionForm } from "@/components/PrescriptionForm" // Import PrescriptionForm

export default function DoctorDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleTime, setRescheduleTime] = useState("")
  const [isRescheduling, setIsRescheduling] = useState(false)

  // State for Prescription Form Dialog
  const [showPrescriptionDialog, setShowPrescriptionDialog] = useState(false)
  const [appointmentToPrescribe, setAppointmentToPrescribe] = useState<Appointment | null>(null)

  useEffect(() => {
    if (user) {
      loadAppointments()
    }
  }, [user])

  const loadAppointments = async () => {
    if (!user) return

    try {
      const appointmentsData = await appointmentsAPI.getByDoctorId(user.id)
      setAppointments(appointmentsData || [])

      // Calculate stats
      const stats = {
        total: appointmentsData?.length || 0,
        pending: appointmentsData?.filter((a) => a.status === "pending").length || 0,
        confirmed: appointmentsData?.filter((a) => a.status === "confirmed").length || 0,
        completed: appointmentsData?.filter((a) => a.status === "completed").length || 0,
      }

      setStats(stats)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTodayString = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const todayAppointments = appointments.filter((appointment) => {
    let appointmentDate = appointment.date
    if (appointmentDate && typeof appointmentDate === 'object' && 'toISOString' in appointmentDate) {
      appointmentDate = (appointmentDate as Date).toISOString().split("T")[0]
    }
    if (typeof appointmentDate === "string" && appointmentDate.includes("T")) {
      appointmentDate = appointmentDate.split("T")[0]
    }
    return appointmentDate === getTodayString()
  })

  const upcomingAppointments = appointments
    .filter((apt) => {
      let aptDate = apt.date
      if (aptDate && typeof aptDate === 'object' && 'toISOString' in aptDate) {
        aptDate = (aptDate as Date).toISOString().split("T")[0]
      }
      if (typeof aptDate === "string" && aptDate.includes("T")) {
        aptDate = aptDate.split("T")[0]
      }
      return new Date(aptDate) >= new Date(getTodayString()) && apt.status === "confirmed"
    })
    .slice(0, 5)

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime) return

    setIsRescheduling(true)
    try {
      await appointmentsAPI.reschedule(selectedAppointment.id, rescheduleDate, rescheduleTime)

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id ? { ...apt, date: rescheduleDate, time: rescheduleTime } : apt,
        ),
      )

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully!",
      })

      setSelectedAppointment(null)
      setRescheduleDate("")
      setRescheduleTime("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reschedule appointment",
        variant: "destructive",
      })
    } finally {
      setIsRescheduling(false)
    }
  }

  const handlePrescriptionSuccess = async (prescription: any) => {
    if (!appointmentToPrescribe || !user) return

    try {
      // Update appointment status to 'completed' and link prescription
      await appointmentsAPI.updateStatus(appointmentToPrescribe.id, "completed", prescription.id)
      toast({
        title: "Success",
        description: "Prescription saved and appointment marked as completed!",
      })
      setShowPrescriptionDialog(false)
      setAppointmentToPrescribe(null)
      await loadAppointments() // Reload appointments to reflect changes
    } catch (error) {
      console.error("Error linking prescription to appointment:", error)
      toast({
        title: "Error",
        description: "Failed to link prescription to appointment.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = async (appointmentId: string) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, "cancelled")

      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: "cancelled" } : apt)))

      toast({
        title: "Success",
        description: "Appointment cancelled successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (appointmentId: string, status: Appointment["status"]) => {
    try {
      await appointmentsAPI.updateStatus(appointmentId, status)

      setAppointments((prev) => prev.map((apt) => (apt.id === appointmentId ? { ...apt, status } : apt)))

      toast({
        title: "Success",
        description: `Appointment ${status} successfully!`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      })
    }
  }

  const StatCard = ({ title, value, description, icon: Icon, color, onClick }: any) => (
    <Card
      className="relative overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 border-0 bg-card/50 dark:bg-gradient-to-br dark:from-slate-900/50 dark:to-slate-800/50 backdrop-blur-sm cursor-pointer"
      onClick={onClick}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-foreground dark:text-slate-200">{title}</CardTitle>
        <div
          className={`p-2 rounded-lg bg-gradient-to-r ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground dark:text-white mb-1 transition-all duration-300 group-hover:scale-110">
          {isLoading ? <div className="h-6 sm:h-8 w-12 sm:w-16 bg-muted dark:bg-slate-700 rounded animate-pulse" /> : value}
        </div>
        <p className="text-xs text-muted-foreground dark:text-slate-400">{description}</p>
      </CardContent>
    </Card>
  )

  const AppointmentCard = ({
    appointment,
    index,
    showActions = true,
  }: { appointment: Appointment; index: number; showActions?: boolean }) => (
    <div
      className="group p-4 sm:p-6 bg-gradient-to-r from-muted/50 to-muted/30 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl border border-border/30 dark:border-slate-600/30 hover:border-teal-500/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="relative">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm sm:text-lg font-bold">
                {appointment.patientName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "P"}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-background dark:border-slate-800" />
          </div>
          <div>
            <p className="text-foreground dark:text-white font-semibold text-base sm:text-xl group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
              {appointment.patientName || "Unknown Patient"}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-muted-foreground dark:text-slate-400 text-xs sm:text-sm mt-1 space-y-1 sm:space-y-0">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{appointment.time || "No time set"}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{appointment.date}</span>
              </div>
            </div>
          </div>
        </div>
        <Badge
          className={`${
            appointment.status === "confirmed"
              ? "bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30"
              : appointment.status === "pending"
                ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border-yellow-500/30"
                : appointment.status === "cancelled"
                  ? "bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/30"
                  : "bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30"
          } transition-all duration-300 group-hover:scale-105 px-2 sm:px-3 py-1 text-xs sm:text-sm`}
        >
          {appointment.status}
        </Badge>
      </div>

      {/* Consultation Type */}
      <div className="flex items-center space-x-2 mb-4">
        {appointment.consultationType === "video" && <Video className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 dark:text-green-400" />}
        {appointment.consultationType === "call" && <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400" />}
        {appointment.consultationType === "clinic" && <Building className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 dark:text-purple-400" />}
        <span className="text-muted-foreground dark:text-slate-300 text-xs sm:text-sm capitalize">
          {appointment.consultationType} Consultation
        </span>
      </div>

      {showActions && (
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {appointment.status === "pending" && (
            <>
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(appointment.id, "confirmed")}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancel(appointment.id)}
                className="flex-1 border-red-500/30 text-red-600 dark:text-red-300 hover:bg-red-500/10 hover:border-red-500/50 text-xs sm:text-sm"
              >
                Cancel
              </Button>
            </>
          )}

          {appointment.status === "confirmed" && (
            <>
              <Button
                size="sm"
                onClick={() => {
                  setAppointmentToPrescribe(appointment)
                  setShowPrescriptionDialog(true)
                }}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Complete
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedAppointment(appointment)}
                    className="border-teal-500/30 text-teal-600 dark:text-teal-300 hover:bg-teal-500/10 text-xs sm:text-sm"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Reschedule</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-background dark:bg-slate-800 border-border dark:border-slate-700 max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-foreground dark:text-white">Reschedule Appointment</DialogTitle>
                    <DialogDescription className="text-muted-foreground dark:text-slate-400">
                      Change the date and time for {appointment.patientName}'s appointment
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
                        className="bg-muted dark:bg-slate-700 border-border dark:border-slate-600 text-foreground dark:text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="time" className="text-foreground dark:text-slate-300">
                        New Time
                      </Label>
                      <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                        <SelectTrigger className="bg-muted dark:bg-slate-700 border-border dark:border-slate-600">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-muted dark:bg-slate-700 border-border dark:border-slate-600">
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
                        onClick={handleReschedule}
                        disabled={isRescheduling || !rescheduleDate || !rescheduleTime}
                        className="flex-1 bg-teal-500 hover:bg-teal-600"
                      >
                        {isRescheduling ? "Rescheduling..." : "Reschedule"}
                      </Button>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent">
                          Cancel
                        </Button>
                      </DialogTrigger>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCancel(appointment.id)}
                className="border-red-500/30 text-red-600 dark:text-red-300 hover:bg-red-500/10 sm:w-auto w-full"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </>
          )}
          {appointment.status === "completed" && appointment.prescriptionId && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/doctor/prescriptions/${appointment.prescriptionId}/edit`)}
              className="w-full border-blue-500/30 text-blue-600 dark:text-blue-300 hover:bg-blue-500/10"
            >
              <FileText className="w-4 h-4 mr-1" /> View Prescription
            </Button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen pt-24 bg-gradient-to-br from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <DoctorNavbar />
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Header Section */}
          <div className="mb-8 sm:mb-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-teal-500/10 text-teal-600 dark:text-teal-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 border border-teal-500/20">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Doctor Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-muted-foreground/60 bg-clip-text text-transparent mb-4">
              Welcome back, Dr. {user?.name?.split(" ")[1] || user?.name}
            </h1>
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto">
              Manage your practice efficiently with real-time insights and patient management tools
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
            <StatCard
              title="Total Appointments"
              value={stats.total}
              description="All time appointments"
              icon={Calendar}
              color="from-blue-500 to-blue-600"
              onClick={() => router.push("/doctor/appointments")}
            />
            <StatCard
              title="Pending Reviews"
              value={stats.pending}
              description="Awaiting confirmation"
              icon={Clock}
              color="from-yellow-500 to-orange-500"
              onClick={() => router.push("/doctor/appointments?filter=pending")}
            />
            <StatCard
              title="Confirmed Today"
              value={todayAppointments.filter((apt) => apt.status === "confirmed").length}
              description="Ready to see patients"
              icon={Users}
              color="from-green-500 to-emerald-500"
              onClick={() => router.push("/doctor/appointments?filter=confirmed")}
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              description="Successfully treated"
              icon={TrendingUp}
              color="from-purple-500 to-pink-500"
              onClick={() => router.push("/doctor/appointments?filter=completed")}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
            {/* Today's Appointments */}
            <div className="xl:col-span-2">
              <Card className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm shadow-2xl">
                <CardHeader className="border-b border-border/50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-teal-500 dark:text-teal-400" />
                        Today's Schedule
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-2 text-sm sm:text-base">
                        {todayAppointments.length} appointments scheduled for today
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-teal-500/30 text-teal-600 dark:text-teal-300 hover:bg-teal-500/10 bg-transparent text-xs sm:text-sm"
                      onClick={loadAppointments}
                    >
                      <Bell className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 p-4 bg-muted/50 dark:bg-slate-800/50 rounded-lg animate-pulse"
                        >
                          <div className="w-10 h-10 sm:w-14 sm:h-14 bg-muted dark:bg-slate-700 rounded-full" />
                          <div className="flex-1">
                            <div className="h-4 sm:h-5 bg-muted dark:bg-slate-700 rounded w-1/3 mb-2" />
                            <div className="h-3 sm:h-4 bg-muted dark:bg-slate-700 rounded w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : todayAppointments.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-teal-500 dark:text-teal-400" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No appointments today</h3>
                      <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                        {appointments.length > 0
                          ? `You have ${appointments.length} total appointments, but none for today`
                          : "No appointments scheduled yet"}
                      </p>
                      <Button
                        onClick={() => router.push("/doctor/appointments")}
                        className="bg-teal-500 hover:bg-teal-600 text-sm sm:text-base"
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        View All Appointments
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {todayAppointments.map((appointment, index) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} index={index} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Upcoming */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start text-white shadow-lg hover:shadow-xl text-xs sm:text-sm transition-[background-position,_box-shadow,_transform] duration-500 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 bg-[length:200%_100%] bg-left hover:bg-right"
                    onClick={() => router.push("/doctor/appointments")}
                  >
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    View All Appointments
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border text-foreground bg-transparent text-xs sm:text-sm transition-all duration-500 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-gradient-to-r hover:from-teal-500/5 hover:via-cyan-500/5 hover:to-teal-500/5"
                    onClick={() => router.push("/doctor/prescriptions")}
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    View Prescriptions
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border text-foreground bg-transparent text-xs sm:text-sm transition-all duration-500 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-gradient-to-r hover:from-teal-500/5 hover:via-cyan-500/5 hover:to-teal-500/5"
                    onClick={() => router.push("/doctor/patients")}
                  >
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Patient Records
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border text-foreground bg-transparent text-xs sm:text-sm transition-all duration-500 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-gradient-to-r hover:from-teal-500/5 hover:via-cyan-500/5 hover:to-teal-500/5"
                    onClick={() => router.push("/doctor/analytics")}
                  >
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-border text-foreground bg-transparent text-xs sm:text-sm transition-all duration-500 hover:border-teal-500/50 hover:text-teal-600 dark:hover:text-teal-300 hover:bg-gradient-to-r hover:from-teal-500/5 hover:via-cyan-500/5 hover:to-teal-500/5"
                    onClick={() => router.push("/doctor/schedule")}
                  >
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Manage Schedule
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card className="border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl font-bold text-foreground">Upcoming</CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">Next confirmed appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4 text-sm">No upcoming appointments</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingAppointments.map((appointment, index) => (
                        <div
                          key={appointment.id}
                          className="flex items-center space-x-3 p-3 bg-muted/30 dark:bg-slate-800/30 rounded-lg hover:bg-muted/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                          onClick={() => router.push("/doctor/appointments")}
                        >
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                            {appointment.patientName
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "P"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-foreground text-xs sm:text-sm font-medium truncate">
                              {appointment.patientName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {appointment.date} at {appointment.time}
                            </p>
                          </div>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
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
      </div>
    </ProtectedRoute>
  )
}
