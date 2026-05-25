import { forwardRef, type ComponentProps } from 'react';
import { Button } from 'app/components/atoms/Button';

interface ICancelButtonProps extends ComponentProps<typeof Button> {}

export const CancelButton = forwardRef<HTMLButtonElement, ICancelButtonProps>(
  function CancelButton(props, ref) {
    return <Button ref={ref} variant='cancel' {...props} />;
  },
);
