import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

const ADMIN = {
  username: 'admin',
  passwordHash: bcrypt.hashSync('admin123', 10),
};

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async login(username: string, password: string) {
    if (username !== ADMIN.username || !bcrypt.compareSync(password, ADMIN.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username, role: 'admin' };
    return { access_token: this.jwt.sign(payload) };
  }
}