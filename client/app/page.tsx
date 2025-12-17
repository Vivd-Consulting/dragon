import { redirect } from 'next/navigation';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function Home() {
  redirect('/accounting/transactions');
}

