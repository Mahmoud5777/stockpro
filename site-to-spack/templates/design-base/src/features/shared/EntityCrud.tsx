"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEntityCrud } from "./useEntityCrud";
import { apiList, apiExport, type EntityRow } from "./api";

export interface EntityField {
  name: string; label: string; type: "string" | "number" | "boolean";
  required: boolean; inputType?: string; writeOnly?: boolean;
  minLength?: number; maxLength?: number; email?: boolean; errorMessage?: string;
  relation?: { urlPath: string; idField: string; labelField: string; paginated: boolean };
}
export interface EntityDescriptor {
  name: string; module: string; kebab: string; idField: string;
  urlPath: string; label: string; permissionCode: string; fields: EntityField[];
  features: { pagination: boolean; search: boolean; export: boolean; filtering?: boolean; security?: boolean; validation?: boolean };
  operations: { consultation: boolean; ajout: boolean; modification: boolean; suppression: boolean; export: boolean };
}
function errorMessage(error: unknown) {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message || (error instanceof Error ? error.message : "Une erreur est survenue.");
}
function RelationInput({ field, value, onChange }: { field: EntityField; value: unknown; onChange: (value: unknown) => void }) {
  const relation = field.relation!;
  // Relation choices use the full-list endpoint instead of one page of records.
  const options = useQuery({ queryKey: [relation.urlPath, "options"],
    queryFn: () => apiList(relation.paginated ? `${relation.urlPath}/all` : relation.urlPath) });
  return <div>
    <select id={field.name} className="input" required={field.required} disabled={options.isPending || options.isError}
      value={String(value ?? "")} onChange={(event) => onChange(event.target.value === "" ? undefined : field.type === "number" ? Number(event.target.value) : event.target.value)}>
      <option value="">{options.isPending ? "Chargement..." : "Sélectionner..."}</option>
      {options.data?.content.map((row) => <option key={String(row[relation.idField])} value={String(row[relation.idField])}>{String(row[relation.labelField] ?? row[relation.idField])}</option>)}
    </select>
    {options.isError && <p role="alert" className="mt-1 text-sm text-red-600">{errorMessage(options.error)}</p>}
  </div>;
}
export default function EntityCrud({ entity }: { entity: EntityDescriptor }) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EntityRow | null>(null);
  const [values, setValues] = useState<EntityRow>({});
  const [message, setMessage] = useState("");
  const [exporting, setExporting] = useState(false);
  useEffect(() => { const timer = setTimeout(() => { setQuery(search); setPage(0); }, 300); return () => clearTimeout(timer); }, [search]);
  const crud = useEntityCrud(entity, entity.features.pagination ? { page, size: 20, search: entity.features.search ? query : undefined } : {});
  const busy = crud.create.isPending || crud.update.isPending || crud.remove.isPending;
  const columns = entity.fields.filter((field) => !field.writeOnly);
  const rows = crud.list.data?.content ?? [];
  const close = () => { setFormOpen(false); setEditing(null); setValues({}); };
  const startEdit = (row: EntityRow) => {
    setEditing(row); setValues(Object.fromEntries(entity.fields.filter((field) => !field.writeOnly).map((field) => [field.name, row[field.name]])));
    setMessage(""); setFormOpen(true);
  };
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setMessage("");
    const payload: EntityRow = {};
    for (const field of entity.fields) {
      const value = values[field.name];
      if (field.writeOnly && editing && !value) continue;
      payload[field.name] = field.type === "boolean" ? !!value : value === "" || value === undefined ? null : value;
    }
    try {
      if (editing) await crud.update.mutateAsync({ id: String(editing[entity.idField]), data: payload });
      else await crud.create.mutateAsync(payload);
      close(); setMessage("Enregistrement sauvegardé.");
    } catch (error) { setMessage(errorMessage(error)); }
  };
  const remove = async (row: EntityRow) => {
    if (!window.confirm("Supprimer cet enregistrement ?")) return;
    try { await crud.remove.mutateAsync(String(row[entity.idField])); setMessage("Enregistrement supprimé."); if (rows.length === 1 && page > 0) setPage(page - 1); }
    catch (error) { setMessage(errorMessage(error)); }
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted">{entity.module}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{entity.label}</h1><p className="mt-1 text-sm text-muted">Consultez et gérez vos enregistrements.</p></div>
      <div className="flex gap-2">
        {entity.features.export && entity.operations.export && <button className="btn btn-outline" disabled={exporting} onClick={async () => {
          setExporting(true); try { await apiExport(entity.urlPath, query); } catch (error) { setMessage(errorMessage(error)); } finally { setExporting(false); }
        }}>{exporting ? "Export..." : "Exporter Excel"}</button>}
        {entity.operations.ajout && <button className="btn btn-primary" onClick={() => { setEditing(null); setValues({}); setMessage(""); setFormOpen(true); }}>+ Ajouter</button>}
      </div>
    </div>
    {message && <p role="status" className="card p-4 text-sm">{message}</p>}
    {formOpen && <section className="card p-5 sm:p-6">
      <h2 className="mb-5 text-lg font-semibold">{editing ? "Modifier" : "Nouvel enregistrement"}</h2>
      <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
        {entity.fields.map((field) => <div key={field.name}>
          <label htmlFor={field.name} className="mb-2 block text-sm font-medium">{field.label}{field.required && <span className="text-red-600"> *</span>}</label>
          {field.relation ? <RelationInput field={field} value={values[field.name]} onChange={(value) => setValues((previous) => ({ ...previous, [field.name]: value }))} /> :
            field.type === "boolean" ? <input id={field.name} type="checkbox" checked={!!values[field.name]} onChange={(event) => setValues((previous) => ({ ...previous, [field.name]: event.target.checked }))} /> :
            <input id={field.name} className="input" type={field.inputType || (field.type === "number" ? "number" : "text")}
              step={field.type === "number" ? "any" : undefined} required={field.required}
              minLength={field.minLength} maxLength={field.maxLength} autoComplete={field.writeOnly ? "new-password" : undefined}
              value={String(values[field.name] ?? "")} onChange={(event) => {
                const value = event.target.value;
                setValues((previous) => ({ ...previous, [field.name]: field.type === "number" && value !== "" ? Number(value) : value }));
              }} />}
        </div>)}
        <div className="flex gap-3 border-t border-slate-200/60 pt-5 sm:col-span-2">
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Enregistrement..." : "Enregistrer"}</button>
          <button type="button" className="btn btn-outline" disabled={busy} onClick={close}>Annuler</button>
        </div>
      </form>
    </section>}
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 p-5">
        <h2 className="font-semibold">Tous les enregistrements <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">{crud.list.data?.totalElements ?? 0}</span></h2>
        {entity.features.search && entity.features.pagination && <input aria-label="Rechercher" className="input sm:max-w-xs" placeholder="Rechercher..." value={search} onChange={(event) => setSearch(event.target.value)} />}
      </div>
      {crud.list.isPending ? <p role="status" className="p-10 text-center text-muted">Chargement des données...</p> :
        crud.list.isError ? <div role="alert" className="p-6"><p className="mb-3 text-red-600">{errorMessage(crud.list.error)}</p><button className="btn btn-outline" onClick={() => crud.list.refetch()}>Réessayer</button></div> :
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="table-head"><tr>{columns.map((field) => <th className="px-5 py-3 text-xs font-medium uppercase tracking-wide" key={field.name}>{field.label}</th>)}<th className="px-5 py-3 text-right text-xs font-medium uppercase">Actions</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={String(row[entity.idField])} className="table-row">
            {columns.map((field) => <td className="px-5 py-4" key={field.name}>{field.type === "boolean" ? <span className={row[field.name] ? "status-active" : "status-inactive"}>{row[field.name] ? "Actif" : "Inactif"}</span> : String(row[field.name] ?? "—")}</td>)}
            <td className="space-x-3 whitespace-nowrap px-5 py-4 text-right">
              {entity.operations.modification && <button className="text-primary hover:underline" disabled={busy} onClick={() => startEdit(row)}>Modifier</button>}
              {entity.operations.suppression && <button className="text-red-600 hover:underline" disabled={busy} onClick={() => remove(row)}>Supprimer</button>}
            </td></tr>)}
            {rows.length === 0 && <tr><td colSpan={columns.length + 1} className="p-12 text-center text-muted">Aucun enregistrement. {entity.operations.ajout ? "Ajoutez votre premier élément pour commencer." : ""}</td></tr>}
          </tbody>
        </table></div>}
      {entity.features.pagination && <div className="flex items-center justify-between border-t border-slate-200/60 p-4 text-sm">
        <span className="text-muted">Page {page + 1} sur {Math.max(1, crud.list.data?.totalPages ?? 1)}</span>
        <div className="flex gap-2"><button className="btn btn-outline" disabled={page === 0 || crud.list.isFetching} onClick={() => setPage(page - 1)}>Précédent</button>
          <button className="btn btn-outline" disabled={page + 1 >= (crud.list.data?.totalPages ?? 1) || crud.list.isFetching} onClick={() => setPage(page + 1)}>Suivant</button></div>
      </div>}
    </section>
  </div>;
}
