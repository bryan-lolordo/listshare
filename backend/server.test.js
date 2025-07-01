const request = require('supertest');
const express = require('express');
const app = require('./server');

describe('API Health', () => {
  it('should return API is running', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toMatch(/API is running/);
  });
});
