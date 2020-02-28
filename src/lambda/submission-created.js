import querystring from "querystring";

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  console.log(`serverless function running now`);

  const email = JSON.parse(event.body).payload.email || "default email"
  const name = JSON.parse(event.body).payload.name || "default name"
  const message = JSON.parse(event.body).payload.message || "default message"

  console.log(`body: Name: ${name} email: ${email} Message: ${message}`)

  return {
    statusCode: 200,
    
  };
};
