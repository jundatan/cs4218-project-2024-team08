import { loginController, forgotPasswordController } from "./authController";
import userModel from "../models/userModel";
import { comparePassword, hashPassword } from "../helpers/authHelper";
import JWT from "jsonwebtoken";

// Mock dependencies
jest.mock("../models/userModel");
jest.mock("../helpers/authHelper");
jest.mock("jsonwebtoken");

describe("loginController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return 404 if email is missing", async () => {
    req.body.email = ""; // Simulate missing email

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  it("should return 404 if password is missing", async () => {
    req.body.password = ""; // Simulate missing password

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid email or password",
    });
  });

  it("should return 404 if user is not found", async () => {
    userModel.findOne.mockResolvedValue(null); // Simulate user not found

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Email is not registerd",
    });
  });

  it("should return 200 if password is invalid", async () => {
    userModel.findOne.mockResolvedValue({
      email: "test@example.com",
      password: "hashedPassword",
    });
    comparePassword.mockResolvedValue(false); // Simulate incorrect password

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Password",
    });
  });

  it("should return 200 and a token if login is successful", async () => {
    userModel.findOne.mockResolvedValue({
      _id: "123",
      email: "test@example.com",
      password: "hashedPassword",
      name: "John Doe",
      phone: "1234567890",
      address: "123 Street",
      role: "user",
    });
    comparePassword.mockResolvedValue(true); // Simulate correct password
    JWT.sign.mockReturnValue("fakeToken"); // Simulate token creation

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "login successfully",
      user: {
        _id: "123",
        name: "John Doe",
        email: "test@example.com",
        phone: "1234567890",
        address: "123 Street",
        role: "user",
      },
      token: "fakeToken",
    });
  });

  it("should return 500 if login throws an error", async () => {
    userModel.findOne.mockResolvedValue({
      _id: "123",
      email: "test@example.com",
      password: "hashedPassword",
      name: "John Doe",
      phone: "1234567890",
      address: "123 Street",
      role: "user",
    });

    const mockError = new Error("mocked error");
    comparePassword.mockImplementation(() => {
      throw mockError; // Throw error here
    });

    await loginController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error in login",
      error: mockError,
    });
  });
});

describe("forgotPasswordController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        answer: "securityAnswer",
        newPassword: "newPassword123",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return 400 if email is missing", async () => {
    req.body.email = ""; // Simulate missing email

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "Emai is required" });
  });

  it("should return 400 if answer is missing", async () => {
    req.body.answer = ""; // Simulate missing security answer

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "answer is required" });
  });

  it("should return 400 if new password is missing", async () => {
    req.body.newPassword = ""; // Simulate missing new password

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({ message: "New Password is required" });
  });

  it("should return 404 if user is not found", async () => {
    userModel.findOne.mockResolvedValue(null); // Simulate user not found

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Wrong Email Or Answer",
    });
  });

  it("should return 200 if password reset is successful", async () => {
    userModel.findOne.mockResolvedValue({
      _id: "123",
      email: "test@example.com",
      answer: "securityAnswer",
    });
    hashPassword.mockResolvedValue("hashedNewPassword"); // Simulate password hashing

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Password Reset Successfully",
    });
  });
  it("should return 500 if forgot password throws an error", async () => {
    userModel.findOne.mockResolvedValue({
        _id: "123",
        email: "test@example.com",
        answer: "securityAnswer",
      });

    const mockError = new Error("mocked error");
    hashPassword.mockImplementation(() => {
      throw mockError; // Throw error here
    });

    await forgotPasswordController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
    success: false,
    message: "Something went wrong",
    error: mockError
    });
  });
});
