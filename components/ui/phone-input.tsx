import * as React from "react"
import { Input } from "@/components/ui/input"
import { handlePhoneInput, PHONE_INPUT_PROPS } from "@/lib/phone"

/** Input that only takes digits and formats them as a PH number while typing */
function PhoneInput({ onChange, ...props }: Omit<React.ComponentProps<typeof Input>, "type" | "inputMode">) {
  return (
    <Input
      {...PHONE_INPUT_PROPS}
      {...props}
      onChange={e => {
        handlePhoneInput(e)
        onChange?.(e)
      }}
    />
  )
}

export { PhoneInput }
