import AuthService from "../services/auth.js";

const auth = new AuthService();

class AuthController {
  async resendOTP(req, res, next) {
    try {
      const data = await auth.resendOTP(req.body.email);
      res.status(200).json({
        success: true,
        message: "OTP is resent",
        data: data,
        error: null,
      })
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const data = await auth.register(req.body);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: data,
        error: null,
      })
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async verifyEmail(req, res, next) {
    try {
      const data = await auth.verifyEmail(req.body);
      res.status(200).json({
        success: true,
        message: "Email is verified",
        data: data,
        error: null,
      })
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const data = await auth.login(req.body);
      res.status(201).json({
        success: true,
        message: "User login successfully",
        data: data,
        error: null,
      })
    } catch (error) {
      console.log(error);
      next(error)
    }
  }
}

export default AuthController;