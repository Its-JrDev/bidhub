'use client';

import * as React from "react"
import { FolderPlus, LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  secondaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  icon: Icon = FolderPlus,
  title,
  description,
  action,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50",
        className
      )}
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted/60 text-muted-foreground ring-8 ring-muted/30">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>

      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm text-balance">
          {description}
        </p>
      )}

      {(action || secondaryAction || children) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              size="sm"
              onClick={action.onClick}
              asChild={!!action.href}
            >
              {action.href ? <a href={action.href}>{action.label}</a> : action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={secondaryAction.onClick}
              asChild={!!secondaryAction.href}
            >
              {secondaryAction.href ? (
                <a href={secondaryAction.href}>{secondaryAction.label}</a>
              ) : (
                secondaryAction.label
              )}
            </Button>
          )}

          {children}
        </div>
      )}
    </div>
  )
}
