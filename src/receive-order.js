import AWS from 'aws-sdk';

const put = Item =>
  new AWS.DynamoDB.DocumentClient()
    .put({
      TableName: process.env.OUTPUT_TABLE,
      Item,
    }).promise();

export const post = (event, context, callback) =>
  Promise.resolve(event.body)
    .then(JSON.parse)
    .then(put)
    .then(JSON.stringify)
    .then(body => callback(null, {
      statusCode: 201,
      body,
    }))
    .catch(error => callback(error));
