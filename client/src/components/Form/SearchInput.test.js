import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import SearchInput from "./SearchInput";
import { useSearch } from "../../context/search";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Mock the useSearch and useNavigate hooks
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

jest.mock('axios');

describe("SearchInput Component", () => {
    let setValuesMock;
    let navigateMock;

    beforeEach(() => {
        setValuesMock = jest.fn();
        navigateMock = jest.fn();
        useSearch.mockReturnValue([{ keyword: "", results: [] }, setValuesMock]);
        useNavigate.mockReturnValue(navigateMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Given the user is on the search input field", () => {
        describe("When the user types into the search bar", () => {
            it("Then it should update the text in the search bar with the user's input", () => {
                render(<SearchInput />);
                const input = screen.getByLabelText(/search/i);
                fireEvent.change(input, { target: { value: 'chair' } });
                expect(setValuesMock).toHaveBeenCalledWith({ keyword: 'chair', results: [] });
            });
        });

        describe("When no input is given", () => {
            it("Then it should not update the text in the search bar", () => {
                render(<SearchInput />);
                const input = screen.getByLabelText(/search/i);
                fireEvent.change(input, { target: { value: '' } });
                expect(setValuesMock).not.toHaveBeenCalled();
            });
        });
    });

    describe("Given the form is ready for submission", () => {
        describe("When the form is submitted with valid input", () => {
            it("Then it should call the API, update results, and navigate to /search on success", async () => {
                useSearch.mockReturnValue([{ keyword: "chair", results: [] }, setValuesMock]);
                axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: "Chair" }] });

                render(<SearchInput />);
                await fireEvent.click(screen.getByRole("button", { name: /search/i }));

                expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/chair");
                expect(setValuesMock).toHaveBeenCalledWith({ keyword: "chair", results: [{ id: 1, name: "Chair" }] });
                expect(navigateMock).toHaveBeenCalledWith("/search");
            });
        });

        describe("When form submission fails due to an API error", () => {
            it("should not update results or navigate to /search", async () => {
                useSearch.mockReturnValue([{ keyword: "chair", results: [] }, setValuesMock]);
                axios.get.mockRejectedValueOnce(new Error("API failure"));

                render(<SearchInput />);
                await fireEvent.click(screen.getByRole("button", { name: /search/i }));

                expect(axios.get).toHaveBeenCalledWith("/api/v1/product/search/chair");
                expect(setValuesMock).not.toHaveBeenCalled(); // No state update on error
                expect(navigateMock).not.toHaveBeenCalled();
            });
        });

        describe("When the form is submitted with an empty keyword", () => {
            it("should not update results or navigate", async () => {
                useSearch.mockReturnValue([{ keyword: "", results: [] }, setValuesMock]);

                render(<SearchInput />);
                await fireEvent.click(screen.getByRole("button", { name: /search/i }));

                expect(setValuesMock).not.toHaveBeenCalled(); // No state update for empty keyword
                expect(navigateMock).not.toHaveBeenCalled(); // No navigation
            });
        });
    });
});
