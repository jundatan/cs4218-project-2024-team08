import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { useCart } from '../../context/cart';
import { useSearch } from '../../context/search';
import {useCategory} from '../../hooks/useCategory';
import Orders from './Orders';
import '@testing-library/jest-dom/extend-expect';
import { act } from 'react-dom/test-utils';

// Mocking axios and context
jest.mock('axios');
jest.mock('../../context/auth');
jest.mock('../../context/cart');
jest.mock('../../context/search');
jest.mock('../../hooks/useCategory');

const mockCategories = [{ id: 1, name: 'Category 1' }];
axios.get.mockResolvedValueOnce({
  data: {
    category: mockCategories
  }
});


describe('Orders Component', () => {
    const mockSetAuth = jest.fn();
    const mockAuth = { token: 'mockToken' };

    beforeEach(() => {
        useAuth.mockReturnValue([mockAuth, mockSetAuth]);
        useCart.mockReturnValue([[], jest.fn()]); // Empty cart initially
        useSearch.mockReturnValue([{ query: '', results: [] }, jest.fn()]);
        
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders Orders component and displays title', () => {
        const { getByText } = render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        );

        expect(getByText('All Orders')).toBeInTheDocument();
    });

    it('fetches and displays orders successfully', async () => {

        const mockOrders = [
            {
                _id: '66f44a13b264f32a2d07a98c', 
                products: [
                    {
                        _id: 'product1',
                        name: 'Product 1',
                        description: 'Description for product 1',
                        price: 100,
                        quantity:10,
                    },
                ],
                payment: {
                    transaction: {}, // Adjust as necessary
                    success: true,
                },
                buyer: {
                    _id: '66f447a50b38990da528f25e', 
                    name: 'John Doe',
                },
                status: 'Not Process',
                createdAt: new Date('2024-09-25T17:36:19.492Z'),
                updatedAt: new Date('2024-09-25T17:36:19.492Z'),
                __v: 0,
            },
        ];
    
    axios.get.mockResolvedValueOnce({ data: mockOrders });

    await act(async () => {
        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        );
      });

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders');
    });

    expect(screen.getByText('All Orders')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Not Process')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Price : 100')).toBeInTheDocument();
});

    it('handles no orders case gracefully', async () => {
        axios.get.mockResolvedValueOnce({ data: [] });

        const { getByText } = render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        );

        // Wait for the orders to be fetched
        await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders'));

        // Check that no orders are displayed
        expect(getByText('All Orders')).toBeInTheDocument();
    });

    it('logs an error when fetching orders fails', async () => {
        console.log = jest.fn(); // Mock console.error to suppress output during the test

        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders'));

        expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    });

    it('Correctly displays the quantity', async () => {
        const mockOrders = [
            {
                _id: '66f44a13b264f32a2d07a98c', 
                products: [
                    {
                        _id: 'product1',
                        name: 'Product 1',
                        description: 'Description for product 1',
                        price: 100,
                        quantity:10,
                    },
                ],
                payment: {
                    transaction: {}, // Adjust as necessary
                    success: true,
                },
                buyer: {
                    _id: '66f447a50b38990da528f25e', 
                    name: 'John Doe',
                },
                status: 'Not Process',
                createdAt: new Date('2024-09-25T17:36:19.492Z'),
                updatedAt: new Date('2024-09-25T17:36:19.492Z'),
                __v: 0,
            },
        ];
    
    axios.get.mockResolvedValueOnce({ data: mockOrders });
    console.log('Mock Orders passed to axios:', mockOrders); 

    await act(async () => {
        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        );
      });

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders');
    });

    expect(screen.getByText('10')).toBeInTheDocument();

    });

    it('does not call getOrders when auth.token is not available', async () => {
        useAuth.mockReturnValue([{ token: undefined }, jest.fn()]);

        // Render the component without auth.token
        render(
            <MemoryRouter>
                <Orders /> {/* Pass the mockAuth prop if necessary */}
            </MemoryRouter>
        );

        // Ensure that getOrders is not called
        expect(axios.get).not.toHaveBeenCalled();
    });

    it('fetches and displays order with payment failure', async () => {

        const mockOrders = [
            {
                _id: '66f44a13b264f32a2d07a98c', 
                products: [
                    {
                        _id: 'product1',
                        name: 'Product 1',
                        description: 'Description for product 1',
                        price: 100,
                        quantity:10,
                    },
                ],
                payment: {
                    transaction: {}, // Adjust as necessary
                    success: false,
                },
                buyer: {
                    _id: '66f447a50b38990da528f25e', 
                    name: 'John Doe',
                },
                status: 'Not Process',
                createdAt: new Date('2024-09-25T17:36:19.492Z'),
                updatedAt: new Date('2024-09-25T17:36:19.492Z'),
                __v: 0,
            },
        ];
    
    axios.get.mockResolvedValueOnce({ data: mockOrders });

    await act(async () => {
        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        );
      });

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders');
    });

    expect(screen.getByText('Failed')).toBeInTheDocument();
});
});
