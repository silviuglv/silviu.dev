---
date: 2025-10-10
title: Building a Fully-Typed HTTP Router for AWS Lambda with Middy and Zod
draft: true
---

## Introduction

I recently needed to add a handful of REST endpoints to one of my projects. The business logic lives in repository classes and service objects, so the API layer is just an interface—basic CRUD operations with minimal logic. Creating a separate Lambda for each endpoint felt like overkill.

There's an ongoing debate in the serverless community about structuring REST APIs: Lambda monoliths with routing (sometimes even wrapping Express) versus one Lambda per endpoint. These are extremes, and most projects fall somewhere in between.

I generally avoid Lambda monoliths and prefer keeping handlers focused on their event intent. My rule of thumb: don't mix event sources in a single handler. Since all my routes come from API Gateway, they share a consistent interface, making them good candidates for a shared handler.

I was already using middy throughout the project, so its `http-router` utility was a natural fit. But I wanted more: full type safety with Zod schemas, automatic validation, and minimal boilerplate. This post shows how I built it.

## The End Result

Here's what using the router looks like:

```ts
// routes/resources.routes.ts
import { createRoute } from "./router";
import { z } from "zod";

const getResourceRoute = createRoute({
  method: "GET",
  path: "/resources/{resourceId}",
  schemas: {
    response: z.object({
      id: z.string(),
      title: z.string(),
      status: z.enum(["active", "archived"]),
    }),
  },
  handler: async (event) => {
    // event.params.resourceId is fully typed as string
    const resource = await repos.resources.get(event.params.resourceId);

    if (!resource) {
      throw new NotFoundError("Resource not found");
    }

    // Response is validated against schema - no data leaks!
    return resource;
  },
});

const createResourceRoute = createRoute({
  method: "POST",
  path: "/resources",
  schemas: {
    body: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
    }),
    response: z.object({
      id: z.string(),
      title: z.string(),
      status: z.enum(["active", "archived"]),
    }),
  },
  handler: async (event) => {
    // event.body is fully typed from the schema
    const resource = await repos.resources.create(event.body);
    return resource;
  },
});

// handler.ts
import { middy } from "./middy";
import httpRouterHandler from "@middy/http-router";
import httpCors from "@middy/http-cors";
import httpSecurityHeaders from "@middy/http-security-headers";

export const handler = middy()
  .use(httpRouterHandler([getResourceRoute, createResourceRoute]))
  .use(httpCors())
  .use(httpSecurityHeaders());
```

Clean handlers with full type inference and validation. Let's build it.

## What We're Building

The solution has three components:

1. **`createRoute` factory** - Wraps your handler with validation and type inference
2. **`httpRouteParser` middleware** - Validates requests/responses and formats the event
3. **`httpOnError` middleware** - Catches errors and formats consistent error responses

Let's walk through each one.

## Part 1: The Route Factory

This is the main interface you'll use. It takes your handler config and returns a configured route for middy's http-router:

```ts
// router/create-route.ts
import middy from '@middy/core';
import { z } from 'zod';
import { httpRouteParser, httpOnError } from './middleware';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RouteSchemas {
body?: z.ZodType;
params?: z.ZodType;
query?: z.ZodType;
response?: z.ZodType;
}

export interface RouteEvent<
TBody = unknown,
TParams = Record<string, string>,
TQuery = Record<string, string>

> {

    body: TBody;

params: TParams;
query: TQuery;
headers: Record<string, string>;
requestId: string;
\_raw: {
event: APIGatewayProxyEventV2;
context: Context;
};
}

type RouteHandler<TSchemas extends RouteSchemas> = (
event: RouteEvent<
TSchemas['body'] extends z.ZodType ? z.infer<TSchemas['body']> : undefined,
TSchemas['params'] extends z.ZodType ? z.infer<TSchemas['params']> : Record<string, string>,
TSchemas['query'] extends z.ZodType ? z.infer<TSchemas['query']> : Record<string, string>

> ) => Promise<TSchemas['response'] extends z.ZodType ? z.infer<TSchemas['response']> : unknown>;

// Extract path parameters from the path string
function createParamsSchema(path: string) {
const matches = path.matchAll(/\\{([^}]+)\\}/g);
const paramNames = Array.from(matches, m => m[1]);

if (paramNames.length === 0) return undefined;

const shape = paramNames.reduce((acc, name) => {
acc[name] = z.string().min(1);
return acc;
}, {} as Record<string, z.ZodString>);

return z.object(shape);
}

export function createRoute<TSchemas extends RouteSchemas>(config: {
method: HttpMethod;
path: string;
schemas?: TSchemas;
handler: RouteHandler<TSchemas>;
}) {
// Auto-generate params schema from path if not provided
const schemas = {
...config.schemas,
params: config.schemas?.params ?? createParamsSchema(config.path),
};

return {
method: config.method,
path: config.path,
handler: middy()
.use(httpRouteParser({ schemas }))
.use(httpOnError())
.handler(config.handler as any),
};
}
```

**What's happening here:**

The `RouteEvent` type is the cleaned-up interface your handler receives. Instead of the raw API Gateway event with nested properties and optional fields, you get a simple object with `body`, `params`, `query`, and `headers`.

