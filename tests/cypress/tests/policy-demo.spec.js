/* Copyright (c) 2020 Red Hat, Inc. */
/// <reference types="cypress" />
import {
  createPolicyFromYAML, verifyPolicyInListing, verifyPolicyNotInListing,
  actionPolicyActionInListing
} from '../views/policy'
import { getUniqueResourceName } from '../scripts/utils'
import { getConfigObject } from '../config'

describe('Testing policy named demo-policy in demo.yaml file', () => {
    const policyName = 'demo-policy'
    // demo-policy-raw.yaml is used for creating the policy "demo-policy"
    // demo-policy-raw.yaml is raw policy yaml and need be to get as raw data
    const policyYAML = getConfigObject('demo-policy-raw', 'sample', 'raw')
    // demo-policy-config.yaml is used for validating the policy "demo-policy"
    // demo-policy-config.yaml isn't raw policy yaml but config yaml and need be converted to a dictionary
    const { policyConfig } = getConfigObject('demo-policy-config', 'sample', 'yaml')
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
      actionPolicyActionInListing(uPolicyName, 'Disable')
    })

    it('Check disabled policy', () => {
      verifyPolicyInListing(uPolicyName,  policyConfig, 'disabled', 3)
    })

    it('Enable policy', () => {
      actionPolicyActionInListing(uPolicyName, 'Enable')
    })

    it('Check enabled policy', () => {
      verifyPolicyInListing(uPolicyName,  policyConfig, 'enabled', 1)
    })

    it('Enforce policy', () => {
      actionPolicyActionInListing(uPolicyName, 'Enforce')
    })

    it('Check enforced policy', () => {
       policyConfig.enforce = true
       policyConfig.inform = false
      verifyPolicyInListing(uPolicyName,  policyConfig)
    })

    it('Inform policy', () => {
      actionPolicyActionInListing(uPolicyName, 'Inform')
    })

    it('Check informed policy', () => {
       policyConfig.enforce = false
       policyConfig.inform = true
      verifyPolicyInListing(uPolicyName,  policyConfig)
    })

    it(`Policy ${uPolicyName} can be deleted in the policy listing`, () => {
      actionPolicyActionInListing(uPolicyName, 'Remove')
    })

    it(`Deleted policy ${uPolicyName} is not present in the policy listing`, () => {
      verifyPolicyNotInListing(uPolicyName)
    })
})
