import { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import User from "App/Models/User";

export default class AuthController {
    public async login({ request, auth, response }: HttpContextContract) {
        const loginSchema = schema.create({
            email: schema.string(),
            password: schema.string()
        })
        try {
            await request.validate({ schema: loginSchema })
        } catch (error) {
            return response.badRequest(error.messages)
        }

        const email = request.input("email");
        const password = request.input("password");
        const token = await auth.use("api").attempt(email, password, {
            expiresIn: "999 days",
        });
        const tokenReturn = token.type + " " + token.token;
        return {token: tokenReturn};
    }

    public async register({ request,response  }: HttpContextContract) {
        const loginSchema = schema.create({
            email: schema.string({}, [
                rules.unique({ table: 'users', column: 'email' })
            ]),
            password: schema.string()
        })
        try {
            await request.validate({ schema: loginSchema })
        } catch (error) {
            return response.badRequest(error.messages)
        }
        const name = request.input("name");
        const email = request.input("email");
        const password = request.input("password");
        const newUser = new User();
        newUser.name = name;
        newUser.email = email;
        newUser.password = password;
        await newUser.save();
        return {message : "Success Register!"};
    }
}