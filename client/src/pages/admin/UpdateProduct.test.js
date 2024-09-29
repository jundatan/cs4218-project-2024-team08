import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route, useParams } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import UpdateProduct from "./UpdateProduct";

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

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: jest.fn(), // Mock useParams hook
  useNavigate: () => jest.fn(), // Mock useNavigate hook to return a mock function
}));

const createMockFile = (name, size, type) => {
  const padding = new Blob([new Array(size).fill("-").join("")], { type });
  return new File([padding], name, { type });
};

describe("UpdateProduct component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useParams.mockReturnValue({ slug: "product1" });
  });

  describe("Given there is product and category data", () => {
    const mockedNavigate = jest.fn();
    beforeEach(() => {
      jest
        .spyOn(require("react-router-dom"), "useNavigate")
        .mockReturnValue(mockedNavigate);
      axios.get.mockImplementation((url) => {
        switch (url) {
          case "/api/v1/product/get-product/product1":
            return Promise.resolve({
              data: {
                product: {
                  slug: "product1",
                  _id: "1",
                  name: "product1",
                  description: "description1",
                  price: 100,
                  quantity: 200,
                  shipping: "0",
                  category: {
                    _id: "1",
                  },
                },
              },
            });
          case "/api/v1/category/get-category":
            return Promise.resolve({
              data: {
                success: true,
                category: [
                  {
                    _id: "1",
                    name: "category1",
                  },
                  {
                    _id: "2",
                    name: "category2",
                  },
                ],
              },
            });
          default:
            return {};
        }
      });
    });

    describe("When the form is submitted", () => {
      it("should update product and navigate to products page", async () => {
        axios.put.mockResolvedValue({
          data: {
            success: true,
            message: "Product Created Successfully",
          },
        });
        const {
          getAllByText,
          getByLabelText,
          getByText,
          getAllByRole,
          getByPlaceholderText,
        } = render(
          <MemoryRouter initialEntries={["/update-product/product1"]}>
            <Routes>
              <Route
                path="/update-product/product1"
                element={<UpdateProduct />}
              />
            </Routes>
          </MemoryRouter>
        );
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith(
            "/api/v1/product/get-product/product1"
          );
        });
        fireEvent.change(getByPlaceholderText("write a name"), {
          target: { value: "Product 2" },
        });
        fireEvent.change(getByPlaceholderText("write a description"), {
          target: { value: "Product 2 description" },
        });
        fireEvent.change(getByPlaceholderText("write a Price"), {
          target: { value: 100000 },
        });
        fireEvent.change(getByPlaceholderText("write a quantity"), {
          target: { value: 3000 },
        });
        const selectCategory = getAllByRole("combobox")[0];
        fireEvent.mouseDown(selectCategory);
        await waitFor(() => {
          expect(getAllByText("category2").length).toBeGreaterThan(1);
        });
        fireEvent.click(getAllByText("category2")[1]);
        await waitFor(() => {
          expect(getAllByRole("combobox")[1]).toBeInTheDocument();
        });
        const selectShipping = getAllByRole("combobox")[1];
        fireEvent.mouseDown(selectShipping);
        await waitFor(() => {
          getByText("No");
        });
        fireEvent.click(getByText("No"));
        const file = createMockFile("test-img-lt1MB.jpg", 350, "image/jpeg");
        const input = getByLabelText("Upload Photo");
        fireEvent.input(input, { target: { files: [file] } });
        await waitFor(() => expect(input.files.length).toBe(1));
        expect(input.files[0].name).toBe("test-img-lt1MB.jpg");
        fireEvent.click(getByText("UPDATE PRODUCT"));
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            "/api/v1/product/update-product/1",
            expect.any(FormData)
          );
        });
        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith(
            "Product Updated Successfully"
          );
        });
        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith(
            "/dashboard/admin/products"
          );
        });
      });
    });

    describe("When the product is deleted", () => {
      it("should delete the product and navigate to products page", async () => {
        window.prompt = jest.fn().mockReturnValue(true);
        axios.delete.mockResolvedValue({
          data: {
            success: true,
            message: "Product deleted successfully",
          },
        });
        const { getByText, getByDisplayValue, getAllByText } = render(
          <MemoryRouter initialEntries={["/update-product/product1"]}>
            <Routes>
              <Route
                path="/update-product/product1"
                element={<UpdateProduct />}
              />
            </Routes>
          </MemoryRouter>
        );
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith(
            "/api/v1/product/get-product/product1"
          );
        });
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith(
            "/api/v1/category/get-category"
          );
        });
        await waitFor(() => {
          expect(getAllByText("category1")[1]).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(getByDisplayValue("product1")).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(getByDisplayValue("description1")).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(getByDisplayValue("100")).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(getByDisplayValue("200")).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(getByText("yes")).toBeInTheDocument();
        });
        await waitFor(() => {
          expect(getByText("DELETE PRODUCT")).toBeInTheDocument();
        });
        fireEvent.click(getByText("DELETE PRODUCT"));
        await waitFor(() => {
          expect(window.prompt).toHaveBeenCalledWith(
            "Are You Sure want to delete this product ? "
          );
        });
        await waitFor(() => {
          expect(axios.delete).toHaveBeenCalledWith(
            "/api/v1/product/delete-product/1"
          );
        });
        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith(
            "Product DEleted Succfully"
          );
        });
        await waitFor(() => {
          expect(mockedNavigate).toHaveBeenCalledWith(
            "/dashboard/admin/products"
          );
        });
      });
    });
  });
});
