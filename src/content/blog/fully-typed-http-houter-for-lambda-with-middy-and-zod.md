---
date: 2025-10-10
title: Fully-Typed HTTP Router for AWS Lambda with Middy and Zod
draft: false
---

When I needed to add a couple of REST endpoints to a serverless project, I faced the age-old debate: Lambda monolith or individual handlers?

My rule of thumb is to avoid mixing event sources in a single handler. However, for REST APIs where the business logic lives in repository classes and service objects, the API layer is just an interface: basic CRUD with minimal logic. Creating separate Lambdas for each endpoint felt like overkill.

Since I was already using [middy](https://middy.js.org/) in the project, I discovered their [http-router](https://middy.js.org/docs/routers/http-router): a simple utility that forwards events to handlers based on method and path. It also handles extracting path parameters if you're using a `/{proxy+}` route in your API Gateway.

This felt like a natural fit, but I wanted more:

- minimal boilerplate for the route handlers
- parsed and fully typed route event and context
- automatic validation of both request and response payloads with Zod
- consistent response envelope that I don't have to worry about in the handler

## The End Result

Here's what using the router looks like:

```ts
// api/src/routes/todos/get-todo.ts
import { z } from "zod";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { createRoute, NotFoundError } from "@repo/http-router";
import { Todo, TodoSchema } from "../../models/todo";

export const getTodoRoute = createRoute({
  method: "GET",
  path: "/todos/{id}",
  schemas: {
    params: z.object({ id: z.uuid() }),
    response: TodoSchema,
  },
  handler: async (event, ctx) => {
    const result = await ctx.ddb.send(
      new GetCommand({
        TableName: ctx.env.tableName,
        Key: {
          PK: "TODO",
          SK: `METADATA#${event.params.id}`,
        },
      })
    );

    if (!result.Item) {
      throw new NotFoundError(`Todo with id '${event.params.id}' not found`);
    }

    return result.Item as Todo;
  },
});

// api/src/lambda/execute-request.ts
import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  httpErrorHandler,
  httpRouteContext,
  httpRouterHandler,
  NotFoundError,
} from "@repo/http-router";
import { routes } from "../routes";

if (!process.env.TABLE_NAME) {
  throw new Error("TABLE_NAME not available in env");
}

export const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient());

export const context = {
  env: {
    tableName: process.env.TABLE_NAME,
  },
  ddb: ddbClient,
};

declare module "@repo/http-router" {
  interface Register {
    context: typeof context;
  }
}

export const handler = middy(
  httpRouterHandler({
    routes,
    notFoundResponse: ({ method, path }) => {
      console.warn("Not found resource", method, path);
      throw new NotFoundError("Not found");
    },
  })
)
  .use(httpRouteContext(context))
  .use(httpHeaderNormalizer())
  .use(httpCors())
  .use(httpErrorHandler());
```

Throughout the code samples I'll most likely exclude the utilities and types implementation. A full example can be found here: [https://github.com/silviuglv/lambda-http-router](https://github.com/silviuglv/lambda-http-router)

As you can see above, the router is contained in a local package called `@repo/http-router`. This contains the full implementation and re-exports the main `@middy/http-router` handler as well.

## Here's How It Works

The solution has four main components:

1. **`createRoute` factory** - Wraps the route handler with validation and type inference
2. **`httpRouteParser` middleware** - Validates requests/responses and formats the event and context
3. **`httpRouteContext` middleware** - Stashes the user-defined context and adds it to the route handler at runtime
4. **`httpErrorHandler` middleware** - Catches errors and formats consistent error responses

Dependencies:

1. **`@middy/core`** - Main middy package
2. **`@middy/http-router`** - Main handler router, we're building on top of it
3. **`aws-lambda`** - Utility types for Lambda
4. **`zod`** - Schema validation and type inference

## 1: The Route Factory

This is the main interface you'll use. It takes your handler config and returns a configured route for middy's http-router:

```ts
// packages/http-router/src/lib/create-route.ts
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
  Handler,
} from "aws-lambda";
import middy from "@middy/core";
import { Method, Route } from "@middy/http-router";
import {
  ParamsSchema,
  RouteContext,
  RouteHandler,
  RouteSchemas,
} from "./types";
import { httpRouteParser } from "./route-parser";

export function createRoute<
  TPath extends string,
  TSchemas extends RouteSchemas,
  TContext extends RouteContext
