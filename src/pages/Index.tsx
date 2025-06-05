import FlipBook from '@/components/FlipBook';
import { BookOpen } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="text-center py-8 sm:py-12 px-2">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 leading-tight">SirohNawawi</h1>
        </div>
        <p className="text-base sm:text-lg text-gray-600 max-w-xs sm:max-w-2xl mx-auto">
          Experience Hadith of Arbain of Imam Nawawi with an interactive flipbook interface.<br className="hidden sm:block" />
          Click on either side of the book to turn pages naturally.
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-12">
        <FlipBook />
      </main>

      {/* Footer Instructions */}
      {/* <footer className="text-center py-8 bg-white border-t">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            How to Add Your Own PDF Book
          </h3>
          <div className="text-gray-600 space-y-2">
            <p>1. Place your PDF file in the <code className="bg-gray-100 px-2 py-1 rounded">public/</code> folder</p>
            <p>2. Update the <code className="bg-gray-100 px-2 py-1 rounded">pdfUrl</code> variable in the Index component</p>
            <p>3. Ensure your PDF file is web-optimized for best performance</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default Index;
