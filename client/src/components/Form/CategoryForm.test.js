// CategoryForm.test.js
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import CategoryForm from "./CategoryForm";

describe("CategoryForm", () => {
    let handleSubmit;
    let setValue;
    let value;

    beforeEach(() => {
        handleSubmit = jest.fn();
        setValue = jest.fn();
        value = "";
    });

    it("should render correctly and initial value is empty", () => {
        const { getByRole, getByPlaceholderText } = render(
            <CategoryForm handleSubmit={handleSubmit} value={value} setValue={setValue} />
        );

        expect(getByPlaceholderText("Enter new category")).toBeInTheDocument();
        expect(getByPlaceholderText("Enter new category").value).toBe("");
        expect(getByRole("button", { name: /submit/i })).toBeInTheDocument();
    });

    it("should update input value on change", () => {
        const { getByPlaceholderText } = render(
            <CategoryForm handleSubmit={handleSubmit} value={value} setValue={setValue} />
        );

        fireEvent.change(getByPlaceholderText("Enter new category"), { target: { value: "Chairs" } });
        expect(getByPlaceholderText("Enter new category").value).toBe("Chairs");
    });

    it("should call handleSubmit on form submission", async () => {
        const { getByText, getByPlaceholderText } = render(
            <CategoryForm handleSubmit={handleSubmit} value={value} setValue={setValue} />
        );

        fireEvent.change(getByPlaceholderText("Enter new category"), { target: { value: "Chairs" } });
        await waitFor(() => fireEvent.click(getByText('Submit')));
        expect(handleSubmit).toHaveBeenCalled();
    });

    it("should handle errors with submission", async () => {
        handleSubmit.mockImplementation(() => {
            throw new Error("Submission error");
        });

        const { getByText, getByPlaceholderText } = render(
            <CategoryForm handleSubmit={handleSubmit} value={value} setValue={setValue} />
        );

        fireEvent.change(getByPlaceholderText("Enter new category"), { target: { value: "Chairs" } });
        await waitFor(() => fireEvent.click(getByText('Submit')));
        expect(handleSubmit).toHaveBeenCalled();
    });
});
