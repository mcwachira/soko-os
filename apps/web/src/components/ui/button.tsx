"use client";
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border-2 border-black shadow active:translate-x-0.5 active:translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "bg-main text-main-foreground hover:brightness-110",
        destructive:
          "bg-destructive text-destructive-foreground hover:brightness-110",
        outline:
          "bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/5",
        secondary:
          "bg-secondary-background text-foreground hover:bg-black/5 dark:hover:bg-white/5",
        ghost: "hover:bg-black/5 dark:hover:bg-white/5",
        link: "text-main underline-offset-4 hover:underline border-0 shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
