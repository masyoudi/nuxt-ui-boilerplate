type GetNextNode<T, K extends string> = K extends keyof T ? T[K] : T extends readonly (infer U)[] ? K extends `${number}` ? U : never : never;

type GetLeafNode<T, P extends string> = P extends keyof T ? T[P] : T extends readonly (infer U)[] ? P extends `${number}` ? U : P extends keyof U ? U[P] : never : never;

export type PathValue<T, P extends string> = P extends `${infer K}.${infer Rest}` ? PathValue<GetNextNode<T, K>, Rest> : GetLeafNode<T, P>;
