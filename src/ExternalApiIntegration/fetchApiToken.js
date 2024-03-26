import { baseService } from "./baseService.js";

const FetchApiToken = async () => {

  try {
    const response = await baseService.post(
      "https://auth-api.kudoway.com/api/sso/v1/oauth2/token",
      {
        client_id: "kudo-prod-payments-web-client",
        client_secret: "4F4qk/KpemGJb3NKTTR0BRdlmrjRBlBh0L7hLbbqJFM=",
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    if (!response.data) {
      throw new Error('Failed to fetch token');
    }

    return response.data.access_token;
  } catch (error) {
    console.error("Error creating auth token:", error);
    return null;
  }
};

export default FetchApiToken;
