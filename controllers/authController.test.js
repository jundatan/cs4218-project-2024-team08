import { updateProfileController } from "./authController.js";
import userModel from "../models/userModel.js"; 
import { hashPassword } from "../helpers/authHelper.js";

jest.mock("../models/userModel");
jest.mock("../helpers/authHelper"); 

describe("Testing updating of user profile", () => {
  test("1. Valid profile update", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "newpassword",
        phone: "123456789",
        address: "New Address",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    userModel.findById.mockResolvedValue({
      _id: "mockedUserId",
      name: "Old Name",
      email: "old@example.com",
      password: "oldpassword",
      phone: "987654321",
      address: "Old Address",
    });

    hashPassword.mockResolvedValue("hashedPassword");

    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "mockedUserId",
      name: "John Doe",
      email: "john@example.com",
      password: "hashedPassword",
      phone: "123456789",
      address: "New Address",
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.objectContaining({
        name: "John Doe",
        email: "john@example.com",
        password: "hashedPassword",
        phone: "123456789",
        address: "New Address",
      }),
    });
  });

  test("2. Invalid name, fallback to current value", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "",
        email: "john@example.com",
        password: "newpassword",
        phone: "123456789",
        address: "New Address",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    userModel.findById.mockResolvedValue({
      _id: "mockedUserId",
      name: "Old Name",
      email: "old@example.com",
      password: "oldpassword",
      phone: "987654321",
      address: "Old Address",
    });

    hashPassword.mockResolvedValue("hashedPassword");

    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "mockedUserId",
      name: "Old Name",
      email: "john@example.com",
      password: "hashedPassword",
      phone: "123456789",
      address: "New Address",
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.objectContaining({
        name: "Old Name", // Fallback to old name
        email: "john@example.com",
        password: "hashedPassword",
        phone: "123456789",
        address: "New Address",
      }),
    });
  });

  test("3. Valid name, invalid email, fallback to current value", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "John Doe",
        email: "",
        password: "newpassword",
        phone: "123456789",
        address: "New Address",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    userModel.findById.mockResolvedValue({
      _id: "mockedUserId",
      name: "Old Name",
      email: "old@example.com",
      password: "oldpassword",
      phone: "987654321",
      address: "Old Address",
    });

    hashPassword.mockResolvedValue("hashedPassword");

    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "mockedUserId",
      name: "John Doe",
      email: "old@example.com", // Fallback to old email
      password: "hashedPassword",
      phone: "123456789",
      address: "New Address",
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.objectContaining({
        name: "John Doe",
        email: "old@example.com", // Fallback to old email
        password: "hashedPassword",
        phone: "123456789",
        address: "New Address",
      }),
    });
  });

  test("4. Valid name, valid email, invalid password", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "123",
        phone: "123456789",
        address: "New Address",
      },
    };
    const res = {
      json: jest.fn(),
    };
    await updateProfileController(req, res);

    expect(res.json).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      error: "Passsword is required and 6 character long",
    });
  });

  test("5. Valid profile, invalid phone, fallback to current value", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "newpassword",
        phone: "",
        address: "New Address",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    userModel.findById.mockResolvedValue({
      _id: "mockedUserId",
      name: "Old Name",
      email: "old@example.com",
      password: "oldpassword",
      phone: "987654321",
      address: "Old Address",
    });

    hashPassword.mockResolvedValue("hashedPassword");

    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "mockedUserId",
      name: "John Doe",
      email: "john@example.com",
      password: "hashedPassword",
      phone: "987654321", // Fallback to old phone
      address: "New Address",
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.objectContaining({
        name: "John Doe",
        email: "john@example.com",
        password: "hashedPassword",
        phone: "987654321", // Fallback to old phone
        address: "New Address",
      }),
    });
  });

  test("6. Valid profile, invalid address, fallback to current value", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "newpassword",
        phone: "123456789",
        address: "",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    userModel.findById.mockResolvedValue({
      _id: "mockedUserId",
      name: "Old Name",
      email: "old@example.com",
      password: "oldpassword",
      phone: "987654321",
      address: "Old Address",
    });

    hashPassword.mockResolvedValue("hashedPassword");

    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "mockedUserId",
      name: "John Doe",
      email: "john@example.com",
      password: "hashedPassword",
      phone: "123456789",
      address: "Old Address", // Fallback to old address
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.objectContaining({
        name: "John Doe",
        email: "john@example.com",
        password: "hashedPassword",
        phone: "123456789",
        address: "Old Address", // Fallback to old address
      }),
    });
  });

  test("All invalid fields, fallback to current values", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: { name: "", email: "", password: "", phone: "", address: "" },
    };

    const res = {
      json: jest.fn(),
    };

    await updateProfileController(req, res);

    expect(res.json).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      error: "Passsword is required and 6 character long",
    });
  });
});
