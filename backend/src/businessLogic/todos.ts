import { S3Storage } from '../storageLayer/attachmentUtils'
import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

const logger = createLogger('Todos')
const todosAccess = new TodosAccess()
const s3Storage = new S3Storage()

const getTodosByUserId = async (userId: string): Promise<TodoItem[]> => {
  try {
    const todos = await todosAccess.getTodosByUserId(userId)
    logger.info('todos # getTodosByUserId - todos: ', todos)
    return todos
  } catch (error) {
    logger.error('Error when getting todos by user id: ', error)
    createError(400, JSON.stringify(error))
  }
}

const createTodo = async (
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> => {
  try {
    const todoId = uuid.v4()
    const createdAt = new Date().toUTCString()
    const newTodo: TodoItem = {
      ...createTodoRequest,
      userId,
      todoId,
      createdAt,
      done: false,
      attachmentUrl: 'http://example.com/image.png'
    }

    const todo = await todosAccess.createTodo(newTodo)
    logger.info('todos # createTodo - todo: ', todo)
    return todo
  } catch (error) {
    logger.error('Error when create new todo from request: ', error)
    createError(400, JSON.stringify(error))
  }
}

const updateTodo = async (
  todoId: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> => {
  try {
    await todosAccess.updateTodo(todoId, userId, updateTodoRequest)

    logger.info(
      `todos # updateTodo - update success todo with todoId ${todoId} and userId ${userId}`
    )
  } catch (error) {
    logger.error('Error when update todo from request: ', error)
    createError(400, JSON.stringify(error))
  }
}

const deleteTodo = async (todoId: string, userId: string): Promise<void> => {
  try {
    await todosAccess.deleteTodo(todoId, userId)

    logger.info(
      `todos # deleteTodo - delete success todo with todoId ${todoId} and userId ${userId}`
    )
  } catch (error) {
    logger.error('Error when delete todo from request: ', error)
    createError(400, JSON.stringify(error))
  }
}

const createAttachmentPresignedUrl = async (
  todoId: string,
  userId: string
): Promise<string> => {
  try {
    const url = s3Storage.getUploadUrl(todoId, userId)
    logger.info(
      `todos # createAttachmentPresignedUrl - generate presigned url: `,
      url
    )
    return url
  } catch (error) {
    logger.error('Error when generating presigned URL to upload file: ', error)
    createError(400, JSON.stringify(error))
  }
}

export {
  getTodosByUserId,
  createTodo,
  updateTodo,
  deleteTodo,
  createAttachmentPresignedUrl
}
