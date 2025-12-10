// src/types/express.d.ts

// This ensures your custom definition is merged with the Express namespace
declare namespace Express {
    // Define the structure of the payload attached to the request by the JWT guard
    // **IMPORTANT**: The property names MUST match what your JwtStrategy adds to the request.
    export interface User {
        id: number; // Assuming your user ID is a number
        email: string; // Add other properties if needed
        // You may need to add: iat: number; and exp: number; if your payload includes them directly
    }

    // Now, Request has a strongly typed 'user' property
    export interface Request {
        user: User;
    }
}