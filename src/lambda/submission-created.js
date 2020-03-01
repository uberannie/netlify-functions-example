import fetch from "node-fetch";
import querystring from "querystring";

const { API_TOKEN } = process.env
const INTERCOM_CONVERSATION_API = `${process.env.INTERCOM_API}/conversations`
const INTERCOM_CONTACT_API = `${process.env.INTERCOM_API}/contacts`
const INTERCOM_SEARCH_CONTACT_API = INTERCOM_CONTACT_API.concat("/search")

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = querystring.parse(event.body);

  const formemail = params.email || "no email found"
  const formname = params.name || "no name found"
  const formcompany = params.company || "no company found"

  // need to find the Intercom generated ID for the contact, so we can create a conversation on behalf of that user
  // we only have their email to work with
  const INTERCOM_SEARCH_FIELD = "email"
  const INTERCOM_SEARCH_OPERATOR = "="
  const intercom_search_request = {
     "query":  {
        "field": INTERCOM_SEARCH_FIELD,
        "operator": INTERCOM_SEARCH_OPERATOR,
        "value": formemail
      }
    }

    try {
      const response = await fetch(INTERCOM_SEARCH_CONTACT_API, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${API_TOKEN}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Accept': 'application/json'},
              body: JSON.stringify(intercom_search_request) }
            );
      const data = await response.json();

      if(data.errors) {
        console.log(JSON.stringify(data))
        throw (JSON.stringify(data))
      }
      // we found a match to create the conversation for
      if(data.total_count > 0) {
        const intercom_conversation = {
              "from": {
                  "type": "user",
                  "id": data.data[0].id
                },
              "body": `I submitted the Contact form via stax.io with the following details\n\nName: ${ formname }\nEmail: ${ formemail }\nCompany: ${ formcompany }`
              }

        console.log(`going to create an intercom conversation now`);

        const conversationresponse = await fetch(INTERCOM_CONVERSATION_API, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${API_TOKEN}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json' },
            body: JSON.stringify(intercom_conversation) }
            )
          const conversationdata = await conversationresponse.json();
          console.log(`created conversation ${conversationdata.id} for ${ formemail }`)

          return {
            statusCode: 200,
            body: `created conversation ${conversationdata.id} for ${ formemail }`
          }
        }
        else {
          // do we want to create a conversation anyway if we couldn't find a matching user to the email
          console.log(`could not create conversation for ${ formemail }`)
          throw (`could not find user ${ formemail }`)
        }
    }
    catch (e) {
      console.log(`there was an error: ${ e }`)
      return {
        statusCode: 400,
        body: `there was an error: ${ e }`
      }
    }
}
