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
  'image_or_audio': /(image|audio)\/.*/
};
