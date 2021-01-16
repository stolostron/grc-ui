/* Copyright (c) 2020 Red Hat, Inc. */
/// <reference types="cypress" />
import { selectItems } from './common'

const timestampRegexp = /^(an?|[0-9]+) (days?|hours?|minutes?|few seconds) ago$/

export const getDefaultSubstitutionRules = (uName) => {
  let label = '[]'
  let timestamp = ''
  if (process.env.MANAGED_CLUSTER_NAME !== undefined) {
    label = `- {key: name, operator: In, values: ["${process.env.MANAGED_CLUSTER_NAME}"]}`
  }
  if (Cypress.env('RESOURCE_ID')) {
    timestamp = Cypress.env('RESOURCE_ID')
  }
  const substitutions = [
      [ /\[LABEL\]/g, label ],
      [ /\[UNAME\]/g, uName ],
      [ /\[TIME\]/g, timestamp ],
      [ /\[ID\]/g, timestamp ]
  ]
  return substitutions
}

export const createPolicyFromYAML = (policyYAML, create=false) => {
  console.log(policyYAML)
  cy.toggleYAMLeditor('On')
    .YAMLeditor()
    .invoke('setValue', policyYAML)
    // create
    .then(() => {
      if (create) {
        cy.get('#create-button-portal-id-btn').click()
      }
    })
    // after creation, always return to grc main page
    cy.CheckGrcMainPage()
}

// this function is mainly used to testing selection on the create policy page
export const createPolicyFromSelection = (uPolicyName, create=false, policyConfig) => {
  // fill the form uName
  cy.get('input[aria-label="name"]')
    .clear()
    .type(uPolicyName)
  // namespace
  cy.get('.bx--dropdown[aria-label="Choose an item"]')
    .click()
    .contains(policyConfig['namespace'])
    .click()
  //specs
    .then(() => {
      selectItems(policyConfig['specifications'], '.bx--multi-select[aria-label="specs"]')
    })
  // cluster binding
    .then(() => {
      selectItems(policyConfig['cluster_binding'], '.bx--multi-select[aria-label="clusters"]', )
    })
  // standards
    .then(() => {
      selectItems(policyConfig['standards'], '.bx--multi-select[aria-label="standards"]', )
    })
  // categories
    .then(() => {
      selectItems(policyConfig['categories'], '.bx--multi-select[aria-label="categories"]', )
    })
  // controls
    .then(() => {
      selectItems(policyConfig['controls'], '.bx--multi-select[aria-label="controls"]', )
    })
  // enforce
    .then(() => {
      if (policyConfig['enforce']) {
        cy.get('input[aria-label="enforce"][type="checkbox"]')
          .next('label')
          .click()
      }
    })
  // disable
    .then(() => {
      if (policyConfig['disable']) {
        cy.get('input[aria-label="disabled"][type="checkbox"]')
          .next('label')
          .click()
      }
    })
  // create
    .then(() => {
      if (create) {
        cy.get('#create-button-portal-id-btn').click()
      }
    })

    // after creation, always return to grc main page
    cy.CheckGrcMainPage()
}

