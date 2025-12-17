import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

interface JwtPayload {
    sub: number;
    username: string;
    role: string;
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService, 
        private jwtService: JwtService
    ) {}

    async validateUser(username: string, pass: string) {
        const user = await this.usersService.findByUsername(username);
        if (!user) return null;
        
        const valid = await bcrypt.compare(pass, user.password);
        if (valid) return { id: user.id, username: user.username, role: user.role };
        
        return null;
    }

    async login(user: { id: number; username: string; role: string }) {
        const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role };
        
        // FIX: Only pass the payload. 
        // NestJS uses the secret and expiration defined in your JwtModule.
        const accessToken = this.jwtService.sign(payload);

        // FIX: Ensure the secret is a string and options match SignOptions type
        const refreshToken = jwt.sign(
            payload, 
            String(process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret'), 
            {
                expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN as any) || '7d',
            }
        );

        await this.usersService.setRefreshToken(user.id, refreshToken);

        return { 
            accessToken, 
            refreshToken 
        };
    }

    async logout(userId: number) {
        await this.usersService.setRefreshToken(userId, null);
        return { ok: true };
    }

    async refreshTokens(oldRefreshToken: string) {
        try {
            const decoded = jwt.verify(
              oldRefreshToken,
              String(process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret')
            ) as unknown as JwtPayload;

            const userWithStoredToken = await this.usersService.findByRefreshToken(oldRefreshToken);
            
            if (!userWithStoredToken || userWithStoredToken.id !== decoded.sub) {
                throw new UnauthorizedException('Invalid or tampered refresh token.');
            }

            const payload: JwtPayload = { 
                sub: userWithStoredToken.id, 
                username: userWithStoredToken.username, 
                role: userWithStoredToken.role 
            };
            
            const newAccessToken = this.jwtService.sign(payload);
            
            // FIX: Explicitly cast the secret to a string for the compiler
            const newRefreshToken = jwt.sign(
                payload, 
                String(process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret'), 
                { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN as any) || '7d' }
            );

            await this.usersService.setRefreshToken(userWithStoredToken.id, newRefreshToken);
            
            return { 
                accessToken: newAccessToken, 
                refreshToken: newRefreshToken 
            };

        } catch (err: unknown) {
            let errorMessage = 'An unknown error occurred during token refresh.';
            if (err instanceof Error) {
                errorMessage = err.message; 
            } 
            console.error('Refresh token failure:', errorMessage);
            throw new UnauthorizedException('Could not refresh tokens. Please log in again.');
        }
    }
}