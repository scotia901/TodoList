require('dotenv').config();
const { Sequelize, DataTypes, Model } = require('sequelize');
const DB =  process.env.MYSQL_TODO_DATABASE;
const DBUSER = process.env.MYSQL_USER;
const DBPASSWORD = process.env.MYSQL_PASSWORD;
const options = {
    dialect: 'mysql',
    logging: false,
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
}
const sequelize = new Sequelize(DB, DBUSER, DBPASSWORD, options);

sequelize.createSchema('maindb');

try {
    sequelize.authenticate();
    console.log('Todo database connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

class User extends Model {}
class Category extends Model {}
class Task extends Model {}

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
        type: DataTypes.BLOB
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

 Category.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sortType: {
        type: DataTypes.STRING,
    },
    theme: {
        type: DataTypes.STRING
    }
 }, { sequelize, tableName: 'category' });

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

if(process.argv.slice(2) == 'init') {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    readline.question('What is DB Password? :', password => {
        if(password == DBPASSWORD) {
            console.log('Execute database initalization.');
            initTables(true);
        } else {
            console.log('Not match password.');
        }
        readline.close();
    });
}

async function initTables (force) {
    try {
        if (typeof force == 'boolean' || force == undefined) {
            await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', null, { raw: true });
            await User.sync({ force: force });
            await Category.sync({ force: force });
            await CategoryTask.sync({ force: force });
            await Task.sync({ force: force });
        } else {
            throw 'Argument TypeError'
        }                                
    } catch (err) {
        console.error(err);
    } finally {
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', null, { raw: true });
        await sequelize.close();
        console.log('Todo database initialize successful.');
    }
}

module.exports = { User, Task, Category }