>(config: {
  method: Method;
  path: TPath;
  schemas?: TSchemas & {
    params?: ParamsSchema<TPath>;
  };
  handler: RouteHandler<TPath, TSchemas, TContext>;
}): Route<APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2> {
  return {
    method: config.method,
    path: config.path,
    handler: middy(
      config.handler as unknown as Handler<
        APIGatewayProxyEventV2,
        APIGatewayProxyStructuredResultV2
      >
    ).use(httpRouteParser({ schemas })),
  };
}
```

This is the simplest module of the implementation. It takes the route definition and maps it to an http-router compliant object, with some middlewares attached to the handler.

The main benefit is in the types: we get automatic inference for the schemas and the path params.

**Type inference in action:**

```ts
createRoute({
  method: "GET",
  path: "/todos/{id}",
  schemas: {
    params: z.object({ id: z.uuid() }),
    response: TodoSchema,
  },
  handler: async (event, ctx) => {
    // (parameter) event: {
    //   body: undefined;
    //   params: {
    //     id: string;
    //   };
    //   query: Record<string, string>;
    //   headers: Record<string, string>;
    // };
    //
    // (parameter) ctx: {
    //   env: {
    //     tableName: string;
    //   };
    //   ddb: DynamoDBDocumentClient;
    //   requestId: string;
    //   _raw: {
    //     event: APIGatewayProxyEventV2;
    //     context: Context;
    //   };
    // };
  },
});
```

A couple of things to notice:

- `params.id` type can be inferred without a schema, but you can enforce it to a stricter type, like a UUID
- You still have access to the full Lambda event and context via `ctx._raw`

No manual type annotations needed. If you return the wrong shape or reference a non-existent parameter, TypeScript catches it.

## 2: The Route Parser Middleware

This middleware does the heavy lifting. It parses and transforms requests in the `before` hook, then validates responses in the `after` hook:

```ts
// packages/http-router/src/lib/route-parser.ts
import { z } from "zod";
import type {
  APIGatewayProxyStructuredResultV2,
  APIGatewayProxyEventV2,
  Context,
} from "aws-lambda";
import type { MiddlewareObj } from "@middy/core";
import { Internal, ParsedContext, RouteEvent, RouteSchemas } from "./types";
import {
  BadRequestError,
  InternalServerError,
  UnsupportedMediaTypeError,
} from "./errors";
import {
  contextCache,
  formatDataResponse,
  INTERNAL_CONTEXT_KEY,
  isRouteEvent,
} from "./utils";

const validateField = (schema: z.ZodType, value: unknown, field: string) => {
  try {
    return schema.parse(value);
  } catch (error) {
    throw new BadRequestError(
      `Invalid request ${field}`,
      error instanceof z.ZodError
        ? z.flattenError(error).fieldErrors
        : undefined
    );
  }
};

export function httpRouteParser<T extends RouteSchemas>(options: {
  schemas?: T;
}): MiddlewareObj<
  APIGatewayProxyEventV2 | RouteEvent<string, T>,
  APIGatewayProxyStructuredResultV2 | Record<string, unknown>,
  Error,
  Context,
  Internal
> {
  return {
    before: async (request) => {
      // Safe guard
      if (isRouteEvent(request.event)) {
        return request.event;
      }

      const { schemas } = options;

      // Stash the raw event and context into internals.
      const __rawEvent = request.event as APIGatewayProxyEventV2;
      const __rawContext = request.context as Context;

      Object.assign(request.internal, { __rawEvent, __rawContext });

      let body: unknown = __rawEvent.body;

      if (typeof __rawEvent.body === "string" && schemas?.body) {
        try {
          body = JSON.parse(__rawEvent.body);
        } catch {
          throw new UnsupportedMediaTypeError("Request body is not valid JSON");
        }
      }

      const parsed = {
        __type: "route",
        body: schemas?.body
          ? validateField(schemas.body, body, "body")
          : undefined,
        params: schemas?.params
          ? validateField(
              schemas.params,
              __rawEvent.pathParameters ?? {},
              "params"
            )
          : undefined,
        query: schemas?.query
          ? validateField(
              schemas.query,
              __rawEvent.queryStringParameters ?? {},
              "query"
            )
          : undefined,
        headers: __rawEvent.headers,
      } as RouteEvent<string, T>;

      const parsedContext: ParsedContext = {
        requestId: __rawContext.awsRequestId,
        _raw: { event: __rawEvent, context: __rawContext },
      };

      const userContext = contextCache.get(INTERNAL_CONTEXT_KEY) ?? {};

      const routeContext = {
        __type: "route",
        ...userContext,
        ...parsedContext,
        // Middy requires this to capture timeout errors.
        getRemainingTimeInMillis: () => {
          return __rawContext.getRemainingTimeInMillis();
        },
      };

      request.event = parsed;
      request.context = routeContext as unknown as Context;
    },

    after: async (request) => {
      const { schemas } = options;

      request.event = request.internal.__rawEvent;
      request.context = request.internal.__rawContext;

      if (request.response?.statusCode) {
        return;
      }

      const requestId = request.context.awsRequestId;

      let data = request.response;

      if (schemas?.response) {
        const result = schemas.response.safeParse(data);

        if (!result.success) {
          throw new InternalServerError("Response validation failed");
        }

        data = result.data;
      }

      request.response = formatDataResponse(
        200,
        data as Record<string, unknown>,
        {
          metadata: { requestId },
        }
      );
    },
  };
}
```

This could probably be cleaned up a bit, as it's kind of hard to follow what's going on. Here's the gist:

**`before` middleware**

This is called first with the event and context in the `request` object from the main Lambda handler.

The route handler requires different objects, but we don't want to lose the initial ones as other middlewares upstream may need them. So we stash them in the `internal` object (something middy provides) for the time being.

Here, we also handle incoming event validation based on the route schemas.

**`after` middleware**

It runs after the route handler has executed.

It restores the main event and context, parses the response to ensure we're not leaking unwanted data at runtime, and formats it into a consistent envelope.

## 3: Route Context Middleware

```ts
// packages/http-router/src/lib/route-context.ts
import type { MiddlewareObj } from "@middy/core";
import { contextCache, INTERNAL_CONTEXT_KEY } from "./utils";

