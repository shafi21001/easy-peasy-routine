import React from 'react';

interface PrintPreviewProps {
  children: React.ReactNode;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ children }) => {
  return (
    <div
      id="print-preview"
      className="bg-white"
      style={{
        width: '14in',
        minHeight: '8.5in',
        margin: '0 auto',
        padding: '0.4in', // 0.4in page margins on all sides for legal paper
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
};

export default PrintPreview;