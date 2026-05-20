import { MonthCalendar } from 'app/components/molecules/MonthCalendar'
import { NavigationControls } from 'app/components/molecules/NavigationControls'

interface IYearCalendarProps {
  year: number
  taskCountByDate?: Record<string, number>
  onPrevYear: () => void
  onNextYear: () => void
  onToday: () => void
}

export function YearCalendar({ year, taskCountByDate = {}, onPrevYear, onNextYear, onToday }: IYearCalendarProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-headline-lg text-on-surface">{year}</h2>
          <p className="text-body-md text-on-surface-variant">Yearly Overview &amp; Heatmap</p>
        </div>
        <NavigationControls onPrev={onPrevYear} onNext={onNextYear} onToday={onToday} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 12 }, (_, month) => (
          <MonthCalendar
            key={month}
            year={year}
            month={month}
            taskCountByDate={taskCountByDate}
            labelFormat='short'
          />
        ))}
      </div>
    </div>
  )
}
