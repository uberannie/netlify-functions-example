require('dotenv').config()
import fetch from 'node-fetch'

//const { API_TOKEN } = process.env
// let's hard code for now
const { API_TOKEN } = process.env
const { INTERCOM_CONVERSATION_API } = process.env
exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  console.log(`serverless function running now`);
  console.log(`Using ${ API_TOKEN } at ${ INTERCOM_CONVERSATION_API }`)

  const formemail = JSON.parse(event.body).payload.email;
  const email = "berau@atsx.io"
  const intercom_conversation = {
                                  "from": {
                                      "type": "user",
                                      "id": email
                                    },
                                  "body": `I just submitted a form for ${ formemail } from another site partyparty`
                                }

  console.log(`Received a submission: ${formemail}`)
  console.log(JSON.stringify(intercom_conversation)

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
          "body": `I just submitted a form for ${ formemail } from another site partyparty`
        })
    }
    .then(response => response.json())
    .then(data => {
            console.log(`Submitted to Intercom:\n ${data}`)
          })
  .catch(error => ({ statusCode: 422, body: String(error) }))

}
