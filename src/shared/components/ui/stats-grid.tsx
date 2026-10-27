import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface StatItem {
  id?: string
  title: string
  value: string | number
  change?: {
    value: string
    type: "increase" | "decrease" | "neutral"
  }
  description?: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function StatCard({ item }: { item: StatItem }) {
  const Icon = item.icon

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {item.title}
        </CardTitle>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{item.value}</div>

        {(item.change || item.description) && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            {item.change && (
              <Badge
                variant={
                  item.change.type === "increase"
                    ? "success"
                    : item.change.type === "decrease"
                    ? "destructive"
                    : "secondary"
                }
                className="gap-1 px-1.5 py-0 font-medium"
              >
                {item.change.type === "increase" && <TrendingUp className="h-3 w-3" />}
                {item.change.type === "decrease" && <TrendingDown className="h-3 w-3" />}
                {item.change.type === "neutral" && <Minus className="h-3 w-3" />}
                <span>{item.change.value}</span>
              </Badge>
            )}
            {item.description && (
              <span className="text-muted-foreground truncate">{item.description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const gridColsClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
      ? "sm:grid-cols-2 lg:grid-cols-3"
      : "sm:grid-cols-2 lg:grid-cols-4"

  return (
    <div className={cn("grid grid-cols-1 gap-4", gridColsClass, className)}>
      {stats.map((stat, idx) => (
        <StatCard key={stat.id ?? idx} item={stat} />
      ))}
    </div>
  )
}
