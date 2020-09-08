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
let page, common

module.exports = {
  '@disabled': false,

  before: (browser) => {
    const loginPage = browser.page.LoginPage()
    loginPage.navigate()
    loginPage.authenticate()

    page = browser.page.AllPolicyPage()
    common = browser.page.CommonPage()
  },

  'GRC Create policy page: Verify templates': (browser) => {
    const templates = [
      'CertificatePolicy',
      'IamPolicy',
      'ImageManifestVulnPolicy',
      'LimitRange',
      'Namespace',
      'Pod',
      'PodSecurityPolicy',
      'Role',
      'RoleBinding',
      'SecurityContextConstraints'
    ]
    const time = browser.globals.time
    let policyName = '', templateFile = ''
    templates.forEach(t => {
      policyName = `${time}-${t}-policy-test`
      templateFile = `${t}_template.yaml`
      page.createTestPolicy(false, { policyName: policyName, specification: [t] }, templateFile)
    })
  },

  'GRC Create policy page: Updating YAML in editor': () => {
    page.updateYamlEditor()
  },

  'GRC All policy page: Create, Search, Verify details of policy': (browser) => {
    const time = browser.globals.time
    const policyName = `${time}-policy-test`
    const templateFile = 'modifiedIMVP_template.yaml'
    const policySpec = {
      policyName: policyName,
      specification: ['ImageManifestVulnPolicy'],
      standards: ['FISMA'],
      categories: ['PR.DS Data Security'],
      controls: ['DE.CM-7 Monitoring for unauthorized activity']
    }
    page.createTestPolicy(true, policySpec, templateFile)
    common.checkViolations(policyName, true)
    common.searchPolicy(policyName, true)
    page.testPolicySidePanel()
    page.testFilters(policySpec)
    common.searchPolicy(policyName, true)
    page.verifyPolicyTable(policyName, templateFile)
    page.testDetailsPage(policyName, templateFile)
  },

  'GRC All policy page: Verify summary table': (browser) => {
    page.verifySummary(browser, `${browser.launch_url}${config.get('contextPath')}/all`)
  },

  'GRC All policy page: Test pagination': (browser) => {
    page.verifyPagination(browser)
  },

  'GRC All policy page: Delete test policy': (browser) => {
    const time = browser.globals.time
    const policyName = `${time}-policy-test`
    common.deletePolicy(policyName)
  }

}
