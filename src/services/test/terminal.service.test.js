import * as terminalService from "../terminal.service";
import prismaMock from "../../utils/singleton";
import AppError from "../../utils/AppError";

describe("Terminal Service", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createTerminal", () => {
    it("should create a new terminal with the provided data", async () => {
      const payload = {
        name: "Terminal 1",
        type: "Domestic",
        airportId: "JFK",
      };

      const newTerminal = {
        id: 1,
        ...payload,
        Airport: { iataCode: payload.airportId },
      };

      prismaMock.terminal.create.mockResolvedValue(newTerminal);

      const result = await terminalService.createTerminal(payload);

      expect(result).toEqual(newTerminal);
      expect(prismaMock.terminal.create).toHaveBeenCalledWith({
        data: {
          name: payload.name,
          type: payload.type,
          Airport: { connect: { iataCode: payload.airportId } },
        },
      });
    });

    it("should throw an error if terminal creation fails", async () => {
      const payload = {
        name: "Terminal 1",
        type: "Domestic",
        airportId: "JFK",
      };

      prismaMock.terminal.create.mockRejectedValue(new Error("Database error"));

      await expect(terminalService.createTerminal(payload)).rejects.toThrow(
        Error
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error creating terminal:",
        expect.any(Error)
      );
    });
  });

  describe("getAllTerminals", () => {
    it("should fetch all terminals", async () => {
      const terminals = [
        {
          id: 1,
          name: "Terminal 1",
          type: "Domestic",
          Airport: { iataCode: "JFK" },
        },
        {
          id: 2,
          name: "Terminal 2",
          type: "International",
          Airport: { iataCode: "LAX" },
        },
      ];

      prismaMock.terminal.findMany.mockResolvedValue(terminals);

      const result = await terminalService.getAllTerminals();

      expect(result).toEqual(terminals);
      expect(prismaMock.terminal.findMany).toHaveBeenCalledWith({
        include: { Airport: true },
      });
    });

    it("should throw an error if fetching terminals fails", async () => {
      prismaMock.terminal.findMany.mockRejectedValue(
        new Error("Database error")
      );

      await expect(terminalService.getAllTerminals()).rejects.toThrow(Error);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching terminals:",
        expect.any(Error)
      );
    });
  });

  describe("getTerminalById", () => {
    it("should fetch a terminal by ID", async () => {
      const terminal = {
        id: 1,
        name: "Terminal 1",
        type: "Domestic",
        Airport: { iataCode: "JFK" },
        FlightsDeparture: [],
        FlightsArrival: [],
      };

      prismaMock.terminal.findUnique.mockResolvedValue(terminal);

      const result = await terminalService.getTerminalById(1);

      expect(result).toEqual(terminal);
      expect(prismaMock.terminal.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { Airport: true, FlightsDeparture: true, FlightsArrival: true },
      });
    });

    it("should throw an error if the terminal is not found", async () => {
      prismaMock.terminal.findUnique.mockResolvedValue(null);

      await expect(terminalService.getTerminalById(1)).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching terminal:",
        expect.any(Error)
      );
    });
  });

  describe("updateTerminal", () => {
    it("should update terminal details", async () => {
      const payload = { name: "Updated Terminal" };
      const existingTerminal = { id: 1, name: "Terminal 1", type: "Domestic" };
      const updatedTerminal = { ...existingTerminal, ...payload };

      prismaMock.terminal.findUnique.mockResolvedValue(existingTerminal);
      prismaMock.terminal.update.mockResolvedValue(updatedTerminal);

      const result = await terminalService.updateTerminal(1, payload);

      expect(result).toEqual(updatedTerminal);
      expect(prismaMock.terminal.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(prismaMock.terminal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: payload,
      });
    });

    it("should throw an error if the terminal is not found", async () => {
      prismaMock.terminal.findUnique.mockResolvedValue(null);

      await expect(
        terminalService.updateTerminal(1, { name: "Updated Terminal" })
      ).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error updating terminal:",
        expect.any(Error)
      );
    });
  });

  describe("deleteTerminal", () => {
    it("should delete a terminal by ID", async () => {
      const terminal = { id: 1, name: "Terminal 1" };

      prismaMock.terminal.findUnique.mockResolvedValue(terminal);
      prismaMock.terminal.delete.mockResolvedValue(terminal);

      const result = await terminalService.deleteTerminal(1);

      expect(result).toEqual({
        message: "Terminal with ID 1 deleted successfully",
      });
      expect(prismaMock.terminal.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw an error if the terminal is not found", async () => {
      prismaMock.terminal.findUnique.mockResolvedValue(null);

      await expect(terminalService.deleteTerminal(1)).rejects.toThrow(AppError);
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting terminal:",
        expect.any(Error)
      );
    });
  });
});
