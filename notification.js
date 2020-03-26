import { success, failure } from "./libs/response-lib";
import * as dynamoDbLib from "./libs/dynamodb-lib";

export const main = async (event, context) => {
  
  const data = JSON.parse(event.body)

  // update status in dynamodb record
  console.log('data', JSON.stringify(data))
  console.log(data)

  const params = {
    TableName: process.env.tableName,
    Key: {
      donationId: data.object.id
    },
    // 'UpdateExpression' defines the attributes to be updated
    // 'ExpressionAttributeValues' defines the value in the update expression
    UpdateExpression: "SET #st = :st",
    ExpressionAttributeValues: {
      ":st": data.object.status || null
    },
    ExpressionAttributeNames: {
      '#st': "status",
    },
    // 'ReturnValues' specifies if and how to return the item's attributes,
    // where ALL_NEW returns all attributes of the item after the update; you
    // can inspect 'result' below to see how it works with different settings
    ReturnValues: "ALL_NEW"
  };

  try {
    await dynamoDbLib.call("update", params);
    return success({ status: true });
  } catch (e) {
    return failure({ status: false, e });
  }
};
