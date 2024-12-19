import * as discountService from "../discount.service";
import prismaMock from "../../utils/singleton";
import AppError from "../../utils/AppError";

describe("Discount Service", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createDiscount", () => {
    it("should create a new discount with valid data", async () => {
      const payload = { percentage: 20 };

      const newDiscount = { id: 1, ...payload };
      prismaMock.discount.create.mockResolvedValue(newDiscount);

      const result = await discountService.createDiscount(payload);

      expect(result).toEqual(newDiscount);
      expect(prismaMock.discount.create).toHaveBeenCalledWith({
        data: { percentage: payload.percentage },
      });
    });

    it("should throw an error if percentage is invalid (< 0 or > 100)", async () => {
      const invalidPayload = { percentage: 150 };

      await expect(discountService.createDiscount(invalidPayload)).rejects.toThrow(
        "Percentage must be between 0 and 100"
      );
    });

    it("should handle database errors", async () => {
      const payload = { percentage: 20 };
      prismaMock.discount.create.mockRejectedValue(new Error("Database error"));

      await expect(discountService.createDiscount(payload)).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith("Error creating discount:", expect.any(Error));
    });
  });

  describe("getAllDiscounts", () => {
    it("should fetch all discounts", async () => {
      const discounts = [
        { id: 1, percentage: 20 },
        { id: 2, percentage: 30 },
      ];

      prismaMock.discount.findMany.mockResolvedValue(discounts);

      const result = await discountService.getAllDiscounts();

      expect(result).toEqual(discounts);
      expect(prismaMock.discount.findMany).toHaveBeenCalled();
    });

    it("should handle database errors", async () => {
      prismaMock.discount.findMany.mockRejectedValue(new Error("Database error"));

      await expect(discountService.getAllDiscounts()).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith("Error fetching discounts:", expect.any(Error));
    });
  });

  describe("getDiscountById", () => {
    it("should fetch a discount by ID", async () => {
      const discount = { id: 1, percentage: 20 };

      prismaMock.discount.findUnique.mockResolvedValue(discount);

      const result = await discountService.getDiscountById(1);

      expect(result).toEqual(discount);
      expect(prismaMock.discount.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw an error if the discount is not found", async () => {
      prismaMock.discount.findUnique.mockResolvedValue(null);

      await expect(discountService.getDiscountById(1)).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith("Error fetching discount:", expect.any(Error));
    });

    it("should handle database errors", async () => {
      prismaMock.discount.findUnique.mockRejectedValue(new Error("Database error"));

      await expect(discountService.getDiscountById(1)).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith("Error fetching discount:", expect.any(Error));
    });
  });

  describe("updateDiscount", () => {
    it("should update a discount with valid data", async () => {
      const payload = { percentage: 25 };
      const existingDiscount = { id: 1, percentage: 20 };
      const updatedDiscount = { ...existingDiscount, ...payload };

      prismaMock.discount.findUnique.mockResolvedValue(existingDiscount);
      prismaMock.discount.update.mockResolvedValue(updatedDiscount);

      const result = await discountService.updateDiscount(1, payload);

      expect(result).toEqual(updatedDiscount);
      expect(prismaMock.discount.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaMock.discount.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: payload,
      });
    });

    it("should throw an error if the discount is not found", async () => {
      prismaMock.discount.findUnique.mockResolvedValue(null);

      await expect(discountService.updateDiscount(1, { percentage: 25 })).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith("Error updating discount:", expect.any(Error));
    });

    it("should throw an error if percentage is invalid", async () => {
      const payload = { percentage: 150 };
      const existingDiscount = { id: 1, percentage: 20 };

      prismaMock.discount.findUnique.mockResolvedValue(existingDiscount);

      await expect(discountService.updateDiscount(1, payload)).rejects.toThrow(
        "Percentage must be between 0 and 100"
      );
    });
  });

  describe("deleteDiscount", () => {
    it("should delete a discount by ID", async () => {
      const discount = { id: 1, percentage: 20 };

      prismaMock.discount.findUnique.mockResolvedValue(discount);
      prismaMock.discount.delete.mockResolvedValue(discount);

      const result = await discountService.deleteDiscount(1);

      expect(result).toEqual({ message: `Discount with ID 1 deleted successfully` });
      expect(prismaMock.discount.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaMock.discount.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw an error if the discount is not found", async () => {
      prismaMock.discount.findUnique.mockResolvedValue(null);

      await expect(discountService.deleteDiscount(1)).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith("Error deleting discount:", expect.any(Error));
    });
  });
});
