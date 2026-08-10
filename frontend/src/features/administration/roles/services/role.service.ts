import { apiClient } from "@/lib/axios";
import type { Page, PageRequest } from "@/types/common";
import type { CrudService } from "@/features/administration/shared/types/crud-service.types";
import { buildListParams } from "@/features/administration/shared/services/buildListParams";
import type { Role, RoleInput } from "../types/role.types";

export const roleService = {
  async list(params: PageRequest): Promise<Page<Role>> {
    const { data } = await apiClient.get<Page<Role>>("/roles", {
      params: buildListParams(params),
    });
    return data;
  },
  async create(input: RoleInput): Promise<Role> {
    const { data } = await apiClient.post<Role>("/roles", input);
    return data;
  },
  async update(id: string, input: RoleInput): Promise<Role> {
    const { data } = await apiClient.put<Role>(`/roles/${id}`, input);
    return data;
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(`/roles/${id}`);
  },
  async listAll(): Promise<Role[]> {
    const { data } = await apiClient.get<Role[]>("/roles/all");
    return data;
  },
} satisfies CrudService<Role, RoleInput>;
