import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import CategoryProduct from "./CategoryProduct.js";
import "@testing-library/jest-dom/extend-expect";

// Mock dependencies
jest.mock("axios");
jest.mock("../components/Header.js", () => <div>Mocked Header</div>);
jest.mock("../components/Layout.js", () => ({ children }) => <div>{children}</div>);
jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("react-router-dom", () => ({
    __esModule: true,
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
    useParams: jest.fn(),
}));

describe("Category Product", () => {
    beforeEach(() => {
        useParams.mockReturnValue({ slug: "electronics" });
        useNavigate.mockReturnValue(jest.fn());
    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    // it("should render loading state correctly", () => {
    //     render(<CategoryProduct />);

    //     expect(screen.getByText(/Category -/i)).toBeInTheDocument();
    //     expect(screen.getByText("0 result found")).toBeInTheDocument();
    // });

    it("should fetch and display product if it is working", async () => {
        render(<CategoryProduct />);

        expect(screen.getByText(/Category -/i)).toBeInTheDocument();
        expect(screen.getByText("0 result found")).toBeInTheDocument();

        axios.get.mockResolvedValue({
            data: {
                products: [
                    {
                        _id: "1",
                        name: "Chair",
                        price: 99,
                        description: "This is an armchair that feels good to sit on, made from Italy.",
                        slug: "chair"
                    },
                ],
                category: { name: "Furniture" },
            },
        });

        render(<CategoryProduct />);

        await waitFor(() => {
            expect(screen.getByText("Category - Furniture")).toBeInTheDocument();
        });

        expect(screen.getByText("1 result found")).toBeInTheDocument();
        expect(screen.getByText("Chair")).toBeInTheDocument();
        expect(screen.getByText("$99.00")).toBeInTheDocument();
        expect(screen.getByText(/This is an armchair that feels good to sit on/i)).toBeInTheDocument();
        expect(screen.getByText(/made from Ita\.\.\.$/i)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: "Chair" })).toBeInTheDocument();
        expect(screen.getByRole('img', { name: "Chair" })).toHaveAttribute('src', '/api/v1/product/product-photo/1');
        expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-category/electronics");
    });

    it("should navigate when 'More Details' button is clicked", async () => {
        const mockNavigate = jest.fn();
        useNavigate.mockReturnValue(mockNavigate);

        axios.get.mockResolvedValue({
            data: {
                products: [
                    {
                        _id: "1",
                        name: "Chair",
                        price: 99,
                        description: "This is an armchair that feels good to sit on, made from Italy.",
                        slug: "chair"
                    },
                ],
                category: { name: "Furniture" },
            },
        });

        render(<CategoryProduct />);

        await waitFor(() => {
            expect(screen.getByRole("button", { name: /more details/i })).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button", { name: /more details/i }));
        expect(mockNavigate).toHaveBeenCalledWith(`/product/chair`);
    });

    it("should handles API errors gracefully", async () => {
        axios.get.mockRejectedValue(new Error("Network Error"));

        render(<CategoryProduct />);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalled();
        });

        expect(screen.queryByText("Chair")).not.toBeInTheDocument();
        expect(screen.getByText(/0 result found/i)).toBeInTheDocument();
    });
});