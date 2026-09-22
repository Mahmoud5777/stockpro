import apiClient from "@/lib/axios";

export interface ListQuery {
  search?: string;
  filters?: Record<string, string>;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageData<T> {
  items: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export async function apiList<T = unknown>(
  urlPath: string,
  query: ListQuery = {}
): Promise<PageData<T>> {
  const params: Record<string, unknown> = {};
  if (query.filters) {
    for (const [key, value] of Object.entries(query.filters)) {
      if (value !== undefined && value !== "") params[key] = value;
    }
  }
  if (query.search) params.search = query.search;
  if (query.page != null) params.page = query.page;
  if (query.size != null) params.size = query.size;
  if (query.sort) params.sort = query.sort;

  const res = await apiClient.get(`/api/${urlPath}`, { params });
  const data = res.data;
  if (Array.isArray(data)) {
    return {
      items: data,
      number: 0,
      size: data.length,
      totalElements: data.length,
      totalPages: 1,
      last: true,
    };
  }
  return {
    items: data.content ?? [],
    number: data.number ?? 0,
    size: data.size ?? 0,
    totalElements: data.totalElements ?? 0,
    totalPages: data.totalPages ?? 0,
    last: data.last ?? true,
  };
}

export async function apiGetOne(urlPath: string, id: string) {
  const res = await apiClient.get(`/api/${urlPath}/${id}`);
  return res.data;
}

export async function apiCreate(urlPath: string, data: unknown) {
  const res = await apiClient.post(`/api/${urlPath}`, data);
  return res.data;
}

export async function apiUpdate(urlPath: string, id: string, data: unknown) {
  const res = await apiClient.put(`/api/${urlPath}/${id}`, data);
  return res.data;
}

export async function apiRemove(urlPath: string, id: string) {
  await apiClient.delete(`/api/${urlPath}/${id}`);
}
