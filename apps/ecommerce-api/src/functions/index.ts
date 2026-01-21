import { APIGatewayProxyHandler, APIGatewayProxyEvent, Context } from "aws-lambda";
import { connectDB } from "@packages/db";
import { logger } from "@packages/logger";
import { catchErrors, formatJSONResponse } from "@packages/middlewares";

export const handler: APIGatewayProxyHandler = catchErrors(async (event: APIGatewayProxyEvent, context: Context) => {
  logger.info("Event received", { event, context });

  // Connect to database
  await connectDB();

  return formatJSONResponse({
    message: "Hello from ecommerce API!",
    event,
    context: {
      functionName: context.functionName,
      awsRequestId: context.awsRequestId,
    },
  });
});

