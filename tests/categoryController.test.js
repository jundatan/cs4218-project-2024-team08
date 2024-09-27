import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import { categoryControlller, createCategoryController, deleteCategoryCOntroller, singleCategoryController, updateCategoryController } from "../controllers/categoryController.js";
import { describe } from "node:test";

// Mock its dependencies
jest.mock("../models/categoryModel.js");
jest.mock("slugify");

describe('Category Controller', () => {
    let req, res, error;

    // Mock the request and response objects
    beforeEach(() => {
        req = { body: {}, params: {}, query: {} };
        res = {
            status: jest.fn(() => res), // "() => res" is required as status usually returns a res object after configuring a HTTP status code
            send: jest.fn(),
        };
        error = "";
        jest.spyOn(console, 'log').mockImplementation(() => {}); // Mock console.log
    });

    afterEach(() => {
        // Restore console.log after each test
        console.log.mockRestore();
    });

    describe('Given the createCategoryController method', () => {
        describe('When no name is given', () => {
            it('should return status code 401', async () => {
                req.body = {};
    
                await createCategoryController(req, res);
    
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
            });
        });

        describe('When the name given is a false value', () => {
            it('should return status code 401', async () => {
                // False values can be when name is false, null, undefined, 0, NaN or empty string
                req.body = { name: null }; 
    
                await createCategoryController(req, res);
    
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
            });
        });

        describe('When the name given has an existing match in the category database', () => {
            it('should return status code 200', async () => {
                req.body = { name: 'Sofa' };
                categoryModel.findOne.mockResolvedValue({ name: 'Sofa' });
    
                await createCategoryController(req, res);
    
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith({
                    success: true,
                    message: "Category Already Exisits",
                });
            });
        });

        describe('When the name given does not have any entries in the category database', () => {
            it('should return status code 201', async () => {
                req.body = { name: 'Armchair' };
                categoryModel.findOne.mockResolvedValue(null);
                slugify.mockReturnValue('armchair');
                categoryModel.mockImplementation(() => ({
                    save: jest.fn().mockResolvedValue({
                        name: 'Armchair',
                        slug: 'armchair',
                    }),
                }));
    
                await createCategoryController(req, res);
    
                expect(res.status).toHaveBeenCalledWith(201);
                expect(res.send).toHaveBeenCalledWith({
                    success: true,
                    message: "new category created",
                    category: { name: 'Armchair', slug: 'armchair' },
                });
            });
        });

        describe('When there is an error with the database', () => {
            it('should return status code 500', async () => {
                req.body = { name: 'Error' };
                error = new Error('Database Error');
                categoryModel.findOne.mockRejectedValue(error);
    
                await createCategoryController(req, res);
    
                expect(console.log).toHaveBeenCalledWith(error);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    error,
                    message: "Errro in Category",
                });
            });
        });

        describe('When the name given is truthy', () => {
            it('should return status code 500', async () => {
                // This means when name is recognised as true by the machine and hence !name returns false, eg are [] and {}
                req.body = { name: {} };
                error = new Error('Error with input to Database');
                categoryModel.findOne.mockRejectedValue(error);
    
                await createCategoryController(req, res);
    
                expect(console.log).toHaveBeenCalledWith(error);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    error,
                    message: "Errro in Category",
                });
            });
        });
    });

    describe('Given the updateCategoryController method', () => {
        describe('When there is an error with the query request to database', () => {
            it('should return status code 500', async () => {
                req.body = { name: 'Chair' }; // Valid Name
                req.params = { id: '12345' }; // ID exists in database
                error = new Error('Database Error');
                categoryModel.findByIdAndUpdate.mockRejectedValue(error);

                await updateCategoryController(req, res);

                expect(console.log).toHaveBeenCalledWith(error);
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    error,
                    message: "Error while updating category",
                });
            });
        });

        describe('When given name is invalid', () => {
            it('should return status code 400', async () => {
                req.body = { name: null };
                req.params = { id: '12345' }; // ID exists in database

                await updateCategoryController(req, res);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.send).toHaveBeenCalledWith({
                    message: "A valid name is required",                    
                });
            });
        });

        describe('When the category is not found', () => {
            it('should return status code 404', async () => {
                req.body = { name: "Table" };
                req.params = { id: 'invalid-id' };
                slugify.mockReturnValue('table');
                categoryModel.findByIdAndUpdate.mockResolvedValue(null);
    
                await updateCategoryController(req, res);
    
                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.send).toHaveBeenCalledWith({
                    message: "Category not found",
                });
            });
        });

        describe('When given name and id are both valid', () => {
            it('should return status code 200', async () => {
                req.body = { name: "Table" };
                req.params = { id: '12345' };
                slugify.mockReturnValue('table');
                categoryModel.findByIdAndUpdate.mockResolvedValue({
                    name: 'Table',
                    slug: 'table',
                });

                await updateCategoryController(req, res);
                
                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith({
                    success: true,
                    messsage: "Category Updated Successfully",
                    category: { name: 'Table', slug: 'table' },
                });
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
                    { name: 'Table', slug: 'table'},
                    { name: 'Chair', slug: 'chair'},
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

        describe('When the category does not exist', () => {
            it('should return status code 404', async () => {
                req.params.slug = 'keyboard';
                error = new Error("Category does not exist!");
                categoryModel.findOne.mockResolvedValue(null);

                await singleCategoryController(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    error,
                    message: 'Error While getting Single Category',
                });
            });
        });

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

    describe('Given the deleteCategoryCOntroller', () => {
        describe('When the category does not exist', () => {
            it('should return status code 404', async () => {
                req.params = { id: "12345" };
                error = new Error("Category does not exist!");
                categoryModel.findByIdAndDelete.mockResolvedValue(null);

                await deleteCategoryCOntroller(req, res);

                expect(res.status).toHaveBeenCalledWith(404);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    error,
                    message: 'Error while removing category',  
                });
            });
        });

        describe('When an error occurs that is not 404', () => {
            // Possible scenarios when id given is wrong format, issue with database
            it('should return status code 500', async () => {
                req.params = { id: null };
                error = new Error("An error has occurred.");
                categoryModel.findByIdAndDelete.mockRejectedValue(error);
    
                await deleteCategoryCOntroller(req, res);
    
                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.send).toHaveBeenCalledWith({
                    success: false,
                    message: "error while deleting category",
                    error,
                });
            });
        });

        describe('When a valid id is given and exists in the database', () => {
            it('should return status code 200', async () => {
                req.params = { id: '12345' };
                categoryModel.findByIdAndDelete.mockResolvedValue(req.params.id);

                await deleteCategoryCOntroller(req, res);

                expect(res.status).toHaveBeenCalledWith(200);
                expect(res.send).toHaveBeenCalledWith({
                    success: true,
                    message: "Categry Deleted Successfully", 
                });
            });
        });
    });
});