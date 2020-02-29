require('dotenv').config()
import fetch from 'node-fetch'

const { API_TOKEN } = process.env
const INTERCOM_CONVERSATION_API = `${process.env.INTERCOM_API}/conversations`
const INTERCOM_CONTACT_API = `${process.env.INTERCOM_API}/contacts`

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  console.log(`going to call ${INTERCOM_CONTACT_API}`)

  const formemail = JSON.parse(event.body).payload.email;
  const formname = JSON.parse(event.body).payload.name;
  const email = "uberstax@stax.io"
  const intercom_conversation = {
                                  "from": {
                                      "type": "user",
                                      "id": email
                                    },
                                  "body": `I just submitted a form for ${ formemail } from another site partyparty`
                                }
  const intercom_contact = {
      	"role": "user",
      	"email": formemail,
      	"name": formname
      }

  console.log(`Received a submission: ${formemail}`)

/*
  return fetch(INTERCOM_CONVERSATION_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json' },
      body: JSON.stringify(intercom_conversation) }
      )
    .then(response => response.json())
    .then(data => {console.log(`we got back created_at: ${data.created_at} id: ${data.id}`)})

    .catch(error => ({ statusCode: 422, body: String(error) }))
*/
return fetch(INTERCOM_CONTACT_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json' },
    body: JSON.stringify(intercom_contact) }
    )
  .then(response => response.json())
  .then(data => {console.log(`we got back ${data.type} ${data.id}`)})

  .catch(error => { console.log(String(error)) })

}
