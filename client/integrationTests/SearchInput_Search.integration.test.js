import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import Search from '../src/pages/Search';
import SearchInput from '../src/components/Form/SearchInput';
import { SearchProvider } from '../src/context/search';

// Mock the axios module
jest.mock('axios');

// Corrected Mock for Layout component
jest.mock("../src/components/Layout", () => {
  const React = require('react');
  return function Layout({ children }) {
    return <div>{children}</div>;
  };
});

describe('SearchInput and Search integration test', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Given that product data exists', () => {
    describe('When the user submits a valid search query through SearchInput', () => {
      it('should display search results in Search if query matches a product', async () => {
        // Mock search results returned by the API
        const products = [
          { _id: '1', name: 'Product 1', description: 'Description 1', price: 100 },
          { _id: '2', name: 'Product 2', description: 'Description 2', price: 200 },
        ];

        // Mock the API call to return the products
        axios.get.mockResolvedValue({ data: products });

        // Render components inside MemoryRouter with routes and SearchProvider
        render(
          <MemoryRouter initialEntries={['/']}>
            <SearchProvider>
              <Routes>
                <Route path="/" element={<SearchInput />} />
                <Route path="/search" element={<Search />} />
              </Routes>
            </SearchProvider>
          </MemoryRouter>
        );

        // Simulate user typing a search query
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'Product' } });

        // Simulate form submission
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        // Wait for the 'Found 2' text to appear
        await waitFor(() => {
          expect(screen.getByText('Found 2')).toBeInTheDocument();
        });

        // Check that the search results are displayed
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
      });

      it('should display no search results in Search if query does not match a product', async () => {
        // Mock the API call to return no products
        axios.get.mockResolvedValue({ data: [] });

        // Render components inside MemoryRouter with routes and SearchProvider
        render(
          <MemoryRouter initialEntries={['/']}>
            <SearchProvider>
              <Routes>
                <Route path="/" element={<SearchInput />} />
                <Route path="/search" element={<Search />} />
              </Routes>
            </SearchProvider>
          </MemoryRouter>
        );

        // Simulate user typing a search query
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'chair' } });

        // Simulate form submission
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        // Wait for the 'No Products Found' text to appear
        await waitFor(() => {
          expect(screen.getByText('No Products Found')).toBeInTheDocument();
        });
      });

      it('should navigate to the Search page after submitting a search query', async () => {
        // Mock search results returned by the API
        const products = [
          { _id: '1', name: 'Product 1', description: 'Description 1', price: 100 },
        ];

        // Track the current location
        const LocationDisplay = () => {
          const location = useLocation();
          return <div data-testid="location-display">{location.pathname}</div>;
        };

        // Mock the API call to return the products
        axios.get.mockResolvedValue({ data: products });

        // Render components
        render(
          <MemoryRouter initialEntries={['/']}>
            <SearchProvider>
              <Routes>
                <Route path="/" element={<><SearchInput /><LocationDisplay /></>} />
                <Route path="/search" element={<><Search /><LocationDisplay /></>} />
              </Routes>
            </SearchProvider>
          </MemoryRouter>
        );

        // Simulate user typing a search query
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'Product 1' } });

        // Simulate form submission
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        // Wait for navigation to '/search'
        await waitFor(() => {
          expect(screen.getByTestId('location-display')).toHaveTextContent('/search');
        });

        // Check that the search result is displayed
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

    });
  });

});
