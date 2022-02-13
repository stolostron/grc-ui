/* Copyright (c) 2020 Red Hat, Inc. */
/* Copyright Contributors to the Open Cluster Management project */

/// <reference types="cypress" />
import { getDefaultSubstitutionRules } from '../../support/views'
//import { getUniqueResourceName } from '../../scripts/utils'
import { getConfigObject } from '../../config'

// this demo should only ilustrate how policy violations can be checked
// it doesn't do any set up
// it uses 'ksrot-test-policy' currently available on multicloud-console.apps.dho-461-acm22.dev09.red-chesterfield.com
// along with an expectations that 3 particular clusters are available there too

describe('Testing policy deviations as specified in the violations.yaml config file', () => {
    const policyName = 'ksrot-test-policy'
    //const uPolicyName = getUniqueResourceName(policyName)
    const uPolicyName = policyName
    // optionally read details about configured clusters
    //const confClusters = getConfigObject('demos/violations-demo/clusters.yaml')
    // read all violation message patterns
    const confViolationPatterns = getConfigObject('violation-patterns.yaml', 'yaml', getDefaultSubstitutionRules({policyname:uPolicyName}))

    // read expected cluster violations
    const confClusterViolations = getConfigObject('demos/violations-demo/violations.yaml', 'yaml', getDefaultSubstitutionRules({policyname:uPolicyName}))

    it ('All expected violations are listed', () => {
      cy.visit(`/multicloud/policies/all/default/${uPolicyName}/clusters`)
      // verify all violations per cluster
        .verifyViolationsInPolicyStatusClusters(uPolicyName, {'namespace': 'default'}, confClusterViolations, confViolationPatterns)
      // open the Templates tab - we should have a command for this
      cy.waitUntil(() => cy.get('.pf-c-page__main-nav .pf-c-nav__link').contains('Templates').scrollIntoView().should('be.visible'))
      cy.get('.pf-c-page__main-nav .pf-c-nav__link').contains('Templates').scrollIntoView().should('be.visible').click()
        .waitForPageContentLoad()
      // verify violations per template
        .verifyViolationsInPolicyStatusTemplates(uPolicyName, {'namespace': 'default'}, confClusterViolations, confViolationPatterns)
    })

})
