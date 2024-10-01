import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateProduct from "./CreateProduct";

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
  useNavigate: () => jest.fn(), // Mock useNavigate hook to return a mock function
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

const createMockFile = (name, size, type) => {
  const padding = new Blob([new Array(size).fill("-").join("")], { type });
  return new File([padding], name, { type });
};

describe("Create Product Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Given that there is category", () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: {
          success: true,
          category: [
            {
              _id: "1",
              name: "Electronics",
            },
            {
              _id: "2",
              name: "Chair",
            },
          ],
        },
      });
    });

    describe("When the user fills the form and submits", () => {
      it("Then it should create the product and redirect to products page", async () => {
        const mockedNavigate = jest.fn();
        jest
          .spyOn(require("react-router-dom"), "useNavigate")
          .mockReturnValue(mockedNavigate);
        axios.post.mockResolvedValue({
          data: {
            success: true,
            message: "Product Created Successfully",
          },
        });
        const {
          getByText,
          getByPlaceholderText,
          getAllByRole,
          getAllByText,
          getByLabelText,
        } = render(
          <MemoryRouter initialEntries={["/create-product"]}>
            <Routes>
              <Route path="/create-product" element={<CreateProduct />} />
            </Routes>
          </MemoryRouter>
        );
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith(
            "/api/v1/category/get-category"
          );
        });

        fireEvent.change(getByPlaceholderText("write a name"), {
          target: { value: "Product 1" },
        });
        fireEvent.change(getByPlaceholderText("write a description"), {
          target: { value: "Product 1 description" },
        });
        fireEvent.change(getByPlaceholderText("write a Price"), {
          target: { value: 1 },
        });
        fireEvent.change(getByPlaceholderText("write a quantity"), {
          target: { value: 1 },
        });
        const selectCategory = getAllByRole("combobox")[0];
        fireEvent.mouseDown(selectCategory);
        await waitFor(() => {
          expect(getAllByText("Electronics").length).toBeGreaterThan(1);
        });
        fireEvent.click(getAllByText("Electronics")[1]);
        await waitFor(() => {
          expect(getAllByRole("combobox")[1]).toBeInTheDocument();
        });
        const selectShipping = getAllByRole("combobox")[1];
        fireEvent.mouseDown(selectShipping);
        await waitFor(() => {
          getByText("Yes");
        });
        fireEvent.click(getByText("Yes"));
        const file = createMockFile("test-img-lt1MB.jpg", 350, "image/jpeg");
        const input = getByLabelText("Upload Photo");
        fireEvent.input(input, { target: { files: [file] } });
        await waitFor(() => expect(input.files.length).toBe(1));
        expect(input.files[0].name).toBe("test-img-lt1MB.jpg");
        fireEvent.click(getByText("CREATE PRODUCT"));
        await waitFor(() => {
          expect(axios.post).toHaveBeenCalledWith(
            "/api/v1/product/create-product",
            expect.any(FormData)
          );
        });
        await waitFor(() => {
          expect(toast.success).toHaveBeenCalledWith(
            "Product Created Successfully"
          );
        });
        expect(mockedNavigate).toHaveBeenCalledWith(
          "/dashboard/admin/products"
        );
      });

      describe("If the product creation fails", () => {
        it("Then it should show an error message", async () => {
          axios.post.mockResolvedValue({
            data: {
              success: false,
              message: "Product creation failed",
            },
          });
          const { getByText, getByPlaceholderText } = render(
            <MemoryRouter initialEntries={["/create-product"]}>
              <Routes>
                <Route path="/create-product" element={<CreateProduct />} />
              </Routes>
            </MemoryRouter>
          );
          await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
              "/api/v1/category/get-category"
            );
          });

          fireEvent.change(getByPlaceholderText("write a name"), {
            target: { value: "Product 1" },
          });
          fireEvent.change(getByPlaceholderText("write a description"), {
            target: { value: "Product 1 description" },
          });
          fireEvent.change(getByPlaceholderText("write a Price"), {
            target: { value: 1 },
          });
          fireEvent.change(getByPlaceholderText("write a quantity"), {
            target: { value: 1 },
          });
          fireEvent.click(getByText("CREATE PRODUCT"));
          await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
              "/api/v1/product/create-product",
              expect.any(FormData)
            );
          });
          await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Product creation failed");
          });
        });
      });
    });
  });
});
