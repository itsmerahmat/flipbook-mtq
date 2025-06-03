
import React from 'react';
import { cn } from '@/lib/utils';

interface PDFPageProps {
  pageNumber: number;
  pageImage: string | null;
  isActive: boolean;
  isNext: boolean;
  className?: string;
}

const PDFPage: React.FC<PDFPageProps> = ({ 
  pageNumber, 
  pageImage, 
  isActive, 
  isNext, 
  className 
}) => {
  return (
    <div 
      className={cn(
        "absolute top-0 w-1/2 h-full bg-white shadow-lg transition-all duration-500 ease-in-out",
        "border border-gray-200 overflow-hidden",
        {
          "left-0 origin-right": pageNumber % 2 === 1,
          "right-0 origin-left": pageNumber % 2 === 0,
          "z-20": isActive,
          "z-10": isNext,
          "z-0": !isActive && !isNext,
        },
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
      }}
    >
      {pageImage ? (
        <img 
          src={pageImage} 
          alt={`Page ${pageNumber}`}
          className="w-full h-full object-contain p-4"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-400 mb-2">Page {pageNumber}</div>
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFPage;
