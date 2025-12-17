'use client';

import { ConfirmDialog } from 'primereact/confirmdialog';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ConfirmDialog />
    </>
  );
}

