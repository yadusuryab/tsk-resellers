export const UPI_CONFIG:any = {
    // Your business UPI ID
    UPI_ID: 'yourbusiness@okhdfcbank', // Change this to your actual UPI ID
    // Or use VPA format: 'yourbusiness@okicici', 'yourbusiness@okaxis', etc.
    
    // Payment amount in INR
    SUBSCRIPTION_AMOUNT: 300,
    
    // Payee name that will appear
    PAYEE_NAME: 'Your Business Name',
    
    // UPI Apps deep linking
    UPI_APPS: {
      gpay: 'gpay',
      phonepe: 'phonepe',
      paytm: 'paytm',
      bhim: 'bhim',
    } as const,
    
    // Generate UPI deep link
    generateUPILink: (amount: number = UPI_CONFIG.SUBSCRIPTION_AMOUNT, note: string = 'Subscription Payment') => {
      const params = new URLSearchParams({
        pa: UPI_CONFIG.UPI_ID,
        pn: UPI_CONFIG.PAYEE_NAME,
        am: amount.toString(),
        tn: note,
        cu: 'INR',
      });
      
      return `upi://pay?${params.toString()}`;
    },
    
    // Generate QR code URL (using Google Charts API - free)
    generateQRCode: (amount: number = UPI_CONFIG.SUBSCRIPTION_AMOUNT) => {
      const upiLink = UPI_CONFIG.generateUPILink(amount);
      return `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(upiLink)}&choe=UTF-8`;
    },
  };