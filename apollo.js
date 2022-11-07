require('dotenv').config();
const request = require('request');
const util = require('util')
const requestAsync = util.promisify(request)

/**
 * Takes a domain name and roles to returns contact data
 * @param domainName
 * @param roles
 * @return {Array}
 */
const defaultRoles = [
    "VP of Engineering", "VP Engineering", "Vice President Engineering", "CTO", "Cheif Technology Officer", "CIO", "Chief Information Officer"
]
async function getContactsFromApollo(domainName, roles = defaultRoles) {
    const options = {
        'method': 'POST',
        'url': 'https://api.apollo.io/v1/mixed_people/search',
        'headers': {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "api_key": `${process.env.APOLLO_API_KEY}`,
            "q_organization_domains": `${domainName}`,
            "page": 1,
            "person_titles": roles
        })

    };

    try {
        const response = await requestAsync(options);
        const parsedBody = JSON.parse(response.body)
        console.log(`[getContactsFromApollo] parsedBody:`, parsedBody);
        if (parsedBody && parsedBody.people && parsedBody.people.length > 0) {
            return parsedBody.people
        }
    } catch (err) {
        console.log(`[getContactsFromApollo] err:`, err)
    }
}


module.exports = {
    getContactsFromApollo,
};