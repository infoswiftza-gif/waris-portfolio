'use client';

import type { CrudRow } from '@/lib/admin/useCrudResource';
import { useState } from 'react';

import { useCrudResource } from '@/lib/admin/useCrudResource';
import { FileUpload } from '@/components/FileUpload';
import { ConfirmDialog } from './ConfirmDialog';
import { CheckboxField, SelectField, TagsField, TextArea, TextField } from './Field';
import { Pagination, TableSkeleton } from './Pagination';
import { useToast } from './Toast';
import { Toolbar } from './Toolbar';

/**
 * One screen for every collection.
 *
 * The four hand-written admin pages were ~86% identical: fetch a list, render a
 * table, open a form, POST or PUT, delete, `alert()` on failure. All of that
 * lives here now and each page is just a config object — the columns, the form
 * fields, and the defaults for a new record. That is what makes "add a field"
 * a one-line change in one place instead of an edit in three.
 *
 * Behaviour that used to be broken and is now structural:
 *  - creating works (the old `save()` returned early unless `editingId` was set)
 *  - saves are confirmed by a toast (the old `saved` flag was never set true)
 *  - the project image field is actually wired to `FileUpload`
 *  - deletes confirm in a dialog instead of `window.confirm`
 */

// ---------------------------------------------------------------- config --

export type Column = {
  key: string;
  label: string;
  /** Clicking the header sorts by this field. Omit to make it unsortable. */
  sortKey?: string;
  render: (row: CrudRow) => React.ReactNode;
  className?: string;
  /** Hidden on narrow screens, where the table would otherwise overflow. */
  hideOnMobile?: boolean;
};

type FieldBase = {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  /** Half-width; pairs with the next field marked `half`. */
  half?: boolean;
};

export type FieldSpec =
  | (FieldBase & { type: 'text'; type_?: string; placeholder?: string; inputMode?: 'text' | 'url' | 'numeric' | 'email' })
  | (FieldBase & { type: 'textarea'; rows?: number; placeholder?: string })
  | (FieldBase & { type: 'number'; placeholder?: string })
  | (FieldBase & { type: 'select'; options: readonly (string | { value: string; label: string })[]; placeholder?: string })
  | (FieldBase & { type: 'tags'; placeholder?: string })
  | (FieldBase & { type: 'checkbox'; checkboxLabel?: string })
  | (FieldBase & { type: 'image'; recordType: 'Project' | 'BlogPost' });

export type ResourceConfig = {
  resource: string;
  title: string;
  singular: string;
  plural: string;
  description: string;
  columns: Column[];
  fields: FieldSpec[];
  defaults: Record<string, unknown>;
  hasPublished: boolean;
  sortable: string[];
  /** Deep link to the public page, for the "view live" link. */
  publicPath?: string;
  /** Enable the draft preview panel. */
  preview?: { titleField: string; bodyField: string };
  emptyHint: string;
};

type FormState = Record<string, unknown>;

const toFormState = (row: CrudRow | null, defaults: Record<string, unknown>): FormState => {
  const base: FormState = { ...defaults };
  if (!row) return base;
  for (const key of Object.keys(base)) {
    if (key in row) base[key] = row[key];
  }
  return base;
};

/**
 * Coerce form values into the JSON body.
 *
 * Only `undefined` is dropped, meaning "this field was never touched" — an
 * explicit empty string is still sent so the server can reject a required field
 * with a real validation message instead of silently accepting a blank. Optional
 * text fields are normalised to `undefined` server-side by `str()`, so clearing
 * a URL really clears it.
 */
function serialize(values: FormState): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) continue;
    // A blank slug is dropped rather than sent. The form initialises the field
    // to `''`, but blog posts declare it optional and the server already
    // derives one from the title when it is absent — sending `''` instead just
    // tripped the schema's `.min(1)` and failed the save with an error the
    // editor could not act on.
    if (key === 'slug' && typeof value === 'string' && !value.trim()) continue;
    out[key] = value;
  }
  return out;
}

