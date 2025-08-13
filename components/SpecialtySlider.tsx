"use client"

import type { ComponentProps } from "react"
import { HeartPulse, Brain, Baby, Sparkles, Bone, Stethoscope, Smile } from "lucide-react"
import { cn } from "@/lib/utils"

type SpecialtySliderProps = {
  title: string
  onSpecialtySelect?: (slug: string) => void
  className?: string
} & ComponentProps<"section">

const specialties = [
  {
    slug: "cardiology",
    name: "Cardiology",
    description: "Heart & Cardiovascular",
    Icon: HeartPulse,
    gradient: "from-pink-500 via-rose-500 to-fuchsia-500",
  },
  {
    slug: "neurology",
    name: "Neurology",
    description: "Brain & Nervous System",
    Icon: Brain,
    gradient: "from-indigo-500 via-violet-500 to-purple-500",
  },
  {
    slug: "pediatrics",
    name: "Pediatrics",
    description: "Children's Health",
    Icon: Baby,
    gradient: "from-sky-500 via-cyan-500 to-teal-500",
  },
  {
    slug: "dermatology",
    name: "Dermatology",
    description: "Skin & Beauty",
    Icon: Sparkles,
    gradient: "from-emerald-500 via-green-500 to-lime-500",
  },
  {
    slug: "orthopedics",
    name: "Orthopedics",
    description: "Bones & Joints",
    Icon: Bone,
    gradient: "from-amber-500 via-orange-500 to-red-500",
  },
  {
    slug: "general",
    name: "General Medicine",
    description: "Primary Care",
    Icon: Stethoscope,
    gradient: "from-blue-500 via-sky-500 to-cyan-500",
  },
  {
    slug: "psychiatry",
    name: "Psychiatry",
    description: "Mental Health",
    Icon: Smile,
    gradient: "from-fuchsia-500 via-pink-500 to-rose-500",
  },
]

export function SpecialtySlider({ title, onSpecialtySelect, className, ...props }: SpecialtySliderProps) {
  return (
    <section
      aria-label={title}
      className={cn(
        // Constrain width; slightly wider in dark theme for better balance
        "w-full md:w-5/6 lg:w-3/4 xl:w-7/12 dark:md:w-11/12 dark:lg:w-5/6 dark:xl:w-2/3 mx-auto py-8 md:py-10 relative bg-transparent",
        className,
      )}
      {...props}
    >
      <div className="mb-6 md:mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-blue-200 dark:via-cyan-200 dark:to-indigo-200">
          {title}
        </h2>
        <p className="mt-2 text-muted-foreground dark:text-slate-300/90 text-base md:text-lg">
          Choose from our wide range of medical specialties with expert doctors
        </p>
      </div>

      {/* Horizontal scroller */}
      <div className="relative">
        <div
          className="no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto px-1 pb-2 scroll-smooth"
          role="list"
          aria-label={`${title} specialties`}
        >
          {specialties.map(({ slug, name, description, Icon, gradient }) => (
            <button
              key={slug}
              type="button"
              role="listitem"
              onClick={() => onSpecialtySelect?.(slug)}
              className={cn(
                // Bigger cards
                "min-w-[220px] sm:min-w-[240px] md:min-w-[260px]",
                // Light theme card
                "rounded-2xl border bg-white hover:bg-slate-50 border-gray-200 text-slate-900",
                // Dark theme overrides
                "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white backdrop-blur",
                "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
                "text-left p-5 md:p-6",
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-14 md:size-16 items-center justify-center rounded-xl",
                    "bg-gradient-to-br shadow-md",
                    gradient,
                  )}
                >
                  <Icon className="size-7 md:size-8 text-white" />
                </div>
                <div>
                  <div className="text-foreground dark:text-white font-semibold text-lg md:text-xl">{name}</div>
                  <div className="text-muted-foreground dark:text-slate-400 text-sm md:text-base">{description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Removed the decorative gradient underline/progress line under the slider */}
      </div>

      {/* Hide horizontal scrollbar globally for this utility class */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  )
}
