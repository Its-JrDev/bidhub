import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  breadcrumbs?: React.ReactNode
  title: string
  description?: string
  badge?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  breadcrumbs,
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 pb-6 border-b", className)}>
      {breadcrumbs && <div>{breadcrumbs}</div>}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl text-balance">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
