require('dotenv').config();
const request = require('request');
const util = require('util')
const requestAsync = util.promisify(request)

/**
 * Takes a business name as an argurement and returns a single domain name
 * @param company
 * @return {string}
 */
// 
async function getDomainNameFromClearbit(company) {
    const options = {
        'method': 'GET',
        'url': `https://company.clearbit.com/v1/domains/find?name=${company}`,
        'headers': {
            'Authorization': `Bearer ${`${process.env.CLEARBIT_BEARER_TOKEN}`}`
        }
    };

    try {
        const response = await requestAsync(options);
        const parsedBody = JSON.parse(response.body)
        console.log(`[getDomainNameFromClearbit] parsedBody:`, parsedBody)
        if (parsedBody && parsedBody.domain && parsedBody.domain.length > 0) {
            return parsedBody.domain
        }
    } catch (err) {
        console.log(`[getDomainNameFromClearbit] err:`, err)
        // throw new Error(error) // TOOD: Return null?
    }
}

module.exports = {
    getDomainNameFromClearbit,
};