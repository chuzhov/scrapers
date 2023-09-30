function convertMsToTime(executionTimeMs) {
  let seconds = Math.floor(executionTimeMs / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  seconds %= 60;
  minutes %= 60;
  hours %= 24;

  // Pad single-digit numbers with leading '0'
  const padWithZero = num => {
    return num.toString().padStart(2, '0');
  };

  return {
    days: padWithZero(days),
    hours: padWithZero(hours),
    minutes: padWithZero(minutes),
    seconds: padWithZero(seconds),
  };
}
module.exports = convertMsToTime;
