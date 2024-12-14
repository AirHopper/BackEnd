import * as cityService from "../city.service";
import prismaMock from "../../utils/singleton";
import imagekit from "../../utils/imageKit";
import AppError from "../../utils/AppError";

describe("City Service", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    imagekit.upload = jest.fn();
    imagekit.deleteFile = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createCity", () => {
    it("should create a city with the provided data", async () => {
      const payload = {
        code: "NYC",
        name: "New York City",
        country: "USA",
        countryCode: "US",
        continent: "America",
      };
      const file = { buffer: Buffer.from("image content") };

      const uploadResult = { url: "imageUrl", fileId: "imageFileId" };
      imagekit.upload.mockResolvedValue(uploadResult);

      const newCity = {
        ...payload,
        imageUrl: uploadResult.url,
        imageId: uploadResult.fileId,
      };
      prismaMock.city.create.mockResolvedValue(newCity);

      const result = await cityService.createCity(payload, file);

      expect(result).toEqual(newCity);
      expect(imagekit.upload).toHaveBeenCalledWith({
        file: file.buffer,
        fileName: expect.stringMatching(`city_${payload.code}_\\d+`),
        folder: "/city_images/",
      });
      expect(prismaMock.city.create).toHaveBeenCalledWith({
        data: {
          ...payload,
          imageUrl: uploadResult.url,
          imageId: uploadResult.fileId,
        },
      });
    });

    it("should throw an error if the image upload fails", async () => {
      const payload = {
        code: "NYC",
        name: "New York City",
        country: "USA",
        countryCode: "US",
        continent: "North America",
      };
      const file = { buffer: Buffer.from("image content") };

      imagekit.upload.mockRejectedValue(new Error("Upload error"));

      await expect(cityService.createCity(payload, file)).rejects.toThrow(
        Error
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error creating city:",
        expect.any(Error)
      );
    });
  });

  describe("getAllCities", () => {
    it("should fetch all cities", async () => {
      const cities = [
        { code: "NYC", name: "New York City", country: "USA" },
        { code: "LON", name: "London", country: "UK" },
      ];

      prismaMock.city.findMany.mockResolvedValue(cities);

      const result = await cityService.getAllCities();

      expect(result).toEqual(cities);
      expect(prismaMock.city.findMany).toHaveBeenCalled();
    });

    it("should handle errors when fetching cities", async () => {
      prismaMock.city.findMany.mockRejectedValue(new Error("Fetch error"));

      await expect(cityService.getAllCities()).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching cities:",
        expect.any(Error)
      );
    });
  });

  describe("getCityByCode", () => {
    it("should fetch a city by code", async () => {
      const city = { code: "NYC", name: "New York City", country: "USA" };

      prismaMock.city.findUnique.mockResolvedValue(city);

      const result = await cityService.getCityByCode("NYC");

      expect(result).toEqual(city);
      expect(prismaMock.city.findUnique).toHaveBeenCalledWith({
        where: { code: "NYC" },
        include: { Airports: true },
      });
    });

    it("should throw an error if the city is not found", async () => {
      prismaMock.city.findUnique.mockResolvedValue(null);

      await expect(cityService.getCityByCode("XYZ")).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching city:",
        expect.any(Error)
      );
    });
  });

  describe("updateCity", () => {
    it("should update a city by code", async () => {
      const payload = { name: "Updated Name" };
      const existingCity = { code: "NYC", name: "Old Name" };
      const updatedCity = { ...existingCity, ...payload };

      prismaMock.city.findUnique.mockResolvedValue(existingCity);
      prismaMock.city.update.mockResolvedValue(updatedCity);

      const result = await cityService.updateCity("NYC", payload);

      expect(result).toEqual(updatedCity);
      expect(prismaMock.city.findUnique).toHaveBeenCalledWith({
        where: { code: "NYC" },
      });
      expect(prismaMock.city.update).toHaveBeenCalledWith({
        where: { code: "NYC" },
        data: payload,
      });
    });

    it("should throw an error if the city is not found", async () => {
      prismaMock.city.findUnique.mockResolvedValue(null);
      const payload = { name: "Updated Name" };

      await expect(cityService.updateCity("XYZ", payload)).rejects.toThrow(
        AppError
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error updating city:",
        expect.any(Error)
      );
    });
  });

  describe("updateCityPhoto", () => {
    it("should update the city photo", async () => {
      const file = { buffer: Buffer.from("new image content") };
      const existingCity = { code: "NYC" };
      const uploadResult = { url: "newImageUrl", fileId: "newFileId" };
      const updatedCity = { ...existingCity, imageUrl: uploadResult.url };

      prismaMock.city.findUnique.mockResolvedValue(existingCity);
      imagekit.upload.mockResolvedValue(uploadResult);
      prismaMock.city.update.mockResolvedValue(updatedCity);

      const result = await cityService.updateCityPhoto("NYC", file);

      expect(result).toEqual(updatedCity);
      expect(imagekit.upload).toHaveBeenCalledWith({
        file: file.buffer,
        fileName: expect.stringMatching(`city_NYC_\\d+`),
        folder: "/city_images/",
      });
      expect(prismaMock.city.update).toHaveBeenCalledWith({
        where: { code: "NYC" },
        data: { imageUrl: uploadResult.url, imageId: uploadResult.fileId },
      });
    });

    it("should delete the existing image if present", async () => {
      const file = { buffer: Buffer.from("new image content") };
      const existingCity = { code: "NYC", imageId: "oldFileId" };
      const uploadResult = { url: "newImageUrl", fileId: "newFileId" };
      const updatedCity = { ...existingCity, imageUrl: uploadResult.url };

      prismaMock.city.findUnique.mockResolvedValue(existingCity);
      imagekit.upload.mockResolvedValue(uploadResult);
      prismaMock.city.update.mockResolvedValue(updatedCity);

      const result = await cityService.updateCityPhoto("NYC", file);

      expect(result).toEqual(updatedCity);
      expect(imagekit.deleteFile).toHaveBeenCalledWith("oldFileId");
    });

    it("should throw an error if the city is not found", async () => {
      prismaMock.city.findUnique.mockResolvedValue(null);

      await expect(
        cityService.updateCityPhoto("XYZ", { buffer: Buffer.from("data") })
      ).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error updating city photo:",
        expect.any(Error)
      );
    });
  });

  describe("deleteCity", () => {
    it("should delete a city by code", async () => {
      const city = { code: "NYC" };

      prismaMock.city.findUnique.mockResolvedValue(city);
      prismaMock.city.delete.mockResolvedValue(city);

      const result = await cityService.deleteCity("NYC");

      expect(result).toEqual({
        message: `City with code NYC deleted successfully`,
      });
      expect(prismaMock.city.delete).toHaveBeenCalledWith({
        where: { code: "NYC" },
      });
    });

    it("should delete the existing image if present", async () => {
      const city = { code: "NYC", imageId: "oldFileId" };

      prismaMock.city.findUnique.mockResolvedValue(city);
      prismaMock.city.delete.mockResolvedValue(city);

      const result = await cityService.deleteCity("NYC");

      expect(result).toEqual({
        message: `City with code NYC deleted successfully`,
      });
      expect(imagekit.deleteFile).toHaveBeenCalledWith("oldFileId");
    });

    it("should throw an error if the city is not found", async () => {
      prismaMock.city.findUnique.mockResolvedValue(null);

      await expect(cityService.deleteCity("XYZ")).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting city:",
        expect.any(Error)
      );
    });
  });
});
