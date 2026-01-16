"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { IconHome, IconServer, IconUserPlus, IconHelp } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const MotionLink = motion(Link)

interface ButtonConfig {
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  style: string
  href: string
}

const buttons: ButtonConfig[] = [
  {
    name: "Home",
    icon: IconHome,
    color: "violet",
    style: "bg-violet-500 text-violet-50 border-violet-400 shadow-violet-500/50",
    href: "/",
  },
  {
    name: "Host",
    icon: IconServer,
    color: "cyan",
    style: "bg-cyan-500 text-cyan-50 border-cyan-400 shadow-cyan-500/50",
    href: "/host",
  },
  {
    name: "Join",
    icon: IconUserPlus,
    color: "lime",
    style: "bg-lime-500 text-lime-50 border-lime-400 shadow-lime-500/50",
    href: "/join",
  },
  {
    name: "Help",
    icon: IconHelp,
    color: "amber",
    style: "bg-amber-500 text-amber-50 border-amber-400 shadow-amber-500/50",
    href: "/help",
  },
]

export function ExpandingButtonGroup() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="flex w-full min-w-lg flex-col items-center">
      <div className="flex items-center w-full" style={{ gap: "0.5rem" }}>
        {buttons.map((button, index) => {
          const Icon = button.icon
          const isHovered = hoveredIndex === index
          const isOtherHovered = hoveredIndex !== null && hoveredIndex !== index

          return (
            <motion.div
              key={index}
              className="flex"
              initial={false}
              animate={{
                flex: isHovered ? 3 : isOtherHovered ? 0.5 : 1,
                minWidth: isHovered ? "auto" : isOtherHovered ? "44px" : "auto",
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 0.8,
              }}
            >
              <MotionLink
                href={button.href}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cn(
                  "relative flex items-center justify-center rounded-lg font-medium overflow-hidden w-full border-2 shadow-lg rounded-full",
                  button.style,
                  "py-2"
                )}
                initial={false}
                animate={{
                  paddingLeft: isHovered ? "24px" : isOtherHovered ? "12px" : "16px",
                  paddingRight: isHovered ? "24px" : isOtherHovered ? "12px" : "16px",
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  mass: 0.8,
                }}
              >
              <div
                className="shrink-0 flex items-center justify-center w-6 h-6"
              >
                <Icon
                  className="w-6 h-6 transition-colors duration-200"
                />
              </div>
              <motion.span
                className="whitespace-nowrap font-semibold"
                initial={false}
                animate={{
                  opacity: isHovered ? 1 : 0,
                  width: isHovered ? "auto" : 0,
                  marginLeft: isHovered ? 8 : 0,
                  display: isHovered ? "block" : "none",
                }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  opacity: {
                    duration: 0.2,
                  },
                }}
                style={{
                  overflow: "hidden",
                }}
              >
                {button.name}
              </motion.span>
            </MotionLink>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
