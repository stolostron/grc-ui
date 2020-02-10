/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

var express = require('express'),
    router = express.Router(),
    log4js = require('log4js'),
    logger = log4js.getLogger('server'),
    session = require('express-session'),
    bodyParser = require('body-parser'),
    configjs = require('../../config/init-auth-config.js'),
    baseconfig = require('../../config/auth-config')

//controllers
var app = require('./app')
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2')

var log4js_config = process.env.LOG4JS_CONFIG ? JSON.parse(process.env.LOG4JS_CONFIG) : undefined
log4js.configure(log4js_config || 'config/log4js.json')

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

configjs.initialize((err, config) => {

  //token review api to validate Bearer token/ retrieve user info
  const request = require('request').defaults({ rejectUnauthorized: false })
  const options = {
    url: `${config.ocp.apiserver_url}/apis/authentication.k8s.io/v1/tokenreviews`,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${config.ocp.serviceaccount_token}`
    },
    json: true,
    body: {
      'apiVersion': 'authentication.k8s.io/v1',
      'kind': 'TokenReview',
      'spec': {
        'token': config.ocp.serviceaccount_token
      }
    }
  }

  const callbackUrl = `${config.ocp.oauth2_redirecturl}`

  passport.use(new OAuth2Strategy({
    //state: true,
    authorizationURL: `${config.ocp.oauth2_authorizepath}`,
    tokenURL: `${config.ocp.oauth2_tokenpath}`,
    clientID: config.ocp.oauth2_clientid,
    clientSecret: config.ocp.oauth2_clientsecret,
    callbackURL: callbackUrl,
    scope: 'user:full',
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, cb) => {
    options.body.spec.token=accessToken

    //retrieving user info through token review api
    request.post(options, (err, resp2, reviewbody) => {
      if (err) {
        return cb(err)
      }
      if (reviewbody.status && reviewbody.status.user){
        reviewbody.status.user.token = accessToken
        return cb(null, reviewbody.status.user)
      }
      return cb(new Error('Server Error'))
    })
  }
  ))

  passport.serializeUser((user, done) => {
    done(null, user)
  })

  passport.deserializeUser((user, done) => {
    done(null, user)
  })
})

router.use(session({ secret: baseconfig.ocp.oauth2_clientsecret }))
router.use(bodyParser.urlencoded({ extended: false }))
router.use(passport.initialize())
router.use(passport.session())

/* GET home page. */
router.get('/auth/login', (passport.authenticate('oauth2')))

// Callback service parsing the authorization token and asking for the access token
router.get('/auth/callback', passport.authenticate('oauth2', { failureRedirect: '/multicloud/login' }),
  (req, res) => {
    req.user = req.session.passport.user
    res.redirect(req.session.returnTo || '/multicloud/welcome')
    delete req.session.returnTo
  })

router.get('/login', (req, res) => {
  logger.info('redirecting to login..')
  res.redirect('/multicloud/auth/login')
})

router.all(['/', '/*'], (req, res, next) => {
  if (!req.session.passport || !req.session.passport.user) {
    req.session.returnTo = req.originalUrl
    res.redirect('/multicloud/auth/login')
  } else {
    res.cookie('cfc-access-token-cookie', req.session.passport.user.token)
    return next()
  }
}, app)

module.exports = router
