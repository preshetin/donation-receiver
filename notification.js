import { success, failure } from "./libs/response-lib";

export const main = async (event, context) => {

  // update status in dynamodb record

  return success({ status: true });
};
