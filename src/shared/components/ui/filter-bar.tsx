'use client';

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface ActiveFilter {
  id: string
  label: string
  value: string
  displayValue?: string
}

export interface FilterBarProps {
  filters: ActiveFilter[]
  onRemove: (filterId: string) => void
  onClearAll: () => void
  className?: string
}

export function FilterBar({
  filters,
  onRemove,
  onClearAll,
  className,
}: FilterBarProps) {
  if (filters.length === 0) return null

  return (
    <div className={cn("flex flex-wrap items-center gap-2 py-2", className)}>
      <span className="text-xs font-medium text-muted-foreground">
        Active filters ({filters.length}):
      </span>

      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((filter) => (
          <Badge
            key={filter.id}
            variant="secondary"
            className="gap-1.5 py-1 pl-2 pr-1 text-xs font-normal"
          >
            <span className="font-medium text-foreground">{filter.label}:</span>
            <span className="text-muted-foreground">{filter.displayValue ?? filter.value}</span>
            <button
              type="button"
              onClick={() => onRemove(filter.id)}
              className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {filter.label} filter</span>
            </button>
          </Badge>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Clear all
      </Button>
    </div>
  )
}
