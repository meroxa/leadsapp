require('dotenv').config();
const { getDomainNameFromClearbit } = require("./clearbit.js");
const { getContactsFromApollo } = require("./apollo.js");
const { _generateContactDataForHubspot, createHubspotContact, addHubspotContactToList } = require("./hubspot.js");

exports.App = class App {

  async processData(records) {
    // Loop through each Postgres record
    records.forEach(async (record) => {
      // Extract the company name from the Postgres row (Ex: Apple)
      const companyName = record.get("company_name")
      console.log(`[processData] companyName:`, companyName)

      if (!companyName || companyName.length === 0) {
        console.log(`[processData] [WARN] Could not get companyName from record. companyName: ${companyName}`)
        record.set("people", [`Could not get companyName from record. companyName: ${companyName}`])
        return
      }

      // Get the company's Domain Name (Ex: Apple -> Apple.com)
      const domainName = await getDomainNameFromClearbit(companyName)
      console.log(`[processData] domainName via:`, domainName)
  
      if (!domainName || domainName.length === 0) {
        console.log(`[processData] [WARN] Could not get domainName via getDomainNameFromClearbit. domainName: ${domainName}`)
        record.set("people", [`Could not get domainName via getDomainNameFromClearbit. domainName: ${domainName}`])
        return
      }

      // Call Apollo search API to get contact information on the CTO and VP of Engineering roles
      const contacts = await getContactsFromApollo(domainName, ["VP of Engineering", "CTO"])
  
      if (!contacts || contacts.length === 0) {
        console.log(`[processData] [WARN] Could not get contacts via getContactsFromApollo. contacts: ${contacts}`)
        record.set("people", [`Could not get contacts via getContactsFromApollo. contacts: ${contacts}`])
        return
      }
  
      contacts.forEach(async (contact) => {
        // Generate a Contact object using data from Apollo
        const contactData = _generateContactDataForHubspot(contact)
        console.log(`[processData] contactData for createHubspotContact:`, contactData)

        // Add a new contact column to the Postgres record, which we will write to Snowflake
        record.set("contact", [contactData])

        // Create a HubSpot Contact
        const contactId = await createHubspotContact(contactData)
        console.log(`[processData] contactId for addHubspotContactToList:`, contactId)
  
        if (!contactId || contactId.length === 0) {
          console.log(`[processData] [WARN] Could not get contactId via createHubspotContact. contactId:`, contactId)
          return
        }

        // Add each contact we created to a specific HubSpot list
        await addHubspotContactToList(contactId, 381)
      })
    })

    // Return the modified Postgres records to write to Snowflake
    return records;
  }

  async run(turbine) {
    let source = await turbine.resources("leadsapp_pg");
    let records = await source.records("leads");
    let processed = await turbine.process(records, this.processData);
    let destination = await turbine.resources("snowflake");
    await destination.write(processed, "leads_from_pg");
  }
};
