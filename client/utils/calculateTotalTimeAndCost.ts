import dayjs from 'dayjs';

function roundUpToHalfHour(minutes) {
  const halfHour = 30;

  return Math.ceil(minutes / halfHour) * halfHour;
}

function formatAsHoursAndMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
}

// Helper function to calculate time spent for a single pair
function calculateTimeSpent(start, end) {
  const startTime = dayjs(start);
  const endTime = dayjs(end);
  const durationMinutes = endTime.diff(startTime, 'minutes');

  return roundUpToHalfHour(durationMinutes);
}

// Main function to calculate total time spent
export default function calculateTotalTimeAndCost(timePairs, rate = 0) {
  let totalMinutesSpent = 0;

  for (const pair of timePairs) {
    const { start_time, end_time } = pair;

    totalMinutesSpent += calculateTimeSpent(start_time, end_time);
  }

  const totalTime = formatAsHoursAndMinutes(totalMinutesSpent);
  const totalHours = totalMinutesSpent / 60;
  const totalCost = rate * totalHours;

  return {
    totalTime,
    totalCost
  };
}
