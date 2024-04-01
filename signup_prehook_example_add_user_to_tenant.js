const express = require("express");
const axios = require("axios");
const bodyParser = require('body-parser')
const app = express();
const port = 5000;

// Middleware
app.use(bodyParser.json()) 

// ENV variables
const FRONT_EGG_API_URL = "https://api.frontegg.com"; // replace with api.us.frontegg.com if you are on Frontegg's US region (portal.us.frontegg.com)
const TENANTS_API_PATH = "/tenants/resources/tenants/v1"; // Get Tenants ➜ https://api.frontegg.com/tenants/resources/tenants/v1
const USERS_API_PATH = "/identity/resources/users/v2"; // Invite user ➜ https://docs.frontegg.com/reference/userscontrollerv2_createuser

const bearerToken = "[BEARER_TOKEN]"; // Get your vendor token ➜ https://docs.frontegg.com/reference/authenticate_vendor
const roleId = "[ROLE_ID]" // Replace with the actual role ID

// Edge case - if you want to limit for specific domains:
const allowedDomain = "mycoolddomain.com";

// User signup hook
app.post("/signup", async (req, res) => {
  console.log("New request!\n", req.body.data); 

  try {
    const { user } = req.body.data;
    const { email } = user;
    const domainToCheck = extractDomainFromEmail(email);

    let matchedTenantId = await findMatchingTenant(domainToCheck);

    if (!matchedTenantId) {
      console.log("No matching tenant found. Sending continue:false response.");
      return res.status(401).send({
        continue: false,
        error: {
          status: 401,
          message: [`Error! only users with ${allowedDomain} domain are allowed to login`],
        },
      });
    }

    console.log("Matching tenant found. Proceeding with the second API call.");
    const userCreationResponse = await createUser(user, matchedTenantId);

    console.log("Second API call response:", userCreationResponse.data);
    return res.status(200).send({
      continue: true,
      message: "User created successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).send({
      continue: false,
      error: {
        status: 500,
        message: ["Internal Server Error"],
      },
    });
  }
});

function extractDomainFromEmail(email) { return email.substring(email.lastIndexOf("@") + 1); }

async function findMatchingTenant(domainToCheck) {
  try {
    const tenantsUrl = `${FRONT_EGG_API_URL}${TENANTS_API_PATH}`;
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${bearerToken}`,
    };

    const response = await axios.get(tenantsUrl, { headers });
    const tenants = response.data;

    for (const tenant of tenants) {
      if (tenant.domain === domainToCheck) {
        return tenant.tenantId;
      }
    }

    return null; // No matching tenant found
  } catch (error) {
    throw error;
  }
}

async function createUser(user, tenantId) {
  try {
    const usersUrl = `${FRONT_EGG_API_URL}${USERS_API_PATH}`;
    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
      "frontegg-tenant-id": tenantId,
    };

    const userData = {
      provider: "local",
      skipInviteEmail: false,
      email: user.email,
      roleIds: [roleId]
    }

    return await axios.post(usersUrl, userData, { headers });
  } catch (error) {
    throw error;
  }
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Next steps - decide what to do with the "default" tenant that is opened for the user.
// You can call our API to delete the tenant from this code
// Or you can also subscribe to the Tenant created
