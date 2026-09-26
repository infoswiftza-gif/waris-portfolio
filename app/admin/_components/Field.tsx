'use client';

import { useId, type ReactNode } from 'react';

/**
 * Form field primitives.
 *
 * Every control gets a real `<label for>`, the optional hint and the server's
 * field error are wired through `aria-describedby`, and invalid controls set
 * `aria-invalid` so the failure is announced rather than only coloured red.
 */

type Base = {
  label: string;
  name: string;
  hint?: string;
  error?: string;
  required?: boolean;
};

function Wrapper({
  label,
  name,
  hint,
  error,
  required,
  hintId,
  errorId,
  children,
}: Base & { hintId: string; errorId: string; children: ReactNode }) {
  return (
    <div className="adm-field">
      <label className="adm-label" htmlFor={name}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {hint ? (
        <span className="adm-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="adm-err" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function TextField({
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
  ...base
}: Base & {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'url' | 'email';
}) {
  const hintId = `${base.name}-hint`;
  const errorId = `${base.name}-err`;
  return (
    <Wrapper {...base} hintId={hintId} errorId={errorId}>
      <input
        id={base.name}
        name={base.name}
        className="adm-input"
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={base.required}
        aria-invalid={base.error ? 'true' : undefined}
        aria-describedby={[base.hint ? hintId : null, base.error ? errorId : null]
          .filter(Boolean)
          .join(' ') || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Wrapper>
  );
}

export function TextArea({
  value,
  onChange,
  rows,
  placeholder,
  ...base
}: Base & { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  const hintId = `${base.name}-hint`;
  const errorId = `${base.name}-err`;
  return (
    <Wrapper {...base} hintId={hintId} errorId={errorId}>
      <textarea
        id={base.name}
        name={base.name}
        className="adm-textarea"
        rows={rows}
        value={value}
        placeholder={placeholder}
        required={base.required}
        aria-invalid={base.error ? 'true' : undefined}
        aria-describedby={[base.hint ? hintId : null, base.error ? errorId : null]
          .filter(Boolean)
          .join(' ') || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Wrapper>
  );
}

export function SelectField({
  value,
  onChange,
  options,
  placeholder,
  ...base
}: Base & {
  value: string;
  onChange: (v: string) => void;
  options: readonly (string | { value: string; label: string })[];
  placeholder?: string;
}) {
  const hintId = `${base.name}-hint`;
  const errorId = `${base.name}-err`;
  return (
    <Wrapper {...base} hintId={hintId} errorId={errorId}>
      <select
        id={base.name}
        name={base.name}
        className="adm-select"
        value={value}
        required={base.required}
        aria-invalid={base.error ? 'true' : undefined}
        aria-describedby={[base.hint ? hintId : null, base.error ? errorId : null]
          .filter(Boolean)
          .join(' ') || undefined}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((opt) => {
          const v = typeof opt === 'string' ? opt : opt.value;
          const l = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </Wrapper>
  );
}

export function CheckboxField({
  label,
  name,
  checked,
  onChange,
  hint,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  const hintId = useId();
  return (
    <div className="adm-field">
      <label className="adm-check" htmlFor={name}>
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>{label}</span>
      </label>
      {hint ? (
        <span className="adm-hint" id={hintId}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

/**
 * Tag editor.
 *
 * Stores an array of strings, which is what the contract's `tags` field wants.
 * Committing on Enter/comma and removing with the small × keeps it usable
 * without a mouse; Backspace on an empty input removes the last tag, which is
 * the behaviour people expect from a token field.
 */
export function TagsField({
  label,
  name,
  values,
  onChange,
  hint,
  error,
  placeholder = 'Type a tag, press Enter',
  max = 20,
}: {
  label: string;
  name: string;
  values: string[];
  onChange: (next: string[]) => void;
  hint?: string;
  error?: string;
  placeholder?: string;
  max?: number;
}) {
  const hintId = `${name}-hint`;
  const errorId = `${name}-err`;

  const add = (raw: string) => {
    const tag = raw.trim().replace(/^,/, '').replace(/,$/, '').trim();
    if (!tag) return;
    if (values.length >= max) return;
    if (values.some((v) => v.toLowerCase() === tag.toLowerCase())) return;
    onChange([...values, tag]);
  };

  return (
    <Wrapper label={label} name={name} hint={hint} error={error} hintId={hintId} errorId={errorId}>
      <div className="adm-tagrow">
        {values.map((tag) => (
          <span className="adm-tag" key={tag}>
            {tag}
            <button
              type="button"
              onClick={() => onChange(values.filter((v) => v !== tag))}
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          id={name}
          name={name}
          className="adm-input"
          style={{ flex: '1 1 160px', minWidth: 140 }}
          value={placeholder && values.length === 0 ? '' : undefined}
          placeholder={values.length >= max ? `Limit of ${max} reached` : placeholder}
          disabled={values.length >= max}
          aria-describedby={[hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            } else if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={(e) => {
            if (e.target.value.trim()) {
              add(e.target.value);
              e.target.value = '';
            }
          }}
        />
      </div>
    </Wrapper>
  );
}
