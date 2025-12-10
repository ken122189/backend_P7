// src/positions/dto/positions.dto.ts

/**
 * DTO for Client Request Body (POST /positions)
 * This is what the API consumer sends. It excludes the userId.
 */
export interface ClientCreatePositionDto {
    position_code: string;
    position_name: string;
}

/**
 * DTO for Internal Service Logic
 * This is the final data structure the service receives, including the userId
 * retrieved from the JWT token in the controller.
 */
export interface CreatePositionDto extends ClientCreatePositionDto {
    userId: number; // Foreign key from authenticated user
}

/**
 * DTO for Updating a Position (PUT/PATCH /positions/:id)
 * All fields are optional for partial updates.
 */
export interface UpdatePositionDto {
    position_code?: string;
    position_name?: string;
}