export function httpRouteContext<T extends Record<string, unknown>>(
  context: T
): MiddlewareObj {
  return {
    before: async () => {
      contextCache.set(INTERNAL_CONTEXT_KEY, context);
    },
  };
}
```

This is a simple one. It takes the context object provided in the Lambda and adds it to a cache so the router middlewares can access it.

We do this because each route handler starts a new middy instance. This means we lose references to shared data like `request.internal`.

## 4: Error Handler

```ts
import { MiddlewareObj } from "@middy/core";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { formatErrorResponse } from "./utils";
import { HttpError } from "./errors";

export function httpErrorHandler(): MiddlewareObj<
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2
> {
  return {
    onError: async (request) => {
      const error = request.error;
      const requestId = request.context.awsRequestId;

      if (error instanceof HttpError) {
        request.response = formatErrorResponse(
          error.statusCode,
          {
            code: error.code,
            message: error.message,
            details: error.details,
          },
          {
            metadata: { requestId },
          }
        );

        return;
      }

      // Error thrown by @middy/http-router for unsupported methods, eg. `TRACE`
      if (error instanceof Error && error.message === "Method not allowed") {
        request.response = formatErrorResponse(
          405,
          {
            code: "MethodNotAllowed",
            message: error.message,
          },
          { metadata: { requestId } }
        );

        return;
      }

      // You may want to add some loggers here.
      request.response = formatErrorResponse(
        500,
        {
          code: "InternalServerError",
          message: "An unexpected error occurred",
        },
        { metadata: { requestId } }
      );
    },
  };
}
```

This middleware catches any errors thrown by your handler or parser middleware. If it's one of our `HttpError` classes (like `NotFoundError` or `BadRequestError`), it formats it into the error envelope with the appropriate status code. If it's an unknown error, we log it for debugging but return a generic 500 error to the client—we don't want to leak stack traces or internal details.

**Custom error classes:**

```ts
// packages/http-router/src/lib/errors.ts
export abstract class HttpError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BadRequestError extends HttpError {
  readonly statusCode = 400;
  readonly code = "BadRequest";
}

export class NotFoundError extends HttpError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";
}

export class InternalServerError extends HttpError {
  readonly statusCode = 500;
  readonly code = "INTERNAL_SERVER_ERROR";
}
```

Each error class defines its HTTP status code and error code. In your handlers, you just throw the appropriate error:

```ts
handler = async (event) => {
  const resource = await repos.resources.get(event.params.resourceId);

  if (!resource) {
    throw new NotFoundError("Resource not found");
  }

  return resource;
};
```

The middleware handles the rest: formatting the response, setting status codes, and ensuring consistency.

## Response Format

All responses follow the same structure. Here's what clients receive:

**Success:**

```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Example Resource",
    "status": "active"
  },
  "meta": {
    "requestId": "abc-def-123",
    "timestamp": "2025-10-10T12:00:00.000Z"
  }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "NotFound",
    "message": "Resource not found"
  },
  "meta": {
    "requestId": "abc-def-123",
    "timestamp": "2025-10-10T12:00:00.000Z"
  }
}
```

The `success` boolean makes it easy for clients to handle responses without checking status codes. The `requestId` is useful for debugging and correlating logs.

## Why This Approach?

This solution fits a specific use case: APIs that are primarily interface layers with thin CRUD operations. If your routes share similar concerns (auth, logging, error handling) and you're already using middy and Zod, this approach reduces boilerplate while maintaining type safety.

## What's Next

The current implementation covers my routing needs, but here are some ideas I'm considering, like **OpenAPI Schema Generation**. The Zod schemas contain all the information needed to generate OpenAPI specs. It's a matter of traversing route definitions and mapping Zod types to OpenAPI types.

## Try It Yourself

I've published the complete implementation with examples and tests on GitHub: [https://github.com/silviuglv/lambda-http-router](https://github.com/silviuglv/lambda-http-router)
