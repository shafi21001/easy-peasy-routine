
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '../ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="shadow-sm sticky top-0 z-40" style={{ backgroundColor: '#d6ecff' }}>
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-3 select-none cursor-default">
            <img src="/assets/logo.png" alt="Logo" style={{ width: '1in', height: '1in' }} />
            <span className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'cursive' }}>Mawlana Bhashani Science and Technology University</span>
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
