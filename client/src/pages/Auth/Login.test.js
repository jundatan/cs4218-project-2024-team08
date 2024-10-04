/* eslint-disable testing-library/prefer-screen-queries */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Login from "./Login";

// Mocking axios.post
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(() => mockedNavigate), // Mock the useNavigate hook
}));

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
      addListener: function () {},
      removeListener: function () {},
    };
  };

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // it("renders login form", () => {
  //   const { getByText, getByPlaceholderText } = render(
  //     <MemoryRouter initialEntries={["/login"]}>
  //       <Routes>
  //         <Route path="/login" element={<Login />} />
  //       </Routes>
  //     </MemoryRouter>
  //   );

  //   const emailInput = getByPlaceholderText("Enter Your Email");
  //   const passwordInput = getByPlaceholderText("Enter Your Password");

  //   expect(getByText("LOGIN FORM")).toBeInTheDocument();
  //   expect(emailInput).toBeInTheDocument();
  //   expect(passwordInput).toBeInTheDocument();
  // });

  // it("inputs should be initially empty", () => {
  //   const { getByText, getByPlaceholderText } = render(
  //     <MemoryRouter initialEntries={["/login"]}>
  //       <Routes>
  //         <Route path="/login" element={<Login />} />
  //       </Routes>
  //     </MemoryRouter>
  //   );
  //   const emailInput = getByPlaceholderText("Enter Your Email");
  //   const passwordInput = getByPlaceholderText("Enter Your Password");

  //   expect(getByText("LOGIN FORM")).toBeInTheDocument();
  //   expect(emailInput.value).toBe("");
  //   expect(passwordInput.value).toBe("");
  // });

  it("should login the user successfully", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        success: true,
        user: { id: 1, name: "John Doe", email: "test@example.com" },
        token: "mockToken",
      },
    });

    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(getByText("LOGIN"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(undefined, {
      duration: 5000,
      icon: "🙏",
      style: {
        background: "green",
        color: "white",
      },
    });
  });

  // it("should display error message on failed login due to unknown error", async () => {
  //   axios.post.mockResolvedValueOnce({
  //     data: {
  //       success: false,
  //       message: "Unknown Error",
  //     },
  //   });

  //   const { getByPlaceholderText, getByText } = render(
  //     <MemoryRouter initialEntries={["/login"]}>
  //       <Routes>
  //         <Route path="/login" element={<Login />} />
  //       </Routes>
  //     </MemoryRouter>
  //   );
  //   const emailInput = getByPlaceholderText("Enter Your Email");
  //   const passwordInput = getByPlaceholderText("Enter Your Password");

  //   fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  //   fireEvent.change(passwordInput, { target: { value: "password123" } });
  //   fireEvent.click(getByText("LOGIN"));

  //   await waitFor(() => expect(axios.post).toHaveBeenCalled());
  //   expect(toast.error).toHaveBeenCalledWith("Unknown Error");
  // });

  // it("should display error message on failed login due to invalid credentials", async () => {
  //   axios.post.mockRejectedValueOnce({ message: "Invalid credentials" });

  //   const { getByPlaceholderText, getByText } = render(
  //     <MemoryRouter initialEntries={["/login"]}>
  //       <Routes>
  //         <Route path="/login" element={<Login />} />
  //       </Routes>
  //     </MemoryRouter>
  //   );
  //   const emailInput = getByPlaceholderText("Enter Your Email");
  //   const passwordInput = getByPlaceholderText("Enter Your Password");

  //   fireEvent.change(emailInput, { target: { value: "test@example.com" } });
  //   fireEvent.change(passwordInput, { target: { value: "password123" } });
  //   fireEvent.click(getByText("LOGIN"));

  //   await waitFor(() => expect(axios.post).toHaveBeenCalled());
  //   expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  // });

  it("should flag a validation message when email is empty", () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");

    fireEvent.change(emailInput, { target: { value: "" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(getByText("LOGIN"));

    expect(emailInput).toBeRequired();
    expect(emailInput.validationMessage).toBe("Constraints not satisfied");
    expect(passwordInput.validationMessage).toBe("");
  });

  it("should flag a validation message when password is empty", () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "" } });
    fireEvent.click(getByText("LOGIN"));

    expect(passwordInput).toBeRequired();
    expect(emailInput.validationMessage).toBe("");
    expect(passwordInput.validationMessage).toBe("Constraints not satisfied");
  });

  // it("should flag validation messages when both email and password is empty", () => {
  //   const { getByPlaceholderText, getByText } = render(
  //     <MemoryRouter initialEntries={["/login"]}>
  //       <Routes>
  //         <Route path="/login" element={<Login />} />
  //       </Routes>
  //     </MemoryRouter>
  //   );

  //   const emailInput = getByPlaceholderText("Enter Your Email");
  //   const passwordInput = getByPlaceholderText("Enter Your Password");

  //   fireEvent.change(emailInput, { target: { value: "" } });
  //   fireEvent.change(passwordInput, { target: { value: "" } });
  //   fireEvent.click(getByText("LOGIN"));

  //   expect(emailInput).toBeRequired();
  //   expect(passwordInput).toBeRequired();
  //   expect(emailInput.validationMessage).toBe("Constraints not satisfied");
  //   expect(passwordInput.validationMessage).toBe("Constraints not satisfied");
  // });

  it("should flag validation messages when email is in invalid format", () => {
    const { getByPlaceholderText, getByText } = render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );

    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");

    fireEvent.change(emailInput, { target: { value: "test" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(getByText("LOGIN"));

    expect(emailInput.validationMessage).toBe("Constraints not satisfied");
  });

  // it("should redirect to forgot password form when clicked", () => {
  //   const { getByText } = render(
  //     <MemoryRouter initialEntries={["/login"]}>
  //       <Routes>
  //         <Route path="/login" element={<Login />} />
  //       </Routes>
  //     </MemoryRouter>
  //   );
  //   fireEvent.click(getByText("Forgot Password"));
  //   expect(useNavigate()).toHaveBeenCalledWith('/forgot-password');
  // });
});
