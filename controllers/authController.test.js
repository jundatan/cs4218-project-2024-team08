import { updateProfileController } from "./authController.js";
import userModel from "../models/userModel.js"; 
import { hashPassword } from "../helpers/authHelper.js";

jest.mock("../models/userModel");
jest.mock("../helpers/authHelper"); 

describe("Testing updating of user profile", () => {
  it("All Valid fields profile update", async () => {
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

  it("All empty fields", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: { name: "", email: "", password: "", phone: "", address: "" },
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

    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "mockedUserId",
      name: "Old Name",
      email: "old@example.com",
      password: "oldpassword",
      phone: "987654321",
      address: "Old Address",
    });

    hashPassword.mockResolvedValue(undefined);

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.objectContaining({
        name: "Old Name",
        email: "old@example.com",
        password: "oldpassword",
        phone: "987654321",
        address: "Old Address",
      }),
    });
  });

  it("Empty name, Non-empty invalid password , non-empty phone, non-empty Address", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "",
        email: "john@example.com",
        password: "123",
        phone: "12345",
        address: "valid address",
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

  it("Non-empty name, empty password, non-empty phone, empty address", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "John Doe",
        email: "old@example.com",
        password: "",
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

    hashPassword.mockResolvedValue(undefined);

    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: "mockedUserId",
      name: "John Doe",
      email: "old@example.com",
      password: "oldpassword",
      phone: "123456789",
      address: "Old Address",
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.objectContaining({
        name: "John Doe",
        email: "old@example.com", 
        password: "oldpassword",
        phone: "123456789",
        address: "Old Address",
      }),
    });
  });

  it("Non-empty name, non-empty valid password, empty phone, non-empty address", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "John Doe",
        email: "old@example.com",
        password: "1234567",
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
      email: "old@example.com",
      password: "hashedPassword",
      phone: "987654321",
      address: "New Address",
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.objectContaining({
        name: "John Doe",
        email: "old@example.com", 
        password: "hashedPassword",
        phone: "987654321",
        address: "New Address",
      }),
    });
  });

  it("Non-empty name, Non-empty invalid password , empty phone, empty Address", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "123",
        phone: "",
        address: "",
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

  it("Empty name, non-empty valid password, non-empty phone, empty address", async () => {
    const req = {
      user: { _id: "mockedUserId" },
      body: {
        name: "",
        email: "old@example.com",
        password: "1234567",
        phone: "123456",
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
      name: "Old Name",
      email: "old@example.com",
      password: "hashedPassword",
      phone: "123456",
      address: "Old Address",
    });

    await updateProfileController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Profile Updated SUccessfully",
      updatedUser: expect.objectContaining({
        name: "Old Name",
        email: "old@example.com", 
        password: "hashedPassword",
        phone: "123456",
        address: "Old Address",
      }),
    });
  });
});
