import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <img 
        src="/Logo.jpg" 
        alt="Logo de la empresa" 
        className="h-[7.8rem] w-auto" // Increased from 5.2rem to 7.8rem (50% larger)
      />
    </div>
  );
};

export default Logo;