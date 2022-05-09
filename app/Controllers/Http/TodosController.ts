import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema } from '@ioc:Adonis/Core/Validator'
import Todo from "App/Models/Todo";

export default class TodosController {
    public async index({ auth }: HttpContextContract) {
        const user = await auth.authenticate();
        const todos = await Todo.query().where('user_id', user.id);
        return todos;
    }
    public async show({ auth, response ,params }: HttpContextContract) {
        const user = await auth.authenticate();
        const todo = await Todo.find(params.id);
        if(todo){
            if (todo.user_id !== user.id) {
                return response.unauthorized();
            }
            return todo;
        }else{
            return response.badRequest({ message: "Todo not found!" });
        }
    }
    public async store({ auth, request, response }: HttpContextContract) {
        const todoSchema = schema.create({
            title: schema.string(),
            description: schema.string(),
        });
        try {
            await request.validate({schema: todoSchema})
        } catch (error) {
            return response.badRequest(error.messages)
        }
        const user = await auth.authenticate();
        const todo = new Todo();
        todo.title = request.input('title');
        todo.description = request.input('description');
        todo.user_id = user.id;
        await todo.save();
        return { message: "Success Create Todo!" };
    }
    public async update({ auth, request, response, params }: HttpContextContract) {
        const todoSchema = schema.create({
            title: schema.string.optional(),
            description: schema.string.optional(),
        });
        try {
            await request.validate({schema: todoSchema})
        } catch (error) {
            return response.badRequest(error.messages)
        }
        const user = await auth.authenticate();
        const todo = await Todo.find(params.id);
        if(todo){
            if (todo.user_id !== user.id) {
                return response.badRequest({ message: "You are not authorized to update this todo!" });
            }
            todo.title = request.input('title');
            todo.description = request.input('description');
            await todo.save();
            return { message: "Success Update Todo!" };
        }else{
            return response.badRequest({ message: "Todo not found!" });
        }
    }
    public async destroy({ auth, response, params }: HttpContextContract) {
        const user = await auth.authenticate();
        const todo = await Todo.find(params.id);
        if(todo){
            if (todo.user_id !== user.id) {
                return response.badRequest({ message: "You are not authorized to delete this todo!" });
            }
            await todo.delete();
            return { message: "Success Delete Todo!" };
        }else{
            return response.badRequest({ message: "Todo not found!" });
        }
    }
}
