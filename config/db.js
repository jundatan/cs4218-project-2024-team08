import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../models/userModel.js";
import colors from "colors";
const connectDB = async () => {
  let conn;
  const adminAccount = {
    _id: new mongoose.Types.ObjectId("6710ee92727bf8b4a799dc15"),
    name: "TestTest123123",
    email: "Test123@Email.com",
    password: "$2b$10$WO6mHb8TNAqjBj0vQ.mO4OIc6PNfIHrVuw3dDp0WFJvrTfrscNKLK",
    phone: "88885555",
    address: "Malaysia",
    answer: "Hockey",
    role: 1,
  };

  const normalAccount = {
    _id: new mongoose.Types.ObjectId("6710ee92727bf8b4a799dc14"),
    name: "123",
    email: "123@Email.com",
    password: "$2b$10$WO6mHb8TNAqjBj0vQ.mO4OIc6PNfIHrVuw3dDp0WFJvrTfrscNKLK", //TestTest123123
    phone: "88885554",
    address: "Malaysia",
    answer: "Hockey",
    role: 0,
  };

  const passwordChangeAccount = {
    //added to avoid test failure for password change when tests run in parralel
    _id: new mongoose.Types.ObjectId("6710ee92727bf8b4a799dc13"),
    name: "1234",
    email: "1234@Email.com",
    password: "$2b$10$WO6mHb8TNAqjBj0vQ.mO4OIc6PNfIHrVuw3dDp0WFJvrTfrscNKLK", //TestTest123123
    phone: "88885554",
    address: "Malaysia",
    answer: "Hockey",
    role: 0,
  };

  const insertUser = async () => {
    const existingUser = await User.findById(adminAccount._id);
    const existingNormal = await User.findById(normalAccount._id);
    const existingPasswordAccount = await User.findById(
      passwordChangeAccount._id
    );
    if (!existingUser) {
      await User.create(adminAccount);
      console.log("Admin Account added".bgGreen.white);
    } else {
      console.log("Admin Account already exists".bgYellow.black);
    }

    if (!existingNormal) {
      await User.create(normalAccount);
      console.log("Normal Account added".bgGreen.white);
    } else {
      console.log("Normal Account already exists".bgYellow.black);
    }

    if (!existingPasswordAccount) {
      await User.create(passwordChangeAccount);
      console.log("Account with changing password added".bgGreen.white);
    } else {
      console.log(
        "Account with changing passowrd already exists".bgYellow.black
      );
    }
  };

  try {
    if (process.env.DEV_MODE === "test") {
      const mongoServer = await MongoMemoryServer.create();
      const testUri = mongoServer.getUri();
      conn = await mongoose.connect(testUri);
      console.log(
        `Connected to in-memory MongoDB: ${conn.connection.host}`.bgMagenta
          .white
      );
      await insertUser();
    } else {
      conn = await mongoose.connect(process.env.MONGO_URL);
      console.log(
        `Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white
      );
    }
  } catch (error) {
    console.log(`Error in Mongodb ${error}`.bgRed.white);
  }
};

export default connectDB;
