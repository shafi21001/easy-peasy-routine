import React from 'react';

interface HeaderMinimalProps {
  universityName: string;
  departmentName: string;
  effectiveFrom: string;
}

const HeaderMinimal: React.FC<HeaderMinimalProps> = ({ universityName, departmentName, effectiveFrom }) => {
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
    <div style={{ 
      height: '0.8in', 
      display: 'flex', 
      alignItems: 'center', 
      position: 'relative',
      width: '100%'
    }}>
      {/* Logo at top left */}
      <img
        src="/assets/logo.png"
        alt="Logo"
        style={{ 
          width: '0.6in', 
          height: '0.6in',
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      />
      
      {/* Centered text */}
      <div style={{ 
        flex: 1,
        textAlign: 'center',
        paddingLeft: '0.7in' // Offset for logo space
      }}>
        <h2 style={{ 
          fontSize: '14px', 
          fontFamily: 'Times New Roman, Times, serif', 
          marginBottom: '2px',
          fontWeight: 'bold'
        }}>
          Department of {departmentName}
        </h2>
        <h1 style={{ 
          fontSize: '14px', 
          fontFamily: 'Times New Roman, Times, serif', 
          marginBottom: '2px',
          fontWeight: 'bold'
        }}>
          {universityName}
        </h1>
        <p style={{ 
          fontSize: '13px', 
          fontFamily: 'Times New Roman, Times, serif',
          margin: 0
        }}>
          Class Routine — Effective From: {formatDate(effectiveFrom)}
        </p>
      </div>
    </div>
  );
};

export default HeaderMinimal;
