import apiClient from "@/lib/axios";

export async function apiList(urlPath: string) {
  const res = await apiClient.get(`/api/${urlPath}`);
  return res.data.content ?? res.data;
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
