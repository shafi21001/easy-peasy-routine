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
        paddingTop: '0.2in',  // Top margin
        paddingBottom: '0.1in',  // Bottom margin - reduced to minimize empty space
        paddingLeft: '0.5in',
        paddingRight: '0.5in',
        margin: '0 auto',
        boxSizing: 'border-box',
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
        WebkitPrintColorAdjust: 'exact',
        colorAdjust: 'exact',
        printColorAdjust: 'exact'
      }}
    >
      {children}
    </div>
  );
};

export default PrintPreviewMinimal;
