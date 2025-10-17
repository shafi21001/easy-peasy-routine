import React from 'react';

interface HeaderProps {
  universityName: string;
  departmentName: string;
  effectiveFrom: string;
}

const Header: React.FC<HeaderProps> = ({ universityName, departmentName, effectiveFrom }) => {
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const formatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
      const parts = formatter.formatToParts(d);
      const day = parts.find(p => p.type === 'day')?.value || '';
      const month = parts.find(p => p.type === 'month')?.value || '';
      const year = parts.find(p => p.type === 'year')?.value || '';
      return `${day} ${month}, ${year}`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="relative mb-4 pt-4 pb-3">
      <img
        src="/assets/logo.png"
        alt="Logo"
        style={{ width: '0.8in', height: '0.8in' }}
        className="absolute top-0 left-0"
      />
      <div className="text-center">
        <h2 className="font-semibold" style={{ fontSize: '17px', fontFamily: 'Times New Roman, Times, serif' }}>Department of {departmentName}</h2>
        <h1 className="font-bold" style={{ fontSize: '17px', fontFamily: 'Times New Roman, Times, serif' }}>{universityName}</h1>
        <p style={{ fontSize: '17px', fontFamily: 'Times New Roman, Times, serif' }}>Class Routine — Effective From: {formatDate(effectiveFrom)}</p>
      </div>
    </div>
  );
};

export default Header;