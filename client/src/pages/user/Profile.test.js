import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Profile from './Profile';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/auth';
import { useCart } from '../../context/cart';
import { useSearch } from '../../context/search';
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
    password: 'oldpassword',
    address: '123 Street',
  };

  const mockSetAuth = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue([{ user: mockUser }, mockSetAuth]);
    useCart.mockReturnValue([[], jest.fn()]);
    useSearch.mockReturnValue([{ query: '', results: [] }, jest.fn()]);
    localStorage.setItem('auth', JSON.stringify({ user: mockUser }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the profile form with initial data', () => {
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

  it('updates the profile successfully with all fields filled correctly', async () => {
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

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'Jane Doe',
        email: 'john.doe@example.com',
        password: 'newPassword',
        phone: '987654321',
        address: '321 Avenue',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');

    expect(mockSetAuth).toHaveBeenCalledWith({
      user: {
        name: 'Jane Doe',
        email: 'john.doe@example.com',
        phone: '987654321',
        address: '321 Avenue',
        password: 'newPassword',
      },
    });

    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe('Jane Doe');
    expect(ls.user.phone).toBe('987654321');
    expect(ls.user.password).toBe('newPassword');
    expect(ls.user.address).toBe('321 Avenue');
  });

  it('all fields empty', async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: mockUser.name,
          email: mockUser.email,
          phone: mockUser.phone,
          password: mockUser.password,
          address: mockUser.address,
        },
      },
    });

    render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
        );

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: '',
        email: mockUser.email,
        phone: '',
        address: '',
        password: '',
      });
    });


    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');

    expect(mockSetAuth).toHaveBeenCalledWith({
      user: {
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        address: mockUser.address,
        password: mockUser.password,
      },
    });

    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe(mockUser.name);
    expect(ls.user.phone).toBe(mockUser.phone);
    expect(ls.user.address).toBe(mockUser.address);
  });

  it('Name is empty, password is invalid, phone is non-empty, address is non-empty', async () => {
    axios.put.mockResolvedValue({
          data: {
            error: 'Password is required and must be 6 characters long',
          },
        });
      
        render(
          <MemoryRouter>
            <Profile />
          </MemoryRouter>
        );
      
        fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
          target: { value: '1231' }, 
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
          target: { value: '' }, 
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
          target: { value: '12345' }, 
        });
        fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), {
          target: { value: '123 Address' }, 
        });
      
        fireEvent.click(screen.getByText('UPDATE'));
      
        await waitFor(() => {
          expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
            name: '',
            email: mockUser.email,
            phone: '12345',
            address: '123 Address',
            password: '1231',
          });
        });
      
        expect(toast.error).toHaveBeenCalledWith('Password is required and must be 6 characters long');
      
        expect(mockSetAuth).not.toHaveBeenCalled();
      
        const ls = JSON.parse(localStorage.getItem('auth'));
        expect(ls.user.name).toBe('John Doe');
        expect(ls.user.phone).toBe('123456789');
        expect(ls.user.address).toBe('123 Street');
        expect(ls.user.password).not.toBe('1231');
      });

  it('Name is non-empty, password is empty, phone is empty, address is empty', async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: 'Jacob',
          email: mockUser.email,
          phone: mockUser.phone,
          password: mockUser.password,
          address: mockUser.address,
        },
      },
    });

    render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
        );

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: 'Jacob' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'Jacob',
        email: mockUser.email,
        phone: '',
        address: '',
        password: '',
      });
    });


    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');

    expect(mockSetAuth).toHaveBeenCalledWith({
      user: {
        name: 'Jacob',
        email: mockUser.email,
        phone: mockUser.phone,
        password: mockUser.password,
        address: mockUser.address,
      },
    });

    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe('Jacob');
    expect(ls.user.phone).toBe(mockUser.phone);
    expect(ls.user.address).toBe(mockUser.address);
  });

  it('Name is non-empty, password is valid, phone is empty, address is empty', async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: 'Jacob',
          email: mockUser.email,
          phone: mockUser.phone,
          password: 'hashedPassword',
          address: mockUser.address,
        },
      },
    });

    render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
        );

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: 'Jacob' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
      target: { value: '12345678' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'Jacob',
        email: mockUser.email,
        phone: '',
        address: '',
        password: '12345678',
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');

    expect(mockSetAuth).toHaveBeenCalledWith({
      user: {
        name: 'Jacob',
        email: mockUser.email,
        phone: mockUser.phone,
        password: 'hashedPassword',
        address: mockUser.address,
      },
    });

    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe('Jacob');
    expect(ls.user.phone).toBe(mockUser.phone);
    expect(ls.user.address).toBe(mockUser.address);
    expect(ls.user.password).toBe('hashedPassword');
  }); 

  it('Name is non-empty, password is invalid, phone is empty, address is empty', async () => {
    axios.put.mockResolvedValue({
      data: {
        error: 'Password is required and must be 6 characters long',
      },
    });
  
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
  
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
      target: { value: '1231' }, 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: 'Jacob' }, 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
      target: { value: '' }, 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), {
      target: { value: '' }, 
    });
  
    fireEvent.click(screen.getByText('UPDATE'));
  
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'Jacob',
        email: mockUser.email,
        phone: '',
        address: '',
        password: '1231',
      });
    });
  

    expect(toast.error).toHaveBeenCalledWith('Password is required and must be 6 characters long');
  
    expect(mockSetAuth).not.toHaveBeenCalled();
  
    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe(mockUser.name);
    expect(ls.user.phone).toBe(mockUser.phone);
    expect(ls.user.address).toBe(mockUser.address);
    expect(ls.user.password).not.toBe('1231');
  });

  it('Name is non-empty, password is empty, phone is non-empty, address is empty', async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: 'Jacob',
          email: mockUser.email,
          phone: "12345",
          password: mockUser.password,
          address: mockUser.address,
        },
      },
    });

    render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
        );

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: 'Jacob' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'Jacob',
        email: mockUser.email,
        phone: '12345',
        address: '',
        password: '',
      });
    });


    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');

    expect(mockSetAuth).toHaveBeenCalledWith({
      user: {
        name: 'Jacob',
        email: mockUser.email,
        phone: '12345',
        password: mockUser.password,
        address: mockUser.address,
      },
    });


    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe('Jacob');
    expect(ls.user.phone).toBe('12345');
    expect(ls.user.address).toBe(mockUser.address);
    expect(ls.user.password).toBe(mockUser.password);
  }); 

  it('Name is non-empty, password is invalid, phone is non-empty, address is non-empty', async () => {
    axios.put.mockResolvedValue({
      data: {
        error: 'Password is required and must be 6 characters long',
      },
    });
  

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
  
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
      target: { value: '1234' }, 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: 'Jacob' }, 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
      target: { value: '12345' }, 
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), {
      target: { value: 'Sesame Street 123' }, 
    });
  
    fireEvent.click(screen.getByText('UPDATE'));
  
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'Jacob',
        email: mockUser.email,
        phone: '12345',
        address: 'Sesame Street 123',
        password: '1234',
      });
    });
  
    expect(toast.error).toHaveBeenCalledWith('Password is required and must be 6 characters long');
  
    expect(mockSetAuth).not.toHaveBeenCalled();
  
    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe(mockUser.name);
    expect(ls.user.phone).toBe(mockUser.phone);
    expect(ls.user.address).toBe(mockUser.address);
    expect(ls.user.password).not.toBe('1234');
  });

  it('Name is non-empty, password is empty, phone is non-empty, address is non-empty', async () => {
    axios.put.mockResolvedValue({
      data: {
        updatedUser: {
          name: 'Jacob',
          email: mockUser.email,
          phone: "12345",
          password: mockUser.password,
          address: 'Sesame Street 123',
        },
      },
    });

    render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
        );

    fireEvent.change(screen.getByPlaceholderText('Enter Your Name'), {
      target: { value: 'Jacob' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Password'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Phone'), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter Your Address'), {
      target: { value: 'Sesame Street 123' },
    });

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/api/v1/auth/profile', {
        name: 'Jacob',
        email: mockUser.email,
        phone: '12345',
        address: 'Sesame Street 123',
        password: '',
      });
    });


    expect(toast.success).toHaveBeenCalledWith('Profile Updated Successfully');

    expect(mockSetAuth).toHaveBeenCalledWith({
      user: {
        name: 'Jacob',
        email: mockUser.email,
        phone: '12345',
        password: mockUser.password,
        address: 'Sesame Street 123',
      },
    });

    const ls = JSON.parse(localStorage.getItem('auth'));
    expect(ls.user.name).toBe('Jacob');
    expect(ls.user.phone).toBe('12345');
    expect(ls.user.address).toBe('Sesame Street 123');
    expect(ls.user.password).toBe(mockUser.password);
  });

  it('shows an error notification when the profile update request fails', async () => {
    axios.put.mockRejectedValue(new Error('Update failed'));

    render(
        <MemoryRouter>
          <Profile />
        </MemoryRouter>
      );

    fireEvent.click(screen.getByText('UPDATE'));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalled();
    });

    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });
});
