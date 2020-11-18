/** *****************************************************************************
 * Licensed Materials - Property of Red Hat, Inc.
 * Copyright (c) 2020 Red Hat, Inc.
 ****************************************************************************** */

/// <reference types="cypress" />

import { pageLoader } from '../views/common'
import { createPolicy, verifyPolicyInListing, verifyPolicyNotInListing, deletePolicyInListing } from '../views/policy'
import { formatResourceName } from '../scripts/utils'

const { policies } = JSON.parse(Cypress.env('TEST_CONFIG'))

describe('Clusters', () => {

  it ('/policies/all page should load', () => {
    cy.visit('/multicloud/policies/all')
      .then(() => { pageLoader.shouldNotExist()
    })
  })

  for (const name in policies) {
    const policyDetails = policies[name]
    const frname = formatResourceName(name)

    it (`Can create new policy ${frname}`, () => {
      cy.visit('/multicloud/policies/create')
      pageLoader.shouldNotExist()
      createPolicy({ name, create:true, ...policyDetails})
    })

    it ('Redirects browser to a page with policy listing', () => {
      cy.location('pathname').should('eq', '/multicloud/policies/all')
      pageLoader.shouldNotExist()
    })

    it(`Policy ${frname} is present in the policy listing`, () => {
      cy.visit('/multicloud/policies/all')
      verifyPolicyInListing({ name, ...policyDetails})
    })

    it(`Policy ${frname} can be deleted in the policy listing`, () => {
      cy.visit('/multicloud/policies/all')
      deletePolicyInListing(name)
    })

    it(`Deleted policy ${frname} is not present in the policy listing`, () => {
      cy.visit('/multicloud/policies/all')
      verifyPolicyNotInListing(name)
    })

  }
})
