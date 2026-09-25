'use client';
import { useEffect, useState } from 'react';
import { headingId } from '@/lib/posts';

export default function PostToc({ headings }: { headings: string[] }) {
  const [on, setOn] = useState('');

  useEffect(() => {
    const els = headings
      .map((text, i) => document.getElementById(headingId(text, i)))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setOn(en.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav className="toc" aria-label="On this page">
      <h4 className="toc-title">On this page</h4>
      <ol>
        {headings.map((text, i) => {
          const id = headingId(text, i);
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                className={on === id ? 'on' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}