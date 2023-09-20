export type ResponseData<T = { [key: string]: any }> = Partial<{
  status: number,
  msg: string,
  success: boolean
  data: T
}>