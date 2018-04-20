import AWS from 'aws-sdk';

const read = id =>
  new AWS.DynamoDB.DocumentClient()
    .get({
      TableName: process.env.INPUT_TABLE,
      Key: { id },
    }).promise().then(response => response.Item);

export const get = (event, context, callback) =>
  Promise.resolve(event.pathParameters.id)
    .then(read)
    .then(JSON.stringify)
    .then(body => callback(null, {
      statusCode: 200,
      body,
    }))
    .catch(error => callback(error));
