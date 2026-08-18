import { apiClient } from "@/lib/axios";

export interface ExportQuery {
  search?: string;
  filters?: Record<string, string | boolean | undefined>;
  sort?: string;
}

/**
 * Télécharge un fichier Excel (.xlsx) généré par le backend (endpoint /export de chaque module).
 * Les critères de recherche/filtres actifs sont passés comme pour la liste paginée.
 */
export async function downloadSpreadsheet(
  url: string,
  query: ExportQuery | undefined,
  defaultFilename: string
): Promise<void> {
  const params: Record<string, unknown> = {};
  if (query?.search) params.search = query.search;
  if (query?.sort) params.sort = query.sort;
  if (query?.filters) {
    for (const [key, value] of Object.entries(query.filters)) {
      if (value !== undefined && value !== "") params[key] = value;
    }
  }

  const { data, headers } = await apiClient.get<Blob>(url, {
    params,
    responseType: "blob",
  });

  const filename = parseContentDispositionFilename(headers["content-disposition"]) ?? defaultFilename;
  const objectUrl = URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function parseContentDispositionFilename(header: unknown): string | null {
  if (typeof header !== "string") return null;
  const match = header.match(/filename="?([^";]+)"?/i);
  return match?.[1] ?? null;
}