const fetch = require('node-fetch')

//const { API_TOKEN } = process.env
// let's hard code for now
const { API_TOKEN } = "dG9rOjExZWVjYmE5XzAxMGRfNDRhOF84NDI5XzAyNjE1MzIxMjI2OToxOjA="
const { INTERCOM_CONVERSATION_API } = 'https://api.intercom.io/conversations'
exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  console.log(`serverless function running now`);

  const email = JSON.parse(event.body).payload.email;

  console.log(`Received a submission: ${email}`)

  return fetch(INTERCOM_CONVERSATION_API), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(  {
          "from": {
            "type": "user",
            "id": email
          },
          "body": "I just submitted the contact form from the Stax website"
        })
    }
    .then(response => response.json())
    .then(data => {
            console.log(`Submitted to Intercom:\n ${data}`)
          })
  .catch(error => ({ statusCode: 422, body: String(error) }))

}
