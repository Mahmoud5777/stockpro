export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface PageRequest {
  page: number;
  size: number;
  sort?: string;
  search?: string;
  filters?: Record<string, string | boolean | undefined>;
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