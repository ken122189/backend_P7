// src/auth/auth.service.ts (Refactored)

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

// Define the interface for your user payload for better type safety
interface JwtPayload {
    sub: number; // User ID
    username: string;
    role: string;
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService, 
        private jwtService: JwtService
    ) {}

    // --- Core Authentication ---
    async validateUser(username: string, pass: string) {
        const user = await this.usersService.findByUsername(username);
        if (!user) return null;
        
        const valid = await bcrypt.compare(pass, user.password);
        
        if (valid) return { id: user.id, username: user.username, role: user.role };
        
        return null;
    }

    // --- Login & Token Generation ---
    async login(user: { id: number; username: string; role: string }) {
        const payload: JwtPayload = { sub: user.id, username: user.username, role: user.role };
        
        // 1. Generate Access Token (using JwtService)
        const accessToken = this.jwtService.sign(payload);

        // 2. Generate Refresh Token (using raw jwt library)
        const refreshToken = jwt.sign(
            payload, 
            process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret', 
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
            }
        );

        // 3. Store the Refresh Token Hash (BEST PRACTICE: HASH IT)
        // Note: For simplicity, you store the plain token. Hashing it here
        // and comparing the hash on refresh is a stronger security measure.
        await this.usersService.setRefreshToken(user.id, refreshToken); // Assuming this stores plain text for now

        // 4. Return the tokens using the key expected by the frontend (accessToken)
        return { 
            accessToken: accessToken, 
            refreshToken: refreshToken 
        };
    }

    // --- Logout ---
    async logout(userId: number) {
        // Revoke the refresh token by nulling it in the DB
        await this.usersService.setRefreshToken(userId, null);
        return { ok: true };
    }

    // --- Token Refresh Flow ---
    async refreshTokens(oldRefreshToken: string) {
        try {
            // 1. Verify the refresh token is valid and not expired
            const decoded: JwtPayload = jwt.verify(
              oldRefreshToken,
              process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret'
            ) as unknown as JwtPayload;

            // 2. Check if the token exists in the database
            // This is the CRITICAL security check for revocation/reuse.
            const userWithStoredToken = await this.usersService.findByRefreshToken(oldRefreshToken);
            
            if (!userWithStoredToken || userWithStoredToken.id !== decoded.sub) {
                // IMPORTANT: If a refresh token is reused or invalid, 
                // you should log the activity and potentially revoke all tokens for this user (refresh token rotation).
                throw new UnauthorizedException('Invalid or tampered refresh token.');
            }

            // 3. Generate new tokens (Payload is based on the verified user data)
            const payload: JwtPayload = { 
                sub: userWithStoredToken.id, 
                username: userWithStoredToken.username, 
                role: userWithStoredToken.role 
            };
            
            const newAccessToken = this.jwtService.sign(payload);
            const newRefreshToken = jwt.sign(
                payload, 
                process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_secret', 
                { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
            );

            // 4. Update the stored token (Refresh Token Rotation)
            await this.usersService.setRefreshToken(userWithStoredToken.id, newRefreshToken);
            
            // 5. Return the new pair
            return { 
                accessToken: newAccessToken, 
                refreshToken: newRefreshToken 
            };

    
} catch (err: unknown) {
    // 1. Log the failure details for internal debugging
    let errorMessage = 'An unknown error occurred during token refresh.';
    
    // Safely check if the error is a standard Error object
    if (err instanceof Error) {
        // This will capture specific errors like 'TokenExpiredError' from jsonwebtoken
        errorMessage = err.message; 
    } 
    // Log the specific failure reason on the server
    console.error('Refresh token failure:', errorMessage);

    // 2. Throw a generic exception to the client (Security Best Practice)
    // The client should not see the raw jwt error message.
    throw new UnauthorizedException('Could not refresh tokens. Please log in again.');
}
    }
}