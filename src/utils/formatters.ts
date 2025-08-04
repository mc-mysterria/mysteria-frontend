export const formatDateForInput = (
  date: Date | string | null | undefined,
): string => {
  if (!date) return "";

  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // If it's a string in ISO format without timezone, treat as UTC to avoid timezone issues
  if (
    typeof date === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(date)
  ) {
    return date.split("T")[0];
  }

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  // Use local date components to avoid timezone conversion
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateForDisplay = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
