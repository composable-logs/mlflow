import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Colors from '../styles/Colors';
import { DataBacklinkFooter } from '../static-data/UIConstants';

export class ReportPage extends Component {
  static propTypes = {
    reportId: PropTypes.string.isRequired,
  };

  render() {
    // The below is based on the NoExperimentView
    return <>
      <h1 style={{ paddingTop: '10px' }}>
        No reports or dashboards implemented (.. yet ..)
      </h1>

      <h2 style={{ color: Colors.secondaryText }}>
        Reports could for example: render the latest version of a suitable
        notebook (or logged images) eg. from the main branch.
      </h2>

      <div style={{"height": "200px"}} />

      {DataBacklinkFooter}
    </>;
  }
}
