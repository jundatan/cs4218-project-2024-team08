import categoryModel from "../models/categoryModel";
import slugify from "slugify";
import {
    categoryControlller,
    createCategoryController,
    deleteCategoryCOntroller,
    singleCategoryController,
    updateCategoryController,
} from "./categoryController";
import { describe } from "node:test";

jest.mock("../models/categoryModel");
jest.mock("slugify");

describe("Category Controller", () => {
    let req, res, error;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { body: {}, params: {}, query: {} };
        res = {
            status: jest.fn(() => res), // "() => res" is required as status usually returns a res object after configuring a HTTP status code
            send: jest.fn(),
        };
        error = "";
        jest.spyOn(console, 'log').mockImplementation(() => { }); // Mock console.log
    });

    const mockResponse = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
    };
    describe("createCategoryController", () => {
        it("should return 201 and new category created", async () => {
            slugify.mockReturnValue("test-slug");
            const mockRequest = {
                body: {
                    name: "test-category",
                },
            };
            categoryModel.findOne.mockImplementation((name) => {
                return false;
            });
            categoryModel.mockImplementation((name) => ({
                save: jest.fn().mockResolvedValue({
                    name: name.name,
                    slug: name.slug,
                }),
            }));
            await createCategoryController(mockRequest, mockResponse);
            expect(categoryModel.findOne).toHaveBeenCalledWith({
                name: "test-category",
            });
            expect(slugify).toHaveBeenCalledWith("test-category");
            expect(categoryModel).toHaveBeenCalledWith({
                name: "test-category",
                slug: "test-slug",
            });
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                message: "new category created",
                category: expect.objectContaining({
                    name: "test-category",
                    slug: "test-slug",
                }),
            });
        });
        it("should return 200 and category already exists", async () => {
            const mockRequest = {
                body: {
                    name: "test-category",
                },
            };
            categoryModel.findOne.mockImplementation((name) => {
                return true;
            });
            await createCategoryController(mockRequest, mockResponse);
            expect(categoryModel.findOne).toHaveBeenCalledWith({
                name: "test-category",
            });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                message: "Category Already Exisits",
            });
        });

        it.failing("should return 500 and error in category", async () => {
            const mockRequest = {
                body: {
                    name: "test-category",
                },
            };
            categoryModel.findOne.mockImplementation(() => {
                throw new Error("Error");
            });
            await createCategoryController(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                errro: undefined,
                message: "Errro in Category",
            });
        });
        it("should return 401 and name is required", async () => {
            const mockRequest = {
                body: {},
            };
            await createCategoryController(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.send).toHaveBeenCalledWith({
                message: "Name is required",
            });
        });
    });

    describe("updateCategoryController", () => {
        it("should return 200 and category updated successfully", async () => {
            slugify.mockReturnValue("test-slug");
            const mockRequest = {
                body: {
                    name: "test-category",
                },
                params: {
                    id: "1",
                },
            };
            categoryModel.findByIdAndUpdate.mockImplementation((id, name, nw) => ({
                name: name.name,
                slug: name.slug,
            }));
            await updateCategoryController(mockRequest, mockResponse);
            expect(categoryModel.findByIdAndUpdate).toHaveBeenCalledWith(
                "1",
                {
                    name: "test-category",
                    slug: "test-slug",
                },
                { new: true }
            );
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                messsage: "Category Updated Successfully",
                category: expect.objectContaining({
                    name: "test-category",
                    slug: "test-slug",
                }),
            });
        });

        it("should return 500 and error while updating category", async () => {
            const mockRequest = {
                body: {
                    name: "test-category",
                },
                params: {
                    id: "1",
                },
            };
            categoryModel.findByIdAndUpdate.mockImplementation(() => {
                throw new Error("Error while updating category");
            });
            await updateCategoryController(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                error: new Error("Error while updating category"),
                message: "Error while updating category",
            });
        });
    });

    describe("deleteCategoryCOntroller", () => {
        it("should return 200 and category deleted successfully", async () => {
            const mockRequest = {
                params: {
                    id: "1",
                },
            };
            categoryModel.findByIdAndDelete.mockResolvedValue(true);
            await deleteCategoryCOntroller(mockRequest, mockResponse);
            expect(categoryModel.findByIdAndDelete).toHaveBeenCalledWith("1");
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: true,
                message: "Categry Deleted Successfully",
            });
        });

        it("should return 500 and error while deleting category", async () => {
            const mockRequest = {
                params: {
                    id: "1",
                },
            };
            categoryModel.findByIdAndDelete.mockImplementation(() => {
                throw new Error("Error while deleting category");
            });
            await deleteCategoryCOntroller(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith({
                success: false,
                error: new Error("Error while deleting category"),
                message: "error while deleting category",
            });
        });
    });

    describe('Given the categoryControlller method', () => {
        describe('When there is an error with categoryModel', () => {
            it('should return status code 500', async () => {
                error = new Error('Error retrieving from categoryModel');
                categoryModel.find.mockRejectedValue(error);

                await categoryControlller(req, res);

                expect(console.log).toHaveBeenCalledWith(error);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    error,
                    message: "Error while getting all categories",
                });
            });
        });

        describe('When there is no error retrieving all categories from its list', () => {
            // In the case where there is no category stored in the list, mockCategories should be []
            it('should return status code 200', async () => {
                const mockCategories = [
                    { name: 'Table', slug: 'table' },
                    { name: 'Chair', slug: 'chair' },
                ];
                categoryModel.find.mockResolvedValue(mockCategories);

                await categoryControlller(req, res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith({
                    success: true,
                    message: "All Categories List",
                    category: mockCategories,
                });
            });
        });
    });

    describe('Given the singleCategoryController method', () => {
        describe('When there is a match of category', () => {
            it('should return status code 200', async () => {
                req.params.slug = 'chair';
                const mockCategory = { name: 'Chair', slug: 'chair' };
                categoryModel.findOne.mockResolvedValue(mockCategory);

                await singleCategoryController(req, res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith({
                    success: true,
                    message: "Get SIngle Category SUccessfully",
                    category: mockCategory,
                });
            });
        });

        // describe('When the category does not exist', () => {
        //     it('should return status code 404', async () => {
        //         req.params.slug = 'keyboard';
        //         error = new Error("Category does not exist!");
        //         categoryModel.findOne.mockResolvedValue(null);

        //         await singleCategoryController(req, res);

        //         expect(res.status).toHaveBeenCalledWith(404);
        //         expect(res.send).toHaveBeenCalledWith({
        //             success: false,
        //             error,
        //             message: 'Error While getting Single Category',
        //         });
        //     });
        // });

        describe('When an error occurs that is not 404', () => {
            it('should return status code 500', async () => {
                req.params.slug = 'chair';
                error = new Error("An error has occurred.");
                categoryModel.findOne.mockRejectedValue(error);

                await singleCategoryController(req, res);

                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    error,
                    message: "Error While getting Single Category",
                });
            });
        });
    });
});