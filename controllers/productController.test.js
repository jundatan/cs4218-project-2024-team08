import fs from "fs";
import slugify from "slugify";
import productModel from "../models/productModel.js";
import mongoose from "mongoose";
import {
  createProductController,
  deleteProductController,
  updateProductController,
} from "./productController";
import { productPhotoController } from "./productController";

const mockBuffer = Buffer.from("test-photo");
const mockPhoto = { data: null, contentType: null };
const mockPhotoCheck = { data: mockBuffer, contentType: "image/jpeg" };
const mockResponse = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
};

jest.mock("../models/productModel");
jest.mock("fs");
jest.mock("slugify");
jest.mock("braintree", () => ({
  BraintreeGateway: jest.fn(() => ({
    clientToken: {
      generate: jest.fn((_, cb) => cb(null, { clientToken: "mockToken" })),
    },
    transaction: {
      sale: jest.fn((_, cb) => cb(null, { success: true })),
    },
  })),
  Environment: {
    Sandbox: "sandbox",
  },
}));

describe("Product Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProductController", () => {
    it("should create a product successfully", async () => {
      const mockRequest = {
        fields: {
          name: "test product",
          description: "test description",
          price: 1000,
          category: new mongoose.Types.ObjectId(),
          quantity: 10,
          shipping: true,
        },
        files: {
          photo: {
            size: 999999,
            path: "./test/img/low-res-test.jpg",
            type: "image/jpeg",
          },
        },
      };
      slugify.mockReturnValue("test-slug");
      fs.readFileSync.mockReturnValue(mockBuffer);
      productModel.mockImplementation((field) => ({
        ...field,
        photo: mockPhoto,
        save: jest.fn(),
      }));

      await createProductController(mockRequest, mockResponse);

      expect(slugify).toHaveBeenCalledWith(mockRequest.fields.name);
      expect(productModel).toHaveBeenCalledWith({
        ...mockRequest.fields,
        slug: "test-slug",
      });
      const product = {
        ...mockRequest.fields,
        slug: "test-slug",
        photo: mockPhotoCheck,
      };
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Created Successfully",
        products: expect.objectContaining(product),
      });
    });

    it("should return an error if any required fields are missing or photo is more than 1mb (switch case)", async () => {
      let mockRequest;
      mockRequest = {
        fields: {},
        files: {},
      };
      slugify.mockReturnValue("test-slug");
      fs.readFileSync.mockReturnValue(mockBuffer);
      productModel.mockImplementation((field) => ({
        ...field,
        photo: mockPhoto,
        save: jest.fn(),
      }));
      await createProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "Name is Required",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        fields: {
          name: "test product",
        },
        files: {
          photo: {
            size: 4353,
            path: "./test/img/low-res-test.jpg",
            type: "image/jpeg",
          },
        },
      };
      await createProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "Description is Required",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        fields: {
          name: "test product",
          description: "test description",
        },
        files: {
          photo: {
            size: 1040,
            path: "./test/img/low-res-test.jpg",
            type: "image/jpeg",
          },
        },
      };
      await createProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "Price is Required",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        fields: {
          name: "test product",
          description: "test description",
          price: 1000000,
          shipping: true,
        },
        files: {},
      };
      await createProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "Category is Required",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        fields: {
          name: "test product",
          description: "test description",
          price: 1,
          category: new mongoose.Types.ObjectId(),
          shipping: true,
        },
        files: {},
      };
      await createProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "Quantity is Required",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        fields: {
          name: "test product",
          description: "test description",
          price: 1342,
          category: new mongoose.Types.ObjectId(),
          quantity: 4435,
          shipping: false,
        },
        files: {},
      };
      await createProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        fields: {
          name: "test product",
          description: "test description",
          price: 1342,
          category: new mongoose.Types.ObjectId(),
          quantity: 236246,
          shipping: false,
        },
        files: {
          photo: {
            size: 1000001,
            path: "./test/img/low-res-test.jpg",
            type: "image/jpeg",
          },
        },
      };
      await createProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should return an error if the product does not exist", async () => {
      const mockRequest = {
        fields: {
          name: "test product",
          description: "test description",
          price: 1000,
          category: new mongoose.Types.ObjectId(),
          quantity: 10,
          shipping: true,
        },
        files: {
          photo: {
            size: 5426,
            path: "./test/img/low-res-test.jpg",
            type: "image/jpeg",
          },
        },
      };
      slugify.mockReturnValue("test-slug");
      fs.readFileSync.mockReturnValue(mockBuffer);
      productModel.mockImplementation((field) => ({
        ...field,
        photo: mockPhoto,
        save: jest.fn().mockImplementation(() => {
          throw new Error("Product not created");
        }),
      }));
      await createProductController(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: false,
        error: new Error("Product not created"),
        message: "Error in crearing product",
      });
    });
  });

  describe("deleteProductController", () => {
    it("should delete a product successfully", async () => {
      const mockRequest = {
        params: {
          pid: new mongoose.Types.ObjectId(),
        },
      };
      productModel.findByIdAndDelete.mockImplementation((pid) => ({
        _id: pid,
        select: jest.fn(),
      }));

      await deleteProductController(mockRequest, mockResponse);

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockRequest.params.pid
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith({
        message: "Product Deleted successfully",
        success: true,
      });
    });

    it("should return an error if the product does not exist", async () => {
      const mockRequest = {
        params: {
          pid: new mongoose.Types.ObjectId(),
        },
      };
      productModel.findByIdAndDelete.mockImplementation((pid) => ({
        select: jest.fn().mockImplementation((photo) => {
          throw new Error("Product not found");
        }),
      }));

      await deleteProductController(mockRequest, mockResponse);

      expect(productModel.findByIdAndDelete).toHaveBeenCalledWith(
        mockRequest.params.pid
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while deleting product",
        error: new Error("Product not found"),
      });
    });
  });

  describe("updateProductController", () => {
    it("should update a product successfully", async () => {
      slugify.mockReturnValue("test-product");
      const mockRequest = {
        params: {
          pid: "1",
        },
        fields: {
          name: "test product",
          description: "test description",
          price: 1000,
          category: new mongoose.Types.ObjectId(),
          quantity: 10,
          shipping: true,
        },
        files: {
          photo: {
            size: 999999,
            path: "./test/img/low-res-test.jpg",
            type: "image/jpeg",
          },
        },
      };
      fs.readFileSync.mockReturnValue(mockBuffer);
      productModel.findByIdAndUpdate.mockImplementation((pid, field, nw) => ({
        ...field,
        photo: mockPhoto,
        save: jest.fn(),
      }));
      await updateProductController(mockRequest, mockResponse);
      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRequest.params.pid,
        { ...mockRequest.fields, slug: "test-product" },
        { new: true }
      );
      expect(slugify).toHaveBeenCalledWith(mockRequest.fields.name);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        mockRequest.files.photo.path
      );
      const product = {
        ...mockRequest.fields,
        slug: "test-product",
        photo: mockPhotoCheck,
      };
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: true,
        message: "Product Updated Successfully",
        products: expect.objectContaining(product),
      });
    });

    it("should return an error if any required fields are missing or photo is more than 1mb (switch case)", async () => {
      let mockRequest;
      mockRequest = {
        params: {
          pid: "1",
        },
        fields: {},
        files: {
          photo: {
            size: 26346,
            path: "./test/img/low-res-test.jpg",
            type: "image/jpeg",
          },
        },
      };
      slugify.mockReturnValue("test-slug");
      fs.readFileSync.mockReturnValue(mockBuffer);
      productModel.mockImplementation((field) => ({
        ...field,
        photo: mockPhoto,
        save: jest.fn(),
      }));
      await updateProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "Name is Required",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        params: {
          pid: "1",
        },
        fields: {
          name: "test product",
        },
        files: {},
      };
      await updateProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "Description is Required",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        params: {
          pid: "1",
        },
        fields: {
          name: "test product",
          description: "test description",
        },
        files: {
          photo: {
            size: 67347,
            path: "./test/img/low-res-test.jpg",
            type: "image/jpeg",
          },
        },
      };
      await updateProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "Price is Required",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        params: {
          pid: "1",
        },
        fields: {
          name: "test product",
          description: "test description",
          price: 1343535,
        },
        files: {},
      };
      await updateProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "Category is Required",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        params: {
          pid: "1",
        },
        fields: {
          name: "test product",
          description: "test description",
          price: 2,
          category: new mongoose.Types.ObjectId(),
        },
        files: {},
      };
      await updateProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "Quantity is Required",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        params: {
          pid: "1",
        },
        fields: {
          name: "test product",
          description: "test description",
          price: 2424,
          category: new mongoose.Types.ObjectId(),
          quantity: 13,
          shipping: false,
        },
        files: {},
      };
      await updateProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);

      mockRequest = {
        params: {
          pid: "1",
        },
        fields: {
          name: "test product",
          description: "test description",
          price: 2424,
          category: new mongoose.Types.ObjectId(),
          quantity: 13,
          shipping: false,
        },
        files: {
          photo: {
            size: 100001,
            path: "./test/img/low-res-test.jpg",
            type: "image/jpeg",
          },
        },
      };
      await updateProductController(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
      expect(mockResponse.status).toHaveBeenCalledWith(500);
    });

    it("should return an error if the product does not exist", async () => {
      const mockRequest = {
        params: {
          pid: "1",
        },
        fields: {
          name: "test product",
          description: "test description",
          price: 1000,
          category: new mongoose.Types.ObjectId(),
          quantity: 10,
          shipping: true,
        },
        files: {
          photo: {
            size: 5426,
            path: "./test/img/low-res-test.jpg",
            type: "image/jpeg",
          },
        },
      };
      slugify.mockReturnValue("test-product");
      fs.readFileSync.mockReturnValue(mockBuffer);
      productModel.findByIdAndUpdate.mockImplementation((pid, field, nw) => {
        throw new Error("Product not found");
      });
      await updateProductController(mockRequest, mockResponse);
      expect(productModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockRequest.params.pid,
        { ...mockRequest.fields, slug: "test-product" },
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith({
        success: false,
        error: new Error("Product not found"),
        message: "Error in Updte product",
      });
    });
  });
});

  describe('productPhotoController', () => {
    let req, res;

    beforeEach(() => {
      req = { params: { pid: 'test-product-id' } };
      res = {
        set: jest.fn(() => res), 
        status: jest.fn(() => res), 
        send: jest.fn(),
      };
    });

    it('should return photo when product has photo data', async () => {
      productModel.findById.mockReturnValue({
          select: jest.fn().mockResolvedValue({
            photo: {
              data: Buffer.from('test-photo-data'), 
              contentType: 'image/png', 
            },
          }),
        });

      await productPhotoController(req, res);

      expect(productModel.findById).toHaveBeenCalledWith('test-product-id');
      expect(res.set).toHaveBeenCalledWith('Content-type', 'image/png');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(Buffer.from('test-photo-data'));
    });

    it('should return 500 on database error', async () => {
      productModel.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error')),
      });
    
      await productPhotoController(req, res);
    
      expect(productModel.findById).toHaveBeenCalledWith('test-product-id');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'Erorr while getting photo', 
        error: expect.any(Error), 
      });
    });
  });
