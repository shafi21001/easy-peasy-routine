import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const exportAsLegalPdf = async (element: HTMLElement, filename: string): Promise<void> => {
  // Dynamically adjust grid cell fonts to fit one line before capture
  const adjustedNodes: Array<{ el: HTMLElement; original: string }> = [];
  const cellTexts = Array.from(element.querySelectorAll<HTMLElement>('.grid-cell-text'));
  cellTexts.forEach((el) => {
    const parentCell = el.closest('td') as HTMLTableCellElement | null;
    if (!parentCell) return;
    const maxSize = Number(el.dataset.max || '12');
    const minSize = Number(el.dataset.min || '8');
    // Binary search best size
    let lo = minSize;
    let hi = maxSize;
    let best = minSize;
    const originalFontSize = window.getComputedStyle(el).fontSize;
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      el.style.fontSize = `${mid}px`;
      // ensure single line and within cell width
      el.style.whiteSpace = 'nowrap';
      const fits = el.scrollWidth <= parentCell.clientWidth - 6; // small padding allowance
      if (fits) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    adjustedNodes.push({ el, original: originalFontSize });
    el.style.fontSize = `${best}px`;
  });

  // Force editor header font sizes per requirement (18px for better print clarity)
  const headerTexts = Array.from(element.querySelectorAll<HTMLElement>('div.text-center h1, div.text-center h2, div.text-center p'));
  const headerAdjusted: Array<{ el: HTMLElement; original: string }> = [];
  headerTexts.forEach((h) => {
    const original = window.getComputedStyle(h).fontSize;
    headerAdjusted.push({ el: h, original });
    h.style.fontSize = '18px'; // Increased for better print clarity
    h.style.fontWeight = 'bold';
  });

  // Enlarge head row fonts for better print clarity
  const tableHeadCells = Array.from(element.querySelectorAll<HTMLElement>('table thead th'));
  const thAdjusted: Array<{ el: HTMLElement; original: string }> = [];
  tableHeadCells.forEach((th) => {
    const original = window.getComputedStyle(th).fontSize;
    thAdjusted.push({ el: th, original });
    th.style.fontSize = '14px'; // Increased for better print clarity
    th.style.fontWeight = 'bold';
  });

  // Remove subtle shadows/noise by forcing a clean background and higher quality capture
  const prevBoxShadow = (element as HTMLElement).style.boxShadow;
  (element as HTMLElement).style.boxShadow = 'none';
  
  // Remove any existing shadows from all child elements
  const shadowElements = Array.from(element.querySelectorAll<HTMLElement>('*'));
  const shadowRevertStyles: Array<{ el: HTMLElement; prop: string; prev: string }> = [];
  shadowElements.forEach((el) => {
    const prevShadow = el.style.boxShadow;
    shadowRevertStyles.push({ el, prop: 'boxShadow', prev: prevShadow });
    el.style.boxShadow = 'none';
  });

  // Temporarily force darker, higher-contrast styles for print clarity
  const revertStyles: Array<{ el: HTMLElement; prop: string; prev: string }> = [];
  const forceStyle = (el: HTMLElement, prop: keyof CSSStyleDeclaration, value: string) => {
    const prev = (el.style as any)[prop] as string;
    revertStyles.push({ el, prop: prop as string, prev });
    (el.style as any)[prop] = value;
  };

  // Force darker text colors for print
  const textNodes = Array.from(element.querySelectorAll<HTMLElement>('th, td, span, p, h1, h2, h3, h4, h5, h6, div, li'));
  textNodes.forEach((n) => {
    // Use pure black for maximum darkness and clarity
    forceStyle(n, 'color', '#000000');
    // Use medium font weight for better visibility without taking more space
    forceStyle(n, 'fontWeight', '600');
    // Add text shadow for better definition without affecting layout
    forceStyle(n, 'textShadow', '0.5px 0.5px 0px rgba(0,0,0,0.3)');
    
    // Improve readability for table cells
    if (n.tagName === 'TH' || n.tagName === 'TD') {
      // Use thinner borders for cleaner appearance
      forceStyle(n, 'borderColor', '#000000');
      forceStyle(n, 'borderWidth', '1px'); // Thinner borders for cleaner look
      forceStyle(n, 'borderStyle', 'solid');
    }
  });

  // Improve text rendering for print clarity
  forceStyle(element, 'filter', 'contrast(1.5) brightness(0.95) saturate(1.2)');
  // Use proper CSS property casting for webkit properties
  (element.style as any).textRendering = 'optimizeLegibility';
  (element.style as any).webkitFontSmoothing = 'subpixel-antialiased';
  (element.style as any).mozOsxFontSmoothing = 'auto';
  // Force crisp edges for better text definition
  (element.style as any).imageRendering = 'crisp-edges';

  const canvas = await html2canvas(element, {
    scale: 4, // Higher scale for maximum text clarity
    useCORS: true,
    backgroundColor: '#ffffff',
    allowTaint: false,
    logging: false,
    imageTimeout: 0,
    // Use higher quality settings for crisp text
    removeContainer: true,
  });

  // Use maximum quality PNG for crisp text
  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: 'legal', // 8.5 x 14 inches
    compress: false, // Disable compression for better text quality
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  // Restore original sizes after capture
  adjustedNodes.forEach(({ el, original }) => {
    el.style.fontSize = original;
  });
  headerAdjusted.forEach(({ el, original }) => {
    el.style.fontSize = original;
  });
  thAdjusted.forEach(({ el, original }) => {
    el.style.fontSize = original;
  });
  (element as HTMLElement).style.boxShadow = prevBoxShadow;

  // Revert forced high-contrast styles
  revertStyles.forEach(({ el, prop, prev }) => {
    (el.style as any)[prop] = prev;
  });
  
  // Revert shadow removal
  shadowRevertStyles.forEach(({ el, prop, prev }) => {
    (el.style as any)[prop] = prev;
  });

  // Fill the entire page to avoid unused margins beyond what the layout provides
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
};