interface Medicine {
  name: string
  dosage: string
  duration: string
  notes: string
  frequency: string
}

export interface Prescription {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  datePrescribed: string
  timePrescribed?: string
  medicines: Medicine[]
  generalNotes?: string
  patientName: string // Added for easier display
  doctorName: string // Added for easier display
  symptoms?: string
  diagnosis?: string
  // New fields for detailed prescription card
  vitals?: {
    temperature?: string
    bp?: string
    pulse?: string
  }
  testsRecommended?: string // Changed to string for simplicity in form, can be comma-separated
  followUpDate?: string
  doctorSignatureText?: string // For digital signature representation (doctor's name)
  attachments?: { id: string; name: string; type: "image" | "pdf"; url: string }[]
}

// New: Review interface for doctor feedback
export interface Review {
  id: string
  doctorId: string
  patientId: string
  appointmentId: string
  rating: number // 1-5
  message?: string
  patientName?: string
  createdAt: string
}

// Existing interfaces and types
export interface Doctor {
  id: string
  name: string
  email: string
  phone: string
  specialty: string
  qualifications: string
  experience: string
  clinicAddress: string
  availability?: TimeSlot[]
  image?: string
  rating?: number
  reviewCount?: number
  consultationFee?: number
  videoConsultationFee?: number
  about?: string
  timeSlots?: string[]
  consultationType?: string[]
}

// Updated Patient interface with comprehensive profile fields
export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  age?: number
  gender?: "Male" | "Female" | "Other"

  // Personal Information (expanded)
  secondaryPhone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  dateOfBirth?: string
  maritalStatus?: string
  nationality?: string
  preferredLanguage?: string

  // Medical Information (expanded)
  bloodGroup?: string
  heightCm?: number
  weightKg?: number
  insuranceProvider?: string
  policyNumber?: string
  groupNumber?: string
  coverageDetails?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  primaryCarePhysician?: string
  medicalIdNumber?: string
  currentMedications?: string
  allergies?: string // Changed from string[] to string for easier form handling
  chronicConditions?: string // Changed from string[] to string for easier form handling
  pastSurgeries?: string
  familyMedicalHistory?: string
  vaccinationRecords?: string

  // Lifestyle Information (new)
  smokingStatus?: string
  alcoholConsumption?: string
  exerciseHabits?: string
  dietaryPreferences?: string
  occupation?: string
  stressLevel?: string
  sleepHours?: string
  physicalActivityLevel?: string

  // Keep password for authentication
  password?: string
}

