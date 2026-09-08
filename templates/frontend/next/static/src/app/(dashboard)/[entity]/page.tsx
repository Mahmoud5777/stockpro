"use client";

import { useParams } from "next/navigation";
import { entitiesRegistry } from "@/lib/entities-registry";
import EntityCrud from "@/features/shared/EntityCrud";

export default function EntityPage() {
  const params = useParams<{ entity: string }>();
  const key = Array.isArray(params.entity) ? params.entity[0] : params.entity;
  const descriptor = entitiesRegistry.find((e) => e.kebab === key);

  if (!descriptor) {
    return <div className="p-6 text-slate-600">Entité introuvable : {String(key)}</div>;
  }
  return <EntityCrud entity={descriptor} />;
}
