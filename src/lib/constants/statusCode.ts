const STATUS_CODES = {
  SUCCESS: {
    OK: { code: 200, message: "Success" },
    CREATED: { code: 201, message: "Resource created successfully" },
    ACCEPTED: { code: 202, message: "Request accepted for processing" },
    NO_CONTENT: { code: 204, message: "No content available" },
  },

  CLIENT_ERROR: {
    BAD_REQUEST: { code: 400, message: "Bad request" },
    UNAUTHORIZED: { code: 401, message: "Unauthorized access" },
    FORBIDDEN: { code: 403, message: "Forbidden" },
    NOT_FOUND: { code: 404, message: "Resource not found" },
    CONFLICT: { code: 409, message: "Conflict in request" },
    UNPROCESSABLE_ENTITY: { code: 422, message: "Unprocessable entity" },
  },

  SERVER_ERROR: {
    INTERNAL_SERVER_ERROR: { code: 500, message: "Internal server error" },
    NOT_IMPLEMENTED: { code: 501, message: "Not implemented" },
    BAD_GATEWAY: { code: 502, message: "Bad gateway" },
    SERVICE_UNAVAILABLE: { code: 503, message: "Service unavailable" },
  },
};

export default STATUS_CODES;
