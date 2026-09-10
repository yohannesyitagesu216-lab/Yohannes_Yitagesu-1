import { ReactNode, createContext, useContext, useState } from 'react'

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  children: ReactNode
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

export function Tabs({ children, defaultValue = '', value, onValueChange }: TabsProps) {
  const [internalValue, setInternalValue] = useState(value || defaultValue)

  const handleChange = (newValue: string) => {
    if (value !== undefined) {
      onValueChange?.(newValue)
    } else {
      setInternalValue(newValue)
    }
  }

  return (
    <TabsContext.Provider value={{ value: value || internalValue, onValueChange: handleChange }}>
      {children}
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex border-b border-[var(--border-color)] ${className}`}>
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  children: ReactNode
  value: string
  className?: string
}

export function TabsTrigger({ children, value, className = '' }: TabsTriggerProps) {
  const context = useContext(TabsContext)
  const isActive = context?.value === value

  return (
    <button
      onClick={() => context?.onValueChange(value)}
      className={`px-4 py-2 font-medium transition-colors border-b-2 ${
        isActive
          ? 'text-[var(--primary)] border-[var(--primary)]'
          : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
      } ${className}`}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  children: ReactNode
  value: string
  className?: string
}

export function TabsContent({ children, value, className = '' }: TabsContentProps) {
  const context = useContext(TabsContext)

  if (context?.value !== value) return null

  return <div className={className}>{children}</div>
}
