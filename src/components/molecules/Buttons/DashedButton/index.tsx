import { forwardRef, type ComponentProps } from 'react';
import { Button } from 'app/components/atoms/Button';

interface IDashedButtonProps extends ComponentProps<typeof Button> {}

export const DashedButton = forwardRef<HTMLButtonElement, IDashedButtonProps>(
  function DashedButton(props, ref) {
    return <Button ref={ref} variant='dashed' {...props} />;
  },
);
