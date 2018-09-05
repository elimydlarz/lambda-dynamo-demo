import AWS from 'aws-sdk';

const fulfill = ({ id }) => ({ id, fulfilled: true });

const put = Item =>
  new AWS.DynamoDB.DocumentClient()
    .put({
      TableName: process.env.OUTPUT_TABLE,
      Item,
    }).promise();

export const trigger = (event, context, callback) =>
  Promise.resolve(event.Records[0].dynamodb.NewImage)
    .then(AWS.DynamoDB.Converter.unmarshall)
    .then(fulfill)
    .then(put)
    .then(() => callback(null, null))
    .catch(error => callback(error));
