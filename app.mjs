import { loadSequelize } from "./database.mjs";
import express, { response } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";

function isLoggedInJWT(UserModel) {
    return async (request, response, next) => {
        const token = request.cookies.token;
        if (!token) 
        {
            return response.status(401).json({ message: 'Unauthorized: no token provieded' });
        }
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            request.userId = decoded.userId;

            request.user = await UserModel.findPk(request.userId);
            if (!request.user) {
                return response.status(401).json({ message: 'Unauthrized' });
            }
            next();
        } catch (error) {
            return response.status(500).json({ message: 'Invalid token' });
        }
    }
}


async function main() {

    try {
        const sequelize = await loadSequelize();
        const app = express();
        const JWT_SECRET = "HND&*Wye8971h2yed687&^@(@&dghuy8i!@%$^&*(&^^#&_+^##*^^";
        const UserModel = sequelize.models.User;
        const PostModel = sequelize.models.Post;
        const CommentModel = sequelize.models.Comment;
        app.use(cookieParser());
        app.use(express.json());

        //POST
        //AUTHENTIFICATION
        app.post('/register', async (request, response) => {
            try {
                const Userdata = request.body;
                if (Userdata.password != Userdata.verifiedPassword) {
                    return response.status(400).json({ message: "Passwords do not match" });
                }

                const newUser = await UserModel.create({
                    username: Userdata.username, 
                    email: Userdata.email,
                    password: Userdata.password
                });
                
                if (!newUser.username || !newUser.email || !newUser.password)
                {
                    return response.status(400).json({ message: "Email, password and verifiedPassword are required" });
                }

                response.status(201).json({ message: "User registered successfully", userId: newUser.id });
            } catch (error) {
                response.status(500).json({ message: 'Error registering user', error: error.message });
            }
        });

        app.post('/login', async (request, response) => {
            try {
                const LoginData = request.body;
                if (!LoginData.email || !LoginData.password) {
                    return response.status(400).json({ message: "Wrong password or email" });
                }
                const LoginUser = await UserModel.findOne({
                    email: LoginData.email,
                    password: LoginData.password
                });
                console.log(LoginUser);

                if (!LoginUser) 
                {
                    return response.status(401).json({ message: "Invalid User" });
                }

                const token = jwt.sign({ userId: LoginUser.id }, JWT_SECRET, { expiresIn: '1h' });
                response.cookie('token', token, { httpOnly: true });
                response.status(201).json({ message: "User loged in successfully", userId: LoginUser.id });
            } catch (error) {
                response.status(500).json({ message: 'Error logging in', error: error.message });
            }
        });

        app.post('/logout', (request, response) => {
            response.clearCookie('token');
            response.json({ message: 'Logout successful' });
        });

        app.use(isLoggedInJWT(UserModel));


        //CREATION
        app.post('/posts', async (request, response) => {
            try {

                const { title, content } = request.body;
                const newPost = await PostModel.create({ title, content, UserId: req.userId });
                if (!UserModel) 
                {
                    return response.status(401).json({ message: 'Unauthrized' });
                }

                if (!title || !content)
                {
                    return response.status(400).json({ message: "cannot leave the title or content empty" });
                }
            } catch (error) {
                console.log(error)
                response.status(500).json({ message: 'Error posting post', error: error.message });
            }
        });


        //GET

        //DELETE

        app.listen(3000, () => {
            console.log("Serveur démarré sur http://localhost:3000");
        });


    } catch (error) {
        console.error("Error de chargement de Sequelize:", error);
    }
}

main();