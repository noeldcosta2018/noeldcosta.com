'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    q: 'What does an engagement actually look like?',
    a: "Depends on what you need. If you're pre-implementation, I run a 4 to 6 week diagnostic — current state, vendor selection, business case, programme structure. If you're mid-implementation and things are off, I step in for 90 days as Programme Director or Senior Advisor to the CIO. If you're post-go-live and AI is the next wave, I scope and lead 8 to 16 week AI builds on SAP BTP. Always direct involvement. I don't disappear after the kickoff.",
  },
  {
    q: 'Are you available right now?',
    a: "Usually 4 to 8 weeks out. I take on two or three programmes at a time, max. If you have a hard deadline I can't meet, I'll tell you on the first call and either point you to someone else or we plan for the next window.",
  },
  {
    q: 'How do you charge?',
    a: 'Day rate or fixed-fee programme. Day rate for advisory and diagnostics. Fixed-fee for delivery work where the scope is clear. Numbers depend on the engagement. We discuss it on the first call. No surprises in writing later.',
  },
  {
    q: 'Do you replace my SI partner or work alongside them?',
    a: "Either. Most often I sit on the client side as Programme Director and hold the SI accountable. Sometimes I replace a struggling SI mid-stream. Sometimes I'm there to make sure the SI doesn't oversell what they can deliver. Depends on what's already in place.",
  },
  {
    q: 'Will you sign an NDA?',
    a: "Yes. Standard practice on day one. I work with regulated entities and government clients regularly. Confidentiality isn't a line item, it's the default.",
  },
  {
    q: 'How is this different from McKinsey, BCG, or the Big 4?',
    a: "I'm one person, not a pyramid. The senior partner you meet is the senior partner who runs your programme. I have CIMA and AICPA, so I read your finances the same way your CFO does. And I've actually delivered the systems, not just produced slide decks about them. Big firms have their place. For ERP and AI delivery, you usually want the human who's done it before.",
  },
  {
    q: 'Why personal brand and not a firm?',
    a: "I run Quantinoid LLC as the trading entity. The personal brand is intentional. My value is judgement and direct involvement, not a logo on a deck. If you hire a firm, you get whoever they assign. If you hire me, you get me.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section
      className="bg-cream"
      style={{ padding: 'clamp(5rem,10vw,8rem) clamp(1.5rem,5vw,4rem)' }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="text-center mb-12">
          <span
            className="cc-mono text-[0.68rem] font-medium tracking-[2.5px] uppercase text-papaya"
          >
            [ FAQ ]
          </span>
          <h2
            className="font-display font-black tracking-[-0.04em] leading-[1.08] text-corbeau mt-4"
            style={{ fontSize: 'clamp(1.75rem,3.5vw,2.25rem)' }}
          >
            Common questions.
          </h2>
        </div>

        <div className="flex flex-col">
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b border-corbeau/[0.08]">
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full py-5 bg-transparent border-none cursor-pointer flex items-center justify-between gap-4 text-left"
              >
                <span
                  className="font-display font-bold text-[0.95rem] text-corbeau leading-snug"
                >
                  {faq.q}
                </span>
                {open === i
                  ? <ChevronUp size={18} className="text-silver shrink-0" />
                  : <ChevronDown size={18} className="text-silver shrink-0" />}
              </button>
              {open === i && (
                <div className="pb-5">
                  <p className="text-[0.88rem] text-night leading-[1.65] m-0">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
