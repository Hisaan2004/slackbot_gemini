/*export const isFutureDateTime = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const meetingDate = new Date(year, month - 1, day, hour, minute);
  const now = new Date();

  return meetingDate.getTime() > now.getTime();
};
*/
export function isvalidateDateTime(dateStr, timeStr) {
  const [day, month, year] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const now = new Date();

  if (date <= now) return false;

  const dayOfWeek = date.getUTCDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  const utcHour = date.getUTCHours();
  if (utcHour < 6 || utcHour > 12) return false;

  return true;
}