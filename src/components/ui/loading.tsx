import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  text?: string
}

const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size = "md", text, ...props }, ref) => {
    const sizes = {
      sm: "h-4 w-4",
      md: "h-8 w-8",
      lg: "h-12 w-12"
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className={cn("animate-spin text-primary", sizes[size])} />
          {text && (
            <p className="text-sm text-muted-foreground">{text}</p>
          )}
        </div>
      </div>
    )
  }
)
Loading.displayName = "Loading"

export { Loading }
