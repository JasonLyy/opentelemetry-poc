import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import fetch from 'node-fetch';

const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(`Event: ${JSON.stringify(event, null, 2)}`);
    console.log(`Context: ${JSON.stringify(context, null, 2)}`);

    const res = await fetch('https://api.belo.app/public/price');
    if (res.ok) {
      const data = await res.json();
      console.log(data);
    }

    return {
        statusCode: 200,
        body: JSON.stringify([
            {
                id: "1",
                name: "Jason"
            }
        ]),
    };
};

module.exports = { handler }