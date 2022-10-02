import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getSrc } from './ShowArtifactPage';
import { getArtifactContent } from '../../../common/utils/ArtifactUtils';
import './RemotelyFetchedMermaidView.css';
import './ShowArtifactTextView.css';
import mermaid from 'mermaid';

// ---- based on ShowArtifactTextView ----

class RemotelyFetchedMermaidView extends Component {
  constructor(props) {
    super(props);
    this.fetchArtifacts = this.fetchArtifacts.bind(this);
  }

  static propTypes = {
    // runUuid: PropTypes.string.isRequired,
    path: PropTypes.string.isRequired,
    artifactRootUri: PropTypes.string.isRequired,
    getArtifact: PropTypes.func,
  };

  static defaultProps = {
    getArtifact: getArtifactContent,
  };

  state = {
    loading: true,
    error: undefined,
    text: undefined,
  };

  componentDidMount() {
    // See
    // https://github.com/mermaidjs/mermaidjs.github.io/blob/master/mermaidAPI.md
    mermaid.initialize({
      startOnLoad: true,
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true
      }
    });
    this.fetchArtifacts();
  }

  componentDidUpdate(prevProps) {
    mermaid.contentLoaded()
  }

  render() {
    if (this.state.loading) {
      return <span>Loading...</span>;
    }
    if (this.state.error) {
      return (
        <span>
          Oops we couldn't load your file because of an error.
        </span>
      );
    } else {
      return (
        <div className='mermaid mermaid-container'>
          {this.state.text}
        </div>
      );
    }
  }

  /** Fetches artifacts and updates component state with the result */
  fetchArtifacts() {
    const artifactLocation = getSrc(
      this.props.path, undefined, this.props.artifactRootUri
    );
    this.props
      .getArtifact(artifactLocation)
      .then((text) => {
        this.setState({ text: text, loading: false });
      })
      .catch((error) => {
        this.setState({ error: error, loading: false });
      });
  }
}

export default RemotelyFetchedMermaidView;
