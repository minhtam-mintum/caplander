import { useState } from 'react'
import { DayCalendar } from 'app/components/organisms/DayCalendar'

export function DayView() {
  const [date, setDate] = useState(new Date())

  function prevDay() {
    setDate((d) => { const n = new Date(d); n.setDate(d.getDate() - 1); return n })
  }

  function nextDay() {
    setDate((d) => { const n = new Date(d); n.setDate(d.getDate() + 1); return n })
  }

  return (
    <main className='max-w-360 mx-auto px-margin py-lg'>
      <DayCalendar
        date={date}
        onPrevDay={prevDay}
        onNextDay={nextDay}
        onToday={() => setDate(new Date())}
      />
    </main>
  )
}
