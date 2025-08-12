"use client"

import type React from "react"
import { Input } from "./input"
import type { LucideIcon } from "lucide-react"

interface AnimatedInputProps {
  id?: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  icon?: LucideIcon
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  icon: Icon,
}) => {
  return (
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
      )}
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-14 ${Icon ? "pl-12" : "pl-4"} pr-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 backdrop-blur-sm
          focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/10
          hover:border-gray-300 hover:bg-white/80
          transition-all duration-300 ease-out
          placeholder:text-gray-400 text-gray-700`}
        required={required}
      />
    </div>
  )
}
