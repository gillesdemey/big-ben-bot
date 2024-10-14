export function getNumberOfChimes() {
  const numMinutes = new Date().getMinutes();
  // this can lag up to one minute behind the CRON invocation
  const isHalfHour = numMinutes === 30 || numMinutes === 31;
  if (isHalfHour) {
    return 1;
  }

  // make sure we return 12 when it's 0 (midnight)
  return new Date().getHours() % 12 || 12;
}
