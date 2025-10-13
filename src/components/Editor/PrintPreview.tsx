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
        padding: '0.5in', // 0.5in page margins on all sides
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
};

export default PrintPreview;