import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import Contact from "./Contact";
import Layout from "./../components/Layout";

// Mocking the Layout component
jest.mock("./../components/Layout", () => ({ children, title }) => (
  <div>
    <h1>{title}</h1>
    {children}
  </div>
));

describe("Contact Component", () => {
  
  beforeEach(() => {
    render(<Contact />);
  });

  describe("Given the Contact component is rendered", () => {
    
    describe("When the layout is rendered", () => {
      it("should display the correct title", () => {
        expect(screen.getByText("Contact us")).toBeInTheDocument();
      });
    });

    describe("When the contact information is displayed", () => {

      it("should display the correct heading", () => {
        expect(screen.getByRole("heading", { name: "CONTACT US" })).toBeInTheDocument();
      });

      it("should display the correct contact details", () => {
        expect(screen.getByText(/www.help@ecommerceapp.com/i)).toBeInTheDocument();
        expect(screen.getByText(/012-3456789/i)).toBeInTheDocument();
        expect(screen.getByText(/1800-0000-0000/i)).toBeInTheDocument();
      });

      it("should display the correct description", () => {
        expect(screen.getByText(/For any query or info about product, feel free to call anytime/i)).toBeInTheDocument();
      });
    });

    describe("When the contact image is rendered", () => {
      it("should display the image with the correct alt text and source", () => {
        const imgElement = screen.getByAltText("contactus");
        expect(imgElement).toBeInTheDocument();
        expect(imgElement).toHaveAttribute("src", "/images/contactus.jpeg");
      });
    });
  });
});
