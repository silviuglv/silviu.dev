---
date: 2025-02-17
title: "Building a GraphQL Transformer Library for AWS AppSync: Part 1 – Motivation"
---

When it comes to building GraphQL servers, [AWS AppSync](https://aws.amazon.com/pm/appsync) is my favourite solution. It is a managed, serverless service that makes it easy to build efficient and scalable APIs.

## Why AWS AppSync?

I really like AppSync for a few simple reasons:

- **Managed & Serverless:** It handles so much for you, like observability and security.
- **JavaScript Runtime:** I can write my resolvers in JavaScript, which feels much more natural.
- **Fast Performance:** There are no cold starts, so things run quickly.
- **Advanced Features:** Built-in features like caching, DeltaSync, and conflict resolution really help with complex tasks.

But here’s the catch: setting up an API with AppSync means I have to write the GraphQL schema, create resolvers for every operation, and then configure all the AWS resources. Even small changes can turn into a headache.

## About Amplify

Another solution that uses AppSync under the hood is [Amplify](https://docs.amplify.aws), a toolchain developed by the AWS folks designed to help developers get started with their services. While I like their approach of describing the entire schema via a config file, it does come with a set of design decisions that I don’t fully agree with, most notably:

1. It creates one DynamoDB table per model;
2. It uses VTL (Velocity Templating Language) to generate resolvers, which makes it hard to customise;
3. It generates complex pipelines for each resolver—good luck finding the right one to modify!

Luckily, Amplify is an open-source project, so we can take a look at how they do things.

## The AppSync GraphQL Transformer Library

Inspired by the idea of declaring models and relationships with simple directives, and having a code generator take care of the rest, I decided to build my own library for AppSync.

Although I want it to be as extensible as possible, I had to make some design decisions right away. Here’s what I’m aiming for:

- **DynamoDB Single Table Design:** Use a single table as the primary data source.
- **JS Runtime Resolvers:** Generate JavaScript runtime resolvers that are easy to modify or replace with custom implementations.
- **TypeScript Support:** Generate schema types and handle transpiling and bundling of resolver code.
- **GraphQL Best Practices:** Follow best practices, including [Connections](https://graphql.org/learn/pagination) and [Global Object IDs](https://graphql.org/learn/global-object-identification).

I aim to create it as a standalone library, independent of any infrastructure-as-code solution. However, to make it easier to work with, I'm also developing a CDK construct that will provision all the necessary resources for you.

## What’s Next?

The project is currently in progress and not yet open source. I plan to have an experimental release ready in a couple of days, and then I’ll make the repository public on [Saapless](https://github.com/saapless).

Stay tuned for more updates, and happy coding!
