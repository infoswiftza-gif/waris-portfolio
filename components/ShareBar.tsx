'use client';
import { useEffect, useState } from 'react';

export default function ShareBar({ title }: { title: string }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const tweet = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="share-bar">
      <span className="share-title">Share</span>
      <div className="share-row">
        <button
          className="share-btn share-copy"
          onClick={copy}
          aria-label={copied ? 'Link copied' : 'Copy link to clipboard'}
        >
          {copied ? '✓' : '🔗'}
        </button>
        <a className="share-btn" href={tweet} target="_blank" rel="noopener noreferrer" aria-label="Share on X">
          𝕏
        </a>
        <a className="share-btn" href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">
          in
        </a>
      </div>
    </div>
  );
}