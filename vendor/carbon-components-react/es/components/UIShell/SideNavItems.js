/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { settings } from 'carbon-components';
import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
var prefix = settings.prefix;

var SideNavItems = function SideNavItems(_ref) {
  var customClassName = _ref.className,
      children = _ref.children;
  var className = cx(["".concat(prefix, "--side-nav__items")], customClassName);
  return React.createElement("ul", {
    className: className
  }, children);
};

SideNavItems.propTypes = {
  /**
   * Provide an optional class to be applied to the containing node
   */
  className: PropTypes.string,

  /**
   * Provide a single icon as the child to `SideNavIcon` to render in the
   * container
   */
  children: PropTypes.node.isRequired
};
export default SideNavItems;