
import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-[9999] w-72 rounded-md border bg-card p-4 text-card-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 border-border",
        className
      )}
      {...props}
      onPointerDownOutside={(e) => {
        const target = e.target as HTMLElement;
        if (
          target && 
          (target.closest('[data-radix-select-viewport]') || 
           target.closest('[role="listbox"]') || 
           target.closest('[data-radix-popper-content-wrapper]'))
        ) {
          e.preventDefault();
        }
        if (props.onPointerDownOutside) {
          props.onPointerDownOutside(e);
        }
      }}
      onInteractOutside={(e) => {
        const target = e.target as HTMLElement;
        if (
          target && 
          (target.closest('[data-radix-select-viewport]') || 
           target.closest('[role="listbox"]') || 
           target.closest('[data-radix-popper-content-wrapper]'))
        ) {
          e.preventDefault();
        }
        if (props.onInteractOutside) {
          props.onInteractOutside(e);
        }
      }}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
