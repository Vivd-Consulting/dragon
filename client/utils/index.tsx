import dayjs from 'dayjs';

export function whatsChanged(prev, next, transformer: Function | null = null) {
  const prevSet = transformer ? new Set(transformer(prev)) : new Set(prev);
  const nextSet = transformer ? new Set(transformer(next)) : new Set(next);
  const added = [...nextSet].filter(x => !prevSet.has(x));
  const removed = [...prevSet].filter(x => !nextSet.has(x));

  return [added, removed];
}

export function sanitize(payload, serializeArrays = true, recurring = false): any {
  return Object.keys(payload).reduce((acc, key) => {
    const value = payload[key];

    if (value === null || value === undefined) {
      return acc;
    }

    const valueType = typeof value;

    if (Array.isArray(value)) {
      if (serializeArrays) {
        acc[key] = `{${value.join(',')}}`;
      } else {
        if (recurring) {
          acc[key] = value.map(v => sanitize(v, serializeArrays, true));
        } else {
          acc[key] = value;
        }
      }
    } else if (valueType === 'object') {
      acc[key] = sanitize(value, serializeArrays);
    } else if (valueType === 'string' && value !== '') {
      acc[key] = value;
    } else if (valueType === 'number') {
      acc[key] = value;
    } else if (valueType === 'boolean') {
      acc[key] = value;
    }

    return acc;
  }, {});
}

//Takes a cardinal number and returns a string with its ordinal number
export function numberToWordFormat(num: number) {
  if (!Number.isInteger(num)) {
    return num.toString();
  }

  const ordinalSuffix: string =
    (3 < num && num < 21) || (num > 23 && num % 10 > 3)
      ? 'th'
      : num % 10 === 1
      ? 'st'
      : num % 10 === 2
      ? 'nd'
      : 'rd';

  return num.toString() + ordinalSuffix;
}

export async function checkLinkIsSafe(link) {
  if (!link) {
    return true;
  }

  try {
    const url = `https://webrisk.googleapis.com/v1/uris:search?threatTypes=MALWARE&threatTypes=UNWANTED_SOFTWARE&threatTypes=SOCIAL_ENGINEERING&uri=${encodeURIComponent(
      link
    )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.threats && data.threats.length > 0) {
      alert('Suspicious URL. Please use a different link.');

      return 'Suspicious URL. Please use a different link.';
    } else {
      return true;
    }
  } catch (error) {
    const err = error as { message: string };

    return err.message;
  }
}

export const dateFormat = date => {
  if (!date) {
    return '--:--:--';
  }

  return dayjs(date).format('MMM D, HH:mm');
};

export function convertDataToDropdownOptions(data: any[], labelKey: string, valueKey: string) {
  const options = data?.map(item => ({
    label: item[labelKey] as string,
    value: item[valueKey]
  }));

  return options;
}

export function getNextWeek() {
  const today = dayjs();
  const nextWeek = today.add(7, 'day');

  const iso8601Date = nextWeek.format();

  return iso8601Date;
}

export function getToday(format) {
  const currentDate = dayjs();

  if (format) {
    currentDate.format(format);
  }

  return currentDate;
}

export function getCurrentMonth() {
  const currentDate = dayjs();

  const monthName = currentDate.format('MMMM');

  return monthName;
}

export function getCurrentMonthRange() {
  const now = dayjs();
  const startOfMonth = now.startOf('month').toISOString();
  const endOfMonth = now.endOf('month').toISOString();

  return { startOfMonth, endOfMonth };
}

export function formatDuration(duration) {
  return duration.format('HH:mm:ss');

  const formattedDuration =
    (duration.hours() && `${duration.hours()} hr`) ||
    (duration.minutes() && `${duration.minutes()} min`) ||
    (duration.seconds() && `${duration.seconds()} sec`);

  return formattedDuration;
}
