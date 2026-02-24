// @ts-check
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('POST /todos', () => {
  test('should create a new todo', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/todos`, {
      data: { title: 'Buy groceries' },
    });

    expect(response.status()).toBe(201);
    const todo = await response.json();
    expect(todo).toMatchObject({
      title: 'Buy groceries',
      completed: false,
    });
    expect(todo.id).toBeDefined();
  });

  test('should create a todo with completed flag', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/todos`, {
      data: { title: 'Already done', completed: true },
    });

    expect(response.status()).toBe(201);
    const todo = await response.json();
    expect(todo.completed).toBe(true);
  });

  test('should return 400 when title is missing', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/todos`, {
      data: {},
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Title is required');
  });
});

test.describe('GET /todos', () => {
  test('should return all todos', async ({ request }) => {
    // Create two todos first
    await request.post(`${BASE_URL}/todos`, { data: { title: 'Todo 1' } });
    await request.post(`${BASE_URL}/todos`, { data: { title: 'Todo 2' } });

    const response = await request.get(`${BASE_URL}/todos`);

    expect(response.status()).toBe(200);
    const todos = await response.json();
    expect(Array.isArray(todos)).toBe(true);
    expect(todos.length).toBeGreaterThanOrEqual(2);
  });
});

test.describe('GET /todos/:id', () => {
  test('should return a single todo by id', async ({ request }) => {
    const created = await (
      await request.post(`${BASE_URL}/todos`, { data: { title: 'Find me' } })
    ).json();

    const response = await request.get(`${BASE_URL}/todos/${created.id}`);

    expect(response.status()).toBe(200);
    const todo = await response.json();
    expect(todo).toMatchObject({ id: created.id, title: 'Find me', completed: false });
  });

  test('should return 404 for non-existent todo', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/todos/99999`);

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Todo not found');
  });
});

test.describe('PUT /todos/:id', () => {
  test('should update todo title', async ({ request }) => {
    const created = await (
      await request.post(`${BASE_URL}/todos`, { data: { title: 'Old title' } })
    ).json();

    const response = await request.put(`${BASE_URL}/todos/${created.id}`, {
      data: { title: 'New title' },
    });

    expect(response.status()).toBe(200);
    const todo = await response.json();
    expect(todo.title).toBe('New title');
    expect(todo.completed).toBe(false);
  });

  test('should update todo completed status', async ({ request }) => {
    const created = await (
      await request.post(`${BASE_URL}/todos`, { data: { title: 'Toggle me' } })
    ).json();

    const response = await request.put(`${BASE_URL}/todos/${created.id}`, {
      data: { completed: true },
    });

    expect(response.status()).toBe(200);
    const todo = await response.json();
    expect(todo.completed).toBe(true);
    expect(todo.title).toBe('Toggle me');
  });

  test('should return 404 when updating non-existent todo', async ({ request }) => {
    const response = await request.put(`${BASE_URL}/todos/99999`, {
      data: { title: 'Nope' },
    });

    expect(response.status()).toBe(404);
  });
});

test.describe('DELETE /todos/:id', () => {
  test('should delete a todo', async ({ request }) => {
    const created = await (
      await request.post(`${BASE_URL}/todos`, { data: { title: 'Delete me' } })
    ).json();

    const deleteResponse = await request.delete(`${BASE_URL}/todos/${created.id}`);
    expect(deleteResponse.status()).toBe(204);

    // Verify it's gone
    const getResponse = await request.get(`${BASE_URL}/todos/${created.id}`);
    expect(getResponse.status()).toBe(404);
  });

  test('should return 404 when deleting non-existent todo', async ({ request }) => {
    const response = await request.delete(`${BASE_URL}/todos/99999`);

    expect(response.status()).toBe(404);
  });
});
