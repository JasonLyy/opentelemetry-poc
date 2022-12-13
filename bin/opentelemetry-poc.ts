#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TestServiceOne } from '../lib/test-service-one';
import { TestServiceTwo } from '../lib/test-service-two';

const app = new cdk.App();
const { endpoint } = new TestServiceTwo(app, 'TestServiceTwoStack');
new TestServiceOne(app, 'TestServiceOneStack', {
    testServiceTwoEndpoint: endpoint,
});