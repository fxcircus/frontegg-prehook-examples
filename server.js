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

// User signup hook
app.post("/usersignup", (req, res) => {
  const user = req.body.data.user;      //  "user": { "ipAddress": "1.1.1.1", "email": "demo@email.com", "provider": "local", "metadata": "{\"code\":\"mycode\"}" }
  const provider = req.body.data.user.provider;
  const ipAddress = req.body.data.user.ipAddress;


  if (user.ipAddress !== "255.255.255.0") {
      return res.send({
          continue: true,
      });
  } else {
      return res.status(401).send({
          // Throw error if the user's IP is not what we expect
          continue: false,
          error: {
              status: 401,
              message: ["Only requests from IP 255.255.255.0 are allowed to complete signup!"]
          },
      });
  }
});

// User invite hook
app.post("/usersignup", (req, res) => {
  const user = req.body.data.user;      // user: { email: 'demo@email.com', metadata: '{}' },

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
              message: ["Only ACME employees are allowed to sign up!"]
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

// Social login
app.post("/social", (req, res) => {
  console.log("New request!", req.body.data.authData); // print full req for reference
  const userName = req.body.data.authData.user.name
  const userMetadata = req.body.data.authData.user.metadata
  const userProfilePictureUrl = req.body.data.authData.user.profilePictureUrl
  console.log(`userName = ${userName}\nuserMetadata = ${userMetadata}\n userProfilePictureUrl = ${userProfilePictureUrl}`)
  return res.send({
    continue: true,
    response: {
      user: {
        name:userName,
        metadata: JSON.stringify({
          "socialClaimA": "valueX",
          "socialClaimB": "valueY"
        }),
        profilePictureUrl: userProfilePictureUrl
      },
    },
  });
});

const port = 5000
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});
