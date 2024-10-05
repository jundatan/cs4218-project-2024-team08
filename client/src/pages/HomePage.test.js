import React from "react";
import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import HomePage from "./HomePage";
import "@testing-library/jest-dom/extend-expect";

// Mock dependencies
jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../context/cart", () => ({ useCart: jest.fn() }));
jest.mock("react-router-dom", () => ({ useNavigate: jest.fn() }));
jest.mock("../components/Layout", () => ({ children }) => <div>{children}</div>);

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

describe("HomePage", () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { });
        useNavigate.mockReturnValue(jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
    });

    // it("should render loading state and initial products", async () => {
    //     useCart.mockReturnValue([[], jest.fn()]);

    //     axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
    //     axios.get.mockResolvedValueOnce({ data: { total: 0 } });

    //     render(<HomePage />);

    //     expect(screen.getByText(/all products/i)).toBeInTheDocument();
    // });

    it("should render products correctly", async () => {
        const mockProducts = [
            {
                _id: "1",
                name: "Chair",
                price: 99,
                description: "A comfortable chair.",
                slug: "chair",
            },
        ];
        const mockCategories = [{ _id: "1", name: "Furniture", slug: "furniture" }];

        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } });
        axios.get.mockResolvedValueOnce({ data: { total: 1 } });
        axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

        render(<HomePage />);

        await waitFor(() => {
            expect(screen.getByText("Chair")).toBeInTheDocument();
        });

        expect(screen.getByText((content, element) => content.includes("Price"))).toBeInTheDocument();
        expect(screen.getByText(/\$99\.00/i)).toBeInTheDocument();
    });

    it("should handle adding item to cart", async () => {
        const mockProduct = {
            _id: "1",
            name: "Chair",
            price: 99,
            description: "A comfortable chair.",
            slug: "chair",
        };

        useCart.mockReturnValue([[], jest.fn()]);

        axios.get.mockResolvedValueOnce({ data: { success: true, category: [] } });
        axios.get.mockResolvedValueOnce({ data: { total: 1 } });
        axios.get.mockResolvedValueOnce({ data: { products: [mockProduct] } });

        render(<HomePage />);

        await waitFor(() => {
            expect(screen.getByText("Chair")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /add to cart/i }));

        expect(localStorage.setItem).toHaveBeenCalledWith(
            "cart",
            JSON.stringify([mockProduct])
        );
        expect(toast.success).toHaveBeenCalledWith("Item Added to cart");
    });

    it("should filter products based on categories", async () => {
        const mockCategories = [
            { _id: "1", name: "Furniture", slug: "furniture" },
            { _id: "2", name: "Electronics", slug: "electronics" },
        ];

        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } });
        axios.get.mockResolvedValueOnce({ data: { total: 0 } });

        render(<HomePage />);

        expect(await screen.findByText(/furniture/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/furniture/i));
    
        expect(screen.getByRole('checkbox', { name: /furniture/i })).toBeChecked();
    });

    // it("should handle error fetching categories", async () => {
    //     const error = new Error("Network Error");
    //     axios.get.mockRejectedValueOnce(error);

    //     render(<HomePage />);

    //     await waitFor(() => {
    //         expect(console.log).toHaveBeenCalledWith(error);
    //     });
    // });

    test("should reset filters when reset button is clicked", async () => {
        const mockCategories = [
            { name: "Furniture", id: 1, slug: "furniture" },
            { name: "Electronics", id: 2, slug: "electronics" }
        ];
        
        const mockProducts = [
            {
                name: "Sofa",
                category: "Furniture",
                price: 100,
                description: "A comfortable couch."
            },
            {
                name: "TV",
                category: "Electronics",
                price: 200,
                description: "A 4K television."
            }
        ];

        const reloadMock = jest.fn();
        Object.defineProperty(window, "location", {
          value: {
            reload: reloadMock,
          },
          writable: true,
        });

        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        axios.get.mockResolvedValueOnce({ data: { total: 2 } });
        axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });
        
        render(<HomePage />);

        await waitFor(() => {
            expect(screen.getByText((content, element) => content.includes('Furniture'))).toBeInTheDocument();
        });
        expect(screen.getByText(/sofa/i)).toBeInTheDocument();
        
        fireEvent.click(screen.getByText(/furniture/i));
        expect(screen.getByRole('checkbox', { name: /furniture/i })).toBeChecked();
    
        fireEvent.click(screen.getByLabelText(/\$100 or more/i));
        expect(screen.getByRole('radio', { name: /\$100 or more/i })).toBeChecked();

        fireEvent.click(screen.getByText(/reset filters/i));

        await waitFor(() => {
            expect(reloadMock).toHaveBeenCalledTimes(1); 
        });

        jest.clearAllMocks();
        await waitFor(() => {
            cleanup();
        });
        axios.get.mockResolvedValueOnce({ data: { success: true, category: mockCategories } })
        axios.get.mockResolvedValueOnce({ data: { total: 2 } });
        axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

        render(<HomePage />);
        await waitFor(() => {
            expect(screen.getByText((content, element) => content.includes('Furniture'))).toBeInTheDocument();
        });
        expect(screen.getByText(/sofa/i)).toBeInTheDocument();
        expect(screen.getByText(/tv/i)).toBeInTheDocument();

        expect(screen.getByRole('checkbox', { name: /furniture/i })).not.toBeChecked();   
        expect(screen.getByRole('radio', { name: /\$100 or more/i })).not.toBeChecked();

    });
});