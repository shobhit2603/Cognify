const ApiResponse = (statusCode, message = "Success", data = null) => {
  return {
    statusCode,
    success: statusCode < 400,
    message,
    data,
  };
};

export default ApiResponse;
