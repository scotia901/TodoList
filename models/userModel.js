const { Sequelize, DataTypes, Model } = require('sequelize');

const DATABASE =  process.env.MYSQL_TODO_DATABASE;
const DBUSER = process.env.MYSQL_USER;
const DBPASSWORD = process.env.MYSQL_PASSWORD;

const options = {
    dialect: 'mysql',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}

const sequelize = new Sequelize(DATABASE, DBUSER, DBPASSWORD, options);

sequelize.createSchema('maindb');

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to tha database:', error);
}

class User extends Model {}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true
    },
    nickname: {
        type: DataTypes.STRING
    },
    passwordHash: {
        type: DataTypes.STRING
    },
    passwordSalt: {
        type: DataTypes.STRING
    },
    snsType: {
        type: DataTypes.STRING
    },
    snsId: {
        type: DataTypes.STRING
    },
    snsConnectAt: {
        type: DataTypes.DATE,
    },
    email: {
        type: DataTypes.STRING
    },
    profileImg: {
        type: DataTypes.STRING
    }
 }, { sequelize, tableName: 'user', freezeTableName: true });

 class Category extends Model {}

 Category.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
 }, { sequelize, tableName: 'category' });

 class Task extends Model {}

 Task.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false
    },
    completed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    importance: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    deadline: {
        type: DataTypes.DATEONLY,
    }
 }, { sequelize, tableName: 'task' });

const CategoryTask = sequelize.define('category_task', {}, { timestamps: false });

Task.belongsTo(User);
User.hasMany(Task);
Category.belongsTo(User);
User.hasMany(Category);
Task.belongsTo(Category);
Category.hasMany(Task);

module.exports = {
    User,

    Task,

    Category,

    initTables: async (force) => {
        try {
            if (typeof force == 'boolean' || typeof force == undefined) {
                await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true });
                // Task.belongsTo(User);
                // User.hasMany(Task);
                // Category.belongsTo(User);
                // User.hasMany(Category);
                // Category.belongsToMany(Task, { through: 'category_task' });
                // Task.belongsToMany(Category, { through: 'category_task' });
                await User.sync({ force: force });
                await Category.sync({ force: force });
                await CategoryTask.sync({ force: force });
                await Task.sync({ force: force });
                await Category.create({ name: "오늘 할 일" });
                await Category.create({ name: "중요" });
                await Category.create({ name: "계획된 일정" });
                await Category.create({ name: "작업" });
            } else {
                throw 'Argument TypeError'
            }                                
        } catch (err) {
            console.error(err);
        } finally {
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true })
        }
    },        

    createSample: async (req, res, next) => {
        try {
            const user = await User.create({ userName: "sampleUser" });

            const category = await Category.create({
                name: 'sampleCategory',
                User: {
                    name: user.name
                }
            }, {
                include: [ User ]
            });

            await Task.create({
                text: 'This task is make by task.create',
                Category: {
                    name: category.name,
                },
                User: {
                    userName: 'sampleUser'
                }
            }, {
                include: [ Category, User ]
            });
        } catch (err) {
            throw err;
        }
    },

    getSample: async () => {

        Task.findAll({
            include: {
                model: User,
                where: {
                    userName: 'sampleUser'
                },
                include: Category
            }
        }).then((result) => {
            console.log(result);
        });

        User.findAll({
            where: {
                '$Categories.name$': 'Category1'
            },
            include: {
                model: Category,
                as: 'Categories'
            }
        }).then((result) => {
            console.log(result);
        });
    },

    isUserExist: async (user) => {
        const snsId = user.snsId;
        try {
            if(snsId) {
                const userCount = await User.count({
                    where: { snsId: snsId }
                });

                if(userCount > 0) {
                    return true
                } else {
                    return false
                }
            }
        } catch (err) {
            console.error(err);
        }
    },

    createSnsUser: async (user, callback) => {
        try {
            const nickname = user.nickname? user.nickname : "익명" ;
            const snsId = user.snsId;
            const email = user.email;
            const snsType = user.snsType;

    
            const result = await User.create({
                nickname: nickname,
                email: email,
                snsId: snsId,
                snsType: snsType,
                snsConnectAt: Sequelize.literal('CURRENT_TIMESTAMP')
            });

            console.log(result);

            callback(null, result);
        } catch (err) {
            console.error(err);
        }
    }
}