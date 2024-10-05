import { registerController, loginController, forgotPasswordController, updateProfileController } from "./authController";
import userModel from "../models/userModel";
import { comparePassword, hashPassword } from "../helpers/authHelper";
import JWT from "jsonwebtoken";

// Mock dependencies
jest.mock("../models/userModel");
jest.mock("../helpers/authHelper");
jest.mock("jsonwebtoken");

describe("registerController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "1234567890",
        address: "123 Street",
        answer: "securityAnswer",
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return an error if name is missing", async () => {
    req.body.name = ""; // Simulate missing name

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  it("should return an error if email is missing", async () => {
    req.body.email = ""; // Simulate missing email

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  it("should return an error if password is missing", async () => {
    req.body.password = ""; // Simulate missing password

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  it("should return an error if phone is missing", async () => {
    req.body.phone = ""; // Simulate missing phone

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  });

  it("should return an error if address is missing", async () => {
    req.body.address = ""; // Simulate missing address

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });

  it("should return an error if answer is missing", async () => {
    req.body.answer = ""; // Simulate missing security answer

    await registerController(req, res);

    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  });

  it("should return an error if user already exists", async () => {
    userModel.findOne.mockResolvedValue({ email: "john@example.com" }); // Simulate existing user

    await registerController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
    });
  });

  it("should register a new user if all fields are valid and user does not exist", async () => {
    userModel.findOne.mockResolvedValue(null); // Simulate user not found
    hashPassword.mockResolvedValue("hashedPassword"); // Simulate password hashing
    userModel.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        address: "123 Street",
        answer: "securityAnswer",
      }),
    })); // Simulate successful user save

    await registerController(req, res);

    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "User Register Successfully",
      user: expect.objectContaining({
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        address: "123 Street",
      }),
    });
  });

  // it("should return 500 if there is an internal server error", async () => {
  //   userModel.findOne.mockRejectedValue(new Error("Database error")); // Simulate a database error

  //   await registerController(req, res);

  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.send).toHaveBeenCalledWith({
  //     success: false,
  //     message: "Errro in Registeration",
  //     error: expect.any(Error),
  //   });
  // });
});

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

  // it("should return 404 if user is not found", async () => {
  //   userModel.findOne.mockResolvedValue(null); // Simulate user not found

  //   await loginController(req, res);

  //   expect(res.status).toHaveBeenCalledWith(404);
  //   expect(res.send).toHaveBeenCalledWith({
  //     success: false,
  //     message: "Email is not registerd",
  //   });
  // });

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

  // it("should return 500 if login throws an error", async () => {
  //   userModel.findOne.mockResolvedValue({
  //     _id: "123",
  //     email: "test@example.com",
  //     password: "hashedPassword",
  //     name: "John Doe",
  //     phone: "1234567890",
  //     address: "123 Street",
  //     role: "user",
  //   });

  //   const mockError = new Error("mocked error");
  //   comparePassword.mockImplementation(() => {
  //     throw mockError; // Throw error here
  //   });

  //   await loginController(req, res);

  //   expect(res.status).toHaveBeenCalledWith(500);
  //   expect(res.send).toHaveBeenCalledWith({
  //     success: false,
  //     message: "Error in login",
  //     error: mockError,
  //   });
  // });
});

// describe("forgotPasswordController", () => {
//   let req, res;

//   beforeEach(() => {
//     req = {
//       body: {
//         email: "test@example.com",
//         answer: "securityAnswer",
//         newPassword: "newPassword123",
//       },
//     };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       send: jest.fn(),
//     };
//   });

//   it("should return 400 if email is missing", async () => {
//     req.body.email = ""; // Simulate missing email

//     await forgotPasswordController(req, res);

//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.send).toHaveBeenCalledWith({ message: "Emai is required" });
//   });

//   it("should return 400 if answer is missing", async () => {
//     req.body.answer = ""; // Simulate missing security answer

//     await forgotPasswordController(req, res);

//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.send).toHaveBeenCalledWith({ message: "answer is required" });
//   });

//   it("should return 400 if new password is missing", async () => {
//     req.body.newPassword = ""; // Simulate missing new password

//     await forgotPasswordController(req, res);

//     expect(res.status).toHaveBeenCalledWith(400);
//     expect(res.send).toHaveBeenCalledWith({ message: "New Password is required" });
//   });

//   it("should return 404 if user is not found", async () => {
//     userModel.findOne.mockResolvedValue(null); // Simulate user not found

//     await forgotPasswordController(req, res);

//     expect(res.status).toHaveBeenCalledWith(404);
//     expect(res.send).toHaveBeenCalledWith({
//       success: false,
//       message: "Wrong Email Or Answer",
//     });
//   });

//   it("should return 200 if password reset is successful", async () => {
//     userModel.findOne.mockResolvedValue({
//       _id: "123",
//       email: "test@example.com",
//       answer: "securityAnswer",
//     });
//     hashPassword.mockResolvedValue("hashedNewPassword"); // Simulate password hashing

//     await forgotPasswordController(req, res);

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.send).toHaveBeenCalledWith({
//       success: true,
//       message: "Password Reset Successfully",
//     });
//   });
//   it("should return 500 if forgot password throws an error", async () => {
//     userModel.findOne.mockResolvedValue({
//         _id: "123",
//         email: "test@example.com",
//         answer: "securityAnswer",
//       });

//     const mockError = new Error("mocked error");
//     hashPassword.mockImplementation(() => {
//       throw mockError; // Throw error here
//     });

//     await forgotPasswordController(req, res);

//     expect(res.status).toHaveBeenCalledWith(500);
//     expect(res.send).toHaveBeenCalledWith({
//     success: false,
//     message: "Something went wrong",
//     error: mockError
//     });
//   });
// });

describe("Testing updating of user profile using updateProfileController", () => {
  it("given all Valid fields, profile should update successfuly", async () => {
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

  it("given all empty fields, profile should update successfully", async () => {
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

  it("given empty name, Non-empty invalid password , non-empty phone, non-empty Address, it should throw error", async () => {
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

  it("given non-empty name, empty password, non-empty phone, empty address, it should update successfully", async () => {
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

  it("given non-empty name, non-empty valid password, empty phone, non-empty address, it should update successfully", async () => {
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

  it("given non-empty name, Non-empty invalid password , empty phone, empty Address, it should throw error", async () => {
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

  it("given empty name, non-empty valid password, non-empty phone, empty address, it should update successfully", async () => {
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