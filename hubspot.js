require('dotenv').config();
const request = require('request');
const util = require('util')
const requestAsync = util.promisify(request)

/**
 * Takes an Apollo contact and returns a contactData object to create a HubSpot contact
 * @param contact
 * @return {Object}
 */
 async function _generateContactDataForHubspot(contact) {
    return {
        "company": contact?.organization?.name ?? "",
        "email": contact?.email ?? "",
        "firstname": contact?.first_name ?? "",
        "lastname": contact?.last_name ?? "",
        "website": contact?.linkedin_url ?? "",
        "phone": contact?.account?.primary_phone?.number ?? ""
      }
}

/**
 * Creates a hubspot contact
 * @param contactData
 * @return {Object}
 */
async function createHubspotContact(contactData) {
    const options = {
        method: 'POST',
        url: 'https://api.hubapi.com/crm/v3/objects/contacts',
        qs: { hapikey: `${process.env.HUBSPOT_API_KEY}` },
        headers:
        {
            'Content-Type': 'application/json'
        },
        body: { "properties": contactData },
        json: true
    };

    try {
        const response = await requestAsync(options);
        console.log(`[createHubspotContact] response.body:`, response.body);
        return response.body.id
    } catch (err) {
        console.log(`[createHubspotContact] err:`, err)
        return ""
    }
}

/**
 * Creates a hubspot contact
 * @param contactData
 * @return {Object}
 */
 async function addHubspotContactToList(contactId, listId) {
    const options = {
        method: 'POST',
        url: `https://api.hubapi.com/contacts/v1/lists/${listId}/add`,
        qs: { hapikey: `${process.env.HUBSPOT_API_KEY}` },
        headers:
        {
            'Content-Type': 'application/json'
        },
        body: {
            "vids": [
              contactId
            ]
          },
        json: true
    };

    try {
        const response = await requestAsync(options);
        console.log(`[addHubspotContactToList] response.body:`, response.body);
    } catch (err) {
        console.log(`[addHubspotContactToList] err:`, err)
    }
}

module.exports = {
    _generateContactDataForHubspot,
    createHubspotContact,
    addHubspotContactToList
};