// enabled='enabled', checking if policy is enabled; enabled='disabled', checking if policy is disabled
// targetStatus = 0, don't check policy status; targetStatus = 1, check policy status is non-violation
// targetStatus = 2, check policy status is violation; targetStatus = 3, check policy status is pending
export const verifyPolicyInListing = (
  uName, policyConfig, enabled='enabled',
  targetStatus=0, violationsCounter=''
  ) => {
  doTableSearch(uName)
  cy.get('.grc-view-by-policies-table').within(() => {
    console.log(uName)
    cy.log(uName)
    cy.get('a').contains(uName).parents('td').siblings('td')
    .spread((namespace, remediation, violations, standards, categories, controls) => {
      // check namespace
      if (policyConfig['namespace']) {
        cy.wrap(namespace).contains(policyConfig['namespace'].trim(), { matchCase: false })
      }
      // check enforce/inform
      if (policyConfig['enforce'] == true) {
        cy.wrap(remediation).contains('enforce', { matchCase: false })
      } else if (policyConfig['enforce'] == false) {
        cy.wrap(remediation).contains('inform', { matchCase: false })
      }
      // check the violation status
      if ([1,2,3].includes(targetStatus)) {
        cy.wrap(violations).find('svg').then((elems) => {
          if (elems.length === 1) {
            getStatusIconFillColor(targetStatus) === elems[0].getAttribute('fill').trim().toLowerCase()
          }
        })
      }
      // check the cluster violations value
      if (violationsCounter) {
        cy.wrap(violations.textContent).should('match', new RegExp('^'+violationsCounter+'$'))
      }
      // check standard
      if (policyConfig['standards']) {
        for (const std of policyConfig['standards']) {
          cy.wrap(standards).contains(std.trim())
        }
      }
      // check categories
      if (policyConfig['categories']) {
        for (const cat of policyConfig['categories']) {
          cy.wrap(categories).contains(cat.trim())
        }
      }
      // check controls
      if (policyConfig['controls']) {
        for (const ctl of policyConfig['controls']) {
          cy.wrap(controls).contains(ctl.trim())
        }
      }
    })

    if (enabled.toLowerCase() === 'disabled') { // check disabled policy
      cy.get('a')
      .contains(uName)
      .siblings('span')
      .contains('disabled', { matchCase: false })
      .then(() => isPolicyStatusAvailable(uName)) // check policy status, it should not be available
      .then((v) => expect(v).to.be.false)
    } else { // check enabled policy
      cy.get('a')
        .contains(uName)
        .siblings('span')
        .should('not.exist')
    }
  })
  clearTableSearch()
}

export const verifyPolicyNotInListing = (uName) => {
  // either there are no policies at all or there are some policies listed
  if (!Cypress.$('#page').find('div.no-resouce'.length)) {
    cy.get('.grc-view-by-policies-table').within(() => {
      cy.get('a')
        .contains(uName)
        .should('not.exist')
    })
  }
}

export const actionPolicyActionInListing = (uName, action, cancel=false) => {
  cy.CheckGrcMainPage()
  doTableSearch(uName)
  cy.get('.grc-view-by-policies-table').within(() => {
    cy.get('a')
      .contains(uName)
      .parents('td')
      .siblings('td')
      .last()
      .click()
  })
  .then(() => {
    cy.get('button').contains(action, { matchCase: false }).click()
  })
  .then(() => {
    cy.get('.bx--modal-container').within(() => {
      if (cancel) {
        cy.get('button').contains('Cancel', { matchCase: false })
          .click()
      } else {
        cy.get('button').contains(action, { matchCase: false })
          .click()
      }
    })
  })
  // wait for the dialog to be closed
  .then(() => {
    cy.get('.bx--modal-container').should('not.exist')
  })
  // after mainpage table action, always return to grc main page
  cy.CheckGrcMainPage()
  clearTableSearch()
}

