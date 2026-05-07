"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface ResultCardProps {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}

export function ResultCard({
  title,
  icon: Icon,
  children,
  className,
}: ResultCardProps) {
  return (
    <Card
      className={cn(
        "border-border/50 bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className
      )}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
