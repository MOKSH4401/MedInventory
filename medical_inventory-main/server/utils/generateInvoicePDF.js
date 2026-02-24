const PDFDocument = require("pdfkit");

/**
 * Generate invoice PDF as Buffer
 * @param {object} purchaseData - { items, totalAmount, buyerName, buyerPhone, paymentMode, paymentId?, billId }
 * @param {string} currency - Currency symbol/code (e.g. "₹" or "INR")
 * @returns {Promise<Buffer>}
 */
const getCurrencySymbol = (currency) => {
  if (!currency || currency === "INR") return "₹";
  return currency;
};

const generateInvoicePDF = (purchaseData, currency = "₹") => {
  const curr = getCurrencySymbol(currency);
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const items = purchaseData.items || [];
      const totalAmount = purchaseData.totalAmount || 0;
      const billId = purchaseData.billId || `INV-${Date.now().toString().slice(-6)}`;
      const purchaseDate = purchaseData.purchaseDate
        ? new Date(purchaseData.purchaseDate).toLocaleDateString()
        : new Date().toLocaleDateString();

      // Header
      doc.fontSize(24).text("MedInventory", { continued: false });
      doc.fontSize(10).fillColor("#666666").text("Medical Store", { continued: false });
      doc.moveDown(0.5);

      doc
        .fontSize(18)
        .fillColor("#000000")
        .text("INVOICE", { align: "right" });
      doc.fontSize(10).fillColor("#666666").text(`Bill Number: ${billId}`, { align: "right" });
      doc.text(purchaseDate, { align: "right" });
      doc.moveDown(1.5);

      // Customer details
      doc.fontSize(11).fillColor("#000000");
      doc.text(`Customer: ${purchaseData.buyerName || "N/A"}`);
      doc.text(`Phone: ${purchaseData.buyerPhone || "N/A"}`);
      doc.text(`Payment Mode: ${purchaseData.paymentMode || "N/A"}`);
      if (purchaseData.paymentId) {
        doc.text(`Payment ID: ${purchaseData.paymentId}`);
      }
      doc.moveDown(1);

      // Table header
      const tableTop = doc.y;
      doc.fontSize(10).fillColor("#000000");
      doc.text("Sr.", 50, tableTop, { width: 40 });
      doc.text("Medicine Name", 90, tableTop, { width: 220 });
      doc.text("Qty", 310, tableTop, { width: 50, align: "right" });
      doc.text("Price/Unit", 360, tableTop, { width: 80, align: "right" });
      doc.text("Amount", 440, tableTop, { width: 100, align: "right" });
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
      doc.moveDown(0.5);

      // Table rows
      let y = doc.y;
      items.forEach((item, index) => {
        const rowHeight = 20;
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
        doc.text(String(index + 1), 50, y, { width: 40 });
        doc.text(String(item.name || "").substring(0, 30), 90, y, { width: 220 });
        doc.text(String(item.quantity || 0), 310, y, { width: 50, align: "right" });
        doc.text(`${curr} ${Number(item.price || 0).toFixed(2)}`, 360, y, {
          width: 80,
          align: "right",
        });
        const amount = (item.price || 0) * (item.quantity || 0);
        doc.text(`${curr} ${amount.toFixed(2)}`, 440, y, { width: 100, align: "right" });
        y += rowHeight;
      });

      doc.y = y + 10;
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold");
      const totalY = doc.y;
      doc.text("Total Amount:", 360, totalY, { width: 80, align: "right" });
      doc.text(`${curr} ${Number(totalAmount).toFixed(2)}`, 440, totalY, {
        width: 100,
        align: "right",
      });
      doc.font("Helvetica");
      doc.moveDown(2);

      // Footer
      doc.fontSize(10).fillColor("#666666").text("Thank you for your purchase!", { align: "center" });
      doc.text("For any queries, please contact: support@medinventory.com", {
        align: "center",
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateInvoicePDF };
