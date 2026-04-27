import bcrypt from 'bcrypt';
import User from '../models/user';
import { generateToken } from '../utils/jwt';

interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

class AuthService {
  async register(input: RegisterInput) {
    const { username, email, password } = input;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      username,
      email,
      passwordHash
    });

    // Generate token
    const token = generateToken(user);

    return { token, user };
  }

  async login(input: LoginInput) {
    const { email, password } = input;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user);

    return { token, user };
  }

  async getCurrentUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(userId: string, updates: Partial<RegisterInput>) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user fields
    if (updates.username) {
      user.username = updates.username;
    }
    if (updates.email) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email: updates.email, _id: { $ne: userId } });
      if (existingUser) {
        throw new Error('Email already in use');
      }
      user.email = updates.email;
    }

    await user.save();
    return user;
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid old password');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;

    await user.save();
    return { success: true };
  }
}

export default new AuthService();