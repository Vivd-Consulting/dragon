import { useState, useCallback } from 'react';

function useClipboard() {
  const [hasCopied, setHasCopied] = useState(false);
  const [copiedValue, setCopiedValue] = useState(null);

  const copyToClipboard = useCallback(value => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(value)
        .then(() => {
          setHasCopied(true);
          setCopiedValue(value);

          // You may also want to reset `hasCopied` after a certain time
          setTimeout(() => setHasCopied(false), 2000);
        })
        .catch(() => {
          setHasCopied(false);
        });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');

      textarea.value = value;
      textarea.style.position = 'fixed'; // Prevents scrolling to bottom
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const successful = document.execCommand('copy');

        setHasCopied(successful);
        if (successful) {
          setCopiedValue(value);
        }
      } catch (err) {
        setHasCopied(false);
      }
      document.body.removeChild(textarea);
    }
  }, []);

  return { hasCopied, copiedValue, copyToClipboard };
}

export default useClipboard;
