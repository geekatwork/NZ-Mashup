import { Fragment } from 'react';
import PropTypes from 'prop-types';

// Simple wrapper component that always renders something for LayersControl
export default function GravelRoadsWrapper({ visible }) {
  // Always return a fragment so LayersControl has something to work with
  return <Fragment />;
}

GravelRoadsWrapper.propTypes = {
  visible: PropTypes.bool,
};
