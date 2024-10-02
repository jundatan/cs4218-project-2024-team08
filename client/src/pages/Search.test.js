import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import Search from "./Search";
import { useSearch } from "../context/search";
import { useNavigate } from "react-router-dom";

// Mock the useSearch hook
jest.mock('../context/search', () => ({
    useSearch: jest.fn(),
}));

// Mock the useNavigate hook from react-router-dom
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

// Mock Layout component
jest.mock("./../components/Layout", () => ({ children }) => <div>{children}</div>);

// Mock success toast
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
    },
}));

// Mock localStorage
Storage.prototype.setItem = jest.fn(); // Properly mock setItem
jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null); // Return null for an empty cart

// Mock product data of length 1
const mockProduct = {
    _id: "1",
    name: "Product 1",
    description: "Product description",
    price: 29.99,
    slug: "Product-1"
};

const mockProductResultGenerator = (length) => {
    return Array.from({ length }, (_, i) => ({
        _id: i.toString(),
        name: `Product ${i}`,
        description: `Description For Product ${i}`,
        price: (i + 1) * 10,
        slug: `Product-${i}`
    }));
};

describe("Search component", () => {

    describe("When searching for a product", () => {
        describe("Given 0 products are found", () => {
            it("should display 'No Products Found'", () => {
                useSearch.mockReturnValue([{ results: [] }, jest.fn()]);
                render(<Search />);
                expect(screen.getByText("No Products Found")).toBeInTheDocument();
            });
        });

        describe("Given 3 products are found", () => {
            it("should display 'Found 3' and render all products", () => {
                useSearch.mockReturnValue([{
                    results: mockProductResultGenerator(3)
                }, jest.fn()]);
                render(<Search />);
                expect(screen.getByText("Found 3")).toBeInTheDocument();
                expect(screen.getAllByRole("img")).toHaveLength(3); // 3 images for 3 products
                expect(screen.getAllByRole("button", { name: /More Details/i })).toHaveLength(3);
                expect(screen.getAllByRole("button", { name: /ADD TO CART/i })).toHaveLength(3);
            });
        });
    });

    describe("When given product data", () => {
        describe("Given all product data is present", () => {
            it("should display the product with all details", () => {
                useSearch.mockReturnValue([{
                    results: [{
                        _id: "1",
                        name: "Product 1",
                        description: "Short description",
                        price: 29.99
                    }]
                }, jest.fn()]);
                render(<Search />);
                expect(screen.getByText("Found 1")).toBeInTheDocument();
                expect(screen.getByAltText("Product 1")).toBeInTheDocument();
                expect(screen.getByText("Short description...")).toBeInTheDocument();
                expect(screen.getByText("$ 29.99")).toBeInTheDocument();
                expect(screen.getByRole("button", { name: /More Details/i })).toBeInTheDocument();
                expect(screen.getByRole("button", { name: /ADD TO CART/i })).toBeInTheDocument();
            });
        });

        describe("Given a product is missing an image", () => {
            it("should display alt text in place of the image", () => {
                useSearch.mockReturnValue([{
                    results: [{
                        _id: "3",
                        name: "Product 3",
                        description: "Product description",
                        price: 49.99
                    }]
                }, jest.fn()]);
                render(<Search />);
                const imgElement = screen.getByAltText("Product 3");
                fireEvent.error(imgElement);
                expect(screen.getByAltText("Product 3")).toBeInTheDocument(); // Ensure alt text is displayed
            });
        });

        describe("Given a product is missing a description", () => {
            it("should display an empty description field", () => {
                useSearch.mockReturnValue([{
                    results: [{
                        _id: "3",
                        name: "Product 3",
                        description: "",
                        price: 49.99
                    }]
                }, jest.fn()]);
                render(<Search />);
                expect(screen.getByText("Found 1")).toBeInTheDocument();
                expect(screen.getByAltText("Product 3")).toBeInTheDocument();
                expect(screen.queryByText("Short description")).not.toBeInTheDocument(); // No description shown
                expect(screen.getByText("$ 49.99")).toBeInTheDocument();
            });
        });

        describe("Given the description is long (>= 30 characters)", () => {
            it("should truncate the description", () => {
                const longMockDescription = "This is a very long description that will be truncated.";
                useSearch.mockReturnValue([{
                    results: [{
                        _id: "4",
                        name: "Product 4",
                        description: longMockDescription,
                        price: 59.99
                    }]
                }, jest.fn()]);
                render(<Search />);
                expect(screen.getByText("Found 1")).toBeInTheDocument();
                expect(screen.getByAltText("Product 4")).toBeInTheDocument();
                expect(screen.getByText(`${longMockDescription.substring(0, 30)}...`)).toBeInTheDocument(); // Verify truncation
                expect(screen.getByText("$ 59.99")).toBeInTheDocument();
            });
        });

        describe("Given a product is missing a price", () => {
            it("should not display the price", () => {
                useSearch.mockReturnValue([{
                    results: [{
                        _id: "3",
                        name: "Product 3",
                        description: "Product description",
                        price: ""
                    }]
                }, jest.fn()]);
                render(<Search />);
                expect(screen.getByText("Found 1")).toBeInTheDocument();
                expect(screen.getByAltText("Product 3")).toBeInTheDocument();
                expect(screen.getByText("Product description...")).toBeInTheDocument();
                expect(screen.queryByText(/\$\d+/)).not.toBeInTheDocument(); // No price shown
            });
        });
    });

    describe("When clicking on buttons", () => {
        describe("Given the 'More Details' button is clicked", () => {
            it("should navigate the user to the product page", () => {
                useSearch.mockReturnValue([{
                    results: [mockProduct]
                }, jest.fn()]);
                render(<Search />);
                const moreDetailsButton = screen.getByRole("button", { name: /More Details/i });
                fireEvent.click(moreDetailsButton);
                expect(useNavigate).toHaveBeenCalledWith(`/product/${mockProduct.slug}`); // Expecting the correct product ID
            });
        });

        describe("Given the 'Add to Cart' button is clicked", () => {
            it("should add the respective item to the cart", () => {
                // Mock useSearch to return a product
                useSearch.mockReturnValue([{
                    results: [mockProduct]
                }, jest.fn()]);
                
                render(<Search />);
            
                jest.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce(JSON.stringify([]));
            
                const addToCartButton = screen.getByRole("button", { name: /ADD TO CART/i });
                fireEvent.click(addToCartButton);
                
                // Expecting the cart to contain the clicked product
                expect(localStorage.setItem).toHaveBeenCalledWith(
                    "cart",
                    JSON.stringify([mockProduct]),
                );
                
                expect(JSON.parse(localStorage.getItem("cart"))).toEqual([mockProduct]); // Expecting the correct product to be in the cart
                expect(toast.success).toHaveBeenCalledWith("Item Added to cart"); // Expecting a success toast
            });
        });
    });
});
