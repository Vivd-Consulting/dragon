import { useRouter } from 'next/router';
import { Button } from 'primereact/button';

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      icon="pi pi-arrow-left"
      size="small"
      text
      raised
      aria-label="Back"
      onClick={() => router.back()}
    />
  );
}
