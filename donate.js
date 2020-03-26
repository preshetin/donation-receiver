import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export const main = async event => {
  const YandexCheckout = require('yandex-checkout')(
    process.env.yandexCheckoutShopId,
    process.env.yandexCheckoutSecret,
  );

  const requestParams = event.queryStringParameters;

  const paymenParams = {
    'amount': {
      'value': requestParams.amount,
      'currency': 'RUB'
    },
    'capture': true,
    "description": `Purpose: ${requestParams.purpose}`,
    'payment_method_data': {
      'type': 'bank_card'
    },
    'description': requestParams.purpose,
    'confirmation': {
      'type': 'redirect',
      'return_url': 'https://www.merchant-website.com/return_url'
    }
  };

  var idempotenceKey = uuid.v4(); // i think it should come from the request...

  try {
    const payment = await YandexCheckout.createPayment(paymenParams, idempotenceKey);
    await dynamoDbLib.call("put", buildParams(requestParams, payment));
    return success({ status: true, confirmation: payment.confirmation });
  } catch (err) {
    console.log('error',err);
    return failure({ status: false });
  }
};

const buildParams = (requestParams, payment) => {

  const params = {
    TableName: process.env.tableName,
    Item: {
      donationId: payment.id,
      status: payment.status,
      email: requestParams.email,
      purpose: requestParams.purpose,
      amount: requestParams.amount,
      createdAt: Date.now()
    }
  };

  return params;
};

