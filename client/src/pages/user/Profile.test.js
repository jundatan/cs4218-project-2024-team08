import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/auth';
import { useCart } from '../../context/cart';
import { useSearch } from '../../context/search';
import {useCategory} from '../../hooks/useCategory';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
jest.mock('axios');
jest.mock('react-hot-toast');
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

describe('Profile Component', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123456789',
    address: '123 Street',
  };

  const mockSetAuth = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue([{ user: mockUser }, mockSetAuth]);
    useCart.mockReturnValue([[], jest.fn()]); // Empty cart initially
    useSearch.mockReturnValue([{ query: '', results: [] }, jest.fn()]);
    localStorage.setItem('auth', JSON.stringify({ user: mockUser }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the profile form with initial data', () => {
    render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
        );

    expect(screen.getByPlaceholderText('Enter Your Name').value).toBe(mockUser.name);
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeDisabled();
    expect(screen.getByPlaceholderText('Enter Your Phone').value).toBe(mockUser.phone);
    expect(screen.getByPlaceholderText('Enter Your Address').value).toBe(mockUser.address);
  });

  test('updates the profile successfully with all fields filled correctly', async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: 'Jane Doe',
          email: 'john.doe@example.com',
          phone: '987654321',
          address: '321 Avenue',
          password: 'newPassword',
        },
      },
    });

    render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
        );

    // Simulate changing form inputs
    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
      target: { value: '987654321' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), {
      target: { value: '321 Avenue' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
      target: { value: 'newPassword' },
    });

    // Simulate form submission
    fireEvent.click(screen.getByText('UPDATE'));

    // Wait for the axios PUT request to resolve
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'Jane Doe',
        email: 'john.doe@example.com',
        password: 'newPassword',
        phone: '987654321',
        address: '321 Avenue',
      });
    });


    // Expect toast success to have been called
    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');

    // Expect the auth context to have been updated
    expect(mockSetAuth).toHaveBeenCalledWith({
      user: {
        name: 'Jane Doe',
        email: 'john.doe@example.com',
        phone: '987654321',
        address: '321 Avenue',
        password: 'newPassword',
      },
    });

    // Expect localStorage to have been updated
    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe('Jane Doe');
    expect(ls.user.phone).toBe('987654321');
    expect(ls.user.password).toBe('newPassword');
    expect(ls.user.address).toBe('321 Avenue');
  });

  test('allows successful profile update when only the name is changed', async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: 'Jone Doe',
          email: 'john.doe@example.com',
          phone: '123456789',
          address: '123 Street',
        },
      },
    });

    render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
        );

    // Simulate changing form inputs
    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: 'Jone Doe' },
    });

    // Simulate form submission
    fireEvent.click(screen.getByText('UPDATE'));

    // Wait for the axios PUT request to resolve
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'Jone Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        address: '123 Street',
        password: '',
      });
    });


    // Expect toast success to have been called
    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');

    // Expect the auth context to have been updated
    expect(mockSetAuth).toHaveBeenCalledWith({
      user: {
        name: 'Jone Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        address: '123 Street',
      },
    });

    // Expect localStorage to have been updated
    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe('Jone Doe');
    expect(ls.user.phone).toBe('123456789');
    expect(ls.user.address).toBe('123 Street');
  });

  test('prevents profile update and shows error when password is shorter than 6 characters', async () => {
    // Mock the axios PUT request to return an error due to short password
    axios.put.mockResolvedValue({
      data: {
        error: 'Password is required and must be 6 characters long',
      },
    });
  
    // Render the Profile component
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
  
    // Simulate changing the password input to a value less than 6 characters
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
      target: { value: '1231' }, // Password less than 6 characters
    });
  
    // Simulate form submission
    fireEvent.click(screen.getByText('UPDATE'));
  
    // Wait for the axios PUT request to resolve and expect it to have been called
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123456789',
        address: '123 Street',
        password: '1231',
      });
    });
  
    // Expect an error toast to have been shown due to short password
    expect(toast.error).toHaveBeenCalledWith('Password is required and must be 6 characters long');
  
    // Ensure no auth update occurs because the update failed
    expect(mockSetAuth).not.toHaveBeenCalled();
  
    // Expect localStorage to remain unchanged as update failed
    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe('John Doe');
    expect(ls.user.phone).toBe('123456789');
    expect(ls.user.address).toBe('123 Street');
    expect(ls.user.password).not.toBe('1231'); // Password should remain unchanged
  });

  test('allows successful profile update when only the phone number is changed', async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '1234',
          address: '123 Street',
        },
      },
    });

    render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
        );

    // Simulate changing form inputs
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
      target: { value: '1234' },
    });

    // Simulate form submission
    fireEvent.click(screen.getByText('UPDATE'));

    // Wait for the axios PUT request to resolve
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234',
        address: '123 Street',
        password: '',
      });
    });


    // Expect toast success to have been called
    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');

    // Expect the auth context to have been updated
    expect(mockSetAuth).toHaveBeenCalledWith({
      user: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '1234',
        address: '123 Street',
      },
    });

    // Expect localStorage to have been updated
    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe('John Doe');
    expect(ls.user.phone).toBe('1234');
    expect(ls.user.address).toBe('123 Street');
  });

  test('updates the profile successfully even when the phone number is missing', async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: 'Jane Doe',
          email: 'john.doe@example.com',
          phone: mockUser.phone,  // fallback phone value
          address: '321 Avenue',
        },
      },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    // Simulate changing form inputs with empty phone field
    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: 'Jane Doe' },
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
        target: { value: '' },
    });
    
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), {
      target: { value: '321 Avenue' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
        target: { value: 'newPassword' },
    });

    // Simulate form submission
    fireEvent.click(screen.getByText('UPDATE'));

    // Wait for the axios PUT request to resolve
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'Jane Doe',
        email: 'john.doe@example.com',
        phone: '', 
        address: '321 Avenue',
        password: 'newPassword',
      });
    });

    // Expect toast success to have been called
    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');

    // Expect the auth context to have been updated with fallback phone
    expect(mockSetAuth).toHaveBeenCalledWith({
      user: {
        name: 'Jane Doe',
        email: 'john.doe@example.com',
        phone: mockUser.phone,  // Expect the fallback value to be used
        address: '321 Avenue',
      },
    });

    // Expect localStorage to have been updated with fallback phone
    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe('Jane Doe');
    expect(ls.user.phone).toBe(mockUser.phone);  // Expect fallback value
    expect(ls.user.address).toBe('321 Avenue');
});

  test('shows an error notification when the profile update request fails', async () => {
    axios.put.mockRejectedValue(new Error('Update failed'));

    render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

    // Simulate form submission
    fireEvent.click(screen.getByText('UPDATE'));

    // Wait for the axios PUT request to fail
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });

    // Expect toast error to have been called
    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });
});
