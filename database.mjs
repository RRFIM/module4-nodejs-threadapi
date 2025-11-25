import { request, response } from "express";
import { Sequelize, DataTypes } from "sequelize";


/**
 * @returns {Promise<Sequelize>}
 */
export async function loadSequelize() {
    try {
        const login = {
            database: "app-database",
            username: "root",
            password: "root"
        };

        const sequelize = new Sequelize("app-database", "root", "root", {
            host: '127.0.0.1',
            dialect: 'mysql'
        });
        
         sequelize.define("User",{
            username: DataTypes.STRING,
            email: DataTypes.STRING,
            password: DataTypes.STRING
        });
        
        
        sequelize.define("Post",{
            username: DataTypes.STRING,
            title: DataTypes.STRING,
            content: DataTypes.STRING,
            createdAt: DataTypes.DATE,
            userId : DataTypes.INTEGER
        });

        sequelize.define("Comment",{
            username: DataTypes.STRING,
            content: DataTypes.STRING
        });

        const User = sequelize.models.User;
        const Post = sequelize.models.Post;
        const Comment = sequelize.models.Comment;
        
        //USER
        User.hasMany(Post);
        User.hasMany(Comment);

        //POST
        Post.belongsTo(User);
        Post.hasMany(Comment);
        
        //COMMENT
        Comment.belongsTo(Post);
        
        
        await sequelize.sync();
        return sequelize;
    } catch (error) {
        console.error(error);
        throw Error("Échec du chargement de Sequelize");
    }
}
