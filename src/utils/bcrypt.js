import bcrypt from 'bcrypt';
const saltRounds = 10;

const hashPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
}

const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

export { hashPassword, comparePassword };