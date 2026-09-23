import type { ReactNode } from 'react';

// Shared page-header block that matches the homepage .section-head language
// (eyebrow with index + big display heading + lede).
export default function PageHead({
  index,
  label,
  title,
  lede,
}: {
  index: string;
  label: string;
  title: ReactNode;
  lede: string;
}) {
  return (
    <div className="section-head">
      <p className="eyebrow" data-reveal>
        <b>{index}</b> / {label}
      </p>
      <h1
        data-reveal
        style={{
          fontFamily: 'var(--display)',
          fontSize: 'clamp(38px,6vw,72px)',
          fontWeight: 800,
          lineHeight: 1.02,
          letterSpacing: '-.04em',
          marginBottom: 22,
        }}
      >
        {title}
      </h1>
      <p className="lede" data-reveal>
        {lede}
      </p>
    </div>
  );
}