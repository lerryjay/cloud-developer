import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
  constructor(
    private readonly dbClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTbl = process.env.TODOS_TABLE) {
  }

  public createTodo = async (todoItem: TodoItem) => {
    try {
      const data = await this.dbClient.put({
        Item: todoItem,
        TableName: this.todosTbl,
        ReturnValues: "ALL_OLD",
        ReturnConsumedCapacity: "TOTAL",
      }).promise();
      logger.info(`Success - item added or updated", ${JSON.stringify(data)} ${JSON.stringify(todoItem)}`);
      return todoItem;
    } catch (err) {
      logger.error(`Error", ${err.stack}`);
    }
  }


  public updateTodo = (todoId: string, userId: string, req: TodoUpdate) => {
    try {
      const data = this.dbClient.update({
        Key: {
          todoId,
          userId
        },
        TableName: this.todosTbl,
        UpdateExpression: "set name = :n, dueDate = :d, done = :c",
        ExpressionAttributeValues: {
          ":n": req.name,
          ":d": req.dueDate,
          ":c": req.done,
        },
      }).promise();
      logger.info("Success - item added or updated", data);
    } catch (err) {
      logger.error("Error", err.stack);
    }
  }

  public updateTodoImageUrl = async  (todoId: string, userId: string, uploadUrl: string) => {
    try {
      logger.info(`Success - updating todo img url ${todoId } ${ userId } ${ uploadUrl}` );
      await this.dbClient.update({
          TableName: this.todosTbl,
          Key: { userId, todoId },
          UpdateExpression: "set attachmentUrl = :u",
          ExpressionAttributeValues: {
            ":u": uploadUrl.split("?")[0]
          },
          ReturnValues: "UPDATED_NEW"
        }).promise();
        logger.info(`Success - updating todo img url ${todoId} ${userId} ${uploadUrl}`);
    } catch (err) {
      logger.error(`Error - updating todo   ${err.stack}`);
    }
   
  }

  public deleteTodo = async (todoId: string, userId: string) => {
    try {
      const data = this.dbClient.delete({
        Key: {
          todoId,
          userId
        },
        TableName: this.todosTbl
      }).promise();
      logger.info("Success - item added or updated", data);
    } catch (err) {
      logger.error("Error", err.stack);
    }
  }

  public getTodosForUser = async (userid: string): Promise<TodoItem[]> => {
    try {
      const result = await this.dbClient.query({
        TableName: this.todosTbl,
        KeyConditionExpression: "#userId = :userId",
        ExpressionAttributeNames: {
          "#userId": "userId"
        },
        ExpressionAttributeValues: {
          ":userId": userid
        }
      }).promise();
      logger.info("Success - Fetched todo list items for user ", userid);
      return result.Items as TodoItem[];
    } catch (err) {
      logger.error("Error", err.stack);
      return [];
    }

  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}