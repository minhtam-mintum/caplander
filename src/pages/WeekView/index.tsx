import { useState } from 'react'
import { WeekCalendar } from 'app/components/organisms/WeekCalendar'

export function WeekView() {
  const [refDate, setRefDate] = useState(new Date())

  function prevWeek() {
    setRefDate((d) => { const n = new Date(d); n.setDate(d.getDate() - 7); return n })
  }

  function nextWeek() {
    setRefDate((d) => { const n = new Date(d); n.setDate(d.getDate() + 7); return n })
  }

  return (
    <main className='max-w-360 mx-auto px-margin py-lg'>
      <WeekCalendar
        refDate={refDate}
        onPrevWeek={prevWeek}
        onNextWeek={nextWeek}
        onToday={() => setRefDate(new Date())}
        onFilter={() => {}}
      />
    </main>
  )
}
