import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import express from "express";
import { registerController, loginController, forgotPasswordController } from "./authController";
import userModel from "../models/userModel";
import { hashPassword, comparePassword } from "../helpers/authHelper";
import JWT from 'jsonwebtoken';

jest.mock('../models/userModel');
jest.mock('../helpers/authHelper');
jest.mock('jsonwebtoken');

// Setup Express app
const app = express();
app.use(express.json());
app.put("/register", registerController);
app.put("/login", loginController);
app.put("/forgotPassword", forgotPasswordController);

// Setup the test database connection
let mongoServer;

describe('Auth Controller Integration Tests', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      });
      
      afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
      });
      
      beforeEach(async () => {
        await userModel.deleteMany(); // Clear the database before each test
      });

  it('should register a new user successfully', async () => {
    hashPassword.mockResolvedValue('hashedPassword');
    userModel.findOne.mockResolvedValue(null);  // No existing user
    userModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Street',
      }),
    }));

    const res = await request(app).put('/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '1234567890',
      address: '123 Street',
      answer: 'myAnswer',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'User Register Successfully');
    expect(userModel.findOne).toHaveBeenCalledWith({ email: 'john@example.com' });
    expect(hashPassword).toHaveBeenCalledWith('password123');
  });

  it('should fail registration if the email is already registered', async () => {
    userModel.findOne.mockResolvedValue({ email: 'john@example.com' });  // Existing user

    const res = await request(app).put('/register').send({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '1234567890',
      address: '123 Street',
      answer: 'myAnswer',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', 'Already Register please login');
  });

  it('should log in a user with correct credentials', async () => {
    userModel.findOne.mockResolvedValue({
      _id: '123',
      email: 'john@example.com',
      password: 'hashedPassword',
      name: 'John Doe',
      phone: '1234567890',
      address: '123 Street',
      role: 'user',
    });
    comparePassword.mockResolvedValue(true);
    JWT.sign.mockReturnValue('fakeToken123');

    const res = await request(app).put('/login').send({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'login successfully');
    expect(res.body).toHaveProperty('token', 'fakeToken123');
    expect(comparePassword).toHaveBeenCalledWith('password123', 'hashedPassword');
  });

  it('should fail login with incorrect password', async () => {
    userModel.findOne.mockResolvedValue({
      email: 'john@example.com',
      password: 'hashedPassword',
    });
    comparePassword.mockResolvedValue(false);

    const res = await request(app).put('/login').send({
      email: 'john@example.com',
      password: 'wrongPassword',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', 'Invalid Password');
    expect(comparePassword).toHaveBeenCalledWith('wrongPassword', 'hashedPassword');
  });

  it('should reset password successfully if email and answer are correct', async () => {
    userModel.findOne.mockResolvedValue({
      _id: '123',
      email: 'john@example.com',
      answer: 'myAnswer',
    });
    hashPassword.mockResolvedValue('newHashedPassword');

    const res = await request(app).put('/forgotPassword').send({
      email: 'john@example.com',
      answer: 'myAnswer',
      newPassword: 'newPassword123',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'Password Reset Successfully');
    expect(hashPassword).toHaveBeenCalledWith('newPassword123');
  });
});
