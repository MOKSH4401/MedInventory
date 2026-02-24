import React from 'react';

const BillTemplate = React.forwardRef(({ purchaseData, settings }, ref) => {
  const total = purchaseData.totalAmount;
  const discountAmount = purchaseData.discountAmount ?? 0;
  const finalAmount = purchaseData.finalAmount ?? total;
  const couponCode = purchaseData.couponCode;
  const items = Array.isArray(purchaseData.items) ? purchaseData.items : [{
    name: purchaseData.itemName,
    quantity: purchaseData.quantity,
    price: purchaseData.price,
    amount: purchaseData.totalAmount
  }];

  // Fixed light theme styles regardless of site theme
  const styles = {
    container: {
      padding: '40px',
      width: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#ffffff',
      color: '#000000',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '20px',
      borderBottom: '2px solid #eaeaea',
      paddingBottom: '20px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: '5px'
    },
    subtitle: {
      color: '#666666'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '30px'
    },
    tableHeader: {
      backgroundColor: '#f8f9fa',
      color: '#000000'
    },
    tableCell: {
      padding: '12px',
      borderBottom: '1px solid #dee2e6',
      color: '#000000'
    },
    tableCellRight: {
      padding: '12px',
      borderBottom: '1px solid #dee2e6',
      textAlign: 'right',
      color: '#000000'
    },
    totalRow: {
      borderTop: '2px solid #000000',
      fontWeight: 'bold',
      color: '#000000'
    },
    footer: {
      marginTop: '40px',
      borderTop: '1px solid #dee2e6',
      paddingTop: '20px',
      textAlign: 'center',
      color: '#666666'
    }
  };

  return (
    <div ref={ref} style={styles.container} className="!bg-white">
      {/* Force white background and black text regardless of theme */}
      <style>
        {`
          @media (prefers-color-scheme: dark) {
            .print-bill * {
              color: #000000 !important;
              background-color: #ffffff !important;
            }
          }
        `}
      </style>
      <div className="print-bill" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>MedInventory</h1>
            <p style={styles.subtitle}>Medical Store</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={styles.title}>INVOICE</h2>
            <p style={styles.subtitle}>Bill Number: {purchaseData._id?.slice(-6)}</p>
            <p style={styles.subtitle}>{new Date(purchaseData.purchaseDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div style={{ marginBottom: '30px', color: styles.color }}>
          <p><strong>Customer:</strong> {purchaseData.buyerName}</p>
          <p><strong>Phone:</strong> {purchaseData.buyerPhone}</p>
          <p><strong>Payment Mode:</strong> {purchaseData.paymentMode}</p>
        </div>

        {/* Items Table */}
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.tableCell}>Sr.</th>
              <th style={styles.tableCell}>Medicine Name</th>
              <th style={styles.tableCellRight}>Qty</th>
              <th style={styles.tableCellRight}>Price/Unit</th>
              <th style={styles.tableCellRight}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td style={styles.tableCell}>{index + 1}</td>
                <td style={styles.tableCell}>{item.name}</td>
                <td style={styles.tableCellRight}>{item.quantity}</td>
                <td style={styles.tableCellRight}>{settings.currency} {item.price}</td>
                <td style={styles.tableCellRight}>{settings.currency} {item.price * item.quantity}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="4" style={{ ...styles.tableCellRight }}>Total Amount:</td>
              <td style={styles.tableCellRight}>{settings.currency} {total}</td>
            </tr>
            {couponCode && discountAmount > 0 && (
              <tr>
                <td colSpan="4" style={{ ...styles.tableCellRight }}>Discount ({couponCode}):</td>
                <td style={{ ...styles.tableCellRight, color: '#059669' }}>
                  -{settings.currency} {discountAmount}
                </td>
              </tr>
            )}
            <tr>
              <td colSpan="4" style={{ ...styles.tableCellRight, ...styles.totalRow }}>Final Amount:</td>
              <td style={{ ...styles.tableCellRight, ...styles.totalRow }}>
                {settings.currency} {finalAmount}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={{ marginBottom: '5px' }}>Thank you for your purchase!</p>
          <p>For any queries, please contact: support@medinventory.com</p>
        </div>
      </div>
    </div>
  );
});

export default BillTemplate;
