import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as path from "path";
import * as dotenv from "dotenv";
import { Function, Tracing } from "aws-cdk-lib/aws-lambda";
dotenv.config({
  path: path.join(__dirname, "../src/.env"),
});


export type TestServiceOneStackProps = StackProps & {
  testServiceTwoEndpoint: string;
}
export class TestServiceOne extends Stack {
  constructor(scope: Construct, id: string, props: TestServiceOneStackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, "service-api", {
      restApiName: 'test-service-one-api'
     });
    const members = api.root.addResource("members");

    const getMembersHandler = new Function(this, "get-members", {
      memorySize: 128,
      timeout: Duration.seconds(8),
      runtime: lambda.Runtime.NODEJS_18_X,
      // handler: "handler",
      functionName: "test-service-one-getMembers",
      code: lambda.Code.fromAsset(path.join(__dirname, '../build')),
      handler: 'getMembers.handler',
      tracing: Tracing.ACTIVE,
      environment: {
        NEW_RELIC_ENDPOINT: process.env.NEW_RELIC_ENDPOINT ?? "",
        NEW_RELIC_API_KEY: process.env.NEW_RELIC_API_KEY ?? "",
        TEST_SERVICE_TWO_ENDPOINT: props.testServiceTwoEndpoint,
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
        OPENTELEMETRY_COLLECTOR_CONFIG_FILE: '/var/task/collector.yaml'
      },
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          this,
          "opentelemetry-layer",
          "arn:aws:lambda:ap-southeast-2:901920570463:layer:aws-otel-nodejs-amd64-ver-1-7-0:2"
        ),
      ],
    });

    const getMembersIntegration = new apigateway.LambdaIntegration(
      getMembersHandler
    );
    members.addMethod("GET", getMembersIntegration);
  }
}
