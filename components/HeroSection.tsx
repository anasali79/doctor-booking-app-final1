"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Video, Phone, ArrowRight, Heart, Shield, Star, Users } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

const floatingElements = [
  { icon: Heart, position: "top-10 left-10", delay: 0, color: "text-red-400" },
  { icon: Shield, position: "top-20 right-20", delay: 0.5, color: "text-blue-400" },
  { icon: Star, position: "bottom-20 left-20", delay: 1, color: "text-yellow-400" },
  { icon: Users, position: "bottom-10 right-10", delay: 1.5, color: "text-green-400" },
]

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Keep blobs in both themes, soften in light */}
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full blur-3xl animate-pulse bg-gradient-to-r from-blue-300 to-purple-300 dark:from-blue-400 dark:to-purple-400"></div>
          <div className="absolute top-40 right-32 w-24 h-24 rounded-full blur-2xl animate-pulse delay-1000 bg-gradient-to-r from-emerald-300 to-cyan-300 dark:from-green-400 dark:to-blue-400"></div>
          <div className="absolute bottom-32 left-32 w-40 h-40 rounded-full blur-3xl animate-pulse delay-2000 bg-gradient-to-r from-purple-300 to-pink-300 dark:from-purple-400 dark:to-pink-400"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 rounded-full blur-2xl animate-pulse delay-3000 bg-gradient-to-r from-yellow-300 to-orange-300 dark:from-yellow-400 dark:to-orange-400"></div>
        </div>
      </div>

      {/* Floating Elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute ${element.position} ${element.color} opacity-20`}
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{
            opacity: 0.2,
            scale: 1,
            rotate: 0,
            y: [0, -20, 0],
          }}
          transition={{
            duration: 2,
            delay: element.delay,
            y: {
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          <element.icon className="w-8 h-8 sm:w-12 sm:h-12" />
        </motion.div>
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Hero Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex mb-6"
          >
            <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium backdrop-blur-sm dark:from-blue-100/20 dark:to-purple-100/20 dark:text-blue-300 dark:border-blue-500/30">
              <Heart className="w-4 h-4 mr-2" />
              India's #1 Healthcare Platform 🇮🇳
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Your Health,
            <br />
            <span className="bg-gradient-to-r from-yellow-500 via-orange-600 to-red-600 bg-clip-text text-transparent dark:from-yellow-400 dark:via-orange-500 dark:to-red-500">
              Our Priority
            </span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-slate-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Connect with qualified doctors instantly. Book appointments, get online consultations, and take control of
            your health journey with our premium healthcare platform.
          </motion.p>
        </motion.div>

        {/* Hero Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Find Doctor Nearby */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            whileHover={{ y: -10 }}
          >
            <Card className="group relative overflow-hidden border border-gray-200 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer h-full dark:border-0 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80">
              {/* Background Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <CardTitle className="text-gray-900 dark:text-white text-xl sm:text-2xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-300">
                  Find Doctor Nearby
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
                  Discover qualified doctors in your area with ratings and reviews
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10 pb-6 sm:pb-8">
                <Link href="/find-doctors">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300 py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 dark:hover:border-white/40">
                      Explore Doctors
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Video Consultation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            whileHover={{ y: -10 }}
          >
            <Card className="group relative overflow-hidden border border-gray-200 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer h-full dark:border-0 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80">
              {/* Background Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Video className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <CardTitle className="text-gray-900 dark:text-white text-xl sm:text-2xl font-bold mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors duration-300">
                  Video Consultation
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
                  Get instant medical advice through secure video calls
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10 pb-6 sm:pb-8">
                <Link href="/consultations/video">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300 py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 dark:hover:border-white/40">
                      Start Video Call
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Call Consultation */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            whileHover={{ y: -10 }}
            className="md:col-span-2 lg:col-span-1"
          >
            <Card className="group relative overflow-hidden border border-gray-200 bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 cursor-pointer h-full dark:border-0 dark:bg-gradient-to-br dark:from-slate-900/80 dark:to-slate-800/80">
              {/* Background Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <CardHeader className="text-center pb-4 sm:pb-6 relative z-10">
                <motion.div
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  <Phone className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </motion.div>
                <CardTitle className="text-gray-900 dark:text-white text-xl sm:text-2xl font-bold mb-3 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                  Call Consultation
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
                  Quick medical consultation over phone calls
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10 pb-6 sm:pb-8">
                <Link href="/consultations/call">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300 py-3 sm:py-4 text-base font-semibold shadow-lg hover:shadow-xl backdrop-blur-sm dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border dark:border-white/20 dark:hover:border-white/40">
                      Make a Call
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-12 sm:mt-16 lg:mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="flex items-center space-x-6 bg-white/5 backdrop-blur-sm rounded-full px-4 sm:px-6 py-3 sm:py-4 border border-white/10">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              <span className="text-sm sm:text-base font-medium text-slate-300">100% Secure</span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
              <span className="text-sm sm:text-base font-medium text-slate-300">Trusted by Millions</span>
            </div>
            <div className="w-px h-4 bg-slate-600"></div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-sm sm:text-base font-medium text-slate-300">Top Rated</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
