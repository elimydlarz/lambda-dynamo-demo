# Lambda Dynamo Demo

# Prerequisites

- Node (see .nvmrc)
- Yarn
- AWS CLI

# Instructions

## Development

Install dependencies.

```
yarn
```

## Deployment

Create an S3 bucket for our lambdas to live in. We only need to do this once.

```
yarn run create-bucket
```

Build, package and deploy lambdas to the bucket we just created.

```
yarn run build-package-deploy
```

Note down the `Invoke URLs` of your new endpoints. You can find them on the [API Gateway page in the AWS console](https://ap-southeast-2.console.aws.amazon.com/apigateway/home?region=ap-southeast-2#/apis) under `lambda-dynamo-demo`, `Stages`, `Prod`, `POST` and `GET`.
