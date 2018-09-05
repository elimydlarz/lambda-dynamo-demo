import AWS from 'aws-sdk';

const readInput = id =>
  new AWS.DynamoDB.DocumentClient()
    .get({
      TableName: process.env.INPUT_TABLE,
      Key: { id },
    })
    .promise()
    .then(response => response.Item);

const mergeInChanges = input =>
  new AWS.DynamoDB.DocumentClient()
    .get({
      TableName: process.env.CHANGES_TABLE,
      Key: { id: input.id },
    })
    .promise()
    .then(response => response.Item)
    .then(changes => ({ ...input, ...changes }));

export const get = (event, context, callback) =>
  Promise.resolve(event.pathParameters.id)
    .then(readInput)
    .then(mergeInChanges)
    .then(JSON.stringify)
    .then(body => callback(null, {
      statusCode: 200,
      body,
    }))
    .catch(error => callback(error));
