import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import ProductDetails from "./ProductDetails";

jest.mock("axios");

jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
    useParams: jest.fn(),
}));

// Mock Layout component
jest.mock("./../components/Layout", () => ({ children }) => <div>{children}</div>);

describe("ProductDetails Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Given an empty product slug", () => {
        it("should redirect to an error page", async () => {
            // Mock the params that would be passed via the URL
            useParams.mockReturnValue({ slug: "" });

            render(<ProductDetails />);
            await waitFor(() => {
                expect(useNavigate).toHaveBeenCalledWith(); // Redirect to the error page
            });
        });
    });

    describe("Given a valid product slug", () => {
        describe("When the product details are successfully retrieved from the backend", () => {
            it("should display the product details", async () => {
                const mockProduct = {
                    _id: "1",
                    name: "Product 1",
                    description: "A great product",
                    price: 29.99,
                    category: { name: "Category 1" },
                };

                // Mock the params that would be passed via the URL
                useParams.mockReturnValue({ slug: "product-1" });

                // Mock the axios get request to return the mock product data
                axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });

                render(<ProductDetails />);

                // Ensure the product data is rendered
                await waitFor(() => {
                    expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product/product-1");

                    expect(screen.getByText(/Product 1/i)).toBeInTheDocument();
                    expect(screen.getByText(/A great product/i)).toBeInTheDocument();
                    expect(screen.getByText(/\$29.99/i)).toBeInTheDocument();
                    expect(screen.getByText(/Category 1/i)).toBeInTheDocument();
                });
            });

            it("should display the related products", async () => {
                const mockProduct = {
                    _id: "1",
                    name: "Product 1",
                    description: "A great product",
                    price: 29.99,
                    category: {
                        _id: "1", 
                        name: "Category 1", 
                    },
                };
            
                const mockRelatedProducts = [
                    {
                         _id: "2", 
                         name: "Product 2", 
                         price: 19.99,
                         description: "Other great product",
                    },
                    { 
                        _id: "3", 
                        name: "Product 3", 
                        price: 39.99,
                        description: "Yet another great product",
                    },
                ];
            
                // Mock the params that would be passed via the URL
                useParams.mockReturnValue({ slug: "product-1" });
                axios.get
                    .mockResolvedValueOnce({ data: { product: mockProduct } })
                    .mockResolvedValueOnce({ data: { products: mockRelatedProducts } });
            
                render(<ProductDetails />);
            
                // Ensure the related products are rendered
                await waitFor(() => {
                    expect(axios.get).toHaveBeenNthCalledWith(1, "/api/v1/product/get-product/product-1");
                    expect(axios.get).toHaveBeenNthCalledWith(2, "/api/v1/product/related-product/1/1");
            
                    expect(screen.getByText(/Product 2/i)).toBeInTheDocument();
                    expect(screen.getAllByText(/Other great product/i)[0]).toBeInTheDocument(); // Use getAllByText for multiple matches
                    expect(screen.getByText(/\$19.99/i)).toBeInTheDocument();
            
                    expect(screen.getByText(/Product 3/i)).toBeInTheDocument();
                    expect(screen.getAllByText(/Yet another great product/i)[0]).toBeInTheDocument(); // Use getAllByText for multiple matches
                    expect(screen.getByText(/\$39.99/i)).toBeInTheDocument();
                });
            });
        });

        describe("When the product is not found in the backend", () => {
            it("should log the error message", async () => {
                // Mock error
                const err = new Error("Product not found");
                const logSpy = jest.spyOn(console, "log");

                useParams.mockReturnValue({ slug: "product-1" });
                axios.get.mockRejectedValueOnce(err);

                render(<ProductDetails />);

                // Ensure that the API is called, and the error is logged
                await waitFor(() => {
                    expect(axios.get).toHaveBeenCalledWith("/api/v1/product/get-product/product-1");
                    expect(logSpy).toHaveBeenCalledWith(err);
                });
            });
        });
    });
});
