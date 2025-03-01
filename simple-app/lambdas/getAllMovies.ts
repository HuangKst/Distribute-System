import { Handler } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

// 初始化 DynamoDB 客户端
const ddbDocClient = createDDbDocClient();

// Lambda 处理函数
export const handler: Handler = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));

    // 扫描整个表
    const commandOutput = await ddbDocClient.send(
      new ScanCommand({
        TableName: process.env.TABLE_NAME, // 读取环境变量
      })
    );

    if (!commandOutput.Items) {
      return {
        statusCode: 404,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ Message: "No movies found" }),
      };
    }

    // 返回查询结果
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ movies: commandOutput.Items }),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error }),
    };
  }
};

// 创建 DynamoDB 客户端
function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });

  return DynamoDBDocumentClient.from(ddbClient, {
    marshallOptions: { convertEmptyValues: true, removeUndefinedValues: true },
    unmarshallOptions: { wrapNumbers: false },
  });
}