// needs to be run either at /multicloud/policies/all or /multicloud/policies/all/{namespace}/{policy} page
// here statusPending = true to check consist pending status for disable policy
export const isPolicyStatusAvailable = (uName, violationsCounter) => {
  let statusAvailable
  // page /multicloud/policies/all
  //if (window.location.toString().endsWith('/multicloud/policies/all')) {
return cy.url().then((pageURL) => {
  if (pageURL.endsWith('/multicloud/policies/all')) {
    cy.get('[aria-label="Sortable Table"]').within(() => {
    cy.get('a').contains(uName).parents('td').siblings('td').spread((namespace, remediation, violations) => {
      // check the violation status
      cy.wrap(violations).find('path').then((elems) => {
        if (elems.length === 1) {
          const d = elems[0].getAttribute('d')
          // M569 seem to be unique to an icon telling that policy status is not available for some cluster
          statusAvailable = !d.startsWith('M569')
          if (statusAvailable && violationsCounter) { // also check if violations counter matches
            if (violations.textContent.indexOf(violationsCounter) < 0) { // not found
              statusAvailable = false
            }
          }
        }
      })
    })
  })
  .then(() => statusAvailable)
  } else { // other pages
    cy.get('.violationCell').spread((violations) => {
      // check the violation status
      cy.wrap(violations).find('path').then((elems) => {
        if (elems.length == 1) {
          const d = elems[0].getAttribute('d')
          // M569 seem to be unique to an icon telling that policy status is not available for some cluster
          statusAvailable = !d.startsWith('M569')
        }
      })
    })
    .then(() => statusAvailable)
  }
})
}

export const verifyPolicyInPolicyDetails = (
  uName, policyConfig, enabled='enabled',
  targetStatus=0, violationsCounter=''
  ) => {
  //cy.get('div.vertical-expend').then((e) => {
  cy.get('#compliance\\.details-expand').within(() => {
    cy.get('div.pf-c-description-list__text').spread((
      name, namespace, enforcement, disabled, violations,
      categories, controls, standards, created
      ) => {
      // check name
      cy.wrap(name).contains(uName)
      // check namespace
      if (policyConfig['namespace']) {
        cy.wrap(namespace).contains(policyConfig['namespace'])
      }
      // check enforce/inform
      if (policyConfig['enforce'] == true) {
        cy.wrap(enforcement).contains('enforce', { matchCase: false })
      } else if (policyConfig['enforce'] == false) {
        cy.wrap(enforcement).contains('inform', { matchCase: false })
      }
      // check state
      if (enabled == 'enabled') {
        cy.wrap(disabled).contains('false')
      } else {
        cy.wrap(disabled).contains('true')
      }
      if ([1,2,3].includes(targetStatus)) {
        // check the violation status
        cy.wrap(violations).find('svg').then((elems) => {
          if (elems.length === 1) {
            getStatusIconFillColor(targetStatus) === elems[0].getAttribute('fill').trim().toLowerCase()
          }
        })
      }
      // check violations counter
      if (violationsCounter) {
        cy.wrap(violations).contains(new RegExp('^'+violationsCounter+'$'))
      }
      // check categories
      if (policyConfig['categories']) {
        for (const cat of policyConfig['categories']) {
          cy.wrap(categories).contains(cat)
        }
      }
      // check controls
      if (policyConfig['controls']) {
        for (const ctl of policyConfig['controls']) {
          cy.wrap(controls).contains(ctl)
        }
      }
      // check standard
      if (policyConfig['standards']) {
        for (const std of policyConfig['standards']) {
          cy.wrap(standards).contains(std)
        }
      }
      // check creation time
      cy.wrap(created).contains(timestampRegexp)
    })
  })
}

const getStatusIconFillColor = (targetStatus) => {
  switch(targetStatus) {
    case 1: // 467f40 is the unique non-volation status color
    case 'compliant':
      return '#467f40'
    case 2: // c9190b is the unique violation status color
    case 'not compliant':
      return '#c9190b'
    case 3:
    default: // f0ab00 is the unique pending status color
    case 'no status':
      return '#f0ab00'
  }
}


