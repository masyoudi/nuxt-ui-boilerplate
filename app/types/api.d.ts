import type { Path as ServerPath, Response as ServerResponse } from '#build/server-routes';
import type { PathValue } from '~~/shared/types/extractor';

type StripApiPrefix<T> = T extends `/api${infer Route}` ? Route : never;

export type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

export type ApiRoute = StripApiPrefix<ServerPath>;

export type ApiResponse<R extends ApiRoute, M extends ApiMethod = 'get'> = ServerResponse<`/api${R}`, Uppercase<M>>;

export type ExtractApiResponse<P extends string, R extends ApiRoute, M extends ApiMethod = 'get'> = PathValue<ApiResponse<R, M>, P>;
