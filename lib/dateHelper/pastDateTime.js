/*export const isFutureDateTime = (dateStr, timeStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const meetingDate = new Date(year, month - 1, day, hour, minute);
  const now = new Date();

  return meetingDate.getTime() > now.getTime();
};
*//*
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
}*/
export function isvalidateDateTime(dateStr, timeStr) {
  const [day, month, year] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const now = new Date();

  // Reject past date/time
  if (date <= now) return false;

  const dayOfWeek = date.getUTCDay();
  // Reject Saturday (6) or Sunday (0)
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  const utcHour = date.getUTCHours();
  const utcMinute = date.getUTCMinutes();

  // Convert 11:00 AM – 5:00 PM PKT to UTC (i.e., 06:00 – 12:00 UTC)
  const earliest = 6 * 60;  // 06:00 UTC in minutes
  const latest = 12 * 60;   // 12:00 UTC in minutes
  const currentMinutes = utcHour * 60 + utcMinute;

  if (currentMinutes < earliest || currentMinutes >= latest) return false;

  return true;
}
