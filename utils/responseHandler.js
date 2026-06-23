const response = (response, stateCode, message, data = null) => {
  const responseObject = {
    status: stateCode < 400 ? "success" : "error",
    message,
    data,
  };
  return response.status(stateCode).json(responseObject);
};
export default response;

{
  /**First status(stateCode)

Here, response.status(stateCode) sets the HTTP status code (like 200, 404, 500, etc.) in the actual HTTP response.
Second status inside responseObject

This is just a custom property in the response body.
It stores "success" if stateCode < 400 and "error" otherwise.
This helps the frontend easily interpret the response status. */
}
