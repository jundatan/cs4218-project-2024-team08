import express from "express";
import request from "supertest";
import router from "../routes/categoryRoutes.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
    categoryControlller,
    createCategoryController,
    deleteCategoryCOntroller,
    singleCategoryController,
    updateCategoryController,
} from "../controllers/categoryController.js";
import { describe } from "node:test";

// Mock dependencies
jest.mock("../middlewares/authMiddleware.js");
jest.mock("../controllers/categoryController.js");

// Initialize the router for testing of actual HTTP requests
const app = express();
app.use(express.json());
app.use(router);

describe("Category Routes", () => {
    beforeEach(() => {
        requireSignIn.mockImplementation((req, res, next) => next());
        isAdmin.mockImplementation((req, res, next) => next());
    });

    describe("Given POST /create-category", () => {
        describe("When it is a valid request", () => {
            it("should return code 201", async () => {
                const testCategory = { name: "Chair", slug: "chair" };
                const expectedCategory = { name: "Chair", slug: "chair" };
                createCategoryController.mockImplementation((req, res) => {
                    res.status(201).json({ success: true, message: "Category created successfully", category: testCategory });
                });

                const response = await request(app)
                    .post("/create-category")
                    .send({ name: "Chair" });

                expect(response.status).toBe(201);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe("Category created successfully");
                expect(response.body.category).toMatchObject(expectedCategory);
                expect(createCategoryController).toHaveBeenCalled();
            });
        });

        describe("When there are errors", () => {
            it("should not return status code 201", async () => {
                createCategoryController.mockImplementation((req, res) => {
                    res.status(500).json({ success: false, message: "Error" });
                });

                const response = await request(app)
                    .post("/create-category")
                    .send({ name: "Chair", slug: "chair" });

                expect(response.status).not.toBe(201);
                expect(response.body.success).not.toBe(true);
                expect(response.body.message).toBe("Error");
                expect(createCategoryController).toHaveBeenCalled();
            });
        });
    });

    describe("Given PUT /update-category/:id", () => {
        describe("When it is a valid request", () => {
            it("should return status code 200", async () => {
                const categoryId = "123";
                const testCategory = { name: "Updated Chair", slug: "updated-chair" };
                const expectedCategory = { name: "Updated Chair", slug: "updated-chair" };
                updateCategoryController.mockImplementation((req, res) => {
                    res.status(200).json({ success: true, message: "Category Updated Successfully", category: testCategory });
                });

                const response = await request(app)
                    .put(`/update-category/${categoryId}`)
                    .send({ name: "Updated Chair", slug: "updated-chair" }); // send updated data

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe("Category Updated Successfully");
                expect(response.body.category).toMatchObject(expectedCategory);
                expect(updateCategoryController).toHaveBeenCalled();
            });
        });

        describe("When there are errors", () => {
            it("should not return status code 200", async () => {
                const categoryId = "123"; // replace with a mock ID
                updateCategoryController.mockImplementation((req, res) => {
                    res.status(500).json({ success: false, message: "Error while updating category" });
                });

                const response = await request(app)
                    .put(`/update-category/${categoryId}`)
                    .send({ name: "Updated Chair", slug: "updated-chair" }); // send updated data

                expect(response.status).not.toBe(200);
                expect(response.body.success).not.toBe(true);
                expect(response.body.message).toBe("Error while updating category");
                expect(updateCategoryController).toHaveBeenCalled();
            });
        });
    });

    describe("Given GET /get-category", () => {
        describe("When it is a valid request", () => {
            it("should return status code 200", async () => {
                const testCategories = [ { name: "Chair", slug: "chair"}, { name: "Table", slug: "table" } ];
                const expectedCategories = [ { name: "Chair", slug: "chair"}, { name: "Table", slug: "table" } ];
                categoryControlller.mockImplementation((req, res) => {
                    res.status(200).json({ success: true, message: "All Categories List", category: testCategories });
                });

                const response = await request(app).get("/get-category");
                
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe("All Categories List");
                expect(response.body.category).toMatchObject(expectedCategories);
                expect(categoryControlller).toHaveBeenCalled();
            });
        });

        describe("When there are errors", () => {
            it("should not return status code 200", async () => {
                categoryControlller.mockImplementation((req, res) => {
                    res.status(500).json({ success: false, message: "Error while getting all categories" });
                });

                const response = await request(app).get("/get-category");

                expect(response.status).not.toBe(200);
                expect(response.body.success).not.toBe(true);
                expect(response.body.message).toBe("Error while getting all categories");
                expect(categoryControlller).toHaveBeenCalled();
            })
        });
    });

    describe("Given GET /single-category/:slug", () => {
        describe("When it is a valid request", () => {
            it("should return status code 200", async () => {
                const slug = "chair";
                const testCategory = { name: "Chair", slug: "chair" };
                const expectedCategory = { name: "Chair", slug: "chair" };
                singleCategoryController.mockImplementation((req, res) => {
                    res.status(200).json({ success: true, message: "Get SIngle Category SUccessfully", category: testCategory});
                });

                const response = await request(app).get(`/single-category/:${slug}`);

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe("Get SIngle Category SUccessfully");
                expect(response.body.category).toMatchObject(expectedCategory);
                expect(singleCategoryController).toHaveBeenCalled();
            })
        });

        describe("When there are errors", () => {
            it("should not return status code 200", async () => {
                const slug = "chair";
                singleCategoryController.mockImplementation((req, res) => {
                    res.status(404).json({ success: false, message: "Category cannot be found"});
                });

                const response = await request(app).get(`/single-category/:${slug}`);

                expect(response.status).not.toBe(200);
                expect(response.body.success).not.toBe(true);
                expect(response.body.message).toBe("Category cannot be found");
                expect(singleCategoryController).toHaveBeenCalled();
            });
        })
    });

    describe("Given DELETE /delete-category/:id", () => {
        describe("When it is a valid request", () => {
            it("should return status code 200", async () => {
                const categoryId = "123";
                deleteCategoryCOntroller.mockImplementation((req, res) => {
                    res.status(200).json({ success: true, message: "Category Deleted Successfully"});
                });
    
                const response = await request(app).delete(`/delete-category/:${categoryId}`);
    
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
                expect(response.body.message).toBe("Category Deleted Successfully");
                expect(deleteCategoryCOntroller).toHaveBeenCalled();
            });
        });

        describe("When there are errors", () => {
            it("should not return status code 200", async () => {
                const categoryId = "123";
                deleteCategoryCOntroller.mockImplementation((req, res) => {
                    res.status(404).json({ success: false, message: "Category not found"});
                });

                const response = await request(app).delete(`/delete-category/:${categoryId}`);

                expect(response.status).not.toBe(200);
                expect(response.body.success).not.toBe(true);
                expect(response.body.message).toBe("Category not found");
                expect(deleteCategoryCOntroller).toHaveBeenCalled();
            })
        });
    });
});