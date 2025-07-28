import bcrypt from 'bcryptjs'

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10)
}

export function comparePassword(plain: string, hash: string) {
  return bcrypt.compareSync(plain, hash)
}
