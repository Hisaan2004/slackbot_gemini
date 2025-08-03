export const isFutureDateTime = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const meetingDate = new Date(year, month - 1, day, hour, minute);
  const now = new Date();

  return meetingDate.getTime() > now.getTime();
};