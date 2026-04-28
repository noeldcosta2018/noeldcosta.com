'use client';

import { useState } from 'react';
import { PopupModal } from 'react-calendly';

interface Props {
  className?: string;
  children: React.ReactNode;
}

export default function BookCallButton({ className, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className}
        aria-haspopup="dialog"
      >
        {children}
      </button>
      {typeof document !== 'undefined' && (
        <PopupModal
          url="https://calendly.com/noeldcosta/30min"
          rootElement={document.body}
          open={isOpen}
          onModalClose={() => setIsOpen(false)}
          pageSettings={{
            backgroundColor: 'fffdf9',
            primaryColor: 'fc985a',
            textColor: '0e1020',
            hideEventTypeDetails: false,
            hideLandingPageDetails: false,
          }}
        />
      )}
    </>
  );
}
