// src/positions/positions.controller.ts

import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    ParseIntPipe,
    Req, 
} from '@nestjs/common';
import { Request } from 'express'; 
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { 
    CreatePositionDto, 
    UpdatePositionDto, 
    ClientCreatePositionDto 
} from './dto/positions.dto'; 

// FIX: Includes 'email: string' to satisfy the global 'User' type requirement (TS2430).
interface RequestWithUser extends Request {
  user: {
    id: number;
    email: string; 
  };
}

@Controller('positions')
export class PositionsController {
    constructor(private positionsService: PositionsService) {}

    // --- 1. GET ALL POSITIONS ---
    @UseGuards(JwtAuthGuard)
    @Get()
    async getAll() {
        return this.positionsService.getAll();
    }

    // --- 2. GET ONE POSITION by position_id ---
    @UseGuards(JwtAuthGuard)
    @Get(':position_id')
    async getOne(
        @Param('position_id', ParseIntPipe) position_id: number,
    ) {
        return this.positionsService.findById(position_id);
    }

    // --- 3. CREATE A NEW POSITION ---
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() body: ClientCreatePositionDto, 
        @Req() req: RequestWithUser 
    ) {
        // Accessing the ID is safe and correctly typed now
        const userIdFromToken = req.user.id; 

        const fullDto: CreatePositionDto = {
            ...body, 
            userId: userIdFromToken,
        };
        
        return this.positionsService.createPosition(fullDto);
    }

    // --- 4. UPDATE AN EXISTING POSITION ---
    @UseGuards(JwtAuthGuard)
    @Put(':position_id')
    async update(
        @Param('position_id', ParseIntPipe) position_id: number,
        @Body() body: UpdatePositionDto = {}, 
    ) {
        return this.positionsService.updatePosition(position_id, body);
    }

    // --- 5. DELETE A POSITION ---
    @UseGuards(JwtAuthGuard)
    @Delete(':position_id')
    async remove(@Param('position_id', ParseIntPipe) position_id: number) {
        return this.positionsService.deletePosition(position_id);
    }
}