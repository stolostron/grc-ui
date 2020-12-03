/* Copyright (c) 2020 Red Hat, Inc. */
/// <reference types="cypress" />

import {
  createPolicy, verifyPolicyInListing, verifyPolicyNotInListing, deletePolicyInListing,
  disablePolicyInListing, enablePolicyInListing, enforcePolicyInListing, informPolicyInListing,
  isPolicyStatusAvailable, verifyDisabledPolicyInListing, verifyNonDisabledPolicyInListing
} from '../views/policy'
import { getConfigObject } from '../config'

const { createIssuer } = getConfigObject('create_test_issuer')
const createIssuerName = createIssuer.name
const { createCertificate } = getConfigObject('create_test_certificate')
const createCertificateName = createCertificate.name
const { certificatePolicy } = getConfigObject('create_test_certpolicy')
const certificatePolicyName = certificatePolicy.name
describe('GRC certificate policy controller e2e tests', () => {
    it ('Create issuer', () => {
      cy.FromGRCToCreatePolicyPage()
      createPolicy({ createIssuerName, create:true, ...createIssuer})
      verifyPolicyInListing({ createIssuerName, ...createIssuer})
    })

    it ('Create certificate', () => {
      cy.FromGRCToCreatePolicyPage()
      createPolicy({ createCertificateName, create:true, ...createCertificate})
      verifyPolicyInListing({ createCertificateName, ...createCertificate})
    })

    it ('Create certificate policy', () => {
      cy.FromGRCToCreatePolicyPage()
      createPolicy({ certificatePolicyName, create:true, ...certificatePolicy})
      verifyPolicyInListing({ certificatePolicyName, ...certificatePolicy})
    })

    it('Disable certificate policy', () => {
      cy.CheckGrcMainPage()
      disablePolicyInListing(certificatePolicyName)
    })

    it('Check disabled certificate policy', () => {
      cy.CheckGrcMainPage()
      verifyDisabledPolicyInListing(certificatePolicyName)
      isPolicyStatusAvailable(certificatePolicyName, true)
    })

    it('Enable certificate policy', () => {
      cy.CheckGrcMainPage()
      enablePolicyInListing(certificatePolicyName)
    })

    it('Check enabled certificate policy', () => {
      cy.CheckGrcMainPage()
      verifyNonDisabledPolicyInListing(certificatePolicyName)
    })

    it('Enforce certificate policy', () => {
      cy.CheckGrcMainPage()
      enforcePolicyInListing(certificatePolicyName)
    })

    it('Check enforced certificate policy', () => {
      cy.CheckGrcMainPage()
      certificatePolicy.enforce = true
      certificatePolicy.inform = false
      verifyPolicyInListing({ certificatePolicyName, ...certificatePolicy})
    })

    it('Inform certificate policy', () => {
      cy.CheckGrcMainPage()
      informPolicyInListing(certificatePolicyName)
    })

    it('Check informed certificate policy', () => {
      cy.CheckGrcMainPage()
      certificatePolicy.enforce = false
      certificatePolicy.inform = true
      verifyPolicyInListing({ certificatePolicyName, ...certificatePolicy})
    })

    it('Delete issuer', () => {
      cy.CheckGrcMainPage()
      deletePolicyInListing(createIssuerName)
      verifyPolicyNotInListing(createIssuerName)
    })

    it('Delete certificate', () => {
      cy.CheckGrcMainPage()
      deletePolicyInListing(createCertificateName)
      verifyPolicyNotInListing(createCertificateName)
    })

    it('Delete certificate policy', () => {
      cy.CheckGrcMainPage()
      deletePolicyInListing(certificatePolicyName)
      verifyPolicyNotInListing(certificatePolicyName)
    })
})
