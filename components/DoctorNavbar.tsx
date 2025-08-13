"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Video, Phone, User, LogOut, Menu, X, Calendar, FileText, Activity, Clock, Users, Building } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

export function DoctorNavbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const navLinks = useMemo(
    () => [
      { href: "/doctor/dashboard", label: "Dashboard", icon: Activity },
      { href: "/doctor/appointments", label: "Appointments", icon: Calendar },
      { href: "/doctor/patients", label: "Patients", icon: Users },
      { href: "/doctor/prescriptions", label: "Prescriptions", icon: FileText },
      { href: "/doctor/schedule", label: "Schedule", icon: Clock },
      { href: "/doctor/reviews", label: "Reviews", icon: Heart },
      { href: "/doctor/analytics", label: "Analytics", icon: Building },
    ],
    [],
  )

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40 shadow-[0_1px_0_0_rgba(0,0,0,0.06),0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06),0_8px_30px_rgba(0,0,0,0.25)]"
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      role="navigation"
      aria-label="Doctor Navigation"
    >
      <div className="h-px w-full bg-gradient-to-r from-teal-400/60 via-blue-400/60 to-cyan-400/60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/doctor/dashboard" className="flex items-center gap-3" aria-label="Doctor Portal">
            <motion.div
              className="size-10 rounded-xl bg-gradient-to-br from-teal-600 via-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-600/20"
              whileHover={{ scale: 1.06, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Heart className="size-5 text-white" />
            </motion.div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Doctor Portal
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <motion.div key={href} className="relative" whileHover={{ y: -1 }}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group/nav relative flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    ].join(" ")}
                  >
                    {/* Hover box */}
                    <span
                      className={[
                        "pointer-events-none absolute inset-0 -z-10 rounded-lg transition",
                        "opacity-0 group-hover/nav:opacity-100",
                        "bg-muted ring-1 ring-border",
                      ].join(" ")}
                    />
                    {/* Active background */}
                    {active && (
                      <span className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-muted/50 ring-1 ring-border" />
                    )}

                    <Icon
                      className={[
                        "size-4",
                        active ? "text-primary" : "text-muted-foreground group-hover/nav:text-foreground",
                      ].join(" ")}
                    />
                    <span>{label}</span>

                    {/* Active underline */}
                    {active && (
                      <motion.span
                        layoutId="active-underline"
                        className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-teal-400 via-blue-400 to-cyan-400"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-gradient-to-br from-teal-600 via-blue-600 to-cyan-600 text-white font-semibold">
                          {user.name?.charAt(0)?.toUpperCase() ?? "D"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center gap-2 p-2">
                    <div className="flex flex-col">
                      <p className="font-medium">Dr. {user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/doctor/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/doctor/dashboard">
                      <Activity className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/doctor/appointments">
                      <Calendar className="mr-2 h-4 w-4" />
                      Appointments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/auth">
                    <Button
                      variant="outline"
                      className="border-border text-foreground hover:bg-muted bg-transparent"
                    >
                      Login
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/auth">
                    <Button className="bg-gradient-to-r from-teal-600 via-blue-600 to-cyan-600 hover:from-teal-700 hover:via-blue-700 hover:to-cyan-700">
                      Sign Up
                    </Button>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle navigation"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-6 w-6 text-foreground dark:text-zinc-200" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-6 w-6 text-foreground dark:text-zinc-200" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-background/60 backdrop-blur border-t border-border rounded-b-xl">
                {navLinks.map(({ href, label, icon: Icon }, idx) => {
                  const active = isActive(href)
                  return (
                    <motion.div
                      key={href}
                      initial={{ x: -14, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * idx }}
                    >
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={[
                          "group/mob relative flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                        ].join(" ")}
                      >
                        {/* Active gradient bar */}
                        {active && (
                          <motion.span
                            layoutId="mobile-active-bar"
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-r-full bg-gradient-to-b from-teal-400 via-blue-400 to-cyan-400"
                          />
                        )}

                        {/* Hover box */}
                        <span
                         className={[
                                      "pointer-events-none absolute inset-0 -z-10 rounded-lg",
                                      "opacity-0 group-hover/mob:opacity-100",
                                      "bg-muted ring-1 ring-border",
                      "transition-all duration-300 ease-in-out transform group-hover/mob:scale-105"
                         ].join(" ")}/>

                        {/* Active base */}
                        {active && (
                          <span className="pointer-events-none absolute inset-0 -z-10 rounded-lg bg-muted/50 ring-1 ring-border" />
                        )}

                        <Icon
                          className={[
                            "size-5",
                            active ? "text-primary" : "text-muted-foreground group-hover/mob:text-foreground",
                          ].join(" ")}
                        />
                        <span className="font-medium">{label}</span>
                      </Link>
                    </motion.div>
                  )
                })}

                {/* Auth actions on mobile */}
                {!user ? (
                  <motion.div
                    className="space-y-3 px-3 py-3 border-t border-border mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full border-border text-foreground hover:bg-muted bg-transparent"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-teal-600 via-blue-600 to-cyan-600 hover:from-teal-700 hover:via-blue-700 hover:to-cyan-700">
                        Sign Up
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-1 px-1 py-2 border-t border-border mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Link
                      href="/doctor/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="size-5" />
                      <span className="font-medium">Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                    >
                      <LogOut className="size-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
