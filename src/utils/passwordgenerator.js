import generator from 'generate-password';

export const generateStrongPassword = async (length = 16) => {
  return generator.generate({
    length: length,
    numbers: true,
    symbols: true
  })
}