// ------------------------------------------------------------- component --

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const toast = useToast();
  const crud = useCrudResource({
    resource: config.resource,
    announce: (m, k) => (k === 'err' ? toast.err(m) : toast.ok(m)),
  });

  const [editing, setEditing] = useState<CrudRow | null>(null);
  const [creating, setCreating] = useState(false);
  // Opt-in, not automatic: the preview is a read-only modal that would
  // otherwise cover the form the moment a record is opened for editing, and
  // closing it used to close the whole form along with any unsaved edits.
  const [previewOpen, setPreviewOpen] = useState(false);
  const [values, setValues] = useState<FormState>(() => toFormState(null, config.defaults));
  const [selected, setSelected] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<
    | { kind: 'delete'; id: string; label: string }
    | { kind: 'bulk'; action: 'delete' | 'publish' | 'unpublish' }
    | null
  >(null);

  const formOpen = creating || editing !== null;

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setPreviewOpen(false);
    setValues(toFormState(null, config.defaults));
    crud.resetErrors();
  };

  const openEdit = (row: CrudRow) => {
    setCreating(false);
    setEditing(row);
    setPreviewOpen(false);
    setValues(toFormState(row, config.defaults));
    crud.resetErrors();
  };

  const closeForm = () => {
    setCreating(false);
    setEditing(null);
    setPreviewOpen(false);
    crud.resetErrors();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = serialize(values);

    if (editing) {
      // Update sends the full form; the server diffs it against the stored
      // document, so a cleared field is applied rather than silently ignored.
      const saved = await crud.update(String(editing._id), payload);
      if (saved) {
        setEditing(null);
        setCreating(false);
        setPreviewOpen(false);
      }
      return;
    }

    const created = await crud.create(payload);
    if (created) {
      // Stay in the form for "save and add another" only when the record was
      // left as a draft; otherwise return to the list.
      closeForm();
    }
  };

  const set = (name: string) => (value: unknown) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const rowLabel = (row: CrudRow) =>
    String(row.title ?? row.name ?? row.label ?? row.slug ?? 'this record');

  const allOnPageSelected =
    crud.rows.length > 0 && selected.length === crud.rows.length;
  const someOnPageSelected = selected.length > 0 && !allOnPageSelected;

  const toggleAll = () => {
    if (allOnPageSelected) {
      setSelected([]);
    } else {
      setSelected(crud.rows.map((r) => String(r._id)));
    }
  };

  const toggleOne = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const runConfirm = async () => {
    if (!confirm) return;
    if (confirm.kind === 'delete') {
      const ok = await crud.remove(confirm.id);
      if (ok) setSelected((prev) => prev.filter((x) => x !== confirm.id));
    } else {
      const ok = await crud.bulk(selected, confirm.action);
      if (ok) setSelected([]);
    }
    setConfirm(null);
  };

  const confirmCopy = !confirm
    ? null
    : confirm.kind === 'delete'
      ? {
          title: `Delete this ${config.singular.toLowerCase()}?`,
          message: (
            <>
              <strong>{rowLabel({ title: confirm.label })}</strong> will be permanently removed. This
              cannot be undone.
            </>
          ),
          confirmLabel: 'Delete',
        }
      : {
          title: `${selected.length} selected — ${confirm.action}?`,
          message:
            confirm.action === 'delete'
              ? `${selected.length} ${config.plural ?? config.title} will be permanently removed.`
              : `${selected.length} ${config.plural ?? config.title} will be ${
                  confirm.action === 'publish' ? 'made public' : 'turned back into drafts'
                }.`,
          confirmLabel: confirm.action === 'delete' ? `Delete ${selected.length}` : 'Apply',
          destructive: confirm.action === 'delete',
        };

  return (
    <>
      <div className="adm-row">
        <div>
          <h2 className="adm-h">{config.title}</h2>
          <p className="adm-sub" style={{ marginBottom: 0 }}>
            {config.description}
          </p>
        </div>
        <div className="adm-actions">
          {config.publicPath ? (
            <a
              className="adm-btn"
              href={config.publicPath}
              target="_blank"
              rel="noreferrer noopener"
            >
              View page ↗
            </a>
          ) : null}
          {!formOpen ? (
            <button type="button" className="adm-btn adm-btn-primary" onClick={openCreate}>
              + New {config.singular.toLowerCase()}
            </button>
          ) : null}
        </div>
      </div>

      {formOpen ? (
        <form className="adm-card adm-form" onSubmit={submit} style={{ marginBottom: 22 }}>
          <div className="adm-row" style={{ marginBottom: 0 }}>
            <h3 className="adm-h" style={{ fontSize: 17, margin: 0 }}>
              {editing ? `Edit ${config.singular.toLowerCase()}` : `New ${config.singular.toLowerCase()}`}
            </h3>
            <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={closeForm}>
              Close
            </button>
          </div>

          {crud.error && !crud.error.fields ? (
            <p className="adm-err" role="alert">
              {crud.error.message}
            </p>
          ) : null}

          <FieldGrid
            fields={config.fields}
            values={values}
            set={set}
            fieldErrors={crud.fieldErrors}
          />

          <div className="adm-actions">
            <button type="submit" className="adm-btn adm-btn-primary" disabled={crud.saving}>
              {crud.saving ? 'Saving…' : editing ? 'Save changes' : `Create ${config.singular.toLowerCase()}`}
            </button>
            {config.preview ? (
              <button
                type="button"
                className="adm-btn"
                onClick={() => setPreviewOpen(true)}
                disabled={crud.saving}
                title="Read-only preview of the body as the public page will render it"
              >
                Preview
              </button>
            ) : null}
            <button
              type="button"
              className="adm-btn"
              onClick={closeForm}
              disabled={crud.saving}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <Toolbar
        search={crud.search}
        onSearch={crud.setSearch}
        status={crud.status}
        onStatus={crud.setStatus}
        hasPublished={config.hasPublished}
        sort={crud.sort}
        dir={crud.dir}
        onSortField={crud.setSortField}
        onToggleDir={() => crud.toggleSort(crud.sort)}
        sortable={config.sortable}
      />

      {selected.length > 0 ? (
        <div className="adm-bulkbar">
          <span>
            <strong>{selected.length}</strong> selected
          </span>
          <div className="adm-actions">
            {config.hasPublished ? (
              <>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  onClick={() => setConfirm({ kind: 'bulk', action: 'publish' })}
                >
                  Publish
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm"
                  onClick={() => setConfirm({ kind: 'bulk', action: 'unpublish' })}
                >
                  Unpublish
                </button>
              </>
            ) : null}
            <button
              type="button"
              className="adm-btn adm-btn-sm adm-btn-danger"
              onClick={() => setConfirm({ kind: 'bulk', action: 'delete' })}
            >
              Delete
            </button>
            <button
              type="button"
              className="adm-btn adm-btn-sm adm-btn-ghost"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
          </div>
        </div>
      ) : null}

      {crud.error && !crud.error.fields ? (
        <div className="adm-card" style={{ borderColor: 'rgba(255,107,122,.4)', marginBottom: 14 }}>
          <p className="adm-err" role="alert" style={{ margin: 0 }}>
            {crud.error.message}{' '}
            <button type="button" className="adm-btn adm-btn-sm" onClick={crud.reload}>
              Retry
            </button>
          </p>
        </div>
      ) : null}

      <div className="adm-tablewrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th className="adm-cellcheck">
                <label className="adm-sr" htmlFor="adm-select-all">
                  Select all on this page
                </label>
                <input
                  id="adm-select-all"
                  type="checkbox"
                  checked={allOnPageSelected}
                  ref={(el) => {
                    // Tri-state: shows the dash when only some rows are picked.
                    if (el) el.indeterminate = someOnPageSelected;
                  }}
                  onChange={toggleAll}
                />
              </th>
              {config.columns.map((col) => (
                <th
                  key={col.key}
                  className={[col.hideOnMobile ? 'adm-hide-sm' : '', col.className ?? '']
                    .filter(Boolean)
                    .join(' ')}
                  aria-sort={
                    col.sortKey && crud.sort === col.sortKey
                      ? crud.dir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {col.sortKey ? (
                    <button type="button" onClick={() => crud.toggleSort(col.sortKey!)}>
                      {col.label}
                      {crud.sort === col.sortKey ? (crud.dir === 'asc' ? ' ↑' : ' ↓') : ''}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              <th style={{ width: 150, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>

          {crud.loading ? (
            <TableSkeleton cols={config.columns.length + 1} />
          ) : (
            <tbody>
              {crud.rows.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 2}>
                    <div className="adm-empty">
                      {crud.search || crud.status !== 'all'
                        ? 'Nothing matches this search or filter.'
                        : config.emptyHint}
                    </div>
                  </td>
                </tr>
              ) : (
                crud.rows.map((row) => {
                  const id = String(row._id);
                  return (
                    <tr key={id} data-selected={selected.includes(id)}>
                      <td className="adm-cellcheck">
                        <label className="adm-sr" htmlFor={`sel-${id}`}>
                          Select {rowLabel(row)}
                        </label>
                        <input
                          id={`sel-${id}`}
                          type="checkbox"
                          checked={selected.includes(id)}
                          onChange={() => toggleOne(id)}
                        />
                      </td>
                      {config.columns.map((col) => (
                        <td
                          key={col.key}
                          className={[col.hideOnMobile ? 'adm-hide-sm' : '', col.className ?? '']
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          className="adm-btn adm-btn-sm"
                          onClick={() => openEdit(row)}
                        >
                          Edit
                        </button>{' '}
                        <button
                          type="button"
                          className="adm-btn adm-btn-sm adm-btn-danger"
                          onClick={() => setConfirm({ kind: 'delete', id, label: rowLabel(row) })}
                          aria-label={`Delete ${rowLabel(row)}`}
                        >
                          Del
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          )}
        </table>
      </div>

      <Pagination
        page={crud.page}
        totalPages={crud.totalPages}
        total={crud.meta.total}
        pageSize={crud.meta.pageSize}
        onPage={crud.setPage}
      />

      {config.preview && previewOpen ? (
        <DraftPreview
          title={String(values[config.preview.titleField] ?? '')}
          body={String(values[config.preview.bodyField] ?? '')}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}

      {confirm && confirmCopy ? (
        <ConfirmDialog
          open
          title={confirmCopy.title}
          message={confirmCopy.message}
          confirmLabel={confirmCopy.confirmLabel}
          destructive={'destructive' in confirmCopy ? confirmCopy.destructive : true}
          busy={crud.saving}
          onConfirm={runConfirm}
          onCancel={() => setConfirm(null)}
        />
      ) : null}
    </>
  );
}

// ----------------------------------------------------------------- fields --

function FieldGrid({
  fields,
  values,
  set,
  fieldErrors,
}: {
  fields: FieldSpec[];
  values: FormState;
  set: (name: string) => (v: unknown) => void;
  fieldErrors: Record<string, string[] | undefined>;
}) {
  // Two consecutive `half` fields share a row; anything else breaks the grid.
  const groups: FieldSpec[][] = [];
  for (let i = 0; i < fields.length; i += 1) {
    const field = fields[i];
    const next = fields[i + 1];
    if (field.half && next?.half) {
      groups.push([field, next]);
      i += 1;
    } else {
      groups.push([field]);
    }
  }

  return (
    <>
      {groups.map((group, i) => (
        <div
          key={i}
          className="adm-field"
          style={group.length > 1 ? { display: 'grid', gap: 16 } : undefined}
        >
          {group.length > 1 ? (
            <div className="adm-grid-2">
              {group.map((f) => (
                <FieldControl key={f.name} spec={f} values={values} set={set} fieldErrors={fieldErrors} />
              ))}
            </div>
          ) : (
            <FieldControl spec={group[0]} values={values} set={set} fieldErrors={fieldErrors} />
          )}
        </div>
      ))}
    </>
  );
}

function FieldControl({
  spec,
  values,
  set,
  fieldErrors,
}: {
  spec: FieldSpec;
  values: FormState;
  set: (name: string) => (v: unknown) => void;
  fieldErrors: Record<string, string[] | undefined>;
}) {
  const err = fieldErrors[spec.name]?.[0];
  const value = values[spec.name];

  switch (spec.type) {
    case 'text':
      return (
        <TextField
          label={spec.label}
          name={spec.name}
          hint={spec.hint}
          required={spec.required}
          error={err}
          type={spec.type_ ?? 'text'}
          inputMode={spec.inputMode}
          placeholder={spec.placeholder}
          value={String(value ?? '')}
          onChange={set(spec.name)}
        />
      );
    case 'textarea':
      return (
        <TextArea
          label={spec.label}
          name={spec.name}
          hint={spec.hint}
          required={spec.required}
          error={err}
          rows={spec.rows}
          placeholder={spec.placeholder}
          value={String(value ?? '')}
          onChange={set(spec.name)}
        />
      );
    case 'number':
      return (
        <TextField
          label={spec.label}
          name={spec.name}
          hint={spec.hint}
          required={spec.required}
          error={err}
          type="number"
          inputMode="numeric"
          placeholder={spec.placeholder}
          // An empty input must send `undefined`, not 0, so "clear the order"
          // does not silently become "order 0".
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(v) => set(spec.name)(v === '' ? undefined : Number(v))}
        />
      );
    case 'select':
      return (
        <SelectField
          label={spec.label}
          name={spec.name}
          hint={spec.hint}
          required={spec.required}
          error={err}
          options={spec.options}
          placeholder={spec.placeholder}
          value={String(value ?? '')}
          onChange={set(spec.name)}
        />
      );
    case 'tags':
      return (
        <TagsField
          label={spec.label}
          name={spec.name}
          hint={spec.hint}
          error={err}
          placeholder={spec.placeholder}
          values={Array.isArray(value) ? (value as string[]) : []}
          onChange={set(spec.name)}
        />
      );
    case 'checkbox':
      return (
        <CheckboxField
          label={spec.checkboxLabel ?? spec.label}
          name={spec.name}
          hint={spec.hint}
          checked={Boolean(value)}
          onChange={set(spec.name)}
        />
      );
    case 'image':
      return (
        <div className="adm-field">
          <span className="adm-label">{spec.label}</span>
          <FileUpload
            name={spec.name}
            recordType={spec.recordType}
            label="Upload image"
            value={String(value ?? '')}
            onChange={(url) => set(spec.name)(url ?? undefined)}
          />
          {spec.hint ? <span className="adm-hint">{spec.hint}</span> : null}
        </div>
      );
    default:
      return null;
  }
}

// --------------------------------------------------------------- preview ---

/**
 * Draft preview.
 *
 * Renders the body the way the public page will, so an unpublished post can be
 * proof-read without publishing it. It is deliberately read-only markup in a
 * `pre-wrap` block rather than a full page render: a preview that reuses the
 * public component tree would drift the moment the public markup changes.
 */
function DraftPreview({
  title,
  body,
  onClose,
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <div className="adm-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal adm-modal-wide" role="dialog" aria-modal="true" aria-label="Draft preview">
        <div className="adm-row" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Draft preview</h2>
          <button type="button" className="adm-btn adm-btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="adm-prev">
          <div className="adm-prev-bar">
            <span className="adm-badge adm-badge-draft">
              <span className="adm-dot" />
              Unpublished
            </span>
            <span>Only you can see this</span>
          </div>
          <div className="adm-prev-body">
            {title ? <strong style={{ display: 'block', marginBottom: 12, fontSize: 18 }}>{title}</strong> : null}
            {body || 'This draft is empty.'}
          </div>
        </div>
      </div>
    </div>
  );
}
