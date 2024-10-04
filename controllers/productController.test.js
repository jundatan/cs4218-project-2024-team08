  import { productPhotoController } from './productController.js';
  import productModel from '../models/productModel.js'; 


  jest.mock('../models/productModel');

  describe('productPhotoController', () => {
    let req, res;

    beforeEach(() => {
      req = { params: { pid: 'test-product-id' } };
      res = {
        set: jest.fn(() => res), 
        status: jest.fn(() => res), 
        send: jest.fn(),
      };
    });

    test('should return photo when product has photo data', async () => {
      productModel.findById.mockReturnValue({
          select: jest.fn().mockResolvedValue({
            photo: {
              data: Buffer.from('test-photo-data'), 
              contentType: 'image/png', 
            },
          }),
        });

      await productPhotoController(req, res);

      expect(productModel.findById).toHaveBeenCalledWith('test-product-id');
      expect(res.set).toHaveBeenCalledWith('Content-type', 'image/png');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(Buffer.from('test-photo-data'));
    });

    test('should return 500 on database error', async () => {
      productModel.findById.mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error')),
      });
    
      await productPhotoController(req, res);
    
      expect(productModel.findById).toHaveBeenCalledWith('test-product-id');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: 'Erorr while getting photo', 
        error: expect.any(Error), 
      });
    });
  });
