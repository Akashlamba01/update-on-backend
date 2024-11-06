// class ApiResponse {
//   constructor(statusCode, data, message = "Success", success) {
//     ;(this.statusCode = statusCode),
//       (this.data = data),
//       (this.message = message),
//       (this.success = statusCode < 400)
//   }
// }

const ApiResponse = {
  successOk: (response, message, data) => {
    if (typeof message == "object") {
      data = message
      message = ""
    }
    message = message || "Success!"
    response.status(200)
    response.json({ message: message, code: 200, success: true, data })
  },

  successCreate: (response, message, data) => {
    if (typeof message == "object") {
      data = message
      message = ""
    }
    message = message || "Created Successfully!"
    response.status(201)
    response.json({ message: message, code: 201, success: true, data })
  },

  successAccepted: (response, message, data) => {
    if (typeof message == "object") {
      data = message
      message = ""
    }
    message = message || "Accepted Successfully!"
    response.status(202)
    response.json({ message: message, code: 202, success: true, data })
  },

  unknown: (response, message, data) => {
    message = message || "Invalid Parameters!"
    response.status(400)
    response.json({
      message: message,
      code: 400,
      success: false,
      data,
    })
  },

  unauthorized: (response, message, data) => {
    message = message || "Request Unauthorized!"
    response.status(401)
    response.json({
      message: message,
      code: 401,
      success: false,
      data,
    })
  },

  notFound: (response, message, data) => {
    message = message || "Not found!"
    response.status(404)
    response.json({
      message: message,
      code: 404,
      success: false,
      data,
    })
  },

  taken: (response, message, data) => {
    message = message || "Data already taken"
    response.status(422)
    response.json({
      message: message,
      code: 422,
      success: false,
      data,
    })
  },

  fail: (response, message, data) => {
    message = message || "Some error has occured, please try again later"
    response.status(500)
    response.json({
      message: message,
      code: 500,
      success: false,
      data,
    })
  },
}

export { ApiResponse }
