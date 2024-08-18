import { PaginationReturn } from './pagination.dto';

export function PaginationResponse<T = any[]>(
  data: T,
  totalDatas: number,
  page: number,
  limit: number,
): PaginationReturn<T> {
  return {
    totalDatas,
    page,
    limit,
    totalPages: Math.ceil(totalDatas / limit),
    data,
  };
}
