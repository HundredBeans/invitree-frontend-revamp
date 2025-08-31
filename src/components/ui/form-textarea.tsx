import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "./textarea"
import { Label } from "./label"

export interface FormTextareaProps extends React.ComponentProps<typeof Textarea> {
  label?: string
  error?: string | null
  helperText?: string
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={textareaId}>
            {label}
          </Label>
        )}
        <Textarea
          id={textareaId}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
FormTextarea.displayName = "FormTextarea"

export { FormTextarea }
