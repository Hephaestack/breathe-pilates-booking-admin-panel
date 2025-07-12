"use client"

import * as React from "react"
import { ChevronDownIcon, CheckIcon } from "lucide-react"
import { cn } from "../../../lib/utils"

const Select = ({ children, value, onValueChange, disabled, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || "")
  const triggerRef = React.useRef(null)
  const contentRef = React.useRef(null)

  React.useEffect(() => {
    setSelectedValue(value || "")
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target) &&
        !contentRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (value) => {
    setSelectedValue(value)
    onValueChange?.(value)
    setIsOpen(false)
  }

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        
        return React.cloneElement(child, {
          isOpen,
          setIsOpen,
          selectedValue,
          handleSelect,
          triggerRef,
          contentRef,
          disabled,
        })
      })}
    </div>
  )
}

const SelectValue = ({ placeholder, isOpen, selectedValue, children, ...props }) => {
  // Filter out custom props before passing to DOM
  const { ...domProps } = props
  return (
    <span className="block truncate" {...domProps}>
      {selectedValue || placeholder}
    </span>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, isOpen, setIsOpen, triggerRef, disabled, ...props }, ref) => {
  // Filter out custom props before passing to DOM
  const { handleSelect, selectedValue, contentRef, ...domProps } = props
  
  return (
    <button
      type="button"
      ref={triggerRef}
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-black bg-white px-3 py-2 text-sm shadow-sm placeholder:text-gray-700 focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      {...domProps}
    >
      {children}
      <ChevronDownIcon className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className, children, isOpen, contentRef, handleSelect, selectedValue, ...props }, ref) => {
  // Filter out custom props before passing to DOM
  const { setIsOpen, triggerRef, disabled, ...domProps } = props
  
  if (!isOpen) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute top-full left-0 z-50 w-full mt-1 max-h-96 overflow-hidden rounded-md border bg-white text-black shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
      {...domProps}
    >
      <div className="p-1 max-h-96 overflow-y-auto">
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;
          
          return React.cloneElement(child, {
            handleSelect,
            selectedValue,
            ...child.props
          })
        })}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className, children, value, handleSelect, selectedValue, ...props }, ref) => {
  // Filter out custom props before passing to DOM
  const { isOpen, setIsOpen, triggerRef, contentRef, disabled, ...domProps } = props
  
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={() => handleSelect(value)}
      {...domProps}
    >
      <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
        {selectedValue === value && <CheckIcon className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

// Unused components for compatibility
const SelectGroup = ({ children, ...props }) => <div {...props}>{children}</div>
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
))
SelectLabel.displayName = "SelectLabel"

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("-mx-1 my-1 h-px bg-gray-200", className)} {...props} />
))
SelectSeparator.displayName = "SelectSeparator"

const SelectScrollUpButton = () => null
const SelectScrollDownButton = () => null

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
