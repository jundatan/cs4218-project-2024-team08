import React from "react";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { useNavigate } from "react-router-dom";
import CartPage from "./CartPage";
import "@testing-library/jest-dom/extend-expect";

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../components/Layout.js", () => ({ children }) => <div>{children}</div>);
jest.mock("../context/cart", () => ({ useCart: jest.fn() }));
jest.mock("../context/auth", () => ({ useAuth: jest.fn(() => [null, jest.fn()]) }));
jest.mock("react-router-dom", () => ({ useNavigate: jest.fn() }));

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
            addListener: function () { },
            removeListener: function () { },
        };
    };

describe("CartPage", () => {
    beforeEach(() => {
        useNavigate.mockReturnValue(jest.fn());
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    // it("should render loading state and empty cart message", () => {
    //     useAuth.mockReturnValue([null, jest.fn()]);
    //     useCart.mockReturnValue([[], jest.fn()]);

    //     render(<CartPage />);

    //     expect(screen.getByText(/Hello Guest/i)).toBeInTheDocument();
    //     expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
    // });

    it("should render cart items correctly", async () => {
        useAuth.mockReturnValue([null, jest.fn()]);
        useCart.mockReturnValue([[], jest.fn()]);

        render(<CartPage />);

        expect(screen.getByText(/Hello Guest/i)).toBeInTheDocument();
        expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();

        const mockCart = [
            {
                _id: "1",
                name: "Chair",
                description: "A comfortable chair.",
                price: 99,
            },
        ];
        const mockUser = { user: { name: "John Doe" }, token: "mockToken" };

        useAuth.mockReturnValue([mockUser, jest.fn()]);
        useCart.mockReturnValue([mockCart, jest.fn()]);

        render(<CartPage />);

        axios.get.mockResolvedValue({ data: { clientToken: "mockToken" } });

        await waitFor(() => {
            expect(screen.getByText((content) => /hello\s+john\s+doe/i.test(content))).toBeInTheDocument();
        });

        expect(screen.getByText(/You Have 1 items in your cart/i)).toBeInTheDocument();
        expect(screen.getByText("Chair")).toBeInTheDocument();
        expect(screen.getByText("Price : 99")).toBeInTheDocument();
    });


    it("should show 'Please Login to checkout' button when user is not logged in", async () => {
        const mockCart = [
            {
                _id: "1",
                name: "Chair",
                description: "A comfortable chair.",
                price: 99,
            },
        ];
        useAuth.mockReturnValue([null, jest.fn()]);
        useCart.mockReturnValue([mockCart, jest.fn()]);

        render(<CartPage />);

        expect(screen.getByRole("button", { name: "Plase Login to checkout" })).toBeInTheDocument();
    });

    it("should remove an item from the cart and update localStorage", async () => {
        const mockUser = { user: { name: "John Doe" }, token: "mockToken" };
        const setCartMock = jest.fn();
        const mockCart = [
            {
                _id: "1",
                name: "Chair",
                description: "A comfortable chair.",
                price: 99,
            },
        ];
        useAuth.mockReturnValue([mockUser, jest.fn()]);
        useCart.mockReturnValue([mockCart, setCartMock]);

        render(<CartPage />);

        localStorage.setItem("cart", JSON.stringify(mockCart));

        fireEvent.click(screen.getByRole("button", { name: /remove/i }));

        expect(setCartMock).toHaveBeenCalledWith([]);
        expect(localStorage.setItem).toHaveBeenCalledWith("cart", JSON.stringify([]));
    });

    it("should navigate to profile page when updating address", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        const mockUser = {
            user: { name: "John Doe", address: "123 Main St" },
            token: "mockToken",
        };
        useAuth.mockReturnValue([mockUser, jest.fn()]);
        useCart.mockReturnValue([[], jest.fn()]);

        render(<CartPage />);

        fireEvent.click(screen.getByRole("button", { name: /update address/i }));

        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/profile");
    });

    it("should handle payment process correctly", async () => {
        const mockCart = [
            {
                _id: "1",
                name: "Chair",
                description: "A comfortable chair.",
                price: 99,
            },
        ];
        const mockUser = {
            user: { name: "John Doe", address: "123 Main St" },
            token: "mockToken",
        };
        const setCartMock = jest.fn();
        const mockNavigate = jest.fn();

        useNavigate.mockReturnValue(mockNavigate);
        useAuth.mockReturnValue([mockUser, jest.fn()]);
        useCart.mockReturnValue([mockCart, setCartMock]);

        axios.get.mockResolvedValue({ data: { clientToken: "mockToken" } });
        axios.post.mockResolvedValue({ data: { success: true } });
        axios.post.mockResolvedValue({
            data: {
                nonce: "mockNonce",
                cart: mockCart,
            },
        });

        render(<CartPage />);

        await waitFor(() => {
            expect(screen.getByText(/Make Payment/i)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText(/Make Payment/i));

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith("Payment Completed Successfully");
        });

        expect(setCartMock).toHaveBeenCalledWith([]);
        expect(localStorage.removeItem).toHaveBeenCalledWith("cart");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/user/orders");
    });

    // it("should display empty cart message", () => {
    //     const mockUser = { user: { name: "John Doe", address: "123 Main St" }, token: "mockToken" };
    //     useAuth.mockReturnValue([mockUser, jest.fn()]);
    //     useCart.mockReturnValue([[], jest.fn()]);

    //     render(<CartPage />);

    //     expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
    // });

    // it("should handle error fetching Braintree token", async () => {
    //     const error = new Error("Network Error");
    //     axios.get.mockRejectedValueOnce(error);

    //     const mockUser = { user: { name: "John Doe", address: "123 Main St" }, token: "mockToken" };
    //     useAuth.mockReturnValue([mockUser, jest.fn()]);
    //     useCart.mockReturnValue([[], jest.fn()]);

    //     render(<CartPage />);

    //     await waitFor(() => {
    //         expect(console.log).toHaveBeenCalledWith(error);
    //     });
    // });
});