import AWS from 'aws-sdk';

import transformReceivedOrder from './shared/transform-received-order';

const readInput = id =>
  new AWS.DynamoDB.DocumentClient()
    .get({
      TableName: process.env.INPUT_TABLE,
      Key: { id },
    })
    .promise()
    .then(response => response.Item);

const mergeInChanges = transformedOrder =>
  new AWS.DynamoDB.DocumentClient()
    .get({
      TableName: process.env.CHANGES_TABLE,
      Key: { id: transformedOrder.id },
    })
    .promise()
    .then(response => response.Item)
    .then(changes => ({ ...transformedOrder, ...changes }));

export const get = (event, context, callback) =>
  Promise.resolve(event.pathParameters.id)
    .then(readInput)
    .then(transformReceivedOrder)
    .then(mergeInChanges)
    .then(JSON.stringify)
    .then(body => callback(null, {
      statusCode: 200,
      body,
    }))
    .catch(error => callback(error));
