import type { ReactNode } from 'react'
import { ButtonField } from 'app/components/molecules/Buttons/ButtonField'

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
          <ButtonField
            key={tab.id}
            variant='nav-tab'
            onClick={() => onChange(tab.id)}
            className={isActive
              ? 'text-primary bg-primary/8 font-medium'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            }
          >
            {tab.icon}
            {tab.label}
          </ButtonField>
        )
      })}
    </nav>
  )
}