The `RouteHandler` type uses conditional types to infer the exact types based on your schemas. If you provide a `body` schema, TypeScript knows `event.body` has that exact shape. If you don't, `event.body` is `undefined`.

The `createParamsSchema` function is a nice touch—it extracts parameter names from the path string using regex. For a path like `/resources/{resourceId}/comments/{commentId}`, it generates a schema for `{ resourceId: string, commentId: string }` automatically. You can still override this with a more specific schema (like validating UUIDs) by providing your own `params` schema.

Finally, `createRoute` wraps your handler with two middleware functions (which we'll build next) and returns an object compatible with middy's http-router.

**Type inference in action:**

```ts
createRoute({
  method: "GET",
  path: "/workflows/{workflowId}",
  schemas: {
    query: z.object({
      status: z.enum(["active", "paused"]).optional(),
    }),
    response: z.object({
      id: z.string(),
      name: z.string(),
    }),
  },
  handler: async (event) => {
    // TypeScript knows:
    // event.params = { workflowId: string } (auto-generated)
    // event.query = { status?: 'active' | 'paused' }
    // return type must match response schema

    const workflow = await getWorkflow(event.params.workflowId);
    return workflow; // Validated at runtime
  },
});
```

No manual type annotations needed. If you return the wrong shape or reference a non-existent parameter, TypeScript catches it.

## Part 2: The Route Parser Middleware

This middleware does the heavy lifting—parsing and validating requests in the `before` hook, and validating responses in the `after` hook:

```ts
// router/middleware.ts
import type { MiddlewareObj } from "@middy/core";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { z } from "zod";

interface RouteSchemas {
  body?: z.ZodType;
  params?: z.ZodType;
  query?: z.ZodType;
  response?: z.ZodType;
}

export function httpRouteParser(options: {
  schemas?: RouteSchemas;
}): MiddlewareObj {
  return {
    before: async (request) => {
      const { event, context } = request;
      const { schemas } = options;
      const requestId = event.requestContext.requestId;

      // Parse JSON body if present
      let body: unknown;
      if (event.body) {
        try {
          body = JSON.parse(event.body);
        } catch {
          throw new ValidationError("Invalid JSON in request body");
        }
      }

      // Validate each part of the request
      const validatedBody = validateField(schemas?.body, body, "body");
      const validatedParams = validateField(
        schemas?.params,
        event.pathParameters || {},
        "path parameters"
      );
      const validatedQuery = validateField(
        schemas?.query,
        event.queryStringParameters || {},
        "query parameters"
      );

      // Replace the event with our cleaned-up version
      request.event = {
        body: validatedBody,
        params: validatedParams,
        query: validatedQuery,
        headers: event.headers || {},
        requestId,
        _raw: { event, context },
      } as any;
    },

    after: async (request) => {
      const { schemas } = options;
      const requestId = (request.event as any).requestId;

      // If response already has statusCode, it's formatted (error case)
      if (request.response?.statusCode) return;

      // Validate response against schema
      let data = request.response;
      if (schemas?.response) {
        const result = schemas.response.safeParse(data);
        if (!result.success) {
          // This is a bug - our handler returned invalid data
          console.error("Response validation failed:", result.error.errors);
          throw new InternalServerError(
            "Response validation failed",
            result.error.errors
          );
        }
        data = result.data;
      }

      // Wrap in success envelope
      request.response = {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          data,
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
          },
        }),
        headers: { "Content-Type": "application/json" },
      };
    },
  };
}

// Helper for validation
function validateField(
  schema: z.ZodType | undefined,
  data: unknown,
  fieldName: string
) {
  if (!schema) return data;

  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));
    throw new ValidationError(`Invalid ${fieldName}`, details);
  }
  return result.data;
}
```

**What's happening here:**

The `before` hook runs before your handler. It parses the JSON body, validates all inputs (body, params, query) against their schemas, and replaces the API Gateway event with a clean object. If validation fails, it throws a `ValidationError` with details about what went wrong.

The `after` hook runs after your handler returns. It validates the response data against the response schema if provided. This is important—it prevents accidentally leaking sensitive data or extra database fields. If your handler returns something that doesn't match the schema, it's treated as a server bug (500 error) rather than a client error. Finally, it wraps the validated data in a consistent success envelope with a `requestId` and timestamp.

The `validateField` helper uses Zod's `safeParse` to validate without throwing. If validation fails, we format the errors into a readable structure with the field path and message.

**Why validate responses?**

Response validation might seem unnecessary, but it's a safety net. Let's say your database returns extra fields or your ORM loads associations you didn't intend to expose. Without response validation, those leak through. With it, only the fields in your schema make it to the client. It's caught me a few times during development.

## Part 3: Error Handling Middleware

Finally, we need consistent error formatting across all routes:

```ts
// router/middleware.ts (continued)
export function httpOnError(): MiddlewareObj {
  return {
    onError: async (request) => {
      const error = request.error;
      const requestId =
        (request.event as any)?.requestId ||
        request.event?.requestContext?.requestId ||
        "unknown";

      // Handle known application errors
      if (error instanceof AppError) {
        request.response = {
          statusCode: error.statusCode,
          body: JSON.stringify({
            success: false,
            error: {
              code: error.code,
              message: error.message,
              details: error.details,
            },
            meta: { requestId, timestamp: new Date().toISOString() },
          }),
          headers: { "Content-Type": "application/json" },
        };
        return;
      }

      // Handle unknown errors - don't expose internals
      console.error("Unhandled error:", error);
      request.response = {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          },
          meta: { requestId, timestamp: new Date().toISOString() },
        }),
        headers: { "Content-Type": "application/json" },
      };
    },
  };
}
```

**What's happening here:**

This middleware catches any errors thrown by your handler or the parser middleware. If it's one of our `AppError` classes (like `NotFoundError` or `ValidationError`), it formats it into the error envelope with the appropriate status code. If it's an unknown error, we log it for debugging but return a generic 500 error to the client—we don't want to leak stack traces or internal details.

**Custom error classes:**

```ts
// router/errors.ts
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly code = "VALIDATION_ERROR";
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = "CONFLICT";
}

export class InternalServerError extends AppError {
  readonly statusCode = 500;
  readonly code = "INTERNAL_SERVER_ERROR";
}
```

Each error class defines its HTTP status code and error code. In your handlers, you just throw the appropriate error:

```
handler: async (event) => {
const resource = await repos.resources.get(event.params.resourceId);

if (!resource) {
throw new NotFoundError('Resource not found');
}

return resource;
}
```

The middleware handles the rest—formatting the response, setting status codes, and ensuring consistency.

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
    "code": "NOT_FOUND",
    "message": "Resource not found"
  },
  "meta": {
    "requestId": "abc-def-123",
    "timestamp": "2025-10-10T12:00:00.000Z"
  }
}
```

**Validation Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      { "path": "title", "message": "Required" },
      { "path": "status", "message": "Invalid enum value" }
    ]
  },
  "meta": {
    "requestId": "abc-def-123",
    "timestamp": "2025-10-10T12:00:00.000Z"
  }
}
```

