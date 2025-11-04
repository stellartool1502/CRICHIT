import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  onHomeClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onHomeClick }) => {
  return (
    <div>
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button onClick={onHomeClick} className="flex items-center space-x-2">
                 <svg className="h-8 w-8 text-teal-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.378 1.602a.75.75 0 00-.756 0L3.378 6.33a.75.75 0 00.207 1.348l.492.164v6.091a3.75 3.75 0 002.25 3.454l2.25 1.125a.75.75 0 00.75 0l2.25-1.125a3.75 3.75 0 002.25-3.454V7.842l.492-.164a.75.75 0 00.207-1.348L12.378 1.602zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"/>
                    <path d="M19.122 8.166a.75.75 0 00-1.06-.053l-2.26 2.057a.75.75 0 001.007 1.114l2.26-2.057a.75.75 0 00-.053-1.061zM21.75 12a.75.75 0 00-1.04-.69l-2.016.806a.75.75 0 00.682 1.29l2.016-.806A.75.75 0 0021.75 12zM4.938 8.113a.75.75 0 00-.053 1.06l2.26 2.058a.75.75 0 101.007-1.114l-2.26-2.057a.75.75 0 00-1.007-.053zM2.25 12a.75.75 0 00.31.69l2.016.806a.75.75 0 10.682-1.29L3.25 11.31a.75.75 0 00-1.04.69z"/>
                </svg>
                <span className="text-xl font-bold text-gray-800">CRICHIT</span>
              </button>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-sm font-medium text-gray-600 hover:text-teal-600">Live Scores</a>
              <a href="#" className="text-sm font-medium text-gray-600 hover:text-teal-600">Network</a>
              <a href="#" className="text-sm font-medium text-gray-600 hover:text-teal-600">Store</a>
              <a href="#" className="text-sm font-medium text-gray-600 hover:text-teal-600">Contact Us</a>
            </nav>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
