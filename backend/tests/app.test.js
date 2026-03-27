import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('GET / returns API status text', async () => {
  const response = await request(app).get('/');

  assert.equal(response.status, 200);
  assert.match(response.text, /Smart Exam Analyzer API is running/);
});

test('POST /api/auth/register rejects invalid payload', async () => {
  const response = await request(app).post('/api/auth/register').send({});

  assert.equal(response.status, 400);
  assert.match(response.body.message, /Validation failed/);
});
