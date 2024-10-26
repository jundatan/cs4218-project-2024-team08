import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest"; // Import supertest
import express from "express"; // Import express
import { updateProfileController } from "./authController";
import userModel from "../models/userModel";
import { hashPassword } from "../helpers/authHelper";
import { requireSignIn } from "../middlewares/authMiddleware";

jest.mock("../middlewares/authMiddleware", () => ({
  requireSignIn: (req, res, next) => {
    req.user = { _id: "6710ee92727bf8b4a799dc15" }; // Simulate an authenticated user
    next();
  },
}));

// Setup Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON
app.put("/updateProfile", requireSignIn, updateProfileController); // Include the auth middleware

// Mock the JWT secret for testing
process.env.JWT_SECRET = "your_test_secret";

// Setup the test database connection
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
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

describe("updateProfileController Integration Test", () => {
  it("given all empty fields, profile should update successfully", async () => {
    // Create a user in the database
    const user = await userModel.create({
      _id: new mongoose.Types.ObjectId("6710ee92727bf8b4a799dc15"),
      name: "TestTest123123",
      email: "Test123@Email.com",
      password: "$2b$10$WO6mHb8TNAqjBj0vQ.mO4OIc6PNfIHrVuw3dDp0WFJvrTfrscNKLK",
      phone: "88885555",
      address: "Malaysia",
      answer: "Hockey",
      role: 0,
    });

    const token = "mockedToken";

    const response = await request(app)
      .put("/updateProfile")
      .send({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
      })
      .set("Authorization", `Bearer ${token}`); // Set mock token in the header

    // Assertions to check if the profile was updated successfully
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty(
      "message",
      "Profile Updated SUccessfully"
    );
  });

  it("given all valid fields, profile should update successfully", async () => {
    // Create a user in the database
    const user = await userModel.create({
      _id: new mongoose.Types.ObjectId("6710ee92727bf8b4a799dc15"),
      name: "TestTest123123",
      email: "Test123@Email.com",
      password: "$2b$10$WO6mHb8TNAqjBj0vQ.mO4OIc6PNfIHrVuw3dDp0WFJvrTfrscNKLK",
      phone: "88885555",
      address: "Malaysia",
      answer: "Hockey",
      role: 0,
    });

    const token = "mockedToken";

    const response = await request(app)
      .put("/updateProfile")
      .send({
        name: "John Doe",
        email: "Johndoe@email.com",
        password: "1234567",
        phone: "98487273",
        address: "Sesame Street 123",
      })
      .set("Authorization", `Bearer ${token}`); // Set mock token in the header

    // Assertions to check if the profile was updated successfully
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body).toHaveProperty(
      "message",
      "Profile Updated SUccessfully"
    );
  });

  it("given non-empty name, non-empty invalid password, empty phone, empty address, it should throw error", async () => {
    // Create a user in the database
    const user = await userModel.create({
      _id: new mongoose.Types.ObjectId("6710ee92727bf8b4a799dc15"),
      name: "TestTest123123",
      email: "Test123@Email.com",
      password: "$2b$10$WO6mHb8TNAqjBj0vQ.mO4OIc6PNfIHrVuw3dDp0WFJvrTfrscNKLK",
      phone: "88885555",
      address: "Malaysia",
      answer: "Hockey",
      role: 0,
    });

    const token = "mockedToken";

    // Perform the request using supertest
    const response = await request(app)
      .put("/updateProfile")
      .send({
        name: "John Doe",
        email: "john@example.com",
        password: "123",
        phone: "",
        address: "",
      })
      .set("Authorization", `Bearer ${token}`);

    expect(response.body).toEqual({
      error: "Passsword is required and 6 character long",
    });
  });
});
