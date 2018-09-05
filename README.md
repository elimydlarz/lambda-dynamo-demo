# Lambda Dynamo Demo

This repo demonstrates a simple application of the 'write now, think later' principle.

1. Orders are received by a Lambda via an API Gateway
2. Received orders are stored as-is in a DynamoDB table
3. An order fulfilment Lambda is triggered asynchronously, transforms the order on-demand, fulfils the order and stores this change in a separate table
4. Orders are retrieved by another Lambda via an API Gateway, at which point they are transformed and merged with their changes on-demand

Because orders are transformed on-demand, the transformation logic can be changed at any time without requiring migration of stored data. This makes it easy to adapt your system as your understanding of the domain and upstream systems grows.

Because order changes are stored separately from orders and merged together on-demand, the merge logic can be changed at any time. This makes it easy to reevaluate what changes mean within your system and how they should impact order data.

# Prerequisites

- Node (see .nvmrc)
- Yarn (or not, whatever)
- AWS CLI

# Instructions

## Development

Install dependencies.

```
yarn
```

## Deployment

I've hard-coded the bucket and stack name `lambda-dynamo-demo-2` into `package.json`. You'll need to replace this with something else before continuing.

Create an S3 bucket for our lambdas to live in. We only need to do this once.

```
yarn run create-bucket
```

Build, package and deploy lambdas to the bucket we just created.

```
yarn run build-package-deploy
```

Note down the `Invoke URLs` of your new endpoints. You can find them on the [API Gateway page in the AWS console](https://ap-southeast-2.console.aws.amazon.com/apigateway/home?region=ap-southeast-2#/apis) under `lambda-dynamo-demo-2`, `Stages`, `Prod`, `POST` and `GET`.

## Why do it this way?

- Easy to get started
- Easy to deploy and maintain
- Highly scalable
- Because you like JavaScript (or Python, I guess)
- Easy asynchrony
- You can build an event-driven system on AWS without losing your events after a week *cough* Kinesis *cough*

## Challenges

### Unit tests are easy, but how do you verify that everything is working together correctly?

There's [LocalStack](https://localstack.cloud/), but it wasn't very mature when I was working with this tech stack. We managed things with some other techniques:

- In your tests of individual lambdas, extract and share fixtures so that the expected outputs of one lambda's tests become the inputs for the consuming lambda's tests. This will stop you from missing simple things and it helps document the structure of your data.
- Continuously deploy to a pre-production environment and run automated tests in it

### It seems like I'm solving the same problems in many of my lambdas - there's too much duplication!

You might be tempted to extract what you see as common functionality, but if you're not careful you'll build a distributed monolith. A big reason to have lots of little things is so that you can reason about them independently and if you have too much common code, you'll mess that up. Some techniques I don't mind are:

- Make NPM packages for common, non-trivial work. This will encourage you to make sure something is really worth extracting and think more carefully about making breaking changes.
- Write some reusable lambdas and use the template to deploy different instances of them for different purposes. For example, getting data from any table and presenting it to a user at a given endpoint can easily be handled with generic javascript code, varied by configuring different API paths and input tables in the template. Be careful not to accidentally couple things that are actually different, but just happen to look the same right now. Imagine a distributed monolith looming menacingly over you at all times.

### How do I migrate data in DynamoDB?

We found a way when we had to, but it's kind of awful. I recommend not doing that and storing events and snapshots like the cool kids. If you record real things that happen and infer on read - rather than on write - what those things mean for your system, you shouldn't have to change the stored data very often.

### What are some other stupid things about DynamoDB?

There are plenty! For example:

- Scans are paginated by the volume of data scanned, so you may have to flip through empty pages of results. Basically, don't scan. If you need to search, use CloudSearch or similar.
- There are lots of silly gotchas when reading and writing data - batch size limits, file size limits and so on. Read the docs before doing more than small, single reads and writes.
- It stores data in a pretty goofy format, which it receives and returns that data in. The SDK can take care of this for you if you know how to use it (as shown in this example).

### Why are we using DynamoDB again?

It's worrying that I felt compelled to put this in. There are some good reasons:

- It's super easy to make it permanently store something in a table and then publish it to an event stream, which can trigger other work asynchronously
- Batch reads and writes are pretty cool - you can transactionally write many things to many different tables without much effort
