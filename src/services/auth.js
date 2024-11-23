import prisma from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import customError from '../utils/AppError.js'
import { getToken, verifyUser } from '../utils/jwt.js';
import { generateOTP } from '../utils/otpgenerator.js';
import { sendEmail } from '../utils/nodemailer.js';

class AuthService {
  // Check email or phone number
  async isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  // Resend OTP
  async resendOTP(email) {
    try {

      // Generate new otp
      const otp = generateOTP();
      
      // Update otp and expiration
      const account = await prisma.account.update({
        where: {
          email: email
        },
        data: {
          otpCode: otp,
          otpExpiration: new Date(Date.now() + 10 * 60 * 1000), // 10 menit
        },
        include: {
          user: true
        }
      })
      
      // Resend email
      sendEmail(email, 'Email Verification', `Your OTP code is: ${otp}`);
      
      delete account.password;
      return account;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new customError('Invalid email', 404);
      } else {
        throw error;
      }
    }
  }

  // Register Email and Password
  async register(userData) {
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
          email: email,
          password: hashedPassword,
          otpCode: otp,
          otpExpiration: new Date(Date.now() + 10 * 60 * 1000), // 10 menit
          user: {
            create: {
              username: username,
              phoneNumber: phoneNumber,
            }
          }
        }, 
        include: {
          user: true
        }
      })

      // Send OTP to email user
      sendEmail(email, 'Email Verification', `Your OTP code is: ${otp}`);

      delete account.password;
      // delete account.otpCode;
      return account;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new customError('Email address already used', 409);
      } else {
        throw error;
      }
    }
  }

  // Verify Email
  async verifyEmail(userData) {
    const { email, otpCode } = userData;
    
    try {
      // Match email and otp
      const account = await prisma.account.findUnique({
        where: {
          email: email,
          otpCode: otpCode
        }
      })
      if (!account) {
        throw new customError('Invalid OTP or email', 400);
      }

      // Check the OTP has expired or not.
      const OTPExpired = new Date() > new Date(account.otpExpiration)
      if (OTPExpired) {
        throw new customError('OTP is expired', 400);
      }

      // Make user verified
      const updatedAccount = await prisma.account.update({
        where: {
          id: account.id,
        },
        data: {
          isVerified: true
        },
        include: {
          user: true
        }
      })

      delete updatedAccount.password;
      return updatedAccount;
    } catch (error) {
      throw error;
    }
  }

  // Login Email and Password
  async login(userData) {
    // Seperated user data
    const { identifier, password } = userData

    try {
      let user;
      // 1. Check user is available or not
      if (this.isValidEmail(identifier)) {
        // Using email
        user = await prisma.account.findUnique({
          where: {
            email: identifier,
          },
          include: {
            user: true,
          }
        })
      } else {
        // Using phone number
        user = await prisma.account.findUnique({
          where: {
            phoneNumber: identifier
          },
          include: {
            user: true,
          }
        })
      }
      if (!user) {
        throw new customError('Invalid email or password', 400);
      }

      // 2. Check password is matching or not
      if (!comparePassword(password, user.password)) {
        throw new customError('Invalid email or password', 400);
      }

      // 3. Get token
      const token = getToken(user.id, user.email)

      delete user.password;
      return { ...user, token: token }
    } catch (error) {
      throw error;
    }
  }
}

export default AuthService