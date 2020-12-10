/* Copyright (c) 2020 Red Hat, Inc. */
/// <reference types="cypress" />
import {
  createPolicyFromYAML, verifyPolicyInListing, verifyPolicyNotInListing,
  actionPolicyActionInListing, verifyPolicyInPolicyDetails, verifyPolicyInPolicyDetailsTemplates
} from '../views/policy'
import { getUniqueResourceName } from '../scripts/utils'
import { getConfigObject } from '../config'

describe('Testing policy named demo-policy in demo.yaml file', () => {
    const policyName = 'demo-policy'
    // demo-policy-raw.yaml is used for creating the policy "demo-policy"
    // demo-policy-raw.yaml is raw policy yaml and need be to get as raw data
    const policyYAML = getConfigObject('sample/demo-policy-raw.yaml', 'raw')
    // demo-policy-config.yaml is used for validating the policy "demo-policy"
    // demo-policy-config.yaml isn't raw policy yaml but config yaml and need be converted to a dictionary
    const { policyConfig } = getConfigObject('sample/demo-policy-config.yaml')
    const uPolicyName = getUniqueResourceName(policyName)

    it (`Can create new policy ${uPolicyName} from YAML editor`, () => {
      cy.FromGRCToCreatePolicyPage()
      createPolicyFromYAML(uPolicyName, policyYAML, true)
    })

    it(`Policy ${uPolicyName} is present in the policy listing`, () => {
      verifyPolicyInListing(uPolicyName,  policyConfig)
    })

    it('Policy status becomes available', () => {
      // cy.visit(`/multicloud/policies/all/${policies[name]['namespace']}/${uPolicyName}`)
      // or cy.visit('/multicloud/policies/all')
      // both pages should be supported
      cy.waitForPolicyStatus(uPolicyName)
    })

    it('Disable policy', () => {
      cy.goToPolicyDetailsPage(uPolicyName,false)
      actionPolicyActionInListing(uPolicyName, 'Disable')
    })

    it('Check disabled policy', () => {
      verifyPolicyInListing(uPolicyName,  policyConfig, 'disabled', 3)
    })

    it('Enable policy', () => {
      cy.goToPolicyDetailsPage(uPolicyName,false)
      actionPolicyActionInListing(uPolicyName, 'Enable')
    })

    it('Check enabled policy', () => {
      verifyPolicyInListing(uPolicyName,  policyConfig, 'enabled', 1, '0/1')
    })

    it('Enforce policy', () => {
      cy.goToPolicyDetailsPage(uPolicyName,false)
      actionPolicyActionInListing(uPolicyName, 'Enforce')
    })

    it('Check enforced policy', () => {
       policyConfig.enforce = true
       policyConfig.inform = false
      verifyPolicyInListing(uPolicyName,  policyConfig)
    })

    it('Inform policy', () => {
      cy.goToPolicyDetailsPage(uPolicyName,false)
      actionPolicyActionInListing(uPolicyName, 'Inform')
    })

    it('Check informed policy', () => {
       policyConfig.enforce = false
       policyConfig.inform = true
      verifyPolicyInListing(uPolicyName,  policyConfig)
    })

    it('check policy and the detailed policy page', () => {
       // we need to find another way how to access this page
       cy.goToPolicyDetailsPage(uPolicyName, policyConfig['namespace'])
         .then(() => {
           verifyPolicyInPolicyDetails(uPolicyName, policyConfig, 'enabled', 1, '0/1')
           verifyPolicyInPolicyDetailsTemplates(uPolicyName, policyConfig)
         })
    })

    it(`Policy ${uPolicyName} can be deleted in the policy listing`, () => {
      // we could use a different way how to return to this page
      cy.goToPolicyDetailsPage(uPolicyName,false)
      actionPolicyActionInListing(uPolicyName, 'Remove')
    })

    it(`Deleted policy ${uPolicyName} is not present in the policy listing`, () => {
      verifyPolicyNotInListing(uPolicyName)
    })
})
