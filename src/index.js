const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if (user) {
    request.user = user
  } else {
    return response.status(404).json({ error: "user don't exist" })
  }

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userExist = users.some(user => user.username === username);

  if (userExist) return response.status(400).json({ error: "Mensagem do erro" })

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  response.status(200).send(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const TodoList = {
    "id": uuidv4(),
    "deadline": new Date(deadline),
    "done": false,
    "title": title,
    "created_at": new Date()
  }

  user.todos.push(TodoList)

  response.status(201).send(TodoList)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { user } = request;
  const { id } = request.params; //id da todo
  const { title, deadline } = request.body;

  const todoUpdated = user.todos.find(todo => todo.id === id)
  if (!todoUpdated) {
    return response.status(404).json({ error: "todo not found" })
  }
  todoUpdated.title = title;
  todoUpdated.deadline = new Date(deadline);

  response.status(200).json(todoUpdated)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoPatch = user.todos.find(todo => todo.id === id);
  if (!todoPatch) {
    return response.status(404).json({ error: "todo not found" })
  }
  todoPatch.done = !todoPatch.done;

  response.status(201).json(todoPatch)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);
  console.log(todoIndex)

  if (todoIndex === -1 && todoIndex !== 0) {
    return response.status(404).json({ error: "todo not found" })
  }

  user.todos.splice(todoIndex, 1)

  response.status(204).json()
});

module.exports = app;