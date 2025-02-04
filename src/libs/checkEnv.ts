// checkEnv.ts

type EnvVarWithOptions = {
  name: string;
  default?: string;
  optional?: boolean;
};

type EnvVar = string | EnvVarWithOptions;

type Names<T> = T extends Array<infer N>
  ? N extends string
    ? N
    : N extends EnvVarWithOptions
    ? N['name']
    : never
  : never;

type ValueType<T, K> = T extends Array<infer N>
  ? N extends K
    ? string
    : N extends EnvVarWithOptions
    ? N['name'] extends K
      ? N['optional'] extends true
        ? string | undefined
        : string
      : never
    : never
  : never;

export function checkEnv<const T extends Array<EnvVar>>(
  ...params: T
): { [K in Names<T>]: ValueType<T, K> } {
  const env = {} as { [K in Names<T>]: ValueType<T, K> };

  for (const param of params) {
    if (typeof param === 'string') {
      if (!Object.hasOwn(process.env, param)) {
        throw new Error(`${param} not available in process.env.`);
      }

      Object.assign(env, { [param]: process.env[`${param}`] });
    } else {
      const { name, default: defaultValue, optional } = param;

      if (
        !Object.hasOwn(process.env, name) &&
        typeof defaultValue !== 'string' &&
        optional !== true
      ) {
        throw new Error(`${name} not available in process.env.`);
      }

      Object.assign(env, {
        [name]: process.env[`${name}`] ?? defaultValue ?? undefined,
      });
    }
  }

  return env;
}