export interface TimeSlot {
  id: string
  doctorId: string
  date: string
  time: string
  isBooked: boolean
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed" | "approved"

export interface Appointment {
  id: string
  doctorId: string
  patientId: string
  date: string
  time: string
  status: AppointmentStatus
  doctorName: string
  patientName: string
  specialty: string
  followUp?: string
  paymentStatus?: "paid" | "pending" | "failed"
  consultationType?: "video" | "call" | "clinic"
  prescriptionId?: string // New field to link to prescription
  fee?: number
}

const BASE_URL = "https://server-side-api-pelg.onrender.com"

// Check if JSON Server is running
const checkServerStatus = async () => {
  try {
    const response = await fetch(`${BASE_URL}/doctors`, { method: "HEAD" })
    return response.ok
  } catch (error) {
    return false
  }
}

// Auth API
export const authAPI = {
  async login(email: string, password: string, role: "doctor" | "patient") {
    try {
      const endpoint = role === "doctor" ? "doctors" : "patients"
      const response = await fetch(`${BASE_URL}/${endpoint}`)

      if (!response.ok) {
        return {
          success: false,
          message: "Server not responding. Please make sure JSON Server is running.",
          user: null,
        }
      }

      const users = await response.json()
      const user = users.find((u: any) => u.email === email && u.password === password)

      if (!user) {
        return {
          success: false,
          message: "Invalid email or password",
          user: null,
        }
      }

      // Return success response with user data
      return {
        success: true,
        message: "Login successful",
        user: { ...user, role },
      }
    } catch (error) {
      console.error("Login error:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          message: "Cannot connect to server. Please check your internet connection.",
          user: null,
        }
      }
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
        user: null,
      }
    }
  },

  async signup(userData: any, role: "doctor" | "patient") {
    try {
      const endpoint = role === "doctor" ? "doctors" : "patients"

      // Check if user already exists
      const existingResponse = await fetch(`${BASE_URL}/${endpoint}`)
      if (existingResponse.ok) {
        const existingUsers = await existingResponse.json()
        const userExists = existingUsers.find((u: any) => u.email === userData.email)
        if (userExists) {
          return {
            success: false,
            message: "User with this email already exists",
            user: null,
          }
        }
      }

      const response = await fetch(`${BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...userData,
          id: Date.now().toString(),
          password: userData.password,
        }),
      })

      if (!response.ok) {
        return {
          success: false,
          message: "Server not responding. Please make sure JSON Server is running.",
          user: null,
        }
      }

      const user = await response.json()
      return {
        success: true,
        message: "Signup successful",
        user: { ...user, role },
      }
    } catch (error) {
      console.error("Signup error:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        return {
          success: false,
          message: "Cannot connect to server. Please check your internet connection.",
          user: null,
        }
      }
      return {
        success: false,
        message: "An unexpected error occurred. Please try again.",
        user: null,
      }
    }
  },
}

// Doctors API
export const doctorsAPI = {
  async getAll(): Promise<Doctor[]> {
    try {
      const response = await fetch(`${BASE_URL}/doctors`)
      if (!response.ok) {
        throw new Error("Failed to fetch doctors")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getById(id: string): Promise<Doctor> {
    try {
      const response = await fetch(`${BASE_URL}/doctors/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch doctor")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async update(id: string, data: Partial<Doctor>): Promise<Doctor> {
    try {
      const response = await fetch(`${BASE_URL}/doctors/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update doctor")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
}

// Reviews API
export const reviewsAPI = {
  async create(review: Omit<Review, "id" | "createdAt">): Promise<Review> {
    try {
      const payload = { ...review, id: Date.now().toString(), createdAt: new Date().toISOString() }
      const response = await fetch(`${BASE_URL}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error("Failed to create review")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' and ensure /reviews resource exists.")
      }
      throw error
    }
  },
  async getByDoctorId(doctorId: string): Promise<Review[]> {
    try {
      const response = await fetch(`${BASE_URL}/reviews?doctorId=${doctorId}`)
      if (!response.ok) throw new Error("Failed to fetch reviews")
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' and ensure /reviews resource exists.")
      }
      throw error
    }
  },
  async getByAppointmentId(appointmentId: string): Promise<Review[]> {
    const response = await fetch(`${BASE_URL}/reviews?appointmentId=${appointmentId}`)
    if (!response.ok) throw new Error("Failed to fetch review for appointment")
    return response.json()
  },
  async update(id: string, data: Partial<Review>): Promise<Review> {
    const response = await fetch(`${BASE_URL}/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error("Failed to update review")
    return response.json()
  },
  async delete(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/reviews/${id}`, { method: "DELETE" })
    if (!response.ok) throw new Error("Failed to delete review")
  },
  async searchByDoctor({
    doctorId,
    page = 1,
    limit = 12,
    minStars,
    query,
    sortBy = "newest",
  }: {
    doctorId: string
    page?: number
    limit?: number
    minStars?: number
    query?: string
    sortBy?: "newest" | "oldest" | "highest" | "lowest"
  }): Promise<{ items: Review[]; total: number }> {
    const sortMap: Record<string, { sort: string; order: "asc" | "desc" }> = {
      newest: { sort: "createdAt", order: "desc" },
      oldest: { sort: "createdAt", order: "asc" },
      highest: { sort: "rating", order: "desc" },
      lowest: { sort: "rating", order: "asc" },
    }
    const { sort, order } = sortMap[sortBy]
    const params = new URLSearchParams()
    params.set("doctorId", doctorId)
    params.set("_page", String(page))
    params.set("_limit", String(limit))
    params.set("_sort", sort)
    params.set("_order", order)
    if (minStars && minStars > 0) params.set("rating_gte", String(minStars))
    if (query && query.trim()) params.set("q", query.trim())
    const url = `${BASE_URL}/reviews?${params.toString()}`
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch reviews")
    const items: Review[] = await response.json()
    const totalHeader = response.headers.get("X-Total-Count")
    const total = totalHeader ? Number(totalHeader) : items.length
    return { items, total }
  },
}

