var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { Icon } from 'carbon-components-react';

var CardContent = function CardContent(_ref) {
  var className = _ref.className,
      children = _ref.children,
      cardIcon = _ref.cardIcon,
      cardTitle = _ref.cardTitle,
      cardLink = _ref.cardLink,
      cardInfo = _ref.cardInfo,
      iconDescription = _ref.iconDescription,
      other = _objectWithoutProperties(_ref, ['className', 'children', 'cardIcon', 'cardTitle', 'cardLink', 'cardInfo', 'iconDescription']);

  var cardContentClasses = classNames(_defineProperty({
    'bx--card__card-overview': true
  }, className, className));

  var cardLinkContent = cardLink ? cardLink.map(function (link, key) {
    return React.createElement(
      'a',
      { key: key, href: link, className: 'bx--about__title--link' },
      link
    );
  }) : '';

  var cardInfoContent = cardInfo ? cardInfo.map(function (info, key) {
    return React.createElement(
      'h4',
      { key: key, className: 'bx--about__title--additional-info' },
      info
    );
  }) : '';

  var cardLinkContentArray = Object.keys(cardLinkContent);
  var cardInfoContentArray = Object.keys(cardInfoContent);

  return React.createElement(
    'div',
    _extends({}, other, { className: cardContentClasses }),
    children,
    React.createElement(
      'div',
      { className: 'bx--card-overview__about' },
      React.createElement(
        'div',
        { className: 'bx--about__icon' },
        React.createElement(Icon, {
          className: 'bx--about__icon--img',
          name: cardIcon,
          description: iconDescription
        })
      ),
      React.createElement(
        'div',
        { className: 'bx--about__title' },
        React.createElement(
          'p',
          { id: 'card-app-title', className: 'bx--about__title--name' },
          cardTitle
        ),
        cardLinkContentArray.map(function (info, key) {
          return cardLinkContent[key];
        }),
        cardInfoContentArray.map(function (info, key) {
          return cardInfoContent[key];
        })
      )
    )
  );
};

CardContent.propTypes = {
  children: PropTypes.node,
  cardIcon: PropTypes.string,
  cardTitle: PropTypes.string,
  cardLink: PropTypes.node,
  cardInfo: PropTypes.array,
  className: PropTypes.string,
  iconDescription: PropTypes.string
};

CardContent.defaultProps = {
  iconDescription: 'card icon',
  cardIcon: 'app-services',
  cardTitle: 'card title'
};

export default CardContent;