import { Context, APIGatewayProxyResult, APIGatewayEvent } from "aws-lambda";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";

import fetch from "node-fetch";

const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`);
  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  const exporter = new OTLPMetricExporter({
    hostname: context.functionName,
  });
  const meterProvider = new MeterProvider();

  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter: exporter,
      exportIntervalMillis: 1000,
    })
  );

  const meter = meterProvider.getMeter(context.functionName);
  const counter = meter.createCounter("metric_name");
  counter.add(10, { key: "value" });

  const res = await fetch(
    `${process.env.TEST_SERVICE_TWO_ENDPOINT}/membersFromDb`
  );
  if (res.ok) {
    const data = await res.json();
    console.log(data);

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify([]),
  };
};

module.exports = { handler };
