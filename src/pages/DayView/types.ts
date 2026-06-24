export interface ITitleDayPageHandle {
  setDate: (date: Date) => void;
}

export interface ITitleDayPageProps {
  defaultDate: Date;
  onDayChange: (date: Date) => void;
}
