function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Copyright IBM Corp. 2016, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { settings } from 'carbon-components';
var prefix = settings.prefix;

var Tab =
/*#__PURE__*/
function (_React$Component) {
  _inherits(Tab, _React$Component);

  function Tab() {
    _classCallCheck(this, Tab);

    return _possibleConstructorReturn(this, _getPrototypeOf(Tab).apply(this, arguments));
  }

  _createClass(Tab, [{
    key: "setTabFocus",
    value: function setTabFocus(evt) {
      var leftKey = 37;
      var rightKey = 39;

      if (evt.which === leftKey) {
        this.props.handleTabAnchorFocus(this.props.index - 1);
      } else if (evt.which === rightKey) {
        this.props.handleTabAnchorFocus(this.props.index + 1);
      } else {
        return;
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this = this,
          _anchorProps;

      var _this$props = this.props,
          className = _this$props.className,
          handleTabClick = _this$props.handleTabClick,
          handleTabAnchorFocus = _this$props.handleTabAnchorFocus,
          handleTabKeyDown = _this$props.handleTabKeyDown,
          href = _this$props.href,
          index = _this$props.index,
          label = _this$props.label,
          selected = _this$props.selected,
          tabIndex = _this$props.tabIndex,
          _onClick = _this$props.onClick,
          _onKeyDown = _this$props.onKeyDown,
          renderAnchor = _this$props.renderAnchor,
          other = _objectWithoutProperties(_this$props, ["className", "handleTabClick", "handleTabAnchorFocus", "handleTabKeyDown", "href", "index", "label", "selected", "tabIndex", "onClick", "onKeyDown", "renderAnchor"]);

      var classes = classNames("".concat(prefix, "--tabs__nav-item"), _defineProperty({}, "".concat(prefix, "--tabs__nav-item--selected"), selected), className);
      var anchorProps = (_anchorProps = {
        className: "".concat(prefix, "--tabs__nav-link"),
        href: href,
        role: 'tab',
        tabIndex: tabIndex
      }, _defineProperty(_anchorProps, 'aria-selected', selected), _defineProperty(_anchorProps, "ref", function ref(e) {
        _this.tabAnchor = e;
      }), _anchorProps);
      return React.createElement("li", _extends({}, other, {
        tabIndex: -1,
        className: classes,
        onClick: function onClick(evt) {
          handleTabClick(index, label, evt);

          _onClick(evt);
        },
        onKeyDown: function onKeyDown(evt) {
          _this.setTabFocus(evt);

          handleTabKeyDown(index, label, evt);

          _onKeyDown(evt);
        },
        role: "presentation",
        selected: selected
      }), renderAnchor ? renderAnchor(anchorProps) : React.createElement("a", anchorProps, label));
    }
  }]);

  return Tab;
}(React.Component);

_defineProperty(Tab, "propTypes", {
  /**
   * Specify an optional className to be added to your Tab
   */
  className: PropTypes.string,

  /**
   * A handler that is invoked when a user clicks on the control.
   * Reserved for usage in Tabs
   */
  handleTabClick: PropTypes.func,

  /**
   * A handler that is invoked when a user presses left/right key.
   * Reserved for usage in Tabs
   */
  handleTabAnchorFocus: PropTypes.func,

  /**
   * A handler that is invoked on the key down event for the control.
   * Reserved for usage in Tabs
   */
  handleTabKeyDown: PropTypes.func,

  /**
   * Provide a string that represents the `href` of the Tab
   */
  href: PropTypes.string.isRequired,

  /**
   * The index of your Tab in your Tabs. Reserved for usage in Tabs
   */
  index: PropTypes.number,

  /**
   * Provide the contents of your Tab
   */
  label: PropTypes.node,

  /**
   * Provide an accessibility role for your Tab
   */
  role: PropTypes.string.isRequired,

  /**
   * Provide a handler that is invoked when a user clicks on the control
   */
  onClick: PropTypes.func.isRequired,

  /**
   * Provide a handler that is invoked on the key down event for the control
   */
  onKeyDown: PropTypes.func.isRequired,

  /**
   * Whether your Tab is selected.
   * Reserved for usage in Tabs
   */
  selected: PropTypes.bool.isRequired,

  /**
   * Specify the tab index of the <a> node
   */
  tabIndex: PropTypes.number.isRequired,

  /*
   * An optional parameter to allow overriding the anchor rendering.
   * Useful for using Tab along with react-router or other client
   * side router libraries.
   **/
  renderAnchor: PropTypes.func
});

_defineProperty(Tab, "defaultProps", {
  role: 'presentation',
  label: 'provide a label',
  tabIndex: 0,
  href: '#',
  selected: false,
  onClick: function onClick() {},
  onKeyDown: function onKeyDown() {}
});

export { Tab as default };