export const verifyPlacementRuleInPolicyDetails = (policyName, policyConfig, clusterViolations, checkLength=true) => {
  cy.get('section[aria-label="Placement rule"]').within(() => {
    cy.get('.bx--structured-list-td').spread((
      label1, name, label2, namespace, label3,
      selector, label4, decisions, label5, timestamp
      ) => {
      // check name
      cy.wrap(name).contains('placement-'+policyName)
      // check namespace
      if (policyConfig['namespace']) {
        cy.wrap(namespace).contains(policyConfig['namespace'])
      }
      // check binding selector
      if (policyConfig['binding_selector']) {
        // FIXME: in theory there could be multiple bindings
        cy.wrap(selector).contains(policyConfig['binding_selector'][0])
      }
      // check Decisions
      if (clusterViolations) {
        // check the number of clusters listed matches the configuration
        // for each cluster check that the expected status is listed
        if (checkLength) {
          cy.wrap(decisions).find('a').should('have.length', Object.keys(clusterViolations).length)
        }
        cy.then(() => {
          for (const clusterName in clusterViolations) {
            cy.wrap(decisions).within(() => {
              // find cluster name
              cy.get('a').contains(clusterName)
                .next().as('clusterStatus')
              // check status
                .then(() => {
                  const clusterStatus = getClusterPolicyStatus(clusterViolations[clusterName]).toLowerCase()
                  cy.get('@clusterStatus').contains(clusterStatus)
                  // check status icon
                  const fillColor = getStatusIconFillColor(clusterStatus)
                  cy.get('@clusterStatus').find('svg').should('have.attr', 'fill', fillColor)
                })
            })
          }
        })
      }
      // check creation time
      cy.wrap(timestamp).contains(timestampRegexp)
    })
  })
}

// will add more check to enhance it later
export const verifyPolicyInPolicyStatus = (uName) => {
  cy.get('.pf-c-toggle-group__button').contains('Templates')
  .click()
  .then(() => {
    cy.get('.policy-status-by-templates-table .pf-c-title').contains(uName)
    verifyPolicyInPolicyHistory(uName)
  })
}

// will add more check to enhance it later
export const verifyPolicyInPolicyHistory = (uName) => {
  cy.get('tbody tr td a').contains('View history', { matchCase: false }).first()
  .click()
  .then(() => {
    cy.get('div h4').contains(uName, { matchCase: false })
  })
}

export const verifyPolicyByYAML = (uName, originalYAML, ingoreClusterSelector=true) => {
  cy.CheckGrcMainPage()
  cy.get('.grc-view-by-policies-table').within(() => {
    cy.get('a')
      .contains(uName)
      .parents('td')
      .siblings('td')
      .last()
      .click()
  })
  .then(() => {
    cy.get('button').contains('Edit', { matchCase: false }).click()
  })
  .then(() => {
    cy.get('.bx--modal-container').within(() => {
      cy.log(ingoreClusterSelector)
      // // eslint-disable-next-line cypress/no-assigning-return-values
      // const acutalYAML = cy.YAMLeditor().first().invoke('getValue')
      // cy.log(acutalYAML)
    })
  })

  // after mainpage table action, always return to grc main page
  cy.CheckGrcMainPage()
}

