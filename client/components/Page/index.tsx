import { Card } from 'primereact/card';
import React from 'react';

interface PageProps {
  children: React.ReactNode;
}

export default function Page({ children }: PageProps) {
  return <Card className="page-card">{children}</Card>;
}
