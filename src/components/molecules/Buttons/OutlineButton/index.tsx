import { forwardRef, type ComponentProps } from 'react';
import { Button } from 'app/components/atoms/Button';

interface IOutlineButtonProps extends ComponentProps<typeof Button> {}

export const OutlineButton = forwardRef<HTMLButtonElement, IOutlineButtonProps>(
  function OutlineButton({ className = '', ...props }, ref) {
    return <Button ref={ref} variant='outlined' className={`w-full justify-center ${className}`} {...props} />;
  },
);
