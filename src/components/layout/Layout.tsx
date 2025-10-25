
import React from 'react';
import { NavLink } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="shadow-sm sticky top-0 z-40" style={{ backgroundColor: '#d6ecff' }}>
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div
            className="w-full flex justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg rounded-md select-none cursor-default"
            style={{
              fontFamily: '"Lucida Handwriting", "Brush Script MT", cursive',
            }}
          >
            <div className="flex items-center justify-center gap-4 max-w-5xl w-full text-center flex-wrap">
              {/* Logo with link */}
              <a
                href="https://ict.mbstu.ac.bd/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <img
                  src="/assets/logo.png"
                  alt="Logo"
                  style={{
                    width: 'clamp(40px, 8vw, 80px)',
                    height: 'clamp(40px, 8vw, 80px)',
                    borderRadius: '0.25rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                  }}
                />
              </a>

              {/* University Name */}
              <span
                className="text-white font-bold"
                style={{
                  fontSize: 'clamp(18px, 4vw, 32px)',
                  lineHeight: 1.2,
                }}
              >
                Department of Information and Communication Technology
              </span>
            </div>
          </div>


          <nav className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={({ isActive }) => `text-gray-700 hover:text-gray-900 ${isActive ? 'font-semibold underline-offset-4' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/view-routines" className={({ isActive }) => `text-gray-700 hover:text-gray-900 ${isActive ? 'font-semibold underline-offset-4' : ''}`}>
              View Routines
            </NavLink>
            <NavLink to="/how-to-use" className={({ isActive }) => `text-gray-700 hover:text-gray-900 ${isActive ? 'font-semibold underline-offset-4' : ''}`}>
              How to Use
            </NavLink>
          </nav>
          <div className="flex items-center space-x-4" />
        </div>
      </header>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
