const response = (res, statusCode, message, data = null) => {
  const responceObject = {
    status: statusCode < 400 ? "success" : "error",
    message,
  };

  if (data) {
    responceObject.data = data;
  }

  return res.status(statusCode).json(responceObject);
};

export default response;
