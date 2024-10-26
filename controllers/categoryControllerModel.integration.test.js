import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import categoryModel from "../models/categoryModel.js";
import {
  createCategoryController,
  deleteCategoryCOntroller,
  updateCategoryController,
} from "./categoryController.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("createCategoryController Integration", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(async () => {
    await categoryModel.deleteMany({});
    jest.clearAllMocks();
  });

  it("should create a new category when valid data is provided", async () => {
    req.body = { name: "table" };

    await createCategoryController(req, res);

    const createdCategory = await categoryModel.findOne({ name: "table" });
    expect(createdCategory).toBeTruthy();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "new category created",
      category: expect.objectContaining({
        name: "table",
        slug: "table",
      }),
    });
  });

  it("should return an error if name is missing", async () => {
    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
  });

  it("should return success if the category already exists", async () => {
    await categoryModel.create({ name: "chair", slug: "chair" });

    req.body = { name: "chair" };

    await createCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Category Already Exisits",
    });
  });
});

describe("deleteCategoryController Integration", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(async () => {
    await categoryModel.deleteMany({});
    jest.clearAllMocks();
  });

  it("should delete a category when valid data is provided", async () => {
    const createdCategory = await categoryModel.create({
      name: "table",
      slug: "table",
    });
    req.params.id = createdCategory._id;

    await deleteCategoryCOntroller(req, res);

    const deletedCategory = await categoryModel.findById(createdCategory._id);
    expect(deletedCategory).toBeNull();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Categry Deleted Successfully",
    });
  });
});

describe("updateCategoryController Integration", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  afterEach(async () => {
    await categoryModel.deleteMany({});
    jest.clearAllMocks();
  });

  it("should update a category when valid data is provided", async () => {
    const createdCategory = await categoryModel.create({
      name: "table",
      slug: "table",
    });
    req.params.id = createdCategory._id;
    req.body = { name: "chair" };

    await updateCategoryController(req, res);

    const updatedCategory = await categoryModel.findById(createdCategory._id);
    expect(updatedCategory).toMatchObject({
      name: "chair",
      slug: "chair",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      messsage: 'Category Updated Successfully',
      category: expect.objectContaining({
        _id: updatedCategory._id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
      }),
    });
  });
});
