
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import PDFPage from './PDFPage';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FlipBookProps {
  pdfUrl: string;
}

const FlipBook: React.FC<FlipBookProps> = ({ pdfUrl }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageImages, setPageImages] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const pdfDocRef = useRef<any>(null);

  // Load PDF and convert pages to images
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setIsLoading(true);
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        
        // Load first few pages immediately
        for (let i = 1; i <= Math.min(4, pdf.numPages); i++) {
          await loadPage(pdf, i);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading PDF:', error);
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl]);

  const loadPage = async (pdf: any, pageNum: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      const imageUrl = canvas.toDataURL();
      setPageImages(prev => ({ ...prev, [pageNum]: imageUrl }));
    } catch (error) {
      console.error(`Error loading page ${pageNum}:`, error);
    }
  };

  // Preload nearby pages
  useEffect(() => {
    if (!pdfDocRef.current) return;

    const loadNearbyPages = async () => {
      const pagesToLoad = [];
      for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        if (!pageImages[i]) {
          pagesToLoad.push(i);
        }
      }

      for (const pageNum of pagesToLoad) {
        await loadPage(pdfDocRef.current, pageNum);
      }
    };

    loadNearbyPages();
  }, [currentPage, totalPages, pageImages]);

  const handleNextPage = () => {
    if (currentPage < totalPages && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsFlipping(false);
      }, 250);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && !isFlipping) {
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsFlipping(false);
      }, 250);
    }
  };

  const handlePageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const centerX = rect.width / 2;

    if (clickX > centerX) {
      handleNextPage();
    } else {
      handlePrevPage();
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto p-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
            <h3 className="text-lg font-semibold mb-2">Loading your book...</h3>
            <p className="text-gray-600">Please wait while we prepare your reading experience.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Book Container */}
      <Card className="relative bg-gradient-to-b from-gray-50 to-gray-100 p-8 shadow-2xl">
        <div 
          className="relative mx-auto bg-white shadow-lg cursor-pointer"
          style={{ 
            width: '800px', 
            height: '600px',
            perspective: '1200px'
          }}
          onClick={handlePageClick}
        >
          {/* Book Spine Shadow */}
          <div className="absolute left-1/2 top-0 w-1 h-full bg-gradient-to-r from-gray-300 to-gray-400 z-30 transform -translate-x-1/2 shadow-lg" />
          
          {/* Current Page */}
          <PDFPage
            pageNumber={currentPage}
            pageImage={pageImages[currentPage] || null}
            isActive={true}
            isNext={false}
            className={isFlipping ? 'animate-pulse' : ''}
          />
          
          {/* Next Page (if exists) */}
          {currentPage < totalPages && (
            <PDFPage
              pageNumber={currentPage + 1}
              pageImage={pageImages[currentPage + 1] || null}
              isActive={false}
              isNext={true}
            />
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevPage}
            disabled={currentPage <= 1 || isFlipping}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <Button 
            variant="outline" 
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || isFlipping}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Reading Instructions */}
      <div className="text-center mt-6 text-gray-600">
        <p className="text-sm">
          Click on the left or right side of the book to turn pages, or use the navigation buttons below.
        </p>
      </div>
    </div>
  );
};

export default FlipBook;
