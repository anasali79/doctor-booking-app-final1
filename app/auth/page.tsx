"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Eye, EyeOff, Stethoscope, GraduationCap, Briefcase, MapPin, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AnimatedInput } from "@/components/ui/animated-input"
import { AnimatedSelect } from "@/components/ui/animated-select"
// Fixed import paths to use correct API location
import { authAPI } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

const medicalSpecialties = [
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "endocrinology", label: "Endocrinology" },
  { value: "gastroenterology", label: "Gastroenterology" },
  { value: "neurology", label: "Neurology" },
  { value: "oncology", label: "Oncology" },
  { value: "ophthalmology", label: "Ophthalmology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "pulmonology", label: "Pulmonology" },
  { value: "radiology", label: "Radiology" },
  { value: "rheumatology", label: "Rheumatology" },
  { value: "urology", label: "Urology" },
]

const qualifications = [
  { value: "mbbs", label: "MBBS" },
  { value: "md", label: "MD" },
  { value: "ms", label: "MS" },
  { value: "dm", label: "DM" },
  { value: "mch", label: "MCh" },
]

const experienceOptions = [
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10+", label: "10+ years" },
]

export default function AuthPage() {
  const [role, setRole] = useState<"patient" | "doctor">("patient")
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: "",
    qualifications: "",
    experience: "",
    clinicAddress: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  // Added useAuth hook to access authentication context
  const { login } = useAuth()
  const router = useRouter()

  const handleInputChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      [key]: value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        // Updated to use authAPI from lib/api and login from AuthContext
        const response = await authAPI.login(formData.email, formData.password, role)
        if (response.success && response.user) {
          login(response.user)
        toast("Login successful!", {
            description: "Welcome back to MediCare!",
            duration: 3000,
          })
          router.push("/")
        } else {
          alert(response.message || "Login failed")
        }
      } else {
        // Signup logic
        const signupData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          ...(role === "doctor" && {
            specialty: formData.specialty,
            qualifications: formData.qualifications,
            experience: formData.experience,
            clinicAddress: formData.clinicAddress,
          }),
        }

        const response = await authAPI.signup(signupData, role)
        if (response.success && response.user) {
          login(response.user)
          toast("Signup successful!", {
            description: "Welcome to MediCare!",
            duration: 3000,
          })
          router.push("/")
        } else {
          alert(response.message || "Signup failed")
        }
      }
    } catch (error) {
      console.error("Auth error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen bg-gray-100 overflow-hidden">
      <div className="relative w-full h-full">
        <div className="h-screen bg-gray-100 flex items-center justify-center">
          <div className="w-full h-full">
            {/* Role Toggle - Always visible at top */}
            <div className="flex justify-center pt-4 pb-4">
              <div className="flex bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setRole("patient")}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    role === "patient" ? "bg-blue-500 text-white shadow-md" : "text-gray-600 hover:text-blue-500"
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setRole("doctor")}
                  className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                    role === "doctor" ? "bg-purple-500 text-white shadow-md" : "text-gray-600 hover:text-purple-500"
                  }`}
                >
                  Doctor
                </button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:flex w-full h-[calc(100vh-120px)] bg-white shadow-2xl overflow-hidden relative">
              {/* Fixed curved animation section */}
              <div
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  role === "patient"
                    ? "bg-gradient-to-br from-blue-400 via-blue-500 to-purple-600"
                    : "bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600"
                }`}
                style={{
                  clipPath: isLogin
                    ? "polygon(0 0, 60% 0, 45% 100%, 0 100%)"
                    : "polygon(40% 0, 100% 0, 100% 100%, 55% 100%)",
                }}
              >
                <div
                  className={`h-full flex flex-col justify-center px-12 text-white transition-all duration-1000 overflow-hidden ${
                    isLogin ? "items-start text-left" : "items-end text-right"
                  }`}
                >
                  <h2 className="text-3xl font-bold mb-4 break-words">
                    {isLogin ? "Welcome Back!" : "Hello!"}
                  </h2>
                  <p className="text-lg mb-8 opacity-90 max-w-xs break-words leading-relaxed">
                    {isLogin
                      ? "Enter your details to access all Medicare features"
                      : "Register to start your healthcare journey with us"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="px-6 py-2 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-gray-800 transition-all duration-300 hover:scale-105 text-sm"
                  >
                    {isLogin ? "SIGN UP" : "SIGN IN"}
                  </button>
                </div>
              </div>

              {/* Desktop Form Section */}
              <div
                className={`w-full h-full flex items-start justify-center transition-all duration-1000 ${
                  isLogin ? "pl-[45%]" : "pr-[45%]"
                } py-8`}
              >
                <div className="w-full max-w-md px-8 h-full overflow-y-auto">
                  <div className="min-h-full flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                      {isLogin ? "Sign In" : "Create Account"}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                      {!isLogin && (
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Full Name
                          </Label>
                          <AnimatedInput
                            id="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(value) => handleInputChange("name", value)}
                            required
                            icon={User}
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address
                        </Label>
                        <AnimatedInput
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(value) => handleInputChange("email", value)}
                          required
                          icon={Mail}
                        />
                      </div>

                      {!isLogin && (
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            Phone Number
                          </Label>
                          <AnimatedInput
                            id="phone"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={(value) => handleInputChange("phone", value)}
                            required
                            icon={Phone}
                          />
                        </div>
                      )}

                      <div className="space-y-2 relative">
                        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                          Password
                        </Label>
                        <div className="relative group">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            className="h-14 pl-4 pr-12 border-2 border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm
                              focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10
                              hover:border-gray-300 hover:bg-white/80
                              transition-all duration-300 ease-out
                              placeholder:text-gray-400 text-gray-700"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {!isLogin && role === "doctor" && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Stethoscope className="w-4 h-4" />
                              Medical Specialty
                            </Label>
                            <AnimatedSelect
                              value={formData.specialty}
                              onValueChange={(value) => handleInputChange("specialty", value)}
                              placeholder="Select your specialty"
                              options={medicalSpecialties}
                              icon={Stethoscope}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4" />
                              Qualification
                            </Label>
                            <AnimatedSelect
                              value={formData.qualifications}
                              onValueChange={(value) => handleInputChange("qualifications", value)}
                              placeholder="Select your qualification"
                              options={qualifications}
                              icon={GraduationCap}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              Experience
                            </Label>
                            <AnimatedSelect
                              value={formData.experience}
                              onValueChange={(value) => handleInputChange("experience", value)}
                              placeholder="Select your experience"
                              options={experienceOptions}
                              icon={Briefcase}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="clinicAddress"
                              className="text-sm font-medium text-gray-700 flex items-center gap-2"
                            >
                              <MapPin className="w-4 h-4" />
                              Clinic Address
                            </Label>
                            <AnimatedInput
                              id="clinicAddress"
                              placeholder="Enter your clinic address"
                              value={formData.clinicAddress}
                              onChange={(value) => handleInputChange("clinicAddress", value)}
                              required
                              icon={MapPin}
                            />
                          </div>
                        </>
                      )}

                      {isLogin && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <input
                              id="remember"
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Label htmlFor="remember" className="text-gray-600">
                              Remember me
                            </Label>
                          </div>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                          >
                            Forgot password?
                          </button>
                        </div>
                      )}

                      <div className="relative z-10 overflow-visible p-1 mt-8">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className={`w-full h-14 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative z-10 border-0 outline-none focus:outline-none ${
                            role === "patient"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          } text-white shadow-lg`}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Please wait...</span>
                            </div>
                          ) : (
                            <span>{isLogin ? "Sign In" : "Create Account"}</span>
                          )}
                        </Button>
                      </div>

                      {isLogin && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
                          <div className="text-xs text-gray-600 space-y-1">
                            {role === "patient" ? (
                              <>
                                <p>
                                  <strong>Email:</strong> john@example.com
                                </p>
                                <p>
                                  <strong>Password:</strong> 11221122
                                </p>
                              </>
                            ) : (
                              <>
                                <p>
                                  <strong>Email:</strong> sarah@example.com
                                </p>
                                <p>
                                  <strong>Password:</strong> 26272627
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden w-full h-[calc(100vh-120px)] px-4">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-gray-800">
                    Medi<span className="text-blue-500">Care</span>
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{isLogin ? "Welcome Back!" : "Join MediCare"}</h1>
                <p className="text-gray-600">
                  {isLogin ? "Sign in to continue your health journey" : "Start your healthcare journey today"}
                </p>
              </div>

              <Card className="bg-white border-gray-200 shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                    <button
                      type="button"
                      onClick={() => setIsLogin(true)}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                        isLogin ? "bg-white text-gray-900 shadow-lg" : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsLogin(false)}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                        !isLogin ? "bg-white text-gray-900 shadow-lg" : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="mobile-name"
                          className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          Full Name
                        </Label>
                        <AnimatedInput
                          id="mobile-name"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(value) => handleInputChange("name", value)}
                          required
                          icon={User}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label
                        htmlFor="mobile-email"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        Email Address
                      </Label>
                      <AnimatedInput
                        id="mobile-email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(value) => handleInputChange("email", value)}
                        required
                        icon={Mail}
                      />
                    </div>

                    {!isLogin && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="mobile-phone"
                          className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          Phone Number
                        </Label>
                        <AnimatedInput
                          id="mobile-phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={(value) => handleInputChange("phone", value)}
                          required
                          icon={Phone}
                        />
                      </div>
                    )}

                    <div className="space-y-2 relative">
                      <Label htmlFor="mobile-password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative group">
                        <Input
                          id="mobile-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange("password", e.target.value)}
                          className="h-14 pl-4 pr-12 border-2 border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm
                            focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10
                            hover:border-gray-300 hover:bg-white/80
                            transition-all duration-300 ease-out
                            placeholder:text-gray-400 text-gray-700"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {!isLogin && role === "doctor" && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Medical Specialty
                          </Label>
                          <AnimatedSelect
                            value={formData.specialty}
                            onValueChange={(value) => handleInputChange("specialty", value)}
                            placeholder="Select your specialty"
                            options={medicalSpecialties}
                            icon={Stethoscope}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            Qualification
                          </Label>
                          <AnimatedSelect
                            value={formData.qualifications}
                            onValueChange={(value) => handleInputChange("qualifications", value)}
                            placeholder="Select your qualification"
                            options={qualifications}
                            icon={GraduationCap}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Experience
                          </Label>
                          <AnimatedSelect
                            value={formData.experience}
                            onValueChange={(value) => handleInputChange("experience", value)}
                            placeholder="Select your experience"
                            options={experienceOptions}
                            icon={Briefcase}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="mobile-clinicAddress"
                            className="text-sm font-medium text-gray-700 flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4" />
                            Clinic Address
                          </Label>
                          <AnimatedInput
                            id="mobile-clinicAddress"
                            placeholder="Enter your clinic address"
                            value={formData.clinicAddress}
                            onChange={(value) => handleInputChange("clinicAddress", value)}
                            required
                            icon={MapPin}
                          />
                        </div>
                      </>
                    )}

                    {isLogin && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <input
                            id="mobile-remember"
                            type="checkbox"
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="mobile-remember" className="text-gray-600">
                            Remember me
                          </Label>
                        </div>
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}

                    <div className="relative z-10 overflow-visible p-1 mt-8">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full h-14 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative z-10 border-0 outline-none focus:outline-none ${
                          role === "patient"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        } text-white shadow-lg`}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Please wait...</span>
                          </div>
                        ) : (
                          <span>{isLogin ? "Sign In" : "Create Account"}</span>
                        )}
                      </Button>
                    </div>

                    {isLogin && (
                      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
                        <div className="text-xs text-gray-600 space-y-1">
                          {role === "patient" ? (
                            <>
                              <p>
                                <strong>Email:</strong> john@example.com
                              </p>
                              <p>
                                <strong>Password:</strong> 11221122
                              </p>
                            </>
                          ) : (
                            <>
                              <p>
                                <strong>Email:</strong> sarah@example.com
                              </p>
                              <p>
                                <strong>Password:</strong> 26272627
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
