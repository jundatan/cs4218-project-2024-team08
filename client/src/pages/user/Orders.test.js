import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import { useCart } from '../../context/cart';
import { useSearch } from '../../context/search';
import Orders from './Orders';
import '@testing-library/jest-dom/extend-expect';
import { act } from 'react-dom/test-utils';


jest.mock('axios');
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), 
  }));

  jest.mock("../../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]),
  }));

  jest.mock("../../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), 
  }));

const mockCategories = [{ id: 1, name: 'Category 1' }];



describe('Orders Component', () => {
    const mockSetAuth = jest.fn();
    const mockAuth = { token: 'mockToken' };

    beforeEach(() => {
        axios.get.mockResolvedValueOnce({
            data: {
              category: mockCategories
            }
          });
        useAuth.mockReturnValue([mockAuth, mockSetAuth]);
        useCart.mockReturnValue([[], jest.fn()]); 
        useSearch.mockReturnValue([{ query: '', results: [] }, jest.fn()]);
        
    });

    afterEach(() => {
        jest.clearAllMocks();
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
                    transaction: {},
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

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Buyer')).toBeInTheDocument();
    expect(screen.getByText('date')).toBeInTheDocument();
    expect(screen.getByText('Payment')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
});
    it('logs an error when fetching orders fails', async () => {
        console.log = jest.fn(); 

        axios.get.mockRejectedValueOnce(new Error('Network Error'));

        render(
            <MemoryRouter>
                <Orders />
            </MemoryRouter>
        );

        await waitFor(() => expect(axios.get).toHaveBeenCalledWith('/api/v1/auth/orders'));

        expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    });

    it('displays orders accurately', async () => {
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
                    transaction: {},
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

    expect(screen.getByText('Not Process')).toBeInTheDocument(); // Status
    expect(screen.getByText('John Doe')).toBeInTheDocument();// Buyer Name
    expect(screen.getByText('Price : 100')).toBeInTheDocument();// Price
    expect(screen.getByText('Success')).toBeInTheDocument(); // Payment Status
    expect(screen.getByText('Product 1')).toBeInTheDocument(); // Product Name
    expect(screen.getByText('Description for product 1')).toBeInTheDocument(); // Description
    expect(screen.getByText('10')).toBeInTheDocument(); // Quantity
    });

    it('does not call getOrders when auth.token is not available', async () => {
        useAuth.mockReturnValue([{ token: undefined }, jest.fn()]);

        render(
            <MemoryRouter>
                <Orders /> 
            </MemoryRouter>
        );

        expect(axios.get).not.toHaveBeenCalledWith('/api/v1/auth/orders');
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
                    transaction: {}, 
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
