import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import express from "express";
import request from "supertest"; // Import supertest
import productModel from "../models/productModel"; // Adjust the path as needed
import { productPhotoController } from "./productController"; // Adjust the path as needed

// Setup Express app
const app = express();
app.get("/product/:pid/photo", productPhotoController); // Define the route

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
  await productModel.deleteMany(); // Clear the database before each test
});

// Integration test for productPhotoController
describe("productPhotoController Integration Test", () => {
  it("should return photo when product has photo data", async () => {
    const product = await productModel.create({
      _id: new mongoose.Types.ObjectId("60c72b2f9b1d5c001c8e4e0a"),
      name: "Sample Product",
      slug: "sample-product",
      description: "This is a sample product description.",
      price: 100,
      category: new mongoose.Types.ObjectId("60c72b2f9b1d5c001c8e4e0d"),
      quantity: 10,
      photo: {
        data: Buffer.from("test-photo-data"),
        contentType: "image/png",
      },
      shipping: true,
    });

    const response = await request(app).get(`/product/${product._id}/photo`);

    // Assertions to check if the photo is returned correctly
    expect(response.status).toBe(200);
    expect(response.header["content-type"]).toBe("image/png");
    expect(response.body).toEqual(Buffer.from("test-photo-data"));
  });

  it("should return 500 if there is an error while getting photo", async () => {
    // Simulate a failure by trying to find a non-existing product
    const response = await request(app).get("/product/invalid-id/photo");

    // Assertions to check if the error response is returned
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("success", false);
    expect(response.body).toHaveProperty(
      "message",
      "Erorr while getting photo"
    );
  });
});
