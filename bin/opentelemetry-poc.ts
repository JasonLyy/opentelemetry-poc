#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TestServiceOne } from '../lib/test-service-one';
import { TestServiceTwo } from '../lib/test-service-two';

const app = new cdk.App();
new TestServiceOne(app, 'TestServiceOneStack');
new TestServiceTwo(app, 'TestServiceTwoStack');