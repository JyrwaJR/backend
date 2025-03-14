import { Prisma } from "@db-prisma/client";
import { JWTExpired, JWEInvalid } from "jose/errors";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import STATUS_CODES from "@/lib/constants/statusCode";

/**
 * Global error handler for handling Prisma errors, JWT errors, validation errors, and unknown errors.
 */
export const errorHandler = (error: unknown) => {
  console.error("Error caught:", error);

  // Handle Validation Errors (Zod)
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: STATUS_CODES.CLIENT_ERROR.BAD_REQUEST.message,
        errors: error.issues, // Provides detailed validation errors
      },
      { status: STATUS_CODES.CLIENT_ERROR.BAD_REQUEST.code },
    );
  }

  // Handle JWT Errors
  if (error instanceof JWTExpired) {
    return NextResponse.json(
      {
        message: "Token expired. Please log in again.",
      },
      { status: STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED.code },
    );
  }
  if (error instanceof JWEInvalid) {
    return NextResponse.json(
      {
        message: "Invalid token. Authentication failed.",
      },
      { status: STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED.code },
    );
  }

  // Handle Prisma Errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // Unique constraint violation
        return NextResponse.json(
          {
            message: "A record with this value already exists.",
          },
          { status: STATUS_CODES.CLIENT_ERROR.CONFLICT.code },
        );
      case "P2025": // Record not found
        return NextResponse.json(
          {
            message: "Requested record was not found.",
          },
          { status: STATUS_CODES.CLIENT_ERROR.NOT_FOUND.code },
        );
      case "P2014": // Relation violation
        return NextResponse.json(
          {
            message: "Invalid relational data. Check references.",
          },
          { status: STATUS_CODES.CLIENT_ERROR.BAD_REQUEST.code },
        );
      default:
        return NextResponse.json(
          {
            message: "Database error, please try again.",
          },
          { status: STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR.code },
        );
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        message: "Invalid data format provided.",
      },
      { status: STATUS_CODES.CLIENT_ERROR.BAD_REQUEST.code },
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return NextResponse.json(
      {
        message: "Database initialization failed. Please try again later.",
      },
      { status: STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR.code },
    );
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return NextResponse.json(
      {
        message: "Database service encountered an internal error.",
      },
      { status: STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR.code },
    );
  }

  // Handle all other unknown errors
  return NextResponse.json(
    {
      message: "An unexpected error occurred. Please try again.",
    },
    { status: STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR.code },
  );
};
