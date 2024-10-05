import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import AdminOrders from "./AdminOrders";
import { useAuth } from "../../context/auth";

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

describe("AdminOrders component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);
  });
  describe("Given there are orders", () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: [
          {
            _id: "1",
            status: "Not Process",
            buyer: { name: "John Doe" },
            createAt: "2024-09-22T09:30:00.000Z",
            payment: { success: true },
            products: [
              {
                _id: "product1",
                name: "Product 1",
                description: "This is product 1",
                price: 100,
              },
            ],
          },
        ],
      });
    });

    describe("When order status is changed", () => {
      it("Then order status is changed successfully", async () => {
        axios.put.mockResolvedValue({ data: { status: "Success" } });
        const { getAllByRole, getAllByText, getByText } = render(
          <MemoryRouter initialEntries={["/orders"]}>
            <Routes>
              <Route path="/orders" element={<AdminOrders />} />
            </Routes>
          </MemoryRouter>
        );
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
        });

        await waitFor(() => {
          expect(getAllByRole("combobox")[0]).toBeInTheDocument();
        });
        const statusSelect = getAllByRole("combobox")[0];

        fireEvent.mouseDown(statusSelect);
        await waitFor(() => {
          expect(getAllByText("Processing")[1]).toBeInTheDocument();
        });
        fireEvent.click(getAllByText("Processing")[1]);
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            "/api/v1/auth/order-status/1",
            {
              status: "Processing",
            }
          );
        });
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
        });
        await waitFor(() => {
          expect(getAllByRole("combobox")[0]).toBeInTheDocument();
        });
        fireEvent.mouseDown(statusSelect);
        await waitFor(() => {
          expect(getAllByText("Not Process")[1]).toBeInTheDocument();
        });
        fireEvent.click(getAllByText("Not Process")[1]);
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            "/api/v1/auth/order-status/1",
            {
              status: "Not Process",
            }
          );
        });
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
        });
        await waitFor(() => {
          expect(getAllByRole("combobox")[0]).toBeInTheDocument();
        });
        fireEvent.mouseDown(statusSelect);
        await waitFor(() => {
          expect(getByText("deliverd")).toBeInTheDocument();
        });
        fireEvent.click(getByText("deliverd"));
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            "/api/v1/auth/order-status/1",
            {
              status: "deliverd",
            }
          );
        });
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
        });
        await waitFor(() => {
          expect(getAllByRole("combobox")[0]).toBeInTheDocument();
        });
        fireEvent.mouseDown(statusSelect);
        await waitFor(() => {
          expect(getByText("cancel")).toBeInTheDocument();
        });
        fireEvent.click(getByText("cancel"));
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            "/api/v1/auth/order-status/1",
            {
              status: "cancel",
            }
          );
        });
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
        });
        await waitFor(() => {
          expect(getAllByRole("combobox")[0]).toBeInTheDocument();
        });
        fireEvent.mouseDown(statusSelect);
        await waitFor(() => {
          expect(getByText("Shipped")).toBeInTheDocument();
        });
        fireEvent.click(getByText("Shipped"));
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith(
            "/api/v1/auth/order-status/1",
            {
              status: "Shipped",
            }
          );
        });
        await waitFor(() => {
          expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
        });
      });
    });
  });
});
