import { z } from "zod";

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type Pagination = z.infer<typeof paginationQuery>;

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export function paginate<T>(items: T[], total: number, pagination: Pagination): Paginated<T> {
  const totalPages = pagination.limit > 0 ? Math.ceil(total / pagination.limit) : 0;
  return {
    items,
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages,
    hasMore: pagination.page < totalPages,
  };
}

export function offsetOf(pagination: Pagination): number {
  return (pagination.page - 1) * pagination.limit;
}
