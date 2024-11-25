import prisma from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import customError from '../utils/AppError.js'
import { getToken, verifyToken } from '../utils/jwt.js';
import { generateOTP } from '../utils/otpgenerator.js';
import { sendEmail } from '../utils/nodemailer.js';
import { setUpOauth2Client, getUserInfo } from '../utils/googleapis.js';
import { generateStrongPassword } from '../utils/passwordgenerator.js';


// Check email or phone number
export const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Register Email and Password
export const registerUser = async (userData) => {
  // Seperated user data
  const { email, password, username, phoneNumber } = userData;

  // Hashing password
  const hashedPassword = await hashPassword(password);

  // Generate OTP
  const otp = generateOTP();

  try {
    // Create account and user
    const account = await prisma.account.create({
      data: {
        email,
        password: hashedPassword,
        otpCode: otp,
        otpExpiration: new Date(Date.now() + 10 * 60 * 1000),
        user: {
          create: {
            username,
            phoneNumber,
          },
        },
      },
      include: { user: true },
    });

    // Send OTP to email user
    sendEmail(email, 'Email Verification', `Your OTP code is: ${otp}`);

    // Send data
    ["createdAt", "updatedAt", "role", "password", "otpCode", "otpExpiration"].forEach((key) => delete account[key]);
    return account;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new customError('Email address already used', 409);
    }
    throw error;
  }
};

// Resend OTP
export const resendOTP = async (email) => {
  try {
    // Generate new otp
    const otp = generateOTP();

    // Update otp and expiration
    const account = await prisma.account.update({
      where: { email },
      data: {
        otpCode: otp,
        otpExpiration: new Date(Date.now() + 10 * 60 * 1000),
      },
      include: { user: true },
    });

    // Resend email
    sendEmail(email, 'Email Verification', `Your OTP code is: ${otp}`);

    // Send data
    ["createdAt", "updatedAt", "role", "password", "otpCode", "otpExpiration"].forEach((key) => delete account[key]);
    return account;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new customError('Invalid email', 404);
    }
    throw error;
  }
};

// Verify Email
export const verifyOTPUser = async (userData) => {
  const { email, otpCode } = userData;

  try {
    // Match email and otp
    const account = await prisma.account.findUnique({
      where: { email, otpCode },
    });
    if (!account) {
      throw new customError('Invalid OTP or email', 400);
    }

    // Check the OTP has expired or not.
    const OTPExpired = new Date() > new Date(account.otpExpiration);
    if (OTPExpired) {
      throw new customError('OTP is expired', 400);
    }

    // Make user verified
    const updatedAccount = await prisma.account.update({
      where: { id: account.id },
      data: { isVerified: true },
      include: { user: true },
    });

    // Send data
    ["createdAt", "updatedAt", "role", "password", "otpCode", "otpExpiration"].forEach((key) => delete updatedAccount[key]);
    return updatedAccount;
  } catch (error) {
    throw error;
  }
};

// Login Email and Password
export const loginUser = async (userData) => {
  // Seperated user data
  const { identifier, password } = userData;

  try {
    let account;
    // Check user is available or not
    if (isValidEmail(identifier)) {
      // Using email
      account = await prisma.account.findUnique({
        where: { email: identifier },
        include: { user: true },
      });
    } else {
      // Using phone number
      let user = await prisma.user.findUnique({
        where: { phoneNumber: identifier }
      });
      account = await prisma.account.findUnique({
        where: { id: user.accountId },
        include: { user: true }
      })
    }

    // Check password is matching or not
    if (!account || !comparePassword(password, account.password)) {
      throw new customError('Invalid email or password', 400);
    }

    // Get Token
    const token = getToken(account.id, account.email);

    // Send data
    ["createdAt", "updatedAt", "role", "password", "otpCode", "otpExpiration"].forEach((key) => delete account[key]);
    return { ...account, token };
  } catch (error) {
    throw error;
  }
};

// Login with Google
export const googleLoginUser = async (userData) => {
  try {
    // Set up user token
    const { code } = userData;
    const oauth2Client = await setUpOauth2Client(code);

    // Get user info
    const data = await getUserInfo(oauth2Client);

    // Check if user is already have an account or not
    let account = await prisma.account.findUnique({
      where: {
        email: data.email
      },
      include: { user: true },
    })

    // Generate random password and hash it
    const password = await generateStrongPassword();
    const hashedPassword = await hashPassword(password);

    // If not exist, create one
    if (!account) { 
      account = await prisma.account.create({
        data: {
          email: data.email,
          password: hashedPassword,
          isVerified: true,
          user: {
            create: {
              username: `${data.given_name} ${data.family_name}`,
            },
          },
        },
        include: { user: true },
      });
    }

    // Get token
    const token = getToken(account.id, account.email);
    return { ...account, token };
  } catch (error) {
    throw error;
  }
};