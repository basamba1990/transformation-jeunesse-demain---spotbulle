// frontend/src/components/ui/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'neutral' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  asChild?: boolean; // Pour utiliser un composant enfant au lieu d'un bouton, similaire à Shadcn/ui
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = React.forwardRef<HTMLButtonElement, ButtonProps>((
  { 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false, 
    asChild = false, 
    children, 
    ...props 
  },
  ref
) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
    secondary: "bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary",
    accent: "bg-accent text-white hover:bg-accent-hover focus:ring-accent",
    danger: "bg-danger text-white hover:bg-red-600 focus:ring-danger",
    neutral: "bg-neutral-light text-neutral-darkest hover:bg-neutral-DEFAULT hover:text-white focus:ring-neutral-dark",
    outline: "border border-primary text-primary hover:bg-primary-light hover:text-white focus:ring-primary",
    ghost: "hover:bg-neutral-light hover:text-neutral-darkest focus:ring-neutral-dark text-neutral-darkest",
    link: "text-primary underline-offset-4 hover:underline focus:ring-primary",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "h-10 w-10", // Pour les boutons contenant uniquement une icône
  };

  const Comp = asChild ? React.Fragment : 'button';
  const buttonContent = (
    <>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </>
  );

  return (
    <Comp
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      ref={ref}
      {...props}
    >
      {buttonContent}
    </Comp>
  );
});

Button.displayName = 'Button';

export { Button };

