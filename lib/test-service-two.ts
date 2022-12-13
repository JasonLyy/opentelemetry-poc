import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { Tracing } from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
dotenv.config({
  path: path.join(__dirname, '../src/.env'),
});

export class TestServiceTwo extends Stack {
  public endpoint: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new apigateway.RestApi(this, 'service-api', {
      restApiName: 'test-service-two-api',
    });
    this.endpoint = api.url;
    const members = api.root.addResource('membersFromDb');

    const getMembersFromDbHandler = new NodejsFunction(this, 'get-members-from-db', {
      memorySize: 128,
      timeout: Duration.seconds(8),
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler',
      functionName: 'test-service-two-getMembersFromDb',
      entry: path.join(__dirname, '../src/getMembersFromDb.ts'),
      tracing: Tracing.ACTIVE,
      environment: {
        NEW_RELIC_ENDPOINT: process.env.NEW_RELIC_ENDPOINT ?? '',
        NEW_RELIC_API_KEY: process.env.NEW_RELIC_API_KEY ?? '',
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
        OPENTELEMETRY_COLLECTOR_CONFIG_FILE: '/var/task/collector.yaml'
      },
      bundling: {
        commandHooks: {
          beforeBundling(inputDir, outputDir) {
            return [`cp ${inputDir}/src/collector.yaml ${outputDir}`];
          },
          afterBundling(): string[] {
            return [];
          },
          beforeInstall() {
            return [];
          },
        },
      },
      layers: [
        lambda.LayerVersion.fromLayerVersionArn(
          this,
          'opentelemetry-layer',
          'arn:aws:lambda:ap-southeast-2:901920570463:layer:aws-otel-nodejs-amd64-ver-1-7-0:2'
        ),
      ],
    });
    getMembersFromDbHandler.addToRolePolicy(
      new PolicyStatement({
        actions: ['s3:ListAllMyBuckets'],
        effect: Effect.ALLOW,
        resources: ['*'],
      })
    );

    const getMembersIntegration = new apigateway.LambdaIntegration(getMembersFromDbHandler);
    members.addMethod('GET', getMembersIntegration);

    const testServiceTwoDb = new dynamodb.Table(this, 'db', {
      tableName: 'test-service-two-db',
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING,
      },
    });
    testServiceTwoDb.grantReadData(getMembersFromDbHandler);
  }
}
