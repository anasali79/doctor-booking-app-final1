"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { DoctorNavbar } from "@/components/DoctorNavbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Search, Phone, Mail, Calendar, ArrowLeft, Eye, MapPin, CalendarDays, Heart, AlertTriangle, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { appointmentsAPI, patientsAPI, type Appointment, type Patient } from "@/lib/api"
import { format, parseISO } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PatientsPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [doctorAppointments, setDoctorAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [showPatientProfileDialog, setShowPatientProfileDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setIsLoading(true)
      try {
        const [patients, appointments] = await Promise.all([
          patientsAPI.getAll(),
          appointmentsAPI.getByDoctorId(user.id),
        ])
        setAllPatients(patients)
        setDoctorAppointments(appointments)
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [user])

  const patientStats = useMemo(() => {
    const map: Record<string, { lastVisit?: string; total: number }> = {}
    doctorAppointments.forEach((apt) => {
      const current = map[apt.patientId] || { total: 0 }
      current.total += 1
      try {
        const d = parseISO(apt.date)
        const last = current.lastVisit ? parseISO(current.lastVisit) : null
        if (!last || d.getTime() > last.getTime()) current.lastVisit = apt.date
      } catch {
        // ignore invalid
      }
      map[apt.patientId] = current
    })
    return map
  }, [doctorAppointments])

  const patientsForThisDoctor = useMemo(() => {
    const ids = new Set(doctorAppointments.map((a) => a.patientId))
    const onlyRelevant = allPatients.filter((p) => ids.has(p.id))
    const withComputed = onlyRelevant.map((p) => {
      const stats = patientStats[p.id] || { total: 0 }
      return {
        ...p,
        lastVisit: stats.lastVisit,
        totalAppointments: stats.total,
        status: "Active" as const,
      }
    })
    if (!searchTerm) return withComputed
    const q = searchTerm.toLowerCase()
    return withComputed.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone || "").toLowerCase().includes(q),
    )
  }, [allPatients, doctorAppointments, patientStats, searchTerm])

  const filteredPatients = useMemo(() => {
    let filtered = patientsForThisDoctor

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          (p.phone || "").toLowerCase().includes(q),
      )
    }

    return filtered
  }, [patientsForThisDoctor, searchTerm])

  const PatientCard = ({ patient }: { patient: any }) => (
    <Card className="group hover:shadow-2xl  transition-all duration-500 hover:-translate-y-2 border-0 bg-card/80 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground dark:text-white flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-white" />
            </div>
            {patient.name}
          </CardTitle>
          <Badge className="bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/30">{patient.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-muted-foreground dark:text-slate-300 text-sm">
          <Mail className="w-4 h-4" />
          <span>{patient.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-muted-foreground dark:text-slate-300 text-sm">
          <Phone className="w-4 h-4" />
          <span>{patient.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-muted-foreground dark:text-slate-300 text-sm">
          <Calendar className="w-4 h-4" />
          <span>
            Last visit: {patient.lastVisit ? format(parseISO(patient.lastVisit), "dd MMM yyyy") : "—"}
          </span>
        </div>
        <div className="pt-3 grid grid-cols-2 gap-2">
          <Button
            size="sm"
            className="w-full bg-teal-500 hover:bg-teal-600"
            onClick={() => {
              const full = allPatients.find((p) => p.id === patient.id) || null
              setSelectedPatient(full)
              setShowPatientProfileDialog(true)
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Link href={`/doctor/patients/${patient.id}/history`}>
            <Button size="sm" variant="outline" className="w-full border-border dark:border-slate-600 text-foreground dark:text-slate-300 bg-transparent">
              Medical History
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute allowedRoles={["doctor"]}>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <DoctorNavbar />
        <div className="h-20 sm:h-24" aria-hidden="true" />
        <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-teal-500/10 text-teal-600 dark:text-teal-300 px-4 py-2 rounded-full text-sm font-medium mb-4 border border-teal-500/20">
              <Users className="w-4 h-4" />
              <span>Doctor Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-muted-foreground to-muted-foreground/60 bg-clip-text text-transparent mb-4">
              Patient Records
            </h1>
            <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto">
              View and manage your patient information and medical history
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-card/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-border/50">
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
          </div>

          {/* Patients Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted/50 dark:bg-slate-800/50 rounded-xl p-6 animate-pulse"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-muted dark:bg-slate-700 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted dark:bg-slate-700 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-muted dark:bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted dark:bg-slate-700 rounded w-full" />
                    <div className="h-3 bg-muted dark:bg-slate-700 rounded w-3/4" />
                    <div className="h-3 bg-muted dark:bg-slate-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-teal-500 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No patients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || specialtyFilter !== "all"
                  ? "Try adjusting your search criteria"
                  : "No patients registered yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          )}

	          {/* View Details Dialog */}
	          <Dialog open={showPatientProfileDialog} onOpenChange={setShowPatientProfileDialog}>
	            <DialogContent className="sm:max-w-lg">
	              <DialogHeader>
	                <DialogTitle className="flex items-center gap-2">
	                  <UserIcon className="w-5 h-5 text-teal-600" />
	                  Patient Details
	                </DialogTitle>
	              </DialogHeader>
	              {selectedPatient ? (
	                <div className="space-y-4">
	                  <div className="flex items-center gap-3">
	                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
	                      {selectedPatient.name?.charAt(0)?.toUpperCase()}
	                    </div>
	                    <div>
	                      <p className="text-lg font-semibold text-foreground dark:text-white">{selectedPatient.name}</p>
	                      <p className="text-sm text-muted-foreground">{selectedPatient.id}</p>
	                    </div>
	                  </div>
	                  <div className="space-y-2">
	                    <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-300">
	                      <Mail className="w-4 h-4" />
	                      <span>{selectedPatient.email || "—"}</span>
	                    </div>
	                    <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-300">
	                      <Phone className="w-4 h-4" />
	                      <span>{selectedPatient.phone || "—"}</span>
	                    </div>
	                    {selectedPatient.address && (
	                      <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-slate-300">
	                        <MapPin className="w-4 h-4" />
	                        <span className="break-words">{selectedPatient.address}</span>
	                      </div>
	                    )}
	                  </div>
	                  <div className="flex gap-2 pt-2">
	                    <Link href={`/doctor/patients/${selectedPatient.id}/history`} className="flex-1">
	                      <Button variant="outline" className="w-full border-border dark:border-slate-600 text-foreground dark:text-slate-300">
	                        Medical History
	                      </Button>
	                    </Link>
	                    <Button className="flex-1" onClick={() => setShowPatientProfileDialog(false)}>
	                      Close
	                    </Button>
	                  </div>
	                </div>
	              ) : (
	                <p className="text-sm text-muted-foreground">No patient selected.</p>
	              )}
	            </DialogContent>
	          </Dialog>
        </div>
      </div>
    </ProtectedRoute>
  )
}