export const getPolicyTemplatesNameAndKind = (policyName, policyConfig) => {
  const templates = new Set()
  for (const specification of policyConfig['specifications']) {
    const shortSpec = specification.split('-')[0].trim() // get only part before '-'

    switch(shortSpec) {
    case 'CertificatePolicy':
      templates.add(policyName+'-cert-expiration'+'/'+'CertificatePolicy')
      break
    case 'ComplianceOperator':
      templates.add('comp-operator-ns'+'/'+'ConfigurationPolicy')
      templates.add('comp-operator-operator-group'+'/'+'ConfigurationPolicy')
      templates.add('comp-operator-subscription'+'/'+'ConfigurationPolicy')
      break
    case 'EtcdEncryption':
      templates.add(policyName+'-etcd-encryption'+'/'+'ConfigurationPolicy')
      break
    case 'GatekeeperOperator':
      templates.add('gatekeeper-operator-ns'+'/'+'ConfigurationPolicy')
      templates.add('gatekeeper-operator-catalog-source'+'/'+'ConfigurationPolicy')
      templates.add('gatekeeper-operator-group'+'/'+'ConfigurationPolicy')
      templates.add('gatekeeper-operator-subscription'+'/'+'ConfigurationPolicy')
      templates.add('gatekeeper'+'/'+'ConfigurationPolicy')
      break
    case 'IamPolicy':
      templates.add(policyName+'-limit-clusteradmin'+'/'+'IamPolicy')
      break
    case 'ImageManifestVulnPolicy':
      templates.add(policyName+'-image-vulnerabilities'+'/'+'ConfigurationPolicy')
      templates.add(policyName+'-image-vulnerability-sub'+'/'+'ConfigurationPolicy')
      break
    case 'LimitRange':
      templates.add(policyName+'-container-mem-limit-range'+'/'+'ConfigurationPolicy')
      break
    case 'Namespace':
      templates.add(policyName+'-prod-ns'+'/'+'ConfigurationPolicy')
      break
    case 'Pod':
      templates.add(policyName+'-nginx-pod'+'/'+'ConfigurationPolicy')
      break
    case 'PodSecurityPolicy':
      templates.add(policyName+'-restricted-psp'+'/'+'ConfigurationPolicy')
      break
    case 'Role':
      templates.add(policyName+'-deployments-role'+'/'+'ConfigurationPolicy')
      break
    case 'RoleBinding':
      templates.add(policyName+'-operatoruser-rolebinding'+'/'+'ConfigurationPolicy')
      break
    case 'SecurityContextConstraints':
      templates.add(policyName+'-restricted-scc'+'/'+'ConfigurationPolicy')
      break
    }
  }
  return Array.from(templates)
}

// from the set of known violations per cluster read just violations relevant for the particular policy
export const getViolationsPerPolicy = (policyName, policyConfig, clusterViolations, clusters = undefined) => {
  const violations = {}
  const templates = getPolicyTemplatesNameAndKind(policyName, policyConfig)
  if (clusters == undefined) {  // clusters were not defined, get a list of all cluster names from the clusterViolations dictionary
    clusters = Object.keys(clusterViolations).filter((value) => { return value != '*' }) // get all keys except the default/wildcard '*' when present
  }
  for (const cluster of clusters) {
    violations[cluster] = []
  }
  for (const template of templates) {
    const templateName = template.split('/', 2)[0]
    for (const cluster of clusters) {
      let violationList = []  // will contain a list of violations for the specific cluster
      if (cluster in clusterViolations) {  // I know violations for the specific cluster in clusterViolations
        violationList = clusterViolations[cluster]
      }
      else if ('*' in clusterViolations) {  // I am using the default/wildcard '*' settings from clusterViolations
        violationList = clusterViolations['*']
      }
      for (const clusterViolation of violationList) {
        if (clusterViolation.startsWith(templateName+'-')) {
          violations[cluster].push(clusterViolation)
        }
      }
    }
  }
  return violations
}

export const getClusterPolicyStatus = (clusterViolations) => {
  // in theory there could be multiple violations found by one policy
  if (clusterViolations.length == 1 && clusterViolations[0].endsWith('-0')) {
    return 'Compliant'
  } else {
    return 'Not Compliant'
  }
}


export const getViolationsCounter = (clusterViolations) => {
  let violations = 0
  const clusters = Object.keys(clusterViolations).length
  for (const cluster in clusterViolations) {
    // in theory there could be multiple violations found by one policy
    // in case the only violation template here is not for success (suffix -0), increase violations counter
    if (!(clusterViolations[cluster].length == 1 && clusterViolations[cluster][0].endsWith('-0'))) {
      violations = violations + 1
    }
  }
  return violations+'/'+clusters
}

