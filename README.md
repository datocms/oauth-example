# Example of using DatoCms's OAuth2 Provider

This demo will show how to ask a user to authorize your app with DatoCms, and get
back and access token that you can use to do deploys, list sites, etc, etc, via
DatoCms's API.

## Installation

Clone this repository and do a quick deploy to DatoCms:

```bash
npm install DatoCms-cli -g
DatoCms deploy --path example/
```

Then visit the URL of your new site and follow the instructions.

## Source Code

To follow along, just read the file [example/app.js](example/app.js) and see how
the flow is implemented.
