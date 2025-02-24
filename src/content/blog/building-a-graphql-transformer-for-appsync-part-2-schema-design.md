---
date: 2025-02-23
title: "Building a GraphQL Transformer for AWS AppSync: Part 2 – Schema Design"
draft: false
---

_I originally intended to write a single post on both schema & table design, but it was getting too long, so I decided to split it into two._

A couple of days ago, I shared my motivation for building a GraphQL Transformer Library for AppSync and what I aim to achieve with it. Since then, I’ve made good progress and wanted to share some decisions regarding schema design.

You can read the full article [here](https://www.silviu.dev/blog/appsync-graphql-transformer-part-1), but to setup the context, here are some constrains I had from the beginning:

1. Global Object IDs and Node Interface support;
2. GraphQL Connections-based pagination;
3. Interfaces and Unions support;

Before diving into these practises and their impact on the transformer, let's consider an example schema:

```graphql
type Author @model {
  id: ID!
  name: String
  posts: Post @hasMany
  tags: Tag @hasMany
}

type Post @model {
  id: ID!
  title: String
  date: String
  content: String
  tags: Tag @hasMany(relation: manyMany)
  author: Author @hasOne
}

type Tag @model {
  name: String
  color: String
}
```

If you are familiar with GraphQL SDL this should make sense. The `@model` directive defines objects, while `@hasOne` and `@hasMany` define relationships.

## Global Object IDs & Node Interface

Both are part of the same [specification](https://graphql.org/learn/global-object-identification), which defines a standardized way for clients to access any node in the graph.

> _Consistent object access enables simple caching and object lookups_

In practice, each object _must_ implement a `Node` interface, and a root field called `node` that _must_ accept an `ID` argument and return a `Node`.

The transformer handles this automatically. Here’s how the schema looks after transformation:

```graphql
interface Node {
  id: ID!
}

type Post implements Node {
  id: ID!
  title: String
  date: String
  content: String
  tags(
    filter: TagEdgeFilterInput
    first: Int
    after: String
    sort: SortDirection
  ): TagConnection!
  author: Author
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}

type Tag implements Node {
  id: ID!
  name: String
  color: String
  createdAt: AWSDateTime
  updatedAt: AWSDateTime
}

# ...other types are ommited

type Query {
  node(id: ID!): Node
  # ...other fields are ommited
}
```

Notice the difference in the `Tag` type. The reference schema lacked an `id` field, but the transformed version includes it. This isn't an omission—GraphQL requires all types implementing an interface to define its fields. The transformer ensures compliance by adding any missing fields.

## Connections

When listing objects, various implementations exist, but they all share a need for pagination.

The [connections spec](https://relay.dev/graphql/connections.htm) standardizes cursor-based pagination. Instead of diving into the details, let’s look at how the transformation our fields:

```graphql
type Author implements Node {
  # ... other fields
  tags(
    filter: TagFilterInput
    first: Int
    after: String
    sort: SortDirection
  ): TagConnection!
}

type Post implements Node {
  # ... other fields
  tags(
    filter: TagEdgeFilterInput
    first: Int
    after: String
    sort: SortDirection
  ): TagConnection!
}

type TagEdge {
  cursor: String
  node: Tag
}

type TagConnection {
  edges: [TagEdge!]!
  pageInfo: PageInfo!
}

type PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor: String
  endCursor: String
}
```

Let's focus on the `TagEdge` for a bit. It may seem meaningless since it is just a wrapper around `Tag`, but it plays a key role in normalizing the differences between how we model `one-to-many` and `many-to-many` relationships.

Another benefit is that it can have other fields as well. For example, if declaring a task list where tasks have different orders in various lists, an `order` field can be added to the edge.

This will become clearer in the next post on table design.

## Interfaces and Unions

Since we introduced interfaces earlier, I won’t go into much detail—just know that you can use them. Unions work similarly but don’t require shared fields.

Here’s an example:

```graphql
type File implements Node {
  id: ID!
  name: String!
  objectKey: String!
  mimeType: String
}

type Note implements Node {
  id: ID!
  name: String
  content: String
}

union Resource = File | Note

type Author implements Node {
  # ... other fields
  resources(
    filter: ResourceEdgeFilterInput
    first: Int
    after: String
    sort: SortDirection
  ): ResourceConnection
}

# ... other objects
```

From a schema perspective, unions don’t require much explanation. However, their impact on table design will become clearer in the next post.

In this article, I've introduced only the basics of how the transformer works and its core features.

We haven't covered how to define authorization with the `@auth` directive, attach custom resolvers or data sources, or use utility directives like `@readOnly` and `@writeOnly`.

So, stay tuned for more updates and happy coding!
