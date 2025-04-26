export interface NewsFilters {
  search?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
  published?: boolean;
  page?: number;
  size?: number;
}