# Frontegg Prehook Examples

This repository provides examples for responding to [Frontegg Prehook events](https://docs.frontegg.com/docs/subscribing-to-prehooks#prehook-events-list).

## Getting Started

Follow these steps to set up and run the examples:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/fxcircus/frontegg-prehook-examples.git
2. Open a terminal and start the server:
   ```bash
   cd frontegg-prehook-examples
   nodemon server.js
   
3. Open a second terminal window, run `ngrok http 5000`
   You will get an endpoint, like `https://[ID].ngrok-free.app`.
   You will send all the Prehook events to this endpoint.

### Setting Up Prehook Endpoints
For example, to test the invite endpoint, set the endpoint in the Frontegg prehook setup to:
   ```bash
   https://[ID].ngrok-free.app/invite
   
