import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
// import fetch from 'node-fetch';

const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  const client = new DocumentClient();
  const data = await client
    .query({
      TableName: 'test-service-two-db',
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': '1',
      },
    })
    .promise();

    return {
        statusCode: 200,
        body: JSON.stringify(data.Items),
      };
};

module.exports = { handler };
