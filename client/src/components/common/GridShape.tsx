import React from 'react';

const GridShape: React.FC = () => {
  return (
    <>
      <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] opacity-20 xl:max-w-[450px]">
        <svg width="450" height="450" viewBox="0 0 450 450" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="450" height="450" fill="url(#grid)" className="text-brand-500" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 opacity-20 xl:max-w-[450px]">
        <svg width="450" height="450" viewBox="0 0 450 450" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="450" height="450" fill="url(#grid)" className="text-brand-500" />
        </svg>
      </div>
    </>
  );
};

export default GridShape;