export const verifyPolicyInPolicyDetailsTemplates = (uName, policyConfig) => {
  cy.get('#policy-templates-table-container').within(() => {
    const templates = getPolicyTemplatesNameAndKind(uName, policyConfig)
    for (const template of templates) {
      const [templateName, templateKind] = template.split('/', 2)
      cy.get('tr[data-row-name="'+templateName+'"]').children().spread((name, visibleAPIver, visibleKind) => {
        // double-check name
        cy.wrap(name).contains(templateName)
        // check api version
        cy.wrap(visibleAPIver).contains(policyConfig['apiVersion'])
        // check kind
        cy.wrap(visibleKind).contains(templateKind)
      })
    }
  })
}

export const verifyPlacementBindingInPolicyDetails = (uName, policyConfig) => {
  cy.get('section[aria-label="Placement binding"]').within(() => {
    cy.get('.bx--structured-list-td').spread((
      label1, name, label2, namespace, label3,
      placement_rule, label4, subjects, label5, timestamp
      ) => {
        cy.wrap(name).contains('binding-'+uName)
        if (policyConfig['namespace']) {
          cy.wrap(namespace).contains(policyConfig['namespace'])
        }
        cy.wrap(placement_rule).contains('placement-'+uName)
        if (policyConfig['apiVersion']) {
          let apiVer = policyConfig['apiVersion']
          apiVer = apiVer.substring(0, apiVer.length - 3)
          cy.wrap(subjects).contains(uName+'('+apiVer+')')
        }
        cy.wrap(timestamp).contains(timestampRegexp)
      })
    })
}


// does the search using the search form
// so far tested only on the policy status page
export const doTableSearch = (text, parentElement = null) => {
  // do the search only if there are resources on the page
  if (Cypress.$('#page').find('div.no-resouce').length > 1) {
    // FIXME - do this search without a force
    cy.get('input[aria-label="Search input"]', {withinSubject: parentElement}).clear({force: true}).type(text, {force: true})
  }
}

export const clearTableSearch = (parentElement = null) => {
  // clear the search only if there are resources on the page
  if (!Cypress.$('#page').find('div.no-resouce'.length)) {
    // FIXME - do this without a force
    cy.get('input[aria-label="Search input"]', {withinSubject: parentElement}).clear({force: true})
  }
}



export const verifyViolationsInPolicyStatusClusters = (clusterViolations, violationPatterns, clusters = undefined) => {
  if (clusters == undefined) {
    clusters = Object.keys(clusterViolations)
  }
  for (const cluster of clusters) {
    for (const patternId of clusterViolations[cluster]) {
      // from a messageId having format "templateName-id' parse both templateName and id
      const templateName = patternId.replace(/-[^-]*$/, '')
      const id = patternId.replace(/^.*-/, '')
      // now use the search to better target the required policy and to get it on the first page
      doTableSearch(templateName)
      cy.get('tbody').within(() => {
        cy.get('td').contains(new RegExp('^'+cluster+'$')).parents('td').siblings('td').spread((clusterStatus, template, message, lastReport, history) => {
          // check status
          let expectedStatus = 'Compliant'
          if (id > 0) { expectedStatus = 'Not compliant' }
          cy.wrap(clusterStatus).contains(expectedStatus)
          // check status icon
          const fillColor = getStatusIconFillColor(expectedStatus.toLowerCase())
          cy.wrap(clusterStatus).find('svg').should('have.attr', 'fill', fillColor)
          // double-check template
          cy.wrap(template).contains(templateName)
          // check message
          // FIXME: here we should have a function that split the content per ';' and tests each part agains Compliant/NonCompliant and expected messages
          if (id == 0) {
            cy.wrap(message).contains(new RegExp('Compliant; '+violationPatterns[templateName][id]))
            cy.log(message)
          } else {
            cy.wrap(message).contains(new RegExp('NonCompliant; '+violationPatterns[templateName][id]))
            cy.log(message)
          }
          // check last report timestamp
          cy.wrap(lastReport).contains(timestampRegexp)
          // check View history link
          cy.wrap(history).within(() => {
            cy.get('a').contains('View history')
          })
        })
      })
    }
  }
  clearTableSearch()
}

