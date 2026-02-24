import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (content, filename) => {
  try {
    const canvas = await html2canvas(content, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 795, // A4 width in pixels (roughly)
      height: 1125, // A4 height in pixels (roughly)
      windowWidth: 795,
      windowHeight: 1125
    });

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt', // Use points for more precise measurements
      format: 'a4'
    });

    // Calculate dimensions
    const imgWidth = 595.28; // A4 width in points
    const imgHeight = 841.89; // A4 height in points
    const aspectRatio = canvas.height / canvas.width;

    // Add image with proper dimensions
    doc.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      0,
      0,
      imgWidth,
      imgWidth * aspectRatio,
      '',
      'MEDIUM'
    );

    doc.save(filename);
    return true;
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error('Failed to generate PDF');
  }
};
