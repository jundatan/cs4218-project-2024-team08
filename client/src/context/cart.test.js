import React from "react";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "./cart.js";

beforeEach(() => {
    Storage.prototype.getItem = jest.fn();
    Storage.prototype.setItem = jest.fn();
    Storage.prototype.removeItem = jest.fn();
});

describe("Cart Context", () => {
    // it("should provide the initial cart value from localStorage", () => {
    //     const mockedCart = [{ id: 1, name: "Product 1", quantity: 1 }];
    //     localStorage.getItem.mockReturnValueOnce(JSON.stringify(mockedCart));

    //     const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

    //     const { result } = renderHook(() => useCart(), { wrapper });
    //     const [cart] = result.current;

    //     expect(cart).toEqual(mockedCart);
    // });

    it("should set a new cart item and update localStorage", () => {
        const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
        const { result } = renderHook(() => useCart(), { wrapper });
        const [cart, setCart] = result.current;
        const newItem = { id: 2, name: "Product 2", quantity: 2 };

        expect(cart).toEqual([]);

        act(() => {
            setCart([newItem]);
        });

        expect(result.current[0]).toEqual([newItem]);
        expect(localStorage.setItem).toHaveBeenCalledWith("cart", JSON.stringify([newItem]));
    });

    // it("should handle an empty cart in localStorage", () => {
    //     localStorage.getItem.mockReturnValueOnce(null);

    //     const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    //     const { result } = renderHook(() => useCart(), { wrapper });
    //     const [cart] = result.current;

    //     expect(cart).toEqual([]);
    // });

    it("should log errors occurred with localStorage", () => {
        localStorage.getItem.mockImplementation(() => {
            throw new Error("localStorage error");
        });

        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
        const { result } = renderHook(() => useCart(), { wrapper });
        const [cart] = result.current;

        expect(cart).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith("Failed to load cart from localStorage:", expect.any(Error));

        consoleSpy.mockRestore();
    });

    // it("should handle invalid JSON in localStorage", () => {
    //     localStorage.getItem.mockReturnValueOnce("invalid JSON");

    //     const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
    //     const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    //     const { result } = renderHook(() => useCart(), { wrapper });
    //     const [cart] = result.current;

    //     expect(cart).toEqual([]);
    //     expect(consoleSpy).toHaveBeenCalled();

    //     consoleSpy.mockRestore();
    // });
});