export const verifyViolationsInPolicyStatusTemplates = (clusterViolations, violationPatterns, clusters = undefined) => {
  if (clusters == undefined) {
    clusters = Object.keys(clusterViolations)
  }
  for (const cluster of clusters) {
    for (const patternId of clusterViolations[cluster]) {
      // from a messageId having format "templateName-id' parse both templateName and id
      const templateName = patternId.replace(/-[^-]*$/, '')
      const id = patternId.replace(/^.*-/, '')
      // now find the right search (there could be more) to better target the required cluster result and to get it on the first page
      // FIXME: this should be replaced by a separate function/command doing this, ideally without 'force'
      cy.get('h4').contains(new RegExp('^'+templateName+'$')).parent('div.policy-status-by-templates-table').as('form')
      cy.get('@form').then(e => doTableSearch(cluster, e))
      cy.get('@form').within(() => {
        cy.get('tbody').within(() => {
          cy.get('td').contains(new RegExp('^'+cluster+'$')).parents('td').siblings('td').spread((clusterStatus, message, lastReport, history) => {
            // check status
            let expectedStatus = 'Compliant'
            if (id > 0) { expectedStatus = 'Not compliant' }
            cy.wrap(clusterStatus).contains(expectedStatus)
            // check status icon
            const fillColor = getStatusIconFillColor(expectedStatus.toLowerCase())
            cy.wrap(clusterStatus).find('svg').should('have.attr', 'fill', fillColor)
            // check message
            // FIXME: here we should have a function that split the content per ';' and tests each part agains Compliant/NonCompliant and expected messages
            if (id == 0) {
              cy.wrap(message).contains(new RegExp('Compliant; '+violationPatterns[templateName][id]))
              cy.log(message)
            } else {
              cy.wrap(message).contains(new RegExp('NonCompliant; '+violationPatterns[templateName][id]))
              cy.log(message)
            }
            // check last report timestamp
            cy.wrap(lastReport).contains(timestampRegexp)
            // check View history link
            cy.wrap(history).within(() => {
              cy.get('a').contains('View history')
            })
          })
        })
      })
    }
  }
}

export const verifyPolicyDetailsInCluster =  (policyName, policyConfig) => {
  cy.goToPolicyClusterPage(policyName, policyConfig)
  cy.get('section[aria-label="Policy details"]').within(() => {
    cy.get('.bx--structured-list-td').spread((nameLabel, name, clusterLabel, cluster, messageLabel, message, statusLabel, status, enforcementLabel, enforcement ) => {
        if (policyConfig['namespace']) {
          cy.wrap(name).contains(policyConfig['namespace']+'.'+policyName)
        }
        if (policyConfig['cluster_binding']) {
          const clustBind = policyConfig['cluster_binding'].toString().split(':')
          const binded_cluster = clustBind[1].substring(2, clustBind[1].length-1)
          cy.wrap(cluster).contains(binded_cluster)
        }
        cy.wrap(message).contains(policyName+'-example: Compliant,')
        cy.wrap(status).contains('Compliant')
        policyConfig['enforce']==='true' ? cy.wrap(enforcement).contains('enforce') : cy.wrap(enforcement).contains('inform')
      })
    })
}

export const verifyPolicyTemplatesInCluster = (policyName, policyConfig) => {
  cy.get('#policyTemplates-table-container').within(() => {
    cy.get('tbody').children('tr[data-row-name="'+policyName+'-example"]').spread((nameLabel, name, apiLabel, api, kindLabel, kind, compliantLabel, compliant) => {
      cy.wrap(name).contains(policyName+'-example')
      if(policyConfig['apiVersion']) {
        cy.wrap(api).contains(policyConfig['apiVersion'])
      }
      if(policyConfig['kind']) {
        cy.wrap(kind).contains(policyConfig['kind'])
      }
      cy.wrap(compliant).contains('Compliant')
      })
    })
}
