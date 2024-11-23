import prisma from '../utils/prisma.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import customError from '../utils/AppError.js'
import { getToken, verifyUser } from '../utils/jwt.js';

class AuthService {
  // Check email or phone number
  async isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  // Register Email and Password
  async register(userData) {
    // Seperated user data
    const { email, password, username, phoneNumber } = userData;

    // Hashing password
    const hashedPassword = await hashPassword(password);
    
    try {
      // Create account and user
      const account = await prisma.account.create({
        data: {
          email: email,
          password: hashedPassword,
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

      delete account.password;
      return { account };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new customError('Email address already used', 409);
      } else {
        return error;
      }
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
      return error;
    }
  }
}

export default AuthService