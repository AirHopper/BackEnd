import errorHandler from '../errorHandler';
import AppError from '../../utils/AppError';

const mockReq = {};
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = jest.fn();

describe('errorHandler Middleware', () => {
  let res;

  beforeEach(() => {
    res = mockRes();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should handle AppError and send custom error response', () => {
    const customError = new AppError('Custom error message', 400);

    errorHandler(customError, mockReq, res, mockNext);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      data: null,
      message: 'Custom error message',
      error: customError,
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should handle non-AppError and send 500 response', () => {
    const genericError = new Error('Something went wrong');

    errorHandler(genericError, mockReq, res, mockNext);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      data: null,
      message: 'Internal Server Error',
      error: genericError,
      sentry: undefined, // By default, `res.sentry` is undefined
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should include sentry ID in response when available in generic error', () => {
    res.sentry = '12345';

    const genericError = new Error('Something went wrong');

    errorHandler(genericError, mockReq, res, mockNext);

    // Assertions
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: false,
      data: null,
      message: 'Internal Server Error',
      error: genericError,
      sentry: '12345', // Sentry ID is included in the response
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
