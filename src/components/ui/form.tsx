import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FieldPath,
  FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"
import { cn } from "@/lib/utils"
import { Label } from "./label"

export const Form = FormProvider

export function FormField({ name, render }: any) {
  const { control } = useFormContext()
  return <Controller name={name} control={control} render={render} />
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />
}

export function FormLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <Label className={cn("text-sm font-medium", className)} {...props} />
}

export function FormControl({ ...props }) {
  return <Slot {...props} />
}

export function FormMessage({ name }: { name: string }) {
  const { getFieldState } = useFormContext()
  const { error } = getFieldState(name)

  if (!error?.message) return null

  return <p className="text-sm text-red-600">{error.message}</p>
}
