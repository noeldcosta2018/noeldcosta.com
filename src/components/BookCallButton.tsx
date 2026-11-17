import Link from 'next/link';
import { BOOK_CALL_PATH } from '@/lib/call-intake';

interface Props {
  className?: string;
  children: React.ReactNode;
}

// Calls are booked through the intake, never straight into a calendar (Noel, 16 November 2026).
export default function BookCallButton({ className, children }: Props) {
  return (
    <Link href={BOOK_CALL_PATH} className={className}>
      {children}
    </Link>
  );
}
