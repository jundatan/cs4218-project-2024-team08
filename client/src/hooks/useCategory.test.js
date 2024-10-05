import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import useCategory from "./useCategory.js";

// Mocking axios.post
jest.mock("axios");

describe("useCategory", () => {
    describe("when categories are fetched successfully", () => {
        let mockedCategories;

        const { result } = renderHook(() => useCategory());
        expect(result.current).toEqual([]);

        beforeEach(() => {
            mockedCategories = [
                { id: 1, name: "Electronics", slug: "electronics" },
                { id: 2, name: "Clothing", slug: "clothing" },
            ];

            // Mock the axios.get call to return the mocked categories
            axios.get.mockResolvedValue({
                data: { category: mockedCategories },
            });
        });

        it('should return categories', async () => {
            const { result } = renderHook(() => useCategory());

            await waitFor(() => {
                expect(result.current).toEqual(mockedCategories);
            });
        });
    });

    describe("when the fetch request fails due to errors", () => {
        beforeEach(() => {
            axios.get.mockRejectedValue(new Error("Failed to fetch categories"));
        });

        it("should handle error", async () => {
            const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });

            const { result } = renderHook(() => useCategory());

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(new Error("Failed to fetch categories"));
            })

            consoleSpy.mockRestore();
        });
    });
});