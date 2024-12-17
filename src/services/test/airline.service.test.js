import * as airlineService from "../airline.service";
import prismaMock from "../../utils/singleton";
import imagekit from "../../utils/imageKit";
import AppError from "../../utils/AppError";

describe("Airline Service", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    imagekit.upload = jest.fn();
    imagekit.deleteFile = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createAirline", () => {
    it("should create an airline with the provided data", async () => {
      const payload = { iataCode: "AA", name: "American Airlines" };
      const file = { buffer: Buffer.from("image content") };
      const uploadResult = { url: "imageUrl", fileId: "imageFileId" };

      imagekit.upload.mockResolvedValue(uploadResult);
      const newAirline = {
        ...payload,
        imageUrl: uploadResult.url,
        imageId: uploadResult.fileId,
      };
      prismaMock.airline.create.mockResolvedValue(newAirline);

      const result = await airlineService.createAirline(payload, file);

      expect(result).toEqual(newAirline);
      expect(imagekit.upload).toHaveBeenCalledWith({
        file: file.buffer,
        fileName: expect.stringMatching(`airline_${payload.iataCode}_\\d+`),
        folder: "/airline_images/",
      });
      expect(prismaMock.airline.create).toHaveBeenCalledWith({
        data: {
          ...payload,
          imageUrl: uploadResult.url,
          imageId: uploadResult.fileId,
        },
      });
    });

    it("should throw an error if the image upload fails", async () => {
      const payload = { iataCode: "AA", name: "American Airlines" };
      const file = { buffer: Buffer.from("image content") };

      imagekit.upload.mockRejectedValue(new Error("Upload error"));

      await expect(airlineService.createAirline(payload, file)).rejects.toThrow(
        Error
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error creating airline:",
        expect.any(Error)
      );
    });
  });

  describe("getAllAirlines", () => {
    it("should fetch all airlines including airplane count", async () => {
      const airlines = [
        { iataCode: "AA", name: "American Airlines", _count: { Airplanes: 5 } },
        { iataCode: "BA", name: "British Airways", _count: { Airplanes: 3 } },
      ];

      prismaMock.airline.findMany.mockResolvedValue(airlines);

      const result = await airlineService.getAllAirlines();

      expect(result).toEqual(airlines);
      expect(prismaMock.airline.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              Airplanes: true,
            },
          },
        },
      });
    });

    it("should handle errors when fetching airlines", async () => {
      prismaMock.airline.findMany.mockRejectedValue(new Error("Fetch error"));

      await expect(airlineService.getAllAirlines()).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching airlines:",
        expect.any(Error)
      );
    });
  });

  describe("getAirlineById", () => {
    it("should fetch an airline by IATA code including airplane count", async () => {
      const airline = {
        iataCode: "AA",
        name: "American Airlines",
        Airplanes: [{ id: 1 }, { id: 2 }],
      };

      prismaMock.airline.findUnique.mockResolvedValue(airline);

      const result = await airlineService.getAirlineById("AA");

      expect(result).toEqual({ ...airline, airplaneCount: 2 });
      expect(prismaMock.airline.findUnique).toHaveBeenCalledWith({
        where: { iataCode: "AA" },
        include: { Airplanes: true },
      });
    });

    it("should throw an error if the airline is not found", async () => {
      prismaMock.airline.findUnique.mockResolvedValue(null);

      await expect(airlineService.getAirlineById("ZZ")).rejects.toThrow(
        AppError
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching airline:",
        expect.any(Error)
      );
    });
  });

  describe("updateAirlineDetails", () => {
    it("should update airline details by IATA code", async () => {
      const payload = { name: "Updated Airlines" };
      const existingAirline = { iataCode: "AA", name: "American Airlines" };
      const updatedAirline = { ...existingAirline, ...payload };

      prismaMock.airline.findUnique.mockResolvedValue(existingAirline);
      prismaMock.airline.update.mockResolvedValue(updatedAirline);

      const result = await airlineService.updateAirlineDetails("AA", payload);

      expect(result).toEqual(updatedAirline);
      expect(prismaMock.airline.findUnique).toHaveBeenCalledWith({
        where: { iataCode: "AA" },
      });
      expect(prismaMock.airline.update).toHaveBeenCalledWith({
        where: { iataCode: "AA" },
        data: payload,
      });
    });

    it("should throw an error if the airline is not found", async () => {
      prismaMock.airline.findUnique.mockResolvedValue(null);

      await expect(
        airlineService.updateAirlineDetails("ZZ", { name: "Updated Airlines" })
      ).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error updating airline details:",
        expect.any(Error)
      );
    });
  });

  describe("updateAirlinePhoto", () => {
    it("should update the airline photo", async () => {
      const file = { buffer: Buffer.from("new image content") };
      const existingAirline = { iataCode: "AA" };
      const uploadResult = { url: "newImageUrl", fileId: "newFileId" };
      const updatedAirline = { ...existingAirline, imageUrl: uploadResult.url };

      prismaMock.airline.findUnique.mockResolvedValue(existingAirline);
      imagekit.upload.mockResolvedValue(uploadResult);
      prismaMock.airline.update.mockResolvedValue(updatedAirline);

      const result = await airlineService.updateAirlinePhoto("AA", file);

      expect(result).toEqual(updatedAirline);
      expect(imagekit.upload).toHaveBeenCalledWith({
        file: file.buffer,
        fileName: expect.stringMatching(`airline_AA_\\d+`),
        folder: "/airline_images/",
      });
      expect(prismaMock.airline.update).toHaveBeenCalledWith({
        where: { iataCode: "AA" },
        data: { imageUrl: uploadResult.url, imageId: uploadResult.fileId },
      });
    });

    it("should delete the existing image if present", async () => {
      const file = { buffer: Buffer.from("new image content") };
      const existingAirline = { iataCode: "AA", imageId: "oldFileId" };
      const uploadResult = { url: "newImageUrl", fileId: "newFileId" };
      const updatedAirline = { ...existingAirline, imageUrl: uploadResult.url };

      prismaMock.airline.findUnique.mockResolvedValue(existingAirline);
      imagekit.upload.mockResolvedValue(uploadResult);
      prismaMock.airline.update.mockResolvedValue(updatedAirline);

      const result = await airlineService.updateAirlinePhoto("AA", file);

      expect(result).toEqual(updatedAirline);
      expect(imagekit.deleteFile).toHaveBeenCalledWith("oldFileId");
    });

    it("should throw an error if the airline is not found", async () => {
      prismaMock.airline.findUnique.mockResolvedValue(null);

      await expect(
        airlineService.updateAirlinePhoto("ZZ", { buffer: Buffer.from("data") })
      ).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error updating airline photo:",
        expect.any(Error)
      );
    });
  });

  describe("deleteAirline", () => {
    it("should delete an airline by IATA code", async () => {
      const airline = { iataCode: "AA" };

      prismaMock.airline.findUnique.mockResolvedValue(airline);
      prismaMock.airline.delete.mockResolvedValue(airline);

      const result = await airlineService.deleteAirline("AA");

      expect(result).toEqual({
        message: `Airline with IATA code AA deleted successfully`,
      });
      expect(prismaMock.airline.delete).toHaveBeenCalledWith({
        where: { iataCode: "AA" },
      });
    });

    it("should delete the existing image if present", async () => {
      const airline = { iataCode: "AA", imageId: "imageFileId" };

      prismaMock.airline.findUnique.mockResolvedValue(airline);
      prismaMock.airline.delete.mockResolvedValue(airline);

      const result = await airlineService.deleteAirline("AA");

      expect(result).toEqual({
        message: `Airline with IATA code AA deleted successfully`,
      });
      expect(imagekit.deleteFile).toHaveBeenCalledWith(airline.imageId);
    });

    it("should throw an error if the airline is not found", async () => {
      prismaMock.airline.findUnique.mockResolvedValue(null);

      await expect(airlineService.deleteAirline("ZZ")).rejects.toThrow(
        AppError
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting airline:",
        expect.any(Error)
      );
    });
  });
});
