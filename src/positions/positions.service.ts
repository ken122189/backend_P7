// src/positions/positions.service.ts

import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { OkPacket, RowDataPacket } from 'mysql2';
import * as mysql from 'mysql2/promise';
import { CreatePositionDto, UpdatePositionDto } from './dto/positions.dto'; 

@Injectable()
export class PositionsService implements OnModuleInit {
    private pool!: mysql.Pool; 

    constructor(private db: DatabaseService) {}
    
    // FIX: Initializes the pool property after DatabaseService is ready.
    onModuleInit() {
        this.pool = this.db.getPool();
    }
    
    private getPool = () => this.pool;

    // 1. Create a new position (FIXED: Handles undefined/null parameters)
    async createPosition(dto: CreatePositionDto) {
        const sql = `
            INSERT INTO positions (position_code, position_name, id)
            VALUES (?, ?, ?)
        `;

        // FIX: Use nullish coalescing (?? null) to prevent 'undefined' 
        // from reaching the mysql2 driver, resolving the 500 error.
        const [result] = await this.getPool().execute<OkPacket>(sql, [
            dto.position_code ?? null,
            dto.position_name ?? null,
            dto.userId ?? null,
        ]);

        return {
            position_id: result.insertId,
            position_code: dto.position_code,
            position_name: dto.position_name,
            userId: dto.userId,
        };
    }

    // 2. Find a position by ID
    async findById(position_id: number) {
        const sql = `
            SELECT position_id, position_code, position_name, id, created_at
            FROM positions
            WHERE position_id = ?
        `;

        const [rows] = await this.getPool().execute<RowDataPacket[]>(sql, [
            position_id,
        ]);

        if (!rows[0]) throw new NotFoundException('Position not found');

        return rows[0];
    }
    
    // 3. Get all positions
    async getAll() {
        const sql = `
            SELECT position_id, position_code, position_name, id, created_at
            FROM positions
            ORDER BY position_id DESC
        `;

        const [rows] = await this.getPool().execute<RowDataPacket[]>(sql);
        return rows;
    }
    
    // 4. Update an existing position
    async updatePosition(position_id: number, partial: UpdatePositionDto) {
        const fields: string[] = [];
        const values: any[] = [];

        if (partial.position_code !== undefined) {
            fields.push('position_code = ?');
            values.push(partial.position_code);
        }

        if (partial.position_name !== undefined) {
            fields.push('position_name = ?');
            values.push(partial.position_name);
        }

        if (fields.length === 0) return this.findById(position_id);

        values.push(position_id);

        const sql = `
            UPDATE positions
            SET ${fields.join(', ')}
            WHERE position_id = ?
        `;

        await this.getPool().execute(sql, values);

        return this.findById(position_id);
    }

    // 5. Delete a position
    async deletePosition(position_id: number) {
        const sql = `
            DELETE FROM positions
            WHERE position_id = ?
        `;

        const [res] = await this.getPool().execute<OkPacket>(sql, [position_id]);

        return res.affectedRows === 1;
    }
}