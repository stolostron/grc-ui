var fs = require('fs')

const config = {}
config.ocp = {}

config.ocp.oauth2_clientid= process.env.OAUTH2_CLIENT_ID
config.ocp.oauth2_clientsecret= process.env.OAUTH2_CLIENT_SECRET
config.ocp.oauth2_redirecturl = process.env.OAUTH2_REDIRECT_URL

config.ocp.apiserver_url=process.env.API_SERVER_URL
if (process.env.NODE_ENV === 'development') {
  config.ocp.serviceaccount_token=process.env.SERVICEACCT_TOKEN
} else {
  config.ocp.serviceaccount_token =  fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token').toString()
}

module.exports = config
