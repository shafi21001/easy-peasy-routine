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
    <div className="relative mb-2 pt-2 pb-2" style={{ display: 'flex', alignItems: 'center' }}>
      <img
        src="/assets/logo.png"
        alt="Logo"
        style={{ width: '0.7in', height: '0.7in' }}
        className="absolute top-2 left-0"
      />
      <div className="text-center" style={{ flex: 1, paddingLeft: '0.8in' }}>
        <h1 className="font-bold" style={{ fontSize: '24px', fontFamily: 'Times New Roman, Times, serif', marginBottom: '4px', fontWeight: 900, letterSpacing: '0.5px' }}>{universityName}</h1>
        <h2 className="font-semibold" style={{ fontSize: '18px', fontFamily: 'Times New Roman, Times, serif', marginBottom: '2px' }}>Department of {departmentName}</h2>
        <p style={{ fontSize: '15px', fontFamily: 'Times New Roman, Times, serif' }}>Class Routine — Effective From: {formatDate(effectiveFrom)}</p>
      </div>
    </div>
  );
};

export default Header;