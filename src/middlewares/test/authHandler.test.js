import { authHandler, adminHandler } from "../authHandler";
import customError from "../../utils/AppError";
import { verifyToken } from "../../utils/jwt";

jest.mock("../../utils/jwt", () => ({
  verifyToken: jest.fn(),
}));

const mockReq = (headers = {}) => ({ headers });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe("authHandler Middleware", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 401 error if token is not provided", () => {
    const req = mockReq({});
    const res = mockRes();

    authHandler(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      new customError("Token not provided", 401)
    );
  });

  test("should attach user to request if token is valid", () => {
    const mockUser = { id: 1, role: "User" };
    verifyToken.mockReturnValue(mockUser);

    const req = mockReq({ authorization: "Bearer validtoken" });
    const res = mockRes();

    authHandler(req, res, mockNext);

    expect(verifyToken).toHaveBeenCalledWith("validtoken");
    expect(req.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
  });

  test("should return 403 error if token is invalid", () => {
    verifyToken.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const req = mockReq({ authorization: "Bearer invalidtoken" });
    const res = mockRes();

    authHandler(req, res, mockNext);

    expect(verifyToken).toHaveBeenCalledWith("invalidtoken");
    expect(mockNext).toHaveBeenCalledWith(
      new customError("Invalid token", 403)
    );
  });
});

describe("adminHandler Middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 403 error if user is not an admin", () => {
    const req = { user: { id: 1, role: "User" } };
    const res = mockRes();

    adminHandler(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      new customError("Access denied: Admins only", 403)
    );
  });

  test("should call next if user is an admin", () => {
    const req = { user: { id: 1, role: "Admin" } };
    const res = mockRes();

    adminHandler(req, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test("should return 403 error if req.user is undefined", () => {
    const req = {};
    const res = mockRes();

    adminHandler(req, res, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      new customError("Access denied: Admins only", 403)
    );
  });
});
