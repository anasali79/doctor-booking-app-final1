"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { LucideIcon } from "lucide-react"

interface SelectOption {
  value: string
  label: string
}

interface AnimatedSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: SelectOption[]
  icon?: LucideIcon
}

export function AnimatedSelect({ value, onValueChange, placeholder, options, icon: Icon }: AnimatedSelectProps) {
  return (
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={`h-14 ${Icon ? "pl-12" : "pl-4"} pr-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm
          focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10
          hover:border-gray-300 hover:bg-white/80
          transition-all duration-300 ease-out
          text-black`}
        >
          <SelectValue placeholder={placeholder} className="text-black" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 rounded-xl shadow-lg">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="text-black hover:bg-gray-100 focus:bg-gray-100 cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
