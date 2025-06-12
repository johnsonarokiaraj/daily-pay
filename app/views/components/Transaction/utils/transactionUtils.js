import dayjs from "dayjs";

// Parse date string properly - it might come in different formats
export const parseTransactionDate = (dateString) => {
  if (!dateString) {
    console.log("No date provided, using today");
    return dayjs();
  }

  // Try parsing with DD-MM-YYYY format first
  let parsedDate = dayjs(dateString, "DD-MM-YYYY");
  console.log("Parsed with DD-MM-YYYY:", parsedDate.isValid(), parsedDate.format());

  // If invalid, try other common formats
  if (!parsedDate.isValid()) {
    parsedDate = dayjs(dateString, "YYYY-MM-DD");
    console.log("Parsed with YYYY-MM-DD:", parsedDate.isValid(), parsedDate.format());
  }
  if (!parsedDate.isValid()) {
    parsedDate = dayjs(dateString);
    console.log("Parsed with default:", parsedDate.isValid(), parsedDate.format());
  }
  // If still invalid, use today's date
  if (!parsedDate.isValid()) {
    parsedDate = dayjs();
    console.log("Using today's date");
  }

  return parsedDate;
};

// Format date for display
export const formatDisplayDate = (date) => {
  if (!date) return "";

  const parsedDate = dayjs(date, [
    "DD-MM-YYYY",
    "YYYY-MM-DD",
    "MM-DD-YYYY",
  ]);

  if (parsedDate.isValid()) {
    return parsedDate.format("DD-MM-YYYY");
  }

  return date;
};

// Prepare transaction data for API submission
export const prepareTransactionData = (values) => ({
  ...values,
  transaction_date: values.transaction_date.format("DD-MM-YYYY"),
  tag_list:
    values.tag_list && values.tag_list.join
      ? values.tag_list.join(",")
      : "",
  is_credit: values.is_credit || false,
});

// Generate tag color based on tag name
export const getTagColor = (name) => {
  const colors = [
    "magenta", "red", "volcano", "orange", "gold",
    "lime", "green", "cyan", "blue", "geekblue", "purple"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
