import * as React from "react"

interface SlotProps {
  children?: React.ReactNode
  as?: React.ElementType
  className?: string
  style?: React.CSSProperties
  [key: string]: unknown
}

function Slot({ as: Comp = "div", children, className, style, ...props }: SlotProps) {
  return <Comp {...props} className={className} style={style}>{children}</Comp>
}

Slot.displayName = "Slot"

export { Slot }
