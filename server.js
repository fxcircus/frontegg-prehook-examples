const express = require('express')
const bodyParser = require('body-parser')
const app = express();

app.use(bodyParser.json())

// JWT Generation hook
app.post("/jwt", (req, res) => {
  console.log("New request!", req.body.data.claims); // print full req for reference
  const userId = req.body.data.claims.sub
  const email = req.body.data.claims.email
  const tenantId = req.body.data.claims.tenantId
  console.log(`userId = ${userId}\nemail = ${email}\n tenantId = ${tenantId}`)
  return res.send({
    continue: true,
    response: {
      claims: {
        tenantId: tenantId,
        customClaims: { claim: "Test Claim" },
      },
    },
  });
});

// User invite hook
app.post("/userinvite", (req, res) => {
  const action = req.body.data.action;   // action: 'CREATE',
  const user = req.body.data.user;      // user: { email: 'demo@email.com', metadata: '{}' },
  const tenantNumOfUsers = req.body.data.tenant.numberOfUsers;  // tenant: { numberOfUsers: 10 }

  console.log(`New request:\nemail = ${user.email}\nmetadata = ${user.metadata}\n tenant = ${tenantNumOfUsers}`);

  if (user.email.endsWith("@acme.com")) {
      return res.send({
          continue: true,
      });
  } else {
      return res.status(401).send({
          // Throw error if the user's email has the domain "acme.com"
          continue: false,
          error: {
              status: 401,
              message: ["Only ACME employees are allowed to join this account!"]
          },
      });
  }
});

// User SAML authentication hook
app.post("/saml", (req, res) => {
  const { email } = req.body.data.samlMetadata.email;
  console.log(`New request:\nemail:\n${email}\n\nRequest:\n${req.body}`)
  return res.send({
    continue: true,
    response: {
      user: {
        email: email,
        metadata: JSON.stringify({
          "fieldA": "valueX",
          "fieldB": "valueY"
        })
      }
    },
  });
})

const port = 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});