import * as AWS from 'aws-sdk'
import {DocumentClient} from 'aws-sdk/clients/dynamodb'
import {TodoItem} from '../models/TodoItem'
import {TodoUpdate} from '../models/TodoUpdate'
import {createLogger} from '../utils/logger'

const AWSXRay = require('aws-xray-sdk')
const logger = createLogger('TodosAccess')

const XAWS = AWSXRay.captureAWS(AWS)

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createXrayDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  getTodosByUserId = async (userId: string): Promise<TodoItem[]> => {
    const params = {
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false
    }

    const result = await this.docClient.query(params).promise()

    return result.Items as TodoItem[]
  }

  createTodo = async (todoItem: TodoItem): Promise<TodoItem> => {
    const params = {
      TableName: this.todosTable,
      Item: todoItem
    }

    await this.docClient.put(params).promise()

    delete todoItem.userId

    return todoItem
  }

  updateTodo = async (
    todoId: string,
    userId: string,
    todoUpdate: TodoUpdate
  ): Promise<void> => {
    const params = {
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues: {
        ':name': todoUpdate.name,
        ':dueDate': todoUpdate.dueDate,
        ':done': todoUpdate.done
      }
    }

    await this.docClient.update(params).promise()
  }

  updateTodoWithAttachment = async (
      todoId: string,
      userId: string,
      attachmentUrl: string
  ): Promise<void> => {
    const params = {
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }

    await this.docClient.update(params).promise()
  }

  deleteTodo = async (todoId: string, userId: string): Promise<void> => {
    const params = {
      TableName: this.todosTable,
      Key: {
        todoId,
        userId
      }
    }

    await this.docClient.delete(params).promise()
  }
}

const createXrayDynamoDBClient = () => {
  if (process.env.IS_OFFLINE) {
    logger.info('Create a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
