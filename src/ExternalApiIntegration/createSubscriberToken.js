import { baseService } from "./baseService.js";

const createSubscriberToken = async (sessionId) => {
  try {
    const response = await baseService.put(
      "http://localhost:3002/api/v1/external_api/sessions",
      {
        session_id: sessionId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "HTTP-X-API-TOKEN": "daceac4f6a07265eef17857c",
        },
      }
    );
    if (!response.data) {
      throw new Error("Failed to create translation resource");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating translation resource:", error);
    return null;
  }
};

export default createSubscriberToken;
