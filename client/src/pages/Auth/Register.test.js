/* eslint-disable testing-library/prefer-screen-queries */
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Register from "./Register";

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

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // it("renders register form", () => {
  //   const { getByText, getByPlaceholderText } = render(
  //     <MemoryRouter initialEntries={["/register"]}>
  //       <Routes>
  //         <Route path="/register" element={<Register />} />
  //       </Routes>
  //     </MemoryRouter>
  //   );

  //   const nameInput = getByPlaceholderText("Enter Your Name");
  //   const emailInput = getByPlaceholderText("Enter Your Email");
  //   const passwordInput = getByPlaceholderText("Enter Your Password");
  //   const phoneInput = getByPlaceholderText("Enter Your Phone");
  //   const addressInput = getByPlaceholderText("Enter Your Address");
  //   const dobInput = getByPlaceholderText("Enter Your DOB");
  //   const sportsInput = getByPlaceholderText("What is Your Favorite sports");

  //   expect(getByText("REGISTER FORM")).toBeInTheDocument();
  //   expect(nameInput).toBeInTheDocument();
  //   expect(emailInput).toBeInTheDocument();
  //   expect(passwordInput).toBeInTheDocument();
  //   expect(phoneInput).toBeInTheDocument();
  //   expect(addressInput).toBeInTheDocument();
  //   expect(dobInput).toBeInTheDocument();
  //   expect(sportsInput).toBeInTheDocument();
  // });

  // it("inputs should be initially empty", () => {
  //   const { getByText, getByPlaceholderText } = render(
  //     <MemoryRouter initialEntries={["/register"]}>
  //       <Routes>
  //         <Route path="/register" element={<Register />} />
  //       </Routes>
  //     </MemoryRouter>
  //   );

  //   const nameInput = getByPlaceholderText("Enter Your Name");
  //   const emailInput = getByPlaceholderText("Enter Your Email");
  //   const passwordInput = getByPlaceholderText("Enter Your Password");
  //   const phoneInput = getByPlaceholderText("Enter Your Phone");
  //   const addressInput = getByPlaceholderText("Enter Your Address");
  //   const dobInput = getByPlaceholderText("Enter Your DOB");
  //   const sportsInput = getByPlaceholderText("What is Your Favorite sports");

  //   expect(getByText("REGISTER FORM")).toBeInTheDocument();
  //   expect(nameInput.value).toBe("");
  //   expect(emailInput.value).toBe("");
  //   expect(passwordInput.value).toBe("");
  //   expect(phoneInput.value).toBe("");
  //   expect(addressInput.value).toBe("");
  //   expect(dobInput.value).toBe("");
  //   expect(sportsInput.value).toBe("");
  // });

  it("should register the user successfully", async () => {
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = getByPlaceholderText("Enter Your Name");
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");
    const phoneInput = getByPlaceholderText("Enter Your Phone");
    const addressInput = getByPlaceholderText("Enter Your Address");
    const dobInput = getByPlaceholderText("Enter Your DOB");
    const sportsInput = getByPlaceholderText("What is Your Favorite sports");

    fireEvent.change(nameInput, {
      target: { value: "John Doe" },
    });
    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "1234567890" },
    });
    fireEvent.change(addressInput, {
      target: { value: "123 Street" },
    });
    fireEvent.change(dobInput, {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(sportsInput, {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(
      "Register Successfully, please login"
    );
  });

  // it("should fail to register the user if an unknown error occurs", async () => {
  //   axios.post.mockResolvedValueOnce({ data: { success: false, message: "Unknown error" } });

  //   const { getByText, getByPlaceholderText } = render(
  //     <MemoryRouter initialEntries={["/register"]}>
  //       <Routes>
  //         <Route path="/register" element={<Register />} />
  //       </Routes>
  //     </MemoryRouter>
  //   );

  //   const nameInput = getByPlaceholderText("Enter Your Name");
  //   const emailInput = getByPlaceholderText("Enter Your Email");
  //   const passwordInput = getByPlaceholderText("Enter Your Password");
  //   const phoneInput = getByPlaceholderText("Enter Your Phone");
  //   const addressInput = getByPlaceholderText("Enter Your Address");
  //   const dobInput = getByPlaceholderText("Enter Your DOB");
  //   const sportsInput = getByPlaceholderText("What is Your Favorite sports");

  //   fireEvent.change(nameInput, {
  //     target: { value: "John Doe" },
  //   });
  //   fireEvent.change(emailInput, {
  //     target: { value: "test@example.com" },
  //   });
  //   fireEvent.change(passwordInput, {
  //     target: { value: "password123" },
  //   });
  //   fireEvent.change(phoneInput, {
  //     target: { value: "1234567890" },
  //   });
  //   fireEvent.change(addressInput, {
  //     target: { value: "123 Street" },
  //   });
  //   fireEvent.change(dobInput, {
  //     target: { value: "2000-01-01" },
  //   });
  //   fireEvent.change(sportsInput, {
  //     target: { value: "Football" },
  //   });

  //   fireEvent.click(getByText("REGISTER"));

  //   await waitFor(() => expect(axios.post).toHaveBeenCalled());
  //   expect(toast.error).toHaveBeenCalledWith(
  //     "Unknown error"
  //   );
  // });

  // it("should display error message on failed registration", async () => {
  //   axios.post.mockRejectedValueOnce({ message: "User already exists" });

  //   const { getByText, getByPlaceholderText } = render(
  //     <MemoryRouter initialEntries={["/register"]}>
  //       <Routes>
  //         <Route path="/register" element={<Register />} />
  //       </Routes>
  //     </MemoryRouter>
  //   );

  //   const nameInput = getByPlaceholderText("Enter Your Name");
  //   const emailInput = getByPlaceholderText("Enter Your Email");
  //   const passwordInput = getByPlaceholderText("Enter Your Password");
  //   const phoneInput = getByPlaceholderText("Enter Your Phone");
  //   const addressInput = getByPlaceholderText("Enter Your Address");
  //   const dobInput = getByPlaceholderText("Enter Your DOB");
  //   const sportsInput = getByPlaceholderText("What is Your Favorite sports");

  //   fireEvent.change(nameInput, {
  //     target: { value: "John Doe" },
  //   });
  //   fireEvent.change(emailInput, {
  //     target: { value: "test@example.com" },
  //   });
  //   fireEvent.change(passwordInput, {
  //     target: { value: "password123" },
  //   });
  //   fireEvent.change(phoneInput, {
  //     target: { value: "1234567890" },
  //   });
  //   fireEvent.change(addressInput, {
  //     target: { value: "123 Street" },
  //   });
  //   fireEvent.change(dobInput, {
  //     target: { value: "2000-01-01" },
  //   });
  //   fireEvent.change(sportsInput, {
  //     target: { value: "Football" },
  //   });

  //   fireEvent.click(getByText("REGISTER"));

  //   await waitFor(() => expect(axios.post).toHaveBeenCalled());
  //   expect(toast.error).toHaveBeenCalledWith("Something went wrong");
  // });

  it("should flag validation message(s) when all fields are empty", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = getByPlaceholderText("Enter Your Name");
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");
    const phoneInput = getByPlaceholderText("Enter Your Phone");
    const addressInput = getByPlaceholderText("Enter Your Address");
    const dobInput = getByPlaceholderText("Enter Your DOB");
    const sportsInput = getByPlaceholderText("What is Your Favorite sports");

    fireEvent.change(nameInput, {
      target: { value: "" },
    });
    fireEvent.change(emailInput, {
      target: { value: "" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "" },
    });
    fireEvent.change(addressInput, {
      target: { value: "" },
    });
    fireEvent.change(dobInput, {
      target: { value: "" },
    });
    fireEvent.change(sportsInput, {
      target: { value: "" },
    });

    fireEvent.click(getByText("REGISTER"));

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(phoneInput).toBeRequired();
    expect(addressInput).toBeRequired();
    expect(dobInput).toBeRequired();
    expect(sportsInput).toBeRequired();

    expect(nameInput.validationMessage).toBe("Constraints not satisfied");
    expect(emailInput.validationMessage).toBe("Constraints not satisfied");
    expect(passwordInput.validationMessage).toBe("Constraints not satisfied");
    expect(phoneInput.validationMessage).toBe("Constraints not satisfied");
    expect(addressInput.validationMessage).toBe("Constraints not satisfied");
    expect(dobInput.validationMessage).toBe("Constraints not satisfied");
    expect(sportsInput.validationMessage).toBe("Constraints not satisfied");
  });

  it("should flag validation message(s) when name, email are empty", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = getByPlaceholderText("Enter Your Name");
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");
    const phoneInput = getByPlaceholderText("Enter Your Phone");
    const addressInput = getByPlaceholderText("Enter Your Address");
    const dobInput = getByPlaceholderText("Enter Your DOB");
    const sportsInput = getByPlaceholderText("What is Your Favorite sports");

    fireEvent.change(nameInput, {
      target: { value: "" },
    });
    fireEvent.change(emailInput, {
      target: { value: "" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "1234567890" },
    });
    fireEvent.change(addressInput, {
      target: { value: "123 Street" },
    });
    fireEvent.change(dobInput, {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(sportsInput, {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();

    expect(nameInput.validationMessage).toBe("Constraints not satisfied");
    expect(emailInput.validationMessage).toBe("Constraints not satisfied");
    expect(passwordInput.validationMessage).toBe("");
    expect(phoneInput.validationMessage).toBe("");
    expect(addressInput.validationMessage).toBe("");
    expect(dobInput.validationMessage).toBe("");
    expect(sportsInput.validationMessage).toBe("");
  });

  it("should flag validation message(s) when name, password, phone are empty", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = getByPlaceholderText("Enter Your Name");
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");
    const phoneInput = getByPlaceholderText("Enter Your Phone");
    const addressInput = getByPlaceholderText("Enter Your Address");
    const dobInput = getByPlaceholderText("Enter Your DOB");
    const sportsInput = getByPlaceholderText("What is Your Favorite sports");

    fireEvent.change(nameInput, {
      target: { value: "" },
    });
    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "" },
    });
    fireEvent.change(addressInput, {
      target: { value: "123 Street" },
    });
    fireEvent.change(dobInput, {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(sportsInput, {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    expect(nameInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(phoneInput).toBeRequired();

    expect(nameInput.validationMessage).toBe("Constraints not satisfied");
    expect(emailInput.validationMessage).toBe("");
    expect(passwordInput.validationMessage).toBe("Constraints not satisfied");
    expect(phoneInput.validationMessage).toBe("Constraints not satisfied");
    expect(addressInput.validationMessage).toBe("");
    expect(dobInput.validationMessage).toBe("");
    expect(sportsInput.validationMessage).toBe("");
  });

  it("should flag validation message(s) when name, address, DOB, sports are empty", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = getByPlaceholderText("Enter Your Name");
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");
    const phoneInput = getByPlaceholderText("Enter Your Phone");
    const addressInput = getByPlaceholderText("Enter Your Address");
    const dobInput = getByPlaceholderText("Enter Your DOB");
    const sportsInput = getByPlaceholderText("What is Your Favorite sports");

    fireEvent.change(nameInput, {
      target: { value: "" },
    });
    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "1234567890" },
    });
    fireEvent.change(addressInput, {
      target: { value: "" },
    });
    fireEvent.change(dobInput, {
      target: { value: "" },
    });
    fireEvent.change(sportsInput, {
      target: { value: "" },
    });

    fireEvent.click(getByText("REGISTER"));

    expect(nameInput).toBeRequired();
    expect(addressInput).toBeRequired();
    expect(dobInput).toBeRequired();
    expect(sportsInput).toBeRequired();

    expect(nameInput.validationMessage).toBe("Constraints not satisfied");
    expect(emailInput.validationMessage).toBe("");
    expect(passwordInput.validationMessage).toBe("");
    expect(phoneInput.validationMessage).toBe("");
    expect(addressInput.validationMessage).toBe("Constraints not satisfied");
    expect(dobInput.validationMessage).toBe("Constraints not satisfied");
    expect(sportsInput.validationMessage).toBe("Constraints not satisfied");
  });

  it("should flag validation message(s) when email, password, address are empty", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = getByPlaceholderText("Enter Your Name");
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");
    const phoneInput = getByPlaceholderText("Enter Your Phone");
    const addressInput = getByPlaceholderText("Enter Your Address");
    const dobInput = getByPlaceholderText("Enter Your DOB");
    const sportsInput = getByPlaceholderText("What is Your Favorite sports");

    fireEvent.change(nameInput, {
      target: { value: "John Doe" },
    });
    fireEvent.change(emailInput, {
      target: { value: "" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "1234567890" },
    });
    fireEvent.change(addressInput, {
      target: { value: "" },
    });
    fireEvent.change(dobInput, {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(sportsInput, {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(addressInput).toBeRequired();

    expect(nameInput.validationMessage).toBe("");    
    expect(emailInput.validationMessage).toBe("Constraints not satisfied");
    expect(passwordInput.validationMessage).toBe("Constraints not satisfied");
    expect(phoneInput.validationMessage).toBe("");
    expect(addressInput.validationMessage).toBe("Constraints not satisfied");
    expect(dobInput.validationMessage).toBe("");
    expect(sportsInput.validationMessage).toBe("");
  });

  it("should flag validation message(s) when email, phone, DOB, sports are empty", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = getByPlaceholderText("Enter Your Name");
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");
    const phoneInput = getByPlaceholderText("Enter Your Phone");
    const addressInput = getByPlaceholderText("Enter Your Address");
    const dobInput = getByPlaceholderText("Enter Your DOB");
    const sportsInput = getByPlaceholderText("What is Your Favorite sports");

    fireEvent.change(nameInput, {
      target: { value: "John Doe" },
    });
    fireEvent.change(emailInput, {
      target: { value: "" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "" },
    });
    fireEvent.change(addressInput, {
      target: { value: "123 Street" },
    });
    fireEvent.change(dobInput, {
      target: { value: "" },
    });
    fireEvent.change(sportsInput, {
      target: { value: "" },
    });

    fireEvent.click(getByText("REGISTER"));

    expect(emailInput).toBeRequired();
    expect(phoneInput).toBeRequired();
    expect(dobInput).toBeRequired();
    expect(sportsInput).toBeRequired();

    expect(nameInput.validationMessage).toBe("");
    expect(emailInput.validationMessage).toBe("Constraints not satisfied");
    expect(passwordInput.validationMessage).toBe("");
    expect(phoneInput.validationMessage).toBe("Constraints not satisfied");
    expect(addressInput.validationMessage).toBe("");
    expect(dobInput.validationMessage).toBe("Constraints not satisfied");    
    expect(sportsInput.validationMessage).toBe("Constraints not satisfied");
  });

  it("should flag validation message(s) when password, DOB, sports are empty", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = getByPlaceholderText("Enter Your Name");
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");
    const phoneInput = getByPlaceholderText("Enter Your Phone");
    const addressInput = getByPlaceholderText("Enter Your Address");
    const dobInput = getByPlaceholderText("Enter Your DOB");
    const sportsInput = getByPlaceholderText("What is Your Favorite sports");

    fireEvent.change(nameInput, {
      target: { value: "John Doe" },
    });
    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "1234567890" },
    });
    fireEvent.change(addressInput, {
      target: { value: "123 Street" },
    });
    fireEvent.change(dobInput, {
      target: { value: "" },
    });
    fireEvent.change(sportsInput, {
      target: { value: "" },
    });

    fireEvent.click(getByText("REGISTER"));

    expect(passwordInput).toBeRequired();
    expect(dobInput).toBeRequired();
    expect(sportsInput).toBeRequired();

    expect(nameInput.validationMessage).toBe("");
    expect(emailInput.validationMessage).toBe("");
    expect(passwordInput.validationMessage).toBe("Constraints not satisfied");
    expect(phoneInput.validationMessage).toBe("");
    expect(addressInput.validationMessage).toBe("");
    expect(dobInput.validationMessage).toBe("Constraints not satisfied");
    expect(sportsInput.validationMessage).toBe("Constraints not satisfied");
  });

  it("should flag validation message(s) when phone, address are empty", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={["/register"]}>
        <Routes>
          <Route path="/register" element={<Register />} />
        </Routes>
      </MemoryRouter>
    );

    const nameInput = getByPlaceholderText("Enter Your Name");
    const emailInput = getByPlaceholderText("Enter Your Email");
    const passwordInput = getByPlaceholderText("Enter Your Password");
    const phoneInput = getByPlaceholderText("Enter Your Phone");
    const addressInput = getByPlaceholderText("Enter Your Address");
    const dobInput = getByPlaceholderText("Enter Your DOB");
    const sportsInput = getByPlaceholderText("What is Your Favorite sports");

    fireEvent.change(nameInput, {
      target: { value: "John Doe" },
    });
    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });
    fireEvent.change(passwordInput, {
      target: { value: "password123" },
    });
    fireEvent.change(phoneInput, {
      target: { value: "" },
    });
    fireEvent.change(addressInput, {
      target: { value: "" },
    });
    fireEvent.change(dobInput, {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(sportsInput, {
      target: { value: "Football" },
    });

    fireEvent.click(getByText("REGISTER"));

    expect(phoneInput).toBeRequired();
    expect(addressInput).toBeRequired();

    expect(nameInput.validationMessage).toBe("");
    expect(emailInput.validationMessage).toBe("");
    expect(passwordInput.validationMessage).toBe("");
    expect(phoneInput.validationMessage).toBe("Constraints not satisfied");
    expect(addressInput.validationMessage).toBe("Constraints not satisfied");
    expect(dobInput.validationMessage).toBe("");
    expect(sportsInput.validationMessage).toBe("");
  });
});
