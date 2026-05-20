import type { ReactNode } from 'react'

export interface NavTab {
  id: string
  label: string
  icon?: ReactNode
}

interface INavTabsProps {
  tabs: NavTab[]
  active: string
  onChange: (id: string) => void
}

export function NavTabs({ tabs, active, onChange }: INavTabsProps) {
  return (
    <nav className="flex items-center gap-1">
      {tabs.map((tab) => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-body-md transition-colors cursor-pointer
              ${isActive
                ? 'text-primary bg-primary/8 font-medium'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