The `success` boolean makes it easy for clients to handle responses without checking status codes. The `requestId` is useful for debugging and correlating logs.

## Performance Considerations

Using a single Lambda with routing adds minimal overhead. The Lambda container stays warm across invocations, and middy's middleware is lightweight. For most APIs, database queries take far longer than any routing logic.

Follow AWS best practices by initializing clients outside the handler:

```ts
// context.ts - runs once per container
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { WorkflowRepository } from "./repositories";

export const dynamoClient = new DynamoDBClient({});
export const repos = {
  workflows: new WorkflowRepository(dynamoClient),
  resources: new ResourceRepository(dynamoClient),
};

// routes/workflows.routes.ts
import { repos } from "../context";

export const getWorkflowRoute = createRoute({
  method: "GET",
  path: "/workflows/{workflowId}",
  handler: async (event) => {
    // Reuses the same repository instance
    const workflow = await repos.workflows.get(event.params.workflowId);
    return workflow;
  },
});
```

This ensures your repositories and clients are initialized once per container, not per invocation.

## Testing

Testing routes is straightforward:

```ts
import { describe, it, expect } from "vitest";
import { getWorkflowRoute } from "./workflows.routes";

describe("GET /workflows/{workflowId}", () => {
  it("should return workflow by id", async () => {
    const mockEvent = {
      params: { workflowId: "123" },
      query: {},
      body: undefined,
      headers: {},
      requestId: "test-123",
      _raw: { event: {} as any, context: {} as any },
    };

    const result = await getWorkflowRoute.handler(mockEvent, {} as any);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.success).toBe(true);
    expect(body.data).toMatchObject({ id: "123" });
  });
});
```

You're testing the handler directly with the parsed event format, making tests readable and focused.

## Why This Approach?

This solution fits a specific use case—APIs that are primarily interface layers with thin CRUD operations. If your routes share similar concerns (auth, logging, error handling) and you're already using middy and Zod, this approach reduces boilerplate while maintaining type safety.

I considered other options:

- **Hono with Lambda adapter** - Great type safety and larger ecosystem, but adds another abstraction layer
- **One Lambda per endpoint** - Maximum isolation and control, more infrastructure to manage
- **API Gateway direct integrations** - For simple proxies, you can skip Lambda entirely

Each has trade-offs. This solution worked well for my project because it leveraged tools I was already using.

## What's Next

The current implementation covers my routing needs, but here are some ideas I'm considering:

**OpenAPI Schema Generation** - The Zod schemas contain all the information needed to generate OpenAPI specs. It's a matter of traversing route definitions and mapping Zod types to OpenAPI types.

**Rate Limiting Middleware** - Per-route rate limiting using DynamoDB or ElastiCache.

**Request/Response Logging** - Structured logging middleware that captures sanitized payloads for debugging.

## Try It Yourself

I've published the complete implementation with examples and tests on GitHub: [github.com/silviuaavram/lambda-typed-router](https://github.com/silviuaavram/lambda-typed-router)

The repository includes:

- Full middleware implementation
- Example CRUD routes
- Integration tests
- CDK deployment setup
