import type { NitroFetchRequest, TypedInternalResponse } from 'nitropack';

export type ApiResponse<
  Route extends NitroFetchRequest,
  Method extends 'get' | 'post' | 'put' | 'patch' | 'delete' = 'get'
> = TypedInternalResponse<Route, unknown, Method>;
