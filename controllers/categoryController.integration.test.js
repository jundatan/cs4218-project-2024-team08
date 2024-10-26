import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import express from "express";
import Category from "../models/categoryModel";
import categoryRoutes from "../routes/categoryRoutes";
import { beforeAll, afterAll, describe, it, expect, jest } from "@jest/globals";

let mongoServer;
let mockApp;

describe("Integrated tests for Category Controller", () => {
    beforeAll(async () => {
        mockApp = express();
        mockApp.use(express.json());
        mockApp.use("/api/v1/category", categoryRoutes);

        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Category.deleteMany();
    });

    describe("Given the categoryControlller", () => {
        describe("When there is no categories in the database", () => {
            it("should return 200 and an empty list", async () => {
                const res = await request(mockApp).get("/api/v1/category/get-category");

                expect(res.statusCode).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.message).toBe("All Categories List");
                expect(res.body.category).toHaveLength(0);
                expect(res.body.category).toEqual([]);
            });
        });

        describe("When there are categories in the database", () => {
            it("should return 200 and all categories", async () => {
                const mockCategories = [
                    { name: "Electronics", slug: "electronics" },
                    { name: "Furniture", slug: "furniture" },
                ];

                await Category.insertMany(mockCategories);

                const res = await request(mockApp).get("/api/v1/category/get-category");

                expect(res.statusCode).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.message).toBe("All Categories List");
                expect(res.body.category).toHaveLength(2);
                expect(res.body.category[0].name).toBe("Electronics");
                expect(res.body.category[1].name).toBe("Furniture");
            });
        });

        describe("When there is an error with the database", () => {
            afterEach(() => {
                jest.restoreAllMocks();
            })

            it("should return 500 and the error", async () => {
                jest.spyOn(Category, "find").mockImplementationOnce(() => {
                    throw new Error("Database error");
                });

                const res = await request(mockApp).get("/api/v1/category/get-category");

                expect(res.statusCode).toBe(500);
                expect(res.body.success).toBe(false);
                expect(res.body.message).toBe("Error while getting all categories");
                expect(res.body.error).toBeDefined();
            });
        });
    });

    describe("Given the singleCategoryController", () => {
        describe("When no category with the specified slug exists in the database", () => {
            it("should return 200 and null", async () => {
                const mockCategories = [
                    { name: "Electronics", slug: "electronics" },
                    { name: "Furniture", slug: "furniture" },
                ];

                await Category.insertMany(mockCategories);

                const res = await request(mockApp).get("/api/v1/category/single-category/door");

                expect(res.statusCode).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.message).toBe("Get SIngle Category SUccessfully");
                expect(res.body.category).toBe(null);
            })
        });

        describe("When a category with the specified slug exists in the database", () => {
            it("should return 200 and the category", async () => {
                const mockCategories = [
                    { name: "Electronics", slug: "electronics" },
                    { name: "Furniture", slug: "furniture" },
                ];

                await Category.insertMany(mockCategories);

                const res = await request(mockApp).get("/api/v1/category/single-category/electronics");

                expect(res.statusCode).toBe(200);
                expect(res.body.success).toBe(true);
                expect(res.body.message).toBe("Get SIngle Category SUccessfully");
                expect(res.body.category.name).toBe("Electronics");
                expect(res.body.category.slug).toBe("electronics");
            });
        });
    });
});