/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
/* Copyright (c) 2020 Red Hat, Inc. */
const config = require('../../config')

module.exports = {
  url: function () {
    return `${this.api.launchUrl}${config.get('contextPath')}`
  },
  elements: {
    userSelect: 'a.idp:nth-of-type(1)',
    username: '#inputUsername',
    password: '#inputPassword',
    submit: 'button[type="submit"]',
    error: '.bx--inline-notification--error',
    header: '.app-header',
    loginPage: 'body > div.pf-c-login',
    loginForm: 'form[role="form"]',
    spinner: '.content-spinner',
    userDropdown: '#acm-user-dropdown > .dropdown-container > .header-action-trigger',
    logout: '#logout'
  },
  commands: [{
    inputUsername,
    inputPassword,
    submit,
    authenticate,
    waitForLoginSuccess,
    waitForLoginForm,
    logout
  }]
}

//helper for other pages to use for authentication in before() their suit
function authenticate(username = '') {
  let password, rbac_user = false
  if(process.env.SELENIUM_USER === undefined || process.env.SELENIUM_PASSWORD === undefined){
    this.api.end()
    throw new Error('Env variable NOT set.\nPlease export UI user/password as SELENIUM_USER/SELENIUM_PASSWORD')
  } else if (username != '') {
    // If a username is provided, we assume it's an RBAC user
    if (process.env.RBAC_PASS === undefined) {
      throw new Error('Env variable NOT set.\nPlease export UI RBAC password as RBAC_PASS')
    } else {
      password = process.env.RBAC_PASS
      rbac_user = true
    }
  } else {
    username = process.env.SELENIUM_USER
    password = process.env.SELENIUM_PASSWORD
  }
  this.waitForLoginForm(rbac_user)
  this.inputUsername(username)
  this.inputPassword(password)
  this.submit()
  this.waitForLoginSuccess()
}

function inputUsername(username) {
  this.waitForElementPresent('@username')
    .setValue('@username', username )
}

function inputPassword(password) {
  this.waitForElementPresent('@password')
    .setValue('@password', password )
}

function submit() {
  this.waitForElementPresent('@submit')
    .click('@submit')
}

function waitForLoginSuccess() {
  this.waitForElementPresent('@header')
  this.waitForElementNotPresent('@spinner')
}

function waitForLoginForm(rbac_user) {
  this.api.elements('tag name', 'form', res => {
    if (res.status < 0 || res.value.length < 1) {
      // Choose login method
      let login_with
      if (rbac_user) {
        login_with = 'grc-e2e-htpasswd'
      } else {
        // select kube:admin if env SELENIUM_USER_SELECT not specified
        login_with = process.env.SELENIUM_USER_SELECT || 'kube:admin'
      }
      const userSelector = `a[title="Log in with ${login_with}"]`
      this.waitForElementPresent(userSelector)
      this.click(userSelector)
    } else {
      // do nothing
    }
  })
  this.waitForElementVisible('@loginForm')
}

function logout() {
  this.waitForElementVisible('@userDropdown').click('@userDropdown')
  this.waitForElementVisible('@logout').click('@logout')
  this.waitForElementPresent('@loginPage')
}
