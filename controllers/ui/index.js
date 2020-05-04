/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

const express = require('express'),
    router = express.Router(),
    app = require('./app'),
    inspect = require('security-middleware')

router.all(['/', '/*'], inspect.ui(), app)

module.exports = router
