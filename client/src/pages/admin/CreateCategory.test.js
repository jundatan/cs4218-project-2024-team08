import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateCategory from "./CreateCategory";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

Object.defineProperty(window, "localStorage", {
  value: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("Create Category Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Creation of Category", () => {
    describe("Given the category form is filled with data", () => {
      describe("When the Submit Button is clicked", () => {
        it("Then there will be a success toast", async () => {
          axios.post.mockResolvedValueOnce({
            data: {
              success: true,
              name: "table",
            },
          });

          const { getByText, getByPlaceholderText } = render(
            <MemoryRouter initialEntries={["/create-category"]}>
              <Routes>
                <Route path="/create-category" element={<CreateCategory />} />
              </Routes>
            </MemoryRouter>
          );

          fireEvent.change(getByPlaceholderText("Enter new category"), {
            target: { value: "table" },
          });
          fireEvent.click(getByText("Submit"));

          await waitFor(() => expect(axios.post).toHaveBeenCalled());
          expect(toast.success).toHaveBeenCalledWith("table is created");
        });
      });
    });
  });

  describe("Given there is an existing category in the list", () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [{ _id: "1", name: "table", slug: "table", __v: 0 }],
        },
      });
    });
    describe("When delete button is clicked", () => {
      beforeEach(() => {
        axios.delete.mockResolvedValueOnce({
          data: {
            success: true,
            message: "category is deleted",
          },
        });
      });
      it("Then there is a success toast", async () => {
        const clearCategoryData = {
          data: {
            success: true,
            category: [],
          },
        };
        const { getByText, findAllByText } = render(
          <MemoryRouter initialEntries={["/create-category"]}>
            <Routes>
              <Route path="/create-category" element={<CreateCategory />} />
            </Routes>
          </MemoryRouter>
        );
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith(
            "/api/v1/category/get-category"
          );
        });
        await findAllByText("Delete");
        fireEvent.click(getByText("Delete"));
        axios.get.mockResolvedValue(clearCategoryData);
        await waitFor(() =>
          expect(axios.delete).toHaveBeenCalledWith(
            "/api/v1/category/delete-category/1"
          )
        );
        await waitFor(() =>
          expect(toast.success).toHaveBeenCalledWith("category is deleted")
        );
      });
    });

    describe("When edit button is clicked", () => {
      beforeEach(() => {
        axios.put.mockResolvedValueOnce({
          data: {
            success: true,
            message: "closetdrawer is updated",
          },
        });
      });

      it("Then the edit is successful", async () => {
        const changeGetMock = {
          data: {
            success: true,
            category: [
              {
                _id: "1",
                name: "closetdrawer",
                slug: "closetdrawer",
                __v: 0,
              },
            ],
          },
        };
        const {
          getByText,
          getAllByText,
          getAllByPlaceholderText,
          findAllByText,
        } = render(
          <MemoryRouter initialEntries={["/create-category"]}>
            <Routes>
              <Route path="/create-category" element={<CreateCategory />} />
            </Routes>
          </MemoryRouter>
        );
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith(
            "/api/v1/category/get-category"
          );
        });
        await findAllByText("Edit");
        fireEvent.click(getByText("Edit"));
        fireEvent.change(getAllByPlaceholderText("Enter new category")[1], {
          target: { value: "closetdrawer" },
        });
        fireEvent.click(getAllByText("Submit")[1]);
        axios.get.mockResolvedValue(changeGetMock);
        await waitFor(() =>
          expect(axios.put).toHaveBeenCalledWith(
            "/api/v1/category/update-category/1",
            { name: "closetdrawer" }
          )
        );
        await waitFor(() =>
          expect(toast.success).toHaveBeenCalledWith("closetdrawer is updated")
        );
        await findAllByText("closetdrawer");
      });
    });
  });
});
