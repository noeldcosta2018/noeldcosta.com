"use client";

import { useRef, useState } from "react";
import Doodle, { HandNote } from "@/components/doodles/Doodle";

export type OutputCard = {
  caption: string;
  file: string;
  alt: string;
  /** Public URL when the screenshot exists; absent while it is a placeholder. */
  src?: string;
  /** A short handwritten aside pointing at the top right of the screenshot. */
  note?: string;
};

/**
 * Section 5 cards: screenshot and caption, laid out like prints on a desk. A
 * supplied screenshot opens larger in a dialog on click (Escape or the close
 * button returns focus to the card).
 */
export default function OutputCards({ cards, width, height }: { cards: OutputCard[]; width: number; height: number }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<OutputCard | null>(null);

  function show(card: OutputCard) {
    setOpen(card);
    dialog.current?.showModal();
  }

  return (
    <>
      <ul className="ar-outputs">
        {cards.map((card) => (
          <li key={card.file} className="ar-output">
            {card.note && (
              <HandNote text={card.note} className="ar-output-note">
                <Doodle name="arrow-down" />
              </HandNote>
            )}
            {card.src ? (
              <button type="button" className="ar-output-zoom" onClick={() => show(card)} aria-label={`View larger: ${card.alt}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.src} alt={card.alt} width={width} height={height} loading="lazy" decoding="async" />
              </button>
            ) : (
              <div className="ar-placeholder" style={{ aspectRatio: `${width} / ${height}` }} role="img" aria-label={card.alt}>
                <span>{card.file}</span>
                <span className="size">
                  {width} x {height}
                </span>
              </div>
            )}
            <p className="ar-output-caption">{card.caption}</p>
          </li>
        ))}
      </ul>
      <dialog ref={dialog} className="ar-lightbox" onClose={() => setOpen(null)} onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        {open?.src && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.src} alt={open.alt} width={width} height={height} />
            <figcaption>{open.caption}</figcaption>
          </figure>
        )}
        <button type="button" className="ar-lightbox-close" onClick={() => dialog.current?.close()}>
          Close
        </button>
      </dialog>
    </>
  );
}
