'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _windowOrGlobal = require('window-or-global');

var _windowOrGlobal2 = _interopRequireDefault(_windowOrGlobal);

var _carbonComponentsReact = require('carbon-components-react');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _ref2 = _react2.default.createElement(
  'svg',
  { width: '24', height: '24', viewBox: '0 0 24 24' },
  _react2.default.createElement('path', { fill: '#D8D8D8', d: 'M0 0h24v24H0z', fillRule: 'evenodd' })
);

var DetailPageHeader = function (_Component) {
  _inherits(DetailPageHeader, _Component);

  function DetailPageHeader() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, DetailPageHeader);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = DetailPageHeader.__proto__ || Object.getPrototypeOf(DetailPageHeader)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      isScrolled: _this.props.isScrolled || false,
      isScrollingDownward: _this.props.isScrollingDownward || false,
      lastPosition: 0
    }, _this.handleScroll = function () {
      var lastPosition = _this.state.lastPosition;


      var currentPosition = _windowOrGlobal2.default.pageYOffset || 0;

      if (currentPosition > 86) {
        if (currentPosition > lastPosition) {
          _this.setState({
            isScrolled: true,
            isScrollingDownward: true,
            lastPosition: currentPosition
          });
        } else {
          _this.setState({
            isScrolled: true,
            isScrollingDownward: false,
            lastPosition: currentPosition
          });
        }
      } else {
        _this.setState({
          isScrolled: false,
          isScrollingDownward: false,
          lastPosition: currentPosition
        });
      }
    }, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(DetailPageHeader, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._debouncedScroll = (0, _lodash2.default)(this.handleScroll, 25);
      _windowOrGlobal2.default.addEventListener('scroll', this._debouncedScroll);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.isScrolled !== this.props.isScrolled) {
        this.setState({ isScrolled: nextProps.isScrolled });
      }

      if (nextProps.isScrollingDownward !== this.props.isScrollingDownward) {
        this.setState({ isScrollingDownward: nextProps.isScrollingDownward });
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      _windowOrGlobal2.default.removeEventListener('scroll', this._debouncedScroll);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          children = _props.children,
          title = _props.title,
          hasTabs = _props.hasTabs,
          statusColor = _props.statusColor,
          statusContent = _props.statusContent,
          statusText = _props.statusText,
          other = _objectWithoutProperties(_props, ['children', 'title', 'hasTabs', 'statusColor', 'statusContent', 'statusText']);

      var _state = this.state,
          isScrolled = _state.isScrolled,
          isScrollingDownward = _state.isScrollingDownward;


      var defaultIcon = _ref2;

      var withTabs = hasTabs ? 'bx--detail-page-header--with-tabs' : 'bx--detail-page-header--no-tabs';

      var scrolled = isScrollingDownward ? 'bx--detail-page-header--scroll' : null;

      var classNames = (0, _classnames2.default)('bx--detail-page-header', withTabs, scrolled);

      var breadcrumb = void 0;
      var tabs = void 0;
      var overflow = void 0;
      var icon = void 0;

      _react.Children.map(children, function (child) {
        if (child.type === _carbonComponentsReact.Breadcrumb) {
          breadcrumb = child;
        }

        if (child.type === _carbonComponentsReact.Tabs) {
          tabs = child;
        }

        if (child.type === _carbonComponentsReact.OverflowMenu) {
          overflow = child;
        }

        if (child.type === _carbonComponentsReact.Icon) {
          icon = child;
        }

        return null;
      });

      var statusStyles = {
        backgroundColor: statusColor
      };

      icon = icon === undefined ? defaultIcon : icon;

      return _react2.default.createElement(
        'header',
        _extends({}, other, { className: classNames, 'data-header-active': isScrolled }),
        _react2.default.createElement(
          'div',
          { className: 'bx--detail-page-header-content' },
          breadcrumb,
          _react2.default.createElement(
            'div',
            { className: 'bx--detail-page-header-title-container' },
            _react2.default.createElement(
              'div',
              { className: 'bx--detail-page-header-icon-container' },
              icon
            ),
            _react2.default.createElement(
              'h1',
              { className: 'bx--detail-page-header-title' },
              title
            ),
            _react2.default.createElement(
              'div',
              { className: 'bx--detail-page-header-status-container' },
              _react2.default.createElement('div', {
                style: statusStyles,
                className: 'bx--detail-page-header-status-icon'
              }),
              ' ',
              _react2.default.createElement(
                'span',
                { className: 'bx--detail-page-header-status-text' },
                statusText,
                statusContent
              )
            )
          ),
          tabs
        ),
        _react2.default.createElement(
          'div',
          { className: 'bx--detail-page-header-menu' },
          overflow
        )
      );
    }
  }]);

  return DetailPageHeader;
}(_react.Component);

DetailPageHeader.propTypes = {
  children: _propTypes2.default.node,
  title: _propTypes2.default.string.isRequired,
  role: _propTypes2.default.string,
  statusColor: _propTypes2.default.string,
  statusContent: _propTypes2.default.node,
  statusText: _propTypes2.default.string,
  hasTabs: _propTypes2.default.bool,
  isScrolled: _propTypes2.default.bool,
  isScrollingDownward: _propTypes2.default.bool
};
DetailPageHeader.defaultProps = {
  title: 'Provide a title',
  statusText: 'Running',
  role: 'banner', // a11y compliance
  hasTabs: false
};
exports.default = DetailPageHeader;