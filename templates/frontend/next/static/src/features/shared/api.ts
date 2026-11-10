import apiClient from "@/lib/axios";

export type EntityRow = Record<string, unknown>;
export interface ListOptions { page?: number; size?: number; search?: string }
export interface EntityPage { content: EntityRow[]; totalElements: number; totalPages: number }

export async function apiList(urlPath: string, options: ListOptions = {}): Promise<EntityPage> {
  const res = await apiClient.get(`/api/${urlPath}`, { params: options });
  const data = res.data;
  if (Array.isArray(data)) return { content: data, totalElements: data.length, totalPages: 1 };
  return { content: data.content ?? [], totalElements: data.totalElements ?? 0, totalPages: data.totalPages ?? 0 };
}

export async function apiGetOne(urlPath: string, id: string) {
  const res = await apiClient.get(`/api/${urlPath}/${encodeURIComponent(id)}`);
  return res.data;
}

export async function apiCreate(urlPath: string, data: unknown) {
  const res = await apiClient.post(`/api/${urlPath}`, data);
  return res.data;
}

export async function apiUpdate(urlPath: string, id: string, data: unknown) {
  const res = await apiClient.put(`/api/${urlPath}/${encodeURIComponent(id)}`, data);
  return res.data;
}

export async function apiRemove(urlPath: string, id: string) {
  await apiClient.delete(`/api/${urlPath}/${encodeURIComponent(id)}`);
}

export async function apiExport(urlPath: string, search: string) {
  const res = await apiClient.get(`/api/${urlPath}/export`, { params: { search }, responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${urlPath}.xlsx`;
  anchor.click();
  URL.revokeObjectURL(url);
}
