import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

export default function calculateTotalTimeAndCost(timeArray, rate = 0) {
  let totalTime = dayjs.duration(0);
  let totalCost = 0;

  timeArray.forEach(entry => {
    const startTime = dayjs(entry.start_time);
    const endTime = dayjs(entry.end_time);

    const entryDuration = endTime.diff(startTime);

    totalTime = totalTime.add(entryDuration);

    const entryCost = (entryDuration / (60 * 60 * 1000)) * rate;

    totalCost += entryCost;
  });

  // @ts-ignore
  if (Number.isNaN(totalTime.$ms)) {
    return { totalTime: '--:--:--', totalCost: 0 };
  }

  const formattedTotalTime = `${totalTime.hours()}:${totalTime.minutes()}:${totalTime.seconds()}`;

  return { totalTime: formattedTotalTime, totalCost };
}
