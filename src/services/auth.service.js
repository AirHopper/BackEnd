import prisma from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import customError from '../utils/AppError.js'
import { getToken, verifyToken } from '../utils/jwt.js';
import { generateOTP } from '../utils/otpgenerator.js';
import { sendEmail } from '../utils/nodemailer.js';
import { generateStrongPassword } from '../utils/passwordgenerator.js';


// Check email or phone number
const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Clean Up Account Properties before send it to frontend
const cleanUpAccountData = (account) => {
  ["createdAt", "updatedAt", "role", "password", "otpCode", "otpExpiration"].forEach((key) => delete account[key]);
}

// Register Email and Password
export const register = async (userData) => {
  // Seperated user data
  const { email, password, fullName, phoneNumber } = userData;

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
            fullName,
            phoneNumber,
          },
        },
      },
      include: { user: true },
    });

    // Send OTP to email user
    sendEmail(email, 'Email Verification', `Your OTP code is: ${otp}`);

    // Send data
    cleanUpAccountData(account);
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
    cleanUpAccountData(account);
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
    cleanUpAccountData(updatedAccount);
    return updatedAccount;
  } catch (error) {
    throw error;
  }
};

// Login Email and Password
export const login = async (userData) => {
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
    if (!account || !await comparePassword(password, account.password)) {
      throw new customError('Invalid email or password', 400);
    }

    // Get Token
    const token = getToken(account.id, account.email);

    // Send data
    cleanUpAccountData(account);
    return { ...account, token };
  } catch (error) {
    throw error;
  }
};

// Login with Google
export const googleLogin = async (userData) => {
  try {
    const { accessToken } = userData
    
    // Fetching user info from google apis
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    if (!response.ok) {
      throw new customError('Invalid access token', 400);
    }
    const data = await response.json();

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
              fullName: `${data.given_name} ${data.family_name}`,
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

// Request link for reset password
export const forgotPassword = async (userData) => {
  const { email } = userData;

  // Find user by email
  try {
    const account = await prisma.account.findUnique({
      where: {
        email: email
      }
    })
  
    // Create token
    const token = getToken(account.id, account.email);
  
    // Send token to user email
    sendEmail(
      account.email, 
      'Reset Password Request', 
      `Click the link if you want to reset your password: http://localhost:5173/reset-password?token=${token}`
      // Setting up link later
    );

    return { email: account.email };
  } catch(error) {
    throw error;
  }
}

// Reset password
export const resetPassword = async (userData) => {
  try {
    const { token, newPassword } = userData;
    
    // Verify token
    const { id } = verifyToken(token);
    
    // Hash new user password
    const hashedPassword = await hashPassword(newPassword)
    
    // Update user password by id
    const account = await prisma.account.update({
      where: { id: id }, 
      data: { password: hashedPassword },
      include: { user: true }
    })
    
    // Send back user data
    cleanUpAccountData(account);
    return account;
  } catch(error) {
    throw error;
  }
}

// Testing Auth Middleware
export const getUser = async (userData) => {
  try {
    const data = await prisma.account.findUnique({
      where: {
        id: userData
      },
      include: {
        user: true,
      }
    })
    return data;
  } catch(error) {
    throw error;
  }
}