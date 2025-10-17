import React from 'react';

interface PrintPreviewMinimalProps {
  children: React.ReactNode;
}

const PrintPreviewMinimal: React.FC<PrintPreviewMinimalProps> = ({ children }) => {
  return (
    <div
      id="print-preview-minimal"
      className="bg-white"
      style={{
        width: '14in',
        height: '8.5in',
        padding: '0.5in',
        margin: '0 auto',
        boxSizing: 'border-box',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
      }}
    >
      {children}
    </div>
  );
};

export default PrintPreviewMinimal;
