// Types communs partagés dans toute l'application

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page courante (0-based, aligné Spring Data Page)
  size: number;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string; // ex: "libProfil,asc"
  search?: string;
}

export type SortDirection = "asc" | "desc";

export interface ApiError {
  status: number;
  message: string;
  errors?: Record<string, string>;
}

export interface SelectOption {
  value: string;
  label: string;
}