// Utility: recalculate and update doctor's average rating from reviews
export async function updateDoctorAggregateRating(doctorId: string) {
  try {
    const reviews = await reviewsAPI.getByDoctorId(doctorId)
    const reviewCount = reviews.length
    const rating = reviewCount > 0 ? Number((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviewCount).toFixed(2)) : 0
    await doctorsAPI.update(doctorId, { rating, reviewCount })
  } catch (e) {
    console.error("Failed to update doctor aggregate rating:", e)
  }
}

// Patients API (Enhanced with comprehensive profile support)
export const patientsAPI = {
  async getById(id: string): Promise<Patient> {
    try {
      const response = await fetch(`${BASE_URL}/patients/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch patient details")
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching patient details:", error)
      throw error
    }
  },
  async getAll(): Promise<Patient[]> {
    try {
      const response = await fetch(`${BASE_URL}/patients`)
      if (!response.ok) {
        throw new Error("Failed to fetch patients")
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching patients:", error)
      throw error
    }
  },
  async update(id: string, data: Partial<Patient>): Promise<Patient> {
    try {
      const response = await fetch(`${BASE_URL}/patients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update patient")
      }
      return response.json()
    } catch (error) {
      console.error("Error updating patient:", error)
      throw error
    }
  },
  async create(data: Omit<Patient, "id">): Promise<Patient> {
    try {
      const response = await fetch(`${BASE_URL}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, id: Date.now().toString() }),
      })
      if (!response.ok) {
        throw new Error("Failed to create patient profile")
      }
      return response.json()
    } catch (error) {
      console.error("Error creating patient profile:", error)
      throw error
    }
  },
}

// Appointments API
export const appointmentsAPI = {
  async create(appointment: Omit<Appointment, "id">): Promise<Appointment> {
    try {
      const response = await fetch(`${BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...appointment, id: Date.now().toString() }),
      })
      if (!response.ok) {
        throw new Error("Failed to create appointment")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getByDoctorId(doctorId: string): Promise<Appointment[]> {
    console.log(`Fetching appointments from: ${BASE_URL}/appointments?doctorId=${doctorId}`)
    try {
      const response = await fetch(`${BASE_URL}/appointments?doctorId=${doctorId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getByPatientId(patientId: string): Promise<Appointment[]> {
    try {
      const response = await fetch(`${BASE_URL}/appointments?patientId=${patientId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch appointments")
      }
      return response.json()
    } catch (error) {
      console.error("Error fetching appointments:", error)
      throw error
    }
  },
  async getById(id: string): Promise<Appointment> {
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch appointment")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async reschedule(id: string, newDate: string, newTime: string): Promise<Appointment> {
    console.log(`Attempting to PATCH ${BASE_URL}/appointments/${id} with new date/time and status 'pending'...`)
    console.log("New Date:", newDate, "New Time:", newTime)
    try {
      const response = await fetch(`${BASE_URL}/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date: newDate, time: newTime, status: "pending" }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`)
      }
      const updatedAppointment: Appointment = await response.json()
      console.log("Appointment rescheduled successfully:", updatedAppointment)
      return updatedAppointment
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
      throw error
    }
  },
  async updateStatus(id: string, status: Appointment["status"], prescriptionId?: string): Promise<Appointment> {
    try {
      const body: { status: Appointment["status"]; prescriptionId?: string } = { status }
      if (prescriptionId) {
        body.prescriptionId = prescriptionId
      }
      const response = await fetch(`${BASE_URL}/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        throw new Error("Failed to update appointment")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
}

// Prescriptions API
export const prescriptionsAPI = {
  async create(prescription: Omit<Prescription, "id">): Promise<Prescription> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...prescription, id: Date.now().toString() }),
      })
      if (!response.ok) {
        throw new Error("Failed to create prescription")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getAll(): Promise<Prescription[]> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions`)
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getByPatientId(patientId: string): Promise<Prescription[]> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions?patientId=${patientId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch prescriptions for patient")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async getById(id: string): Promise<Prescription> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions/${id}`)
      if (!response.ok) {
        // If response is not ok, it means 404 or other error
        if (response.status === 404) {
          throw new Error(`Prescription with ID ${id} not found.`)
        }
        throw new Error(`Failed to fetch prescription: ${response.statusText}`)
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async update(id: string, data: Partial<Prescription>): Promise<Prescription> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        throw new Error("Failed to update prescription")
      }
      return response.json()
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}/prescriptions/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete prescription")
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please run 'npm run json-server' in a separate terminal.")
      }
      throw error
    }
  },
}

// Export server status check function
export { checkServerStatus }
