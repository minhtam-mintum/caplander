import { formatTimeRange } from 'app/utils/day';
import { cn } from 'app/utils/cn';

interface IWeekEventCardProps {
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  offsetTop: number;
  height: number;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onResizeStart?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export function WeekEventCard({
  title,
  startTime,
  endTime,
  color,
  offsetTop,
  height,
  onClick,
  className,
  style,
  draggable,
  onDragStart,
  onDragEnd,
  onResizeStart,
}: IWeekEventCardProps) {
  return (
    <div
      className={cn(
        'absolute inset-x-1 rounded-md px-2 py-1 overflow-hidden hover:brightness-95 transition-all group',
        className,
      )}
      style={{
        top: offsetTop,
        height: Math.max(height, 20),
        background: `color-mix(in srgb, ${color} 15%, white)`,
        borderLeft: `3px solid ${color}`,
        color,
        ...style,
      }}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}>
      <p className='text-label-md font-semibold truncate leading-tight'>{title}</p>
      {height >= 32 && (
        <p className='text-label-sm opacity-80 leading-tight'>
          {formatTimeRange(startTime, endTime)}
        </p>
      )}
      {onResizeStart && (
        <div
          className='absolute bottom-0 inset-x-0 h-3 cursor-s-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onResizeStart(e);
          }}>
          <div className='w-6 h-0.5 rounded-full bg-current opacity-50' />
        </div>
      )}
    </div>
  );
}
