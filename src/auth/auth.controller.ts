import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service'; // Assuming you have a basic AuthService

@Controller('auth') // Base path: /auth
export class AuthController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  // POST /auth/register - Handles user creation (moved from UsersController)
  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    // Frontend URL: http://localhost:8000/api/auth/register (assuming /api global prefix)
    return this.usersService.createUser(body.username, body.password);
  }

  // POST /auth/login - The missing login endpoint (FIXES 404)
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    // Frontend URL: http://localhost:8000/api/auth/login (assuming /api global prefix)
    const user = await this.authService.validateUser(body.username, body.password);
    
    if (!user) {
        // Use an HTTP exception like UnauthorizedException in a real app
        return { success: false, message: 'Invalid credentials' };
    }
    
    // Returns a token or success response
    return this.authService.login(user); 
  }
}