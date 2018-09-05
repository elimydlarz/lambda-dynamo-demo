import AWS from 'aws-sdk';

import transformReceivedOrder from './shared/transform-received-order';

const fulfilOrder = ({ id, products }) => ({ id, productsFulfilled: products });

const put = Item =>
  new AWS.DynamoDB.DocumentClient()
    .put({
      TableName: process.env.OUTPUT_TABLE,
      Item,
    }).promise();

export const trigger = (event, context, callback) =>
  Promise.resolve(event.Records[0].dynamodb.NewImage)
    .then(AWS.DynamoDB.Converter.unmarshall)
    .then(transformReceivedOrder)
    .then(fulfilOrder)
    .then(put)
    .then(() => callback(null, null))
    .catch(error => callback(error));
