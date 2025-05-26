import React from 'react';

interface FABProps {
  icon: React.ReactNode;
  onClick: () => void;
  position?: 'bottom-right' | 'bottom-center';
  color?: 'primary' | 'secondary' | 'accent';
}

const FloatingActionButton: React.FC<FABProps> = ({ 
  icon, 
  onClick, 
  position = 'bottom-right',
  color = 'primary'
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };
  
  const colorClasses = {
    'primary': 'bg-primary-500 hover:bg-primary-600',
    'secondary': 'bg-secondary-500 hover:bg-secondary-600',
    'accent': 'bg-accent-500 hover:bg-accent-600'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`fixed ${positionClasses[position]} ${colorClasses[color]} text-white p-4 rounded-full shadow-lg z-10 transition-all duration-300 hover:shadow-xl active:scale-95`}
    >
      {icon}
    </button>
  );
};

export default FloatingActionButton;
