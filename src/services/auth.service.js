import prisma from "../utils/prisma.js";
import { hashPassword, comparePassword } from "../utils/bcrypt.js";
import customError from "../utils/AppError.js";
import { getToken, verifyToken } from "../utils/jwt.js";
import { generateOTP } from "../utils/otpgenerator.js";
import { sendEmail } from "../utils/nodemailer.js";
import { generateStrongPassword } from "../utils/passwordgenerator.js";
import cleanUpAccountData from "../utils/cleanUpAccountData.js";
import isValidEmail from "../utils/isValidEmail.js";
import ejs from "ejs";
import path from "path";

const OTP_EXPIRATION_TIME_MS = 10 * 60 * 1000;

// Register Email and Password
export const register = async (userData) => {
  // Seperated user data
  const { email, password, fullName, phoneNumber } = userData;
  const hashedPassword = await hashPassword(password);
  const otp = generateOTP();

  try {
    const account = await prisma.account.create({
      data: {
        email,
        password: hashedPassword,
        otpCode: otp,
        otpExpiration: new Date(Date.now() + OTP_EXPIRATION_TIME_MS),
        user: {
          create: {
            fullName,
            phoneNumber,
          },
        },
      },
      include: { user: true },
    });

    const emailTemplatePath = path.resolve("src/views/otpRegister.ejs");
    const htmlContent = await ejs.renderFile(emailTemplatePath, {
      otp,
    });

    sendEmail(email, "Email Verification", htmlContent);
    cleanUpAccountData(account);
    return account;
  } catch (error) {
    console.error("Error registering user:", error);
    if (error.code === "P2002") {
      throw new customError("Email, phone number, or fullname already used", 409);
    }
    throw error;
  }
};

// Resend OTP
export const resendOTP = async (email) => {
  try {
    const otp = generateOTP();
    const account = await prisma.account.update({
      where: { email },
      data: {
        otpCode: otp,
        otpExpiration: new Date(Date.now() + OTP_EXPIRATION_TIME_MS), // 10 minutes
      },
      include: { user: true },
    });

    const emailTemplatePath = path.resolve("src/views/otpRegister.ejs");
    const htmlContent = await ejs.renderFile(emailTemplatePath, {
      otp,
    });

    sendEmail(email, "Email Verification", htmlContent);
    cleanUpAccountData(account);
    return account;
  } catch (error) {
    console.error("Error resending OTP:", error);
    if (error.code === "P2025") {
      throw new customError("Invalid email", 404);
    }
    throw error;
  }
};

// Verify Email
export const verifyOTP = async (userData) => {
  const { email, otpCode } = userData;

  try {
    const account = await prisma.account.findUnique({
      where: { email, otpCode },
    });
    if (!account) {
      throw new customError("Invalid OTP or email", 400);
    }

    const OTPExpired = new Date() > new Date(account.otpExpiration);
    if (OTPExpired) {
      throw new customError("OTP is expired", 400);
    }

    const updatedAccount = await prisma.account.update({
      where: { id: account.id },
      data: { isVerified: true },
      include: { user: true },
    });

    cleanUpAccountData(updatedAccount);
    return updatedAccount;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

// Login Email and Password
export const login = async (userData) => {
  // Seperated user data
  const { identifier, password } = userData;

  try {
    let account;
    if (isValidEmail(identifier)) {
      account = await prisma.account.findUnique({
        where: { email: identifier },
        include: { user: true },
      });
    } else {
      const user = await prisma.user.findUnique({
        where: { phoneNumber: identifier },
      });
      if (!user) {
        throw new customError("Invalid phone number or password", 400);
      }
      account = await prisma.account.findUnique({
        where: { id: user.accountId },
        include: { user: true },
      });
    }

    if (!account || !(await comparePassword(password, account.password))) {
      throw new customError("Invalid email or password", 400);
    }

    const token = getToken({ id: account.id, email: account.email, role: account.role });
    cleanUpAccountData(account);
    return { ...account, token };
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

// Login with Google
export const googleLogin = async (userData) => {
  try {
    const { accessToken } = userData;

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    if (!response.ok) {
      throw new customError("Invalid access token", 400);
    }
    const data = await response.json();

    let account = await prisma.account.findUnique({
      where: { email: data.email },
      include: { user: true },
    });

    const password = await generateStrongPassword();
    const hashedPassword = await hashPassword(password);

    if (!account) {
      account = await prisma.account.create({
        data: {
          email: data.email,
          password: hashedPassword,
          isVerified: true,
          user: {
            create: {
              fullName: `${data.given_name} ${data.family_name}`,
            },
          },
        },
        include: { user: true },
      });
    }

    const token = getToken({ id: account.id, email: account.email, role: account.role });
    cleanUpAccountData(account);
    return { ...account, token };
  } catch (error) {
    console.error("Error logging in with Google:", error);
    throw error;
  }
};

// Request link for reset password
export const forgotPassword = async (userData) => {
  const { email } = userData;

  try {
    const account = await prisma.account.findUnique({
      where: { email },
    });

    if (!account) {
      throw new customError("Invalid email", 404);
    }

    const token = getToken({ id: account.id, email: account.email });

    const emailTemplatePath = path.resolve("src/views/resetPassword.ejs");

    const resetLink = `${process.env.FE_URL}/reset-password?token=${token}`;

    const htmlContent = await ejs.renderFile(emailTemplatePath, {
      resetLink,
    });

    sendEmail(account.email, "Reset Password Request", htmlContent);

    return { email: account.email };
  } catch (error) {
    console.error("Error in forgot password request:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (userData) => {
  try {
    const { token, newPassword } = userData;

    const { id } = verifyToken(token);
    const hashedPassword = await hashPassword(newPassword);

    const account = await prisma.account.update({
      where: { id },
      data: { password: hashedPassword },
      include: { user: true },
    });

    cleanUpAccountData(account);
    return account;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

// Testing Auth Middleware
export const getUser = async (userData) => {
  try {
    const data = await prisma.account.findUnique({
      where: { id: userData },
      include: { user: true },
    });
    return data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Register admin by other admin
export const registerAdmin = async (userData) => {
  const { email, password } = userData;
  const hashedPassword = await hashPassword(password);
  try {
    const account = await prisma.account.create({
      data: {
        email: email,
        password: hashedPassword,
        role: 'Admin',
        isVerified: true
      }
    })
    cleanUpAccountData(account);
    return account;
  } catch (error) {
    console.error("Error registering admin:", error);
    if (error.code === "P2002") {
      throw new customError("Email, phone number, or fullname already used", 409);
    }
    throw error;
  }
}