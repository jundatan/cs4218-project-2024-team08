import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import SearchInput from '../src/components/Form/SearchInput';
import Search from '../src/pages/Search';
import ProductDetails from '../src/pages/ProductDetails';
import { SearchProvider } from '../src/context/search';

// Mock the axios module
jest.mock('axios');

// Mock the Layout component
jest.mock('../src/components/Layout', () => {
  const React = require('react');
  return function Layout({ children }) {
    return <div>{children}</div>;
  };
});

// Mock react-toastify for toast notifications
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
  },
}));

describe('Integration tests for SearchInput, Search, and ProductDetails components', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Given that product data exists', () => {
    describe('SearchInput and Search components', () => {
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

    describe('Search and ProductDetails components', () => {
      it('should navigate to ProductDetails when the More Details button of a product is clicked', async () => {
        // Mock search results returned by the API
        const products = [
          {
            _id: '1',
            name: 'Product 1',
            description: 'Description 1',
            price: 100,
            slug: 'product-1',
            category: { _id: 'cat1', name: 'Category 1' },
          },
        ];

        // Mock the API calls
        axios.get.mockImplementation((url) => {
          if (url.startsWith('/api/v1/product/search/')) {
            // Return search results
            return Promise.resolve({ data: products });
          } else if (url.startsWith('/api/v1/product/get-product/')) {
            // Extract slug from the URL
            const slug = url.split('/').pop();
            // Find the product with the matching slug
            const product = products.find((p) => p.slug === slug);
            return Promise.resolve({ data: { product } });
          } else if (url.startsWith('/api/v1/product/related-product/')) {
            // Return empty related products for simplicity
            return Promise.resolve({ data: { products: [] } });
          } else {
            return Promise.reject(new Error('Unknown API endpoint'));
          }
        });

        // Render components inside MemoryRouter with routes and SearchProvider
        render(
          <MemoryRouter initialEntries={['/']}>
            <SearchProvider>
              <Routes>
                <Route path="/" element={<SearchInput />} />
                <Route path="/search" element={<Search />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
              </Routes>
            </SearchProvider>
          </MemoryRouter>
        );

        // Simulate user typing a search query
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'Product' } });

        // Simulate form submission
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        // Wait for the search results to appear
        await waitFor(() => {
          expect(screen.getByText('Found 1')).toBeInTheDocument();
        });

        // Verify that the search results are displayed
        expect(screen.getByText('Product 1')).toBeInTheDocument();

        // Simulate clicking on 'More Details' button for 'Product 1'
        const moreDetailsButton = screen.getByRole('button', { name: /More Details/i });
        fireEvent.click(moreDetailsButton);

        // Wait for the product details page to render
        await waitFor(() => {
          expect(screen.getByText('Product Details')).toBeInTheDocument();
        });

        // Verify that the product details are displayed correctly
        expect(screen.getByText(/Product 1/i)).toBeInTheDocument();
        expect(screen.getByText(/Description 1/i)).toBeInTheDocument();
        expect(screen.getByText(/\$100\.00/i)).toBeInTheDocument();
        expect(screen.getByText(/Category 1/i)).toBeInTheDocument();
      });

      it('should add the product to the cart when the Add to Cart button is clicked', async () => {
        // Mock search results returned by the API
        const products = [
          {
            _id: '1',
            name: 'Product 1',
            description: 'Description 1',
            price: 100,
            slug: 'product-1',
            category: { _id: 'cat1', name: 'Category 1' },
          },
        ];

        // Mock the API calls
        axios.get.mockImplementation((url) => {
          if (url.startsWith('/api/v1/product/search/')) {
            // Return search results
            return Promise.resolve({ data: products });
          } else if (url.startsWith('/api/v1/product/get-product/')) {
            // Extract slug from the URL
            const slug = url.split('/').pop();
            // Find the product with the matching slug
            const product = products.find((p) => p.slug === slug);
            return Promise.resolve({ data: { product } });
          } else if (url.startsWith('/api/v1/product/related-product/')) {
            // Return empty related products for simplicity
            return Promise.resolve({ data: { products: [] } });
          } else {
            return Promise.reject(new Error('Unknown API endpoint'));
          }
        });

        // Mock localStorage getItem and setItem
        jest.spyOn(Storage.prototype, 'getItem').mockReturnValueOnce(JSON.stringify([]));
        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

        // Render components inside MemoryRouter with routes and SearchProvider
        render(
          <MemoryRouter initialEntries={['/']}>
            <SearchProvider>
              <Routes>
                <Route path="/" element={<SearchInput />} />
                <Route path="/search" element={<Search />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
              </Routes>
            </SearchProvider>
          </MemoryRouter>
        );

        // Simulate user typing a search query
        const input = screen.getByPlaceholderText(/search/i);
        fireEvent.change(input, { target: { value: 'Product' } });

        // Simulate form submission
        fireEvent.click(screen.getByRole('button', { name: /search/i }));

        // Wait for the search results to appear
        await waitFor(() => {
          expect(screen.getByText('Found 1')).toBeInTheDocument();
        });

        // Verify that the search results are displayed
        expect(screen.getByText('Product 1')).toBeInTheDocument();

        // Simulate clicking on 'More Details' button for 'Product 1'
        const moreDetailsButton = screen.getByRole('button', { name: /More Details/i });
        fireEvent.click(moreDetailsButton);

        // Wait for the product details page to render
        await waitFor(() => {
          expect(screen.getByText('Product Details')).toBeInTheDocument();
        });

        // Simulate clicking on 'ADD TO CART' button
        const addToCartButton = screen.getByRole('button', { name: /ADD TO CART/i });
        fireEvent.click(addToCartButton);

        await waitFor(() => {
          // Expect localStorage.setItem to have been called with the updated cart
          expect(setItemSpy).toHaveBeenCalledWith(
            'cart',
            JSON.stringify([products[0]]),
          );

          // Expect the toast notification to have been called
          expect(toast.success).toHaveBeenCalledWith('Item Added to cart');
        });

        // Clean up mocks
        setItemSpy.mockRestore();
      });
    });
  });
});
