import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.scss';

type Variant = 'primary' | 'secondary' | 'ghost' | 'icon';

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
