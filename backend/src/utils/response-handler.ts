export interface ApiResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T | null;
}

export function createResponse<T>(
  status: number,
  message: string,
  data: T | null = null,
): ApiResponse<T> {
  return {
    status,
    success: status >= 200 && status < 300,
    message,
    data,
  };
}
