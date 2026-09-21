import type { InternalApi } from 'nitropack';
import type { PathValue } from '~~/shared/types/primitive';

type ApiRouteWithPrefix = Extract<keyof InternalApi, `/api/${string}`>;

type RemoveApiPrefix<T> = T extends `/api${infer Route}` ? Route : never;

type AddApiPrefix<R extends ApiRoute> = Extract<`/api${R}`, ApiRouteWithPrefix>;

type ApiDefinition<R extends ApiRoute> = InternalApi[AddApiPrefix<R>];

type RouteResponse<R extends ApiRoute, M extends ApiMethod> = M extends keyof ApiDefinition<R> ? ApiDefinition<R>[M] : 'default' extends keyof ApiDefinition<R> ? ApiDefinition<R>['default'] : unknown;

export type ApiMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options';

export type ApiRoute = RemoveApiPrefix<ApiRouteWithPrefix>;

export type ApiResponse<R extends ApiRoute, M extends ApiMethod = 'get'> = R extends ApiRoute ? RouteResponse<R, M> : never;

export type ExtractApiResponse<P extends string, R extends ApiRoute, M extends ApiMethod = 'get'> = PathValue<ApiResponse<R, M>, P>;
