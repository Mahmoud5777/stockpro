"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEntityCrud } from "./useEntityCrud";

export interface EntityField {
  name: string;
  label: string;
  type: "string" | "number" | "boolean";
  required: boolean;
}

export interface EntityDescriptor {
  name: string;
  kebab: string;
  urlPath: string;
  label: string;
  permissionCode: string;
  fields: EntityField[];
}

export default function EntityCrud({ entity }: { entity: EntityDescriptor }) {
  const { list, create, update, remove } = useEntityCrud(entity);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);

  const schemaShape: Record<string, z.ZodTypeAny> = {};
  entity.fields.forEach((f) => {
    if (f.type === "number") {
      schemaShape[f.name] = f.required ? z.number() : z.number().optional();
    } else if (f.type === "boolean") {
      schemaShape[f.name] = z.boolean().optional();
    } else {
      schemaShape[f.name] = f.required
        ? z.string().min(1, "Champ requis")
        : z.string().optional();
    }
  });
  const schema = z.object(schemaShape);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = (values: Record<string, unknown>) => {
    if (editing && editing.id) {
      update.mutate(
        { id: String(editing.id), data: values },
        {
          onSuccess: () => {
            setEditing(null);
            reset({});
          },
        }
      );
    } else {
      create.mutate(values, { onSuccess: () => reset({}) });
    }
  };

  const startEdit = (row: Record<string, unknown>) => {
    setEditing(row);
    reset(row);
  };

  const startCreate = () => {
    setEditing(null);
    reset({});
  };

  const rows: Record<string, unknown>[] = Array.isArray(list.data)
    ? list.data
    : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{entity.label}</h1>
        <button
          onClick={startCreate}
          className="rounded bg-slate-900 px-4 py-2 text-white"
        >
          Ajouter
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mb-6 grid grid-cols-2 gap-3 rounded bg-white p-4 shadow"
      >
        {entity.fields.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium">{f.label}</label>
            {f.type === "boolean" ? (
              <input
                type="checkbox"
                {...register(f.name)}
                className="mt-2"
              />
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                {...register(
                  f.name,
                  f.type === "number" ? { valueAsNumber: true } : {}
                )}
                className="mt-1 w-full rounded border px-3 py-2"
              />
            )}
            {errors[f.name] && (
              <p className="text-sm text-red-500">
                {String(errors[f.name]?.message ?? "")}
              </p>
            )}
          </div>
        ))}
        <div className="col-span-2 flex gap-2">
          <button
            type="submit"
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            {editing ? "Enregistrer" : "Créer"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              reset({});
            }}
            className="rounded bg-slate-300 px-4 py-2"
          >
            Annuler
          </button>
        </div>
      </form>

      <div className="overflow-auto rounded bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              {entity.fields.map((f) => (
                <th key={f.name} className="px-3 py-2 text-left">
                  {f.label}
                </th>
              ))}
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={String(row.id ?? i)} className="border-t">
                {entity.fields.map((f) => (
                  <td key={f.name} className="px-3 py-2">
                    {String(row[f.name] ?? "")}
                  </td>
                ))}
                <td className="space-x-2 px-3 py-2">
                  <button
                    onClick={() => startEdit(row)}
                    className="text-blue-600 hover:underline"
                  >
                    Editer
                  </button>
                  <button
                    onClick={() => remove.mutate(String(row.id))}
                    className="text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={entity.fields.length + 1}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  Aucun élément
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
