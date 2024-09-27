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
jest.mock("../middlewares/authMiddleware.js", () => ({
    requireSignIn: jest.fn((req, res, next) => next()),
    isAdmin: jest.fn((req, res, next) => next()),
}));

jest.mock("../controllers/categoryController.js", () => ({
    categoryControlller: jest.fn(),
    createCategoryController: jest.fn(),
    deleteCategoryCOntroller: jest.fn(),
    singleCategoryController: jest.fn(),
    updateCategoryController: jest.fn(),
}));

describe("Category Routes", () => {
    let mockRequest, mockResponse, nextFunction;

    beforeEach(() => {
        // Define mockRequest here to ensure it's in scope
        mockRequest = (body = {}, params = {}, query = {}) => ({
            body,
            params,
            query,
        });

        mockResponse = () => {
            const res = {};
            res.status = jest.fn().mockReturnValue(res);
            res.json = jest.fn().mockReturnValue(res);
            res.send = jest.fn().mockReturnValue(res);
            return res;
        };
        
        nextFunction = jest.fn();
    });

    describe("When handling requests", () => {
        describe("POST /create-category", () => {
            test("should register POST route for /create-category with middlewares and controller", () => {
                expect(router.post).toHaveBeenCalledWith(
                    "/create-category",
                    requireSignIn,
                    isAdmin,
                    createCategoryController
                );
            });

            test("should call the createCategoryController and not return status code 500 on valid request", async () => {
                const req = mockRequest({ name: 'Chair', slug: 'chair' });
                const res = mockResponse();

                await router.post.mock.calls[0][3](req, res, nextFunction); // Call the controller

                expect(res.status).not.toHaveBeenCalledWith(500);
                expect(createCategoryController).toHaveBeenCalledWith(req, res, nextFunction); // Optional: Check if the controller was called
            });

            test("should return status code 500 if there are any errors", async () => {
                createCategoryController.mockImplementation((req, res) => {
                    res.status(500).json({ message: "Error" });
                });

                const req = mockRequest({ name: 'Chair', slug: 'chair' });
                const res = mockResponse();

                await router.post.mock.calls[0][3](req, res, nextFunction); // Call the controller

                expect(res.status).toHaveBeenCalledWith(500);
            });
        });
    });
});
