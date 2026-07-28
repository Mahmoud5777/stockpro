import { apiClient } from "@/lib/axios";

// Basé sur ApplicationDTO (backend). Utilisé uniquement pour peupler le select
// "Application" du formulaire Fonctionnalité (une fonctionnalité référence toujours une application).
export interface ApplicationLite {
  idApp: string;
  codeApp: string;
  nomApp: string;
}

export const applicationService = {
  async listAll(): Promise<ApplicationLite[]> {
    const { data } = await apiClient.get<ApplicationLite[]>("/applications/all");
    return data;
  },
};
