/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
// const AAT = require('@ibma/aat')
// const fs = require('fs')
// const path = require('path')
// const _ = require('lodash')

// module.exports = {
//   runAccessibilityScan: (browser, page) => {
//     const disableA11y = browser.globals.disable_a11y
//     if(disableA11y){
//       // eslint-disable-next-line no-console
//       console.log(`A11Y TEST DISABLED ${page}`)
//     }
//     else{
//       browser.source(source => {
//         browser.perform((done) => {
//           AAT.getCompliance(source.value, page, (report) => {
//             const reportSnap = JSON.parse(fs.readFileSync(path.join(__dirname,`/A11y-snapshot/${page}.json`), 'utf8'))
//             if(report.summary.counts.violation !== reportSnap.summary.counts.violation){
//               const currentViolations = _.filter(report.reports[0].issues,{'level':'violation'})
//               const currentPotentialViolations = _.filter(report.reports[0].issues,{'level':'potentialviolation'})
//               const snapshotViolations = _.filter(reportSnap.reports[0].issues,{'level':'violation'})
//               const snapshotPotentialViolations = _.filter(reportSnap.reports[0].issues,{'level':'potentialviolation'})
//               // eslint-disable-next-line no-console
//               console.log('Violations from current page',_.countBy(currentViolations,'ruleId'))
//               // eslint-disable-next-line no-console
//               console.log('Violations from snapshot',_.countBy(snapshotViolations,'ruleId'))
//               // console.log('Violation difference', _.difference(currentViolations,snapshotViolations))
//               // eslint-disable-next-line no-console
//               console.log('Potential violations from current page',_.countBy(currentPotentialViolations,'ruleId'))
//               // eslint-disable-next-line no-console
//               console.log('Potential violations from snapshot',_.countBy(snapshotPotentialViolations,'ruleId'))
//               // console.log('Potential violation difference', _.difference(currentPotentialViolations,snapshotPotentialViolations))
//               // eslint-disable-next-line no-console
//               console.log('------------TO FIND RULE SET--------------')
//               // eslint-disable-next-line no-console
//               console.log('GO TO http://ibm.biz/A11yToolsLandingPage AND CLICK ON RULES TAB')
//             }

//             if(report.issueMessages.messages && report.summary.counts.violation > 0) {
//               // eslint-disable-next-line no-console
//               console.log('----- ITEMIZED A11Y ERRORS: --------------------------------------')
//               // eslint-disable-next-line no-console
//               console.log(report.issueMessages.messages)
//               // eslint-disable-next-line no-console
//               console.log('------------------------------------------------------------------')
//             }

//             browser.assert.equal(report.summary.counts.violation, reportSnap.summary.counts.violation, `Check for accesibility violations in page ${browser.launchUrl}/policy/${page}   See report at: ./tests-output/a11y/${page}.json`)

//             done()
//           })
//         })
//       })
//     }
//   }
// }
