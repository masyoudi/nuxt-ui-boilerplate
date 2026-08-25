import type { NitroFetchRequest, TypedInternalResponse } from 'nitropack';
import type { PathValue } from './extractor';

export type ApiResponse<
  Route extends NitroFetchRequest,
  Method extends 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'query' = 'get'
> = TypedInternalResponse<Route, unknown, Method>;

export type ExtractApiResponse<
  P extends string,
  Route extends NitroFetchRequest,
  Method extends 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options' | 'query' = 'get'
> = PathValue<TypedInternalResponse<Route, unknown, Method>, P>;
