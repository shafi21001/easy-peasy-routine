import React from 'react';

interface HeaderMinimalProps {
  universityName: string;
  departmentName: string;
  effectiveFrom: string;
}

const HeaderMinimal: React.FC<HeaderMinimalProps> = ({ departmentName, effectiveFrom }) => {
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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: '0.7in', // Offset for logo space
        lineHeight: '1.2', // Tighter line spacing
        WebkitFontSmoothing: 'subpixel-antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility'
      }}>
        <h1 style={{ 
          fontSize: '16px', 
          fontFamily: 'Times New Roman, Times, serif', 
          margin: 0,
          padding: 0,
          fontWeight: 900, // Extra bold
          letterSpacing: '0.3px',
          lineHeight: '1.1',
          WebkitFontSmoothing: 'subpixel-antialiased',
          textRendering: 'geometricPrecision'
        }}>
          Mawlana Bhashani Science and Technology University
        </h1>
        <h2 style={{ 
          fontSize: '16px', 
          fontFamily: 'Times New Roman, Times, serif', 
          margin: 0,
          padding: 0,
          fontWeight: 'bold',
          lineHeight: '1.1',
          WebkitFontSmoothing: 'antialiased',
          textRendering: 'geometricPrecision'
        }}>
          Department of {departmentName}
        </h2>
        <p style={{ 
          fontSize: '16px', 
          fontFamily: 'Times New Roman, Times, serif',
          margin: 0,
          padding: 0,
          lineHeight: '1.1',
          WebkitFontSmoothing: 'antialiased',
          textRendering: 'geometricPrecision'
        }}>
          Class Routine — Effective From: {formatDate(effectiveFrom)}
        </p>
      </div>
    </div>
  );
};

export default HeaderMinimal;
