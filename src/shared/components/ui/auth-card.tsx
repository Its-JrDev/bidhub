'use client';

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface AuthCardProps {
  brand?: {
    name: string
    logo?: React.ReactNode
  }
  title?: string
  description?: string
  socialProviders?: {
    name: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
  }[]
  footerAction?: {
    text: string
    linkText: string
    href: string
  }
  children: React.ReactNode
}

export function AuthCard({
  brand = { name: "Lumen" },
  title = "Welcome back",
  description = "Enter your credentials to access your account",
  socialProviders,
  footerAction = {
    text: "Don't have an account?",
    linkText: "Sign up",
    href: "#signup",
  },
  children,
}: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 sm:p-8 text-foreground">
      <div className="w-full max-w-md">
        {/* Centered Brand Icon */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          {brand.logo ?? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-lg shadow-sm">
              L
            </div>
          )}
          <span className="font-semibold text-sm tracking-tight text-muted-foreground">
            {brand.name}
          </span>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-bold tracking-tight">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>

          <CardContent className="space-y-4">
            {socialProviders && socialProviders.length > 0 && (
              <>
                <div className="grid grid-cols-1 gap-2">
                  {socialProviders.map((provider, idx) => {
                    const Icon = provider.icon
                    return (
                      <Button
                        key={idx}
                        variant="outline"
                        className="w-full gap-2 text-xs font-medium"
                        onClick={provider.onClick}
                      >
                        <Icon className="h-4 w-4" />
                        <span>Continue with {provider.name}</span>
                      </Button>
                    )
                  })}
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground font-medium">
                      Or continue with
                    </span>
                  </div>
                </div>
              </>
            )}

            {children}
          </CardContent>

          {footerAction && (
            <CardFooter className="flex justify-center border-t py-4 text-xs text-muted-foreground">
              <span>{footerAction.text} </span>
              <a
                href={footerAction.href}
                className="ml-1 font-semibold text-foreground underline underline-offset-4 hover:opacity-80"
              >
                {footerAction.linkText}
              </a>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
