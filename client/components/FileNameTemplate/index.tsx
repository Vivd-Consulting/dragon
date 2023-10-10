import { useFileName } from 'hooks/useFileName';

export function FileNameTemplate({ fileId }) {
  const [fileName] = useFileName(fileId);

  return <span>{fileName}</span>;
}
