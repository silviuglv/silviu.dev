---
date: 2024-10-20
title: Check env vars at runtime, with full TypeScript support
---

As developers, we inevitably work with environment variables. When using TypeScript, this can become a headache because you always have to check if a variable exists and handle its type accordingly.

While there are libraries that provide schema-based validation and type inference for `process.env` or `.env` files, they don’t always fit every use case, especially when working with Lambda functions in a serverless project.

## Let me explain the problem

When working with Lambda functions, your environment variables may be populated during stack deployment, based on the resources in the stack, like DynamoDB TableName or SQS QueueUrl.

Defining a schema for each of your lambda handlers, even if you only need one env variable seems a bit too much for me.

## The Solution

Here’s a small utility function that checks environment variables at runtime while providing full TypeScript support. It allows you to define required and optional variables, handle default values, and infer the correct types from your environment configuration.

**!Important:** This function uses [const modifiers on type parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters) so you must use TypeScript 5.0 or above.

```typescript
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
    ? N["name"]
    : never
  : never;

type ValueType<T, K> = T extends Array<infer N>
  ? N extends K
    ? string
    : N extends EnvVarWithOptions
    ? N["name"] extends K
      ? N["optional"] extends true
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
    if (typeof param === "string") {
      if (!Object.hasOwn(process.env, param)) {
        throw new Error(`${param} not available in process.env.`);
      }

      Object.assign(env, { [param]: process.env[`${param}`] });
    } else {
      const { name, default: defaultValue, optional } = param;

      if (
        !Object.hasOwn(process.env, name) &&
        typeof defaultValue !== "string" &&
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
```

## How to Use It

Here’s how you can use the `checkEnv` function to validate and infer types for your environment variables:

```ts
import { checkEnv } from “./checkEnv”;

const env = checkEnv(
  // this is required. will throw an error if not found.
  "FIRST_ENV_VAR",
  {
    // this is optional. will return the `default` value if not found
    name: "SECOND_ENV_VAR",
    default: "default_value",
  },
  {
    // this is optional.
    name: "THIRD_ENV_VAR",
    optional: true,
  }
);

/**
 * The type for the env object will be:
 * {
 *   FIRST_ENV_VAR: string;
 *   SECOND_ENV_VAR: string;
 *   THIRD_ENV_VAR: string | undefined;
 * }
 */
```

With less than 30 lines of code (excluding types), this utility function helps you safely check and infer types for your environment variables at runtime. No need for schemas or external libraries. It’s lightweight and perfect for Lambda functions.

Happy coding!
