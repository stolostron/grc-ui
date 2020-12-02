/* Copyright (c) 2020 Red Hat, Inc. */
import { getOpt } from '../scripts/utils'
import 'cypress-wait-until'
import { oauthIssuer } from '../views/resource'
import { pageLoader } from '../views/common'

Cypress.Commands.add('login', (OPTIONS_HUB_USER, OPTIONS_HUB_PASSWORD, OC_IDP) => {
  var user = process.env.SELENIUM_USER || OPTIONS_HUB_USER || Cypress.env('OPTIONS_HUB_USER')
  var password = process.env.SELENIUM_PASSWORD || OPTIONS_HUB_PASSWORD || Cypress.env('OPTIONS_HUB_PASSWORD')
  var idp = OC_IDP || Cypress.env('OC_IDP')
  cy.visit('/multicloud/welcome')
  cy.get('body').then(body => {
    // Check if logged in
    if (body.find('#header').length === 0) {

      // Check if identity providers are configured
      if (body.find('form').length === 0)
        cy.contains(idp).click()
      cy.get('#inputUsername', { timeout: 20000 }).click().focused().type(user)
      cy.get('#inputPassword', { timeout: 20000 }).click().focused().type(password)
      cy.get('button[type="submit"]', { timeout: 20000 }).click()
      cy.get('#header', { timeout: 30000 }).should('exist')
    }
  })
})

Cypress.Commands.add('reloadUntil', (condition, options) => {
  if (!options) {
    options = {}
  }

  var startTime = getOpt(options, 'startTime', new Date())
  var timeout = getOpt(options, 'timeout', 300000)
  var interval = getOpt(options, 'interval', 0)
  var currentTime = new Date()
  if (currentTime - startTime < timeout) {
    condition().then(result => {
      if (result == false) {
        cy.reload()
        if (interval > 0) {
          cy.wait(interval)
        }

        options.startTime = startTime
        cy.reloadUntil(condition, options)
      }
    })
  }
})

Cypress.Commands.add('waitUntilContains', (selector, text, options) => {
  cy.waitUntil(() => cy.ifContains(selector, text), options)
})

Cypress.Commands.add('waitUntilNotContains', (selector, text, options) => {
  cy.waitUntil(() => cy.ifNotContains(selector, text), options)
})

Cypress.Commands.add('waitUntilAttrIs', (selector, attr, value, options) => {
  cy.waitUntil(() => cy.ifAttrIs(selector, attr, value), options)
})

Cypress.Commands.add('ifAttrIs', (selector, attr, value, action) => {
  return cy.checkCondition(selector, ($elem) => $elem && $elem.attr(attr) && $elem.attr(attr).includes(value), action)
})

Cypress.Commands.add('ifContains', (selector, text, action) => {
  return cy.checkCondition(selector, ($elem) => $elem && $elem.text().includes(text), action)
})

Cypress.Commands.add('ifNotContains', (selector, text, action) => {
  return cy.checkCondition(selector, ($elem) => !$elem || !$elem.text().includes(text), action)
})

Cypress.Commands.add('checkCondition', (selector, condition, action) => {
  return cy.get('body').then($body => {
    var $elem = $body.find(selector)
    var result = condition($elem)
    if (result == true && action) {
      return action($elem)
    }

    return cy.wrap(result)
  })
})

Cypress.Commands.add('forEach', (selector, action, options) => {
  var failIfNotFound = getOpt(options, 'failIfNotFound', false)
  if (failIfNotFound == true) {
    return cy.get(selector, options).each(($elem) => action($elem))
  }

  return cy.get('body').then(($body) => {
    var $elems = $body.find(selector)
    if ($elems.length > 0) {
      action($elems.get(0))
      cy.forEach(selector, action)
    }
  })
})

Cypress.Commands.add('logout', () => {
  cy.getCookie('acm-access-token-cookie').should('exist').then((token) => {
    oauthIssuer(token.value).then((issuer) => {
      cy.get('#acm-user-dropdown').click().then(() => cy.get('#acm-logout').click().then(() => cy.url().should('include', issuer)))
    })
  })
})

Cypress.Commands.add('generateNamespace', () => {
  return 'search-' + Date.now()
})

Cypress.Commands.add('waitUsingSLA', () => {
  return cy.wait(parseInt(Cypress.env('SERVICE_SLA'), 10) || 5000)
})

Cypress.Commands.add('FromACMToGRCPage', () => {
  cy.get('#hamburger', { timeout: 20000 }).should('exist')
  cy.get('#hamburger').click()
  cy.get('#grc', { timeout: 20000 }).should('exist')
  cy.get('#grc').click()
  cy.get('.bx--detail-page-header-title').contains('Governance and risk')
})

Cypress.Commands.add('CheckGrcMainPage', () => {
  cy.location('pathname').should('eq', '/multicloud/policies/all')
  pageLoader.shouldNotExist()
  cy.get('.bx--detail-page-header-title').contains('Governance and risk')
})

Cypress.Commands.add('FromGRCToCreatePolicyPage', () => {
  cy.get('#create-policy', { timeout: 20000 }).should('exist')
  cy.get('#create-policy').click()
  cy.location('pathname').should('eq', '/multicloud/policies/create')
  pageLoader.shouldNotExist()
  cy.get('.bx--detail-page-header-title').contains('Create policy')
})
