// Utility function to format numbers in Indian currency system
export const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === 0) {
    return '₹0.00';
  }

  // Convert to number and handle negative values
  const num = parseFloat(amount);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Format to 2 decimal places
  const formatted = absNum.toFixed(2);
  const [integerPart, decimalPart] = formatted.split('.');

  // Apply Indian number formatting (lakhs, crores)
  let formattedInteger = integerPart;

  if (integerPart.length > 3) {
    // Convert to Indian number system
    const reversed = integerPart.split('').reverse();
    let formattedReversed = '';

    reversed.forEach((char, index) => {
      formattedReversed += char;
      // Add comma after 3rd digit from right
      if (index === 2 && reversed.length > 3) {
        formattedReversed += ',';
      }
      // Add comma every 2 digits after the first comma
      else if (index > 2 && (index - 2) % 2 === 0 && index < reversed.length - 1) {
        formattedReversed += ',';
      }
    });

    formattedInteger = formattedReversed.split('').reverse().join('');
  }

  const result = `₹${formattedInteger}.${decimalPart}`;
  return isNegative ? `-${result}` : result;
};
