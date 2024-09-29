import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";
import "@testing-library/jest-dom/extend-expect";
import Layout from "../components/Layout";

// Mock the dependencies
jest.mock("../hooks/useCategory");
jest.mock("../components/Layout", () => ({ children, title }) => (
    <div>
        <h1>{title}</h1>
        {children}
    </div>
));

describe("Categories Component", () => {
    it("should render categories", async () => {
        const mockCategories = [
            { _id: 1, name: "Electronics", slug: "electronics" },
            { _id: 2, name: "Clothing", slug: "clothing" },
        ];
        useCategory.mockReturnValue(mockCategories);

        render(
            <Router>
                <Categories />
            </Router>
        );

        expect(screen.getByText("Electronics")).toBeInTheDocument();
        expect(screen.getByText("Clothing")).toBeInTheDocument();
    });

    it("should display an error message when categories fail to load", async () => {
        useCategory.mockReturnValue([]);

        render(
            <Router>
                <Categories />
            </Router>
        );

        expect(screen.getByText("Failed to load categories")).toBeInTheDocument();
    });
});
