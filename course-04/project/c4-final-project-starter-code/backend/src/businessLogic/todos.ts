import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic

const todoAccess = new TodosAccess();
const attachmentUtils = new AttachmentUtils();
const logger = createLogger("todos");

export const createTodo = async (userId, req: CreateTodoRequest) => {
  const todoItem: TodoItem = {
    name: req.name,
    dueDate: req.dueDate,
    userId,
    todoId: uuid.v4(),
    done: false,
    attachmentUrl:"",
    createdAt: new Date().getTime().toString(),
    ...req
  }
  logger.info(`adding ${todoItem}`)
  return todoAccess.createTodo(todoItem);
}

export const getTodosForUser = async (userid: string): Promise<TodoItem[]> => {
  return todoAccess.getTodosForUser(userid);
}

export const updateTodo = async (todoId: string, userId: string, req: UpdateTodoRequest) => {
  todoAccess.updateTodo(todoId,userId,req);
}

export const deleteTodo = async (todoId: string, userId: string) => {
  todoAccess.deleteTodo(todoId,userId);
}

export const createAttachmentPresignedUrl = async (todoId: string, userId:string): Promise<string> =>  {
  const url = await attachmentUtils.createAttachmentPresignedUrl(todoId);
  await todoAccess.updateTodoImageUrl(todoId, userId, url)
  return url;
}

