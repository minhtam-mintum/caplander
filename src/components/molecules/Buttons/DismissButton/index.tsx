import { forwardRef, type ComponentProps } from 'react';
import { Button } from 'app/components/atoms/Button';

interface IDismissButtonProps extends ComponentProps<typeof Button> {}

export const DismissButton = forwardRef<HTMLButtonElement, IDismissButtonProps>(
  function DismissButton(props, ref) {
    return <Button ref={ref} variant='dismiss' {...props} />;
  },
);
