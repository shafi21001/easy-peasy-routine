
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
            className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg rounded-md select-none cursor-default"
            style={{ fontFamily: '"Lucida Handwriting", "Brush Script MT", cursive' }}
          >
            {/* Spacer for 2-inch empty space */}
            <div style={{ width: '2in' }}></div>

            {/* Logo */}
            <img
              src="/assets/logo.png"
              alt="Logo"
              style={{
                width: '0.8in',
                height: '0.8in',
                borderRadius: '0.25rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                marginRight: '1rem',
              }}
            />

            {/* University Name */}
            <span
              className="text-white font-bold whitespace-nowrap"
              style={{
                fontSize: '32px',
                textAlign: 'center',
              }}
            >
              Department of Information and Communication Technology
            </span>
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
