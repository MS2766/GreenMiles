export const fetchAPI = async (url: string, options?: RequestInit) => {
  try {
    console.log("fetchAPI: Fetching URL:", url, "with options:", options);
    const response = await fetch(url, options);
    console.log("fetchAPI: Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("fetchAPI: Error response body:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`,
      );
    }

    const text = await response.text();
    console.log("fetchAPI: Raw response:", text);

    if (!text) {
      console.log("fetchAPI: Empty response body");
      return null; // Handle empty response
    }

    try {
      const json = JSON.parse(text);
      console.log("fetchAPI: Parsed JSON:", json);
      return json;
    } catch (jsonError) {
      console.log("fetchAPI: Not JSON, returning raw text:", text);
      return text; // Return plain text instead of throwing
    }
  } catch (error) {
    console.error("fetchAPI: Fetch error:", error);
    throw error;
  }
};
