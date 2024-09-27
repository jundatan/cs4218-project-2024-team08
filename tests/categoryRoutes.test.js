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

// Mock dependencies
jest.mock("../middlewares/authMiddleware.js");
jest.mock("../controllers/categoryController.js");

const app = express();
app.use(express.json()); // to parse JSON body
app.use(router);

describe("Category Routes", () => {
    beforeEach(() => {
        requireSignIn.mockImplementation((req, res, next) => next());
        isAdmin.mockImplementation((req, res, next) => next());
    });

    describe("Given POST /create-category", () => {
        describe("When it is a valid request", () => {
            test("Then return code 201", async () => {
                createCategoryController.mockImplementation((req, res) => {
                    res.status(201).json({ message: "Category created successfully" });
                });

                const response = await request(app)
                    .post("/create-category")
                    .send({ name: "Chair", slug: "chair" }); // send the required data for category creation

                expect(response.status).toBe(201);
                expect(response.body.message).toBe("Category created successfully");
                expect(createCategoryController).toHaveBeenCalled(); // check that the controller was called
            });
        });

        describe("When there are any errors", () => {
            test("Then it should not return status code 201", async () => {
                createCategoryController.mockImplementation((req, res) => {
                    res.status(500).json({ message: "Error" });
                });

                const response = await request(app)
                    .post("/create-category")
                    .send({ name: "Chair", slug: "chair" });

                expect(response.status).not.toBe(201);
                expect(response.body.message).toBe("Error");
                expect(createCategoryController).toHaveBeenCalled(); // check that the controller was called
            });
        });
    });

    describe("Given PUT /update-category/:id", () => {
        describe("When it is a valid request", () => {
            test("Then return status code 200", async () => {
                const categoryId = "123"; // replace with a mock ID
                updateCategoryController.mockImplementation((req, res) => {
                    res.status(200).json({ message: "Category Updated Successfully" });
                });

                const response = await request(app)
                    .put(`/update-category/${categoryId}`)
                    .send({ name: "Updated Chair", slug: "updated-chair" }); // send updated data

                expect(response.status).toBe(200);
                expect(response.body.message).toBe("Category Updated Successfully");
                expect(updateCategoryController).toHaveBeenCalled(); // check that the controller was called
            });
        });

        describe("When there are any errors", () => {
            test("Then it should not return status code 200", async () => {
                const categoryId = "123"; // replace with a mock ID
                updateCategoryController.mockImplementation((req, res) => {
                    res.status(500).json({ message: "Error while updating category" });
                });

                const response = await request(app)
                    .put(`/update-category/${categoryId}`)
                    .send({ name: "Updated Chair", slug: "updated-chair" }); // send updated data

                expect(response.status).not.toBe(200);
                expect(response.body.message).toBe("Error while updating category");
                expect(updateCategoryController).toHaveBeenCalled(); // check that the controller was called
            });
        });
    });
});
