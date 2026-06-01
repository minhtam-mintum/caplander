import { forwardRef, type ComponentProps } from 'react';
import { Button } from 'app/components/atoms/Button';

interface IIconButtonProps extends ComponentProps<typeof Button> {}

export const IconButton = forwardRef<HTMLButtonElement, IIconButtonProps>(
  function IconButton(props, ref) {
    return <Button ref={ref} type='button' variant='icon' {...props} />;
  },
);
