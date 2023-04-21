require('dotenv').config();
const express = require('express');
const Router = express.Router();
const TaskController = require('../controllers/taskController');

Router.get('/', async (req, res, next) => {
    await TaskController.getTasksByUserAndCategory(req, res, next);
});

Router.post('/', async (req, res, next) => {
    await TaskController.postTaskByUserAndCategory(req, res, next);
});

Router.delete('/', async (req, res, next) => {
    await TaskController.deleteTaskByTaskId(req, res, next);
});

Router.get('/count', async (req, res, next) => {
    await TaskController.countTasksByCategory(req, res, next);
});

Router.get("/search/:term", async (req, res, next) => {
    await TaskController.searchTasksByUserAndTerm(req, res, next);
});

Router.put('/update/text', async (req, res, next) => {
    await TaskController.updateTaskTextByTaskId(req, res, next);
});

Router.put("/toggle/completed", async (req, res, next) => {
    await TaskController.toggleTaskCompleted(req, res, next);
});

Router.put("/toggle/importance", async (req, res, next) => {
    await TaskController.toggleTaskImportance(req, res, next);
});

Router.put("/update/deadline", async (req, res, next) => {
    await TaskController.updateTaskDeadline(req, res, next);
});

module.exports = Router;