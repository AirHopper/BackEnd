import * as discountController from '../discount.controller.js';
import * as discountService from '../../services/discount.service.js';

jest.mock('../../services/discount.service.js'); // Mock the discount service

describe('Discount Controller', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    // Mock the request object
    mockReq = {
      body: {
        discountCode: 'SUMMER2024',
        amount: 20,
        startDate: '2024-06-01',
        endDate: '2024-08-31',
      },
      params: { id: '1' }, // For ID-based tests
    };

    // Mock the response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock the next function for error handling
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createDiscount', () => {
    it('should create a discount and return a success response', async () => {
      const discount = { ...mockReq.body, id: 1 }; // Simulate a discount object being created
      discountService.createDiscount.mockResolvedValue(discount); // Mock service response

      await discountController.createDiscount(mockReq, mockRes, mockNext);

      // Assertions
      expect(discountService.createDiscount).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Discount created successfully',
        data: discount,
        error: null,
      });
    });

    it('should handle errors and pass them to next middleware', async () => {
      const error = new Error('Failed to create discount');
      discountService.createDiscount.mockRejectedValue(error); // Simulate service failure

      await discountController.createDiscount(mockReq, mockRes, mockNext);

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(error); // Ensure the error is passed to next
    });
  });

  describe('getAllDiscounts', () => {
    it('should fetch all discounts successfully', async () => {
      const discounts = [{ id: 1, discountCode: 'SUMMER2024', amount: 20 }];
      discountService.getAllDiscounts.mockResolvedValue(discounts); // Mock service response

      await discountController.getAllDiscounts(mockReq, mockRes, mockNext);

      // Assertions
      expect(discountService.getAllDiscounts).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Discounts fetched successfully',
        data: discounts,
        error: null,
      });
    });

    it('should handle errors when fetching discounts', async () => {
      const error = new Error('Failed to fetch discounts');
      discountService.getAllDiscounts.mockRejectedValue(error); // Simulate service failure

      await discountController.getAllDiscounts(mockReq, mockRes, mockNext);

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getDiscountById', () => {
    it('should fetch a discount by ID', async () => {
      const discount = { id: 1, discountCode: 'SUMMER2024', amount: 20 };
      discountService.getDiscountById.mockResolvedValue(discount); // Mock service response

      await discountController.getDiscountById(mockReq, mockRes, mockNext);

      // Assertions
      expect(discountService.getDiscountById).toHaveBeenCalledWith(1); // ID parsing
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Discount fetched successfully',
        data: discount,
        error: null,
      });
    });

    it('should handle errors when fetching a discount by ID', async () => {
      const error = new Error('Discount not found');
      discountService.getDiscountById.mockRejectedValue(error); // Simulate service failure

      await discountController.getDiscountById(mockReq, mockRes, mockNext);

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('updateDiscount', () => {
    it('should update a discount and return a success response', async () => {
      const updatedDiscount = { ...mockReq.body, id: 1 }; // Simulate updated discount
      discountService.updateDiscount.mockResolvedValue(updatedDiscount); // Mock service response

      await discountController.updateDiscount(mockReq, mockRes, mockNext);

      // Assertions
      expect(discountService.updateDiscount).toHaveBeenCalledWith(1, mockReq.body); // ID parsing and body
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Discount updated successfully',
        data: updatedDiscount,
        error: null,
      });
    });

    it('should handle errors during discount update', async () => {
      const error = new Error('Failed to update discount');
      discountService.updateDiscount.mockRejectedValue(error); // Simulate service failure

      await discountController.updateDiscount(mockReq, mockRes, mockNext);

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteDiscount', () => {
    it('should delete a discount and return a success response', async () => {
      const result = { success: true }; // Simulate result after deletion
      discountService.deleteDiscount.mockResolvedValue(result); // Mock service response

      await discountController.deleteDiscount(mockReq, mockRes, mockNext);

      // Assertions
      expect(discountService.deleteDiscount).toHaveBeenCalledWith(1); // ID parsing
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Discount deleted successfully',
        data: result,
        error: null,
      });
    });

    it('should handle errors during discount deletion', async () => {
      const error = new Error('Failed to delete discount');
      discountService.deleteDiscount.mockRejectedValue(error); // Simulate service failure

      await discountController.deleteDiscount(mockReq, mockRes, mockNext);

      // Assertions
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
