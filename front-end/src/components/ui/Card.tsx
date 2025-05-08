// frontend/src/components/ui/Card.tsx
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType; // Permet de spécifier un autre élément HTML que div
}

const Card: React.FC<CardProps> = React.forwardRef<HTMLElement, CardProps>((
  { children, className = '', as: Component = 'div', ...props },
  ref
) => {
  return (
    <Component
      ref={ref as any} // Le typage de ref peut être complexe avec `as`
      className={`bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = (
  { children, className = '', ...props }
) => {
  return (
    <div className={`p-4 sm:p-6 border-b border-neutral-light ${className}`} {...props}>
      {children}
    </div>
  );
};
CardHeader.displayName = 'CardHeader';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = (
  { children, className = '', ...props }
) => {
  return (
    <div className={`p-4 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};
CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const CardFooter: React.FC<CardFooterProps> = (
  { children, className = '', ...props }
) => {
  return (
    <div className={`p-4 sm:p-6 bg-neutral-lightest border-t border-neutral-light ${className}`} {...props}>
      {children}
    </div>
  );
};
CardFooter.displayName = 'CardFooter';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
    className?: string;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle: React.FC<CardTitleProps> = (
    { children, className = '', as: Heading = 'h3', ...props }
) => {
    return (
        <Heading className={`text-lg font-semibold text-neutral-darkest ${className}`} {...props}>
            {children}
        </Heading>
    );
};
CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
    className?: string;
}

const CardDescription: React.FC<CardDescriptionProps> = (
    { children, className = '', ...props }
) => {
    return (
        <p className={`text-sm text-neutral-default mt-1 ${className}`} {...props}>
            {children}
        </p>
    );
};
CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };

