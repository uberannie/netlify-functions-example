import fetch from "node-fetch";
import querystring from "query-string";

const { INTERCOM_API_TOKEN } = process.env
const INTERCOM_CONVERSATION_API = `${process.env.INTERCOM_API_URL}/conversations`
const INTERCOM_CONTACT_API = `${process.env.INTERCOM_API_URL}/contacts`
const INTERCOM_SEARCH_CONTACT_API = INTERCOM_CONTACT_API.concat("/search")

exports.handler = async (event, context) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {

      const params = querystring.parse(event.body);
      let intercom_user_id = ""

      // Need the Intercom user ID
      // obtained by creating a new user or searching for them
      // to be able to create conversation on their behalf

      // let's try to create the contact first
      const intercom_create_contact = {
        "role": "user",
        "email": params.email,
        "name": params.name,
        "company": params.company
      }

      const createcontactresponse = await fetch(INTERCOM_CONTACT_API, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${INTERCOM_API_TOKEN}`,
                  'Accept': 'application/json',
                  'Content-Type': 'application/json' },
                body: JSON.stringify(intercom_create_contact)
              });

      switch(createcontactresponse.status){
        case 409: { // 409 returned when user already exists
          // need to find the Intercom generated ID for the contact
          // we only have their email to work with
          const INTERCOM_SEARCH_FIELD = "email"
          const INTERCOM_SEARCH_OPERATOR = "="
          const intercom_search_request = {
             "query":  {
                "field": INTERCOM_SEARCH_FIELD,
                "operator": INTERCOM_SEARCH_OPERATOR,
                "value": params.email
              }
            }

          const searchcontactresponse = await fetch(INTERCOM_SEARCH_CONTACT_API, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${INTERCOM_API_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'},
                  body: JSON.stringify(intercom_search_request) }
                );
          const searchdata = await searchcontactresponse.json();

          if(searchdata.errors || searchdata.total_count == 0) {
            throw (JSON.stringify(searchdata))
          }
          else {
            intercom_user_id = searchdata.data[0].id;
          }

          break;
        }
        case 200: { // successfully created new contact, thx Intercom you return the contact deets
          const createdata = await createcontactresponse.json();
          intercom_user_id = createdata.id;
          break;
        }
        default: {  // some other problem trying to create contact
          console.log(`${intercom_create_contact} ${INTERCOM_CONTACT_API} ${INTERCOM_API_TOKEN}`)
          throw (`${ createcontactresponse.status } returned trying to create contact`)
          break;
        }
      }

      // create the Intercom conversation
      const intercom_conversation = {
            "from": {
                "type": "user",
                "id": intercom_user_id
              },
            "body": `I submitted the Contact form via stax.io with the following details\n\nName: ${ params.name }\nEmail: ${ params.email }\nCompany: ${ params.company }`
            }

        const conversationresponse = await fetch(INTERCOM_CONVERSATION_API, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${INTERCOM_API_TOKEN}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json' },
            body: JSON.stringify(intercom_conversation) }
            )
          const conversationdata = await conversationresponse.json();

          return {
            statusCode: 200,
            body: `created conversation ${conversationdata.id} for ${ params.email } ${ intercom_user_id }`
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
