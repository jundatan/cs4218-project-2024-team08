import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import { createCategoryController } from "../controllers/categoryController";

// Mock its dependencies
jest.mock("../models/categoryModel.js");
jest.mock("slugify");

describe('Given the Category Controller', () => {
    let req, res, next, error;

    // Mock the request and response objects
    beforeEach(() => {
        req = { body: {}, params: {}, query: {} };
        res = {
            status: jest.fn(() => res), // "() => res" is required as status usually returns a res object after configuring a HTTP status code
            send: jest.fn(),
        };
    });

    describe('When testing the createCategoryController method', () => {
        test('Then return 401 if no name is given', async () => {
            req.body = {};

            await createCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith("Name is required");
        });

        test('Then return 401 if the name given is a false value', async () => {
            // False values can be when name is false, null, undefined, 0, NaN or empty string
            req.body = { name: null }; 

            await createCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.send).toHaveBeenCalledWith("Name is required");
        });

        test('Then return 200 if the name given has an existing category in the database', async () => {
            req.body = { name: 'Sofa' };
            categoryModel.findOne.mockResolvedValue({ name: 'Sofa' });

            await createCategoryController(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.send).toHaveBeenCalledWith({
                success: true,
                message: "Category Already Exisits",
            });
        });

        test('Then return 201 if the name given does not have a matching category in the database', async () => {
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

        test('Then return 500 if there is an error with the database', async () => {
            req.body = { name: 'Error' };
            categoryModel.findOne.mockRejectedValue(new Error('Database Error'));

            await createCategoryController(req, res);

            expect(console.log).toHaveBeenCalledWith(new Error('Database Error'));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                errro,
                message: "Errro in Category",
            });
        });

        test('Then return 500 if the name given is truthy', async () => {
            // This means when name is recognised as true by the machine and hence !name returns false, eg are [] and {}
            req.body = { name: {} };
            categoryModel.findOne.mockRejectedValue(new Error('Error with input to Database'));

            await createCategoryController(req, res);

            expect(console.log).toHaveBeenCalledWith(new Error('Error with input to Databas'));
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.send).toHaveBeenCalledWith({
                success: false,
                errro,
                message: "Errro in Category",
            });
        });
    });
});