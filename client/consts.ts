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
  { name: 'Low', id: 0, severity: 'success' },
  { name: 'Medium', id: 1, severity: 'info' },
  { name: 'High', id: 2, severity: 'warning' },
  { name: 'Urgent', id: 3, severity: 'danger' }
] as const;

export const TASK_STATUS = ['Backlog', 'Grooming', 'Todo', 'In Progress', 'In Review', 'Complete'];
