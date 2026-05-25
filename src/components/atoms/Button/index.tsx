import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.scss';

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'icon'
  | 'tonal'
  | 'outlined'
  | 'dismiss'
  | 'cancel'
  | 'dashed'
  | 'field-trigger'
  | 'select-option'
  | 'nav-tab'
  | 'time-item'
  | 'swatch'
  | 'action-icon'
  | 'label-action';

interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }: IButtonProps, ref) => {
    return (
      <button ref={ref} className={`${styles.base} ${styles[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
