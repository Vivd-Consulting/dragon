import { faFire, faArrowDown, faArrowUp, faCircle } from '@fortawesome/free-solid-svg-icons';

export const VALIDATION_PATTERNS = {
  EMAIL: {
    value: /\S+@\S+\.\S+/,
    message: 'Please enter a valid email address.'
  },
  URL: {
    value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    message: 'Please enter a valid URL.'
  }
};

export const ACCEPTED_TYPES = {
  '': /.*/,
  'audio/*': /audio\/(mpeg|ogg)/,
  'image/*': /image\/.*/,
  image_or_audio: /(image|audio)\/.*/
};

export const TASK_PRIORITY = [
  { name: 'Low', id: 0, icon: faArrowDown, textColor: 'text-green-500' },
  { name: 'Medium', id: 1, icon: faCircle, textColor: 'text-orange-500' },
  { name: 'High', id: 2, icon: faArrowUp, textColor: 'text-orange-500' },
  { name: 'Urgent', id: 3, icon: faFire, textColor: 'text-red-500' }
] as const;

export const TASK_STATUS = ['Backlog', 'Grooming', 'Todo', 'In Progress', 'In Review', 'Complete'];

export const PAYMENT_METHODS = [
  { label: 'SWIFT', value: 'swift' },
  { label: 'ACH', value: 'ach' },
  { label: 'E-Transfer', value: 'e-transfer' },
  { label: 'USDT', value: 'usdt' }
];
