import React, {PropTypes, Component} from 'react';
import pure from 'recompose/pure';
import {lightBlack} from 'material-ui-build/src/styles/colors';

const styles = {
  root: {
    display: 'flex',
  },
  body: {
    flexGrow: 1,
  },
  description: {
    fontSize: 12,
    lineHeight: '20px',
    color: lightBlack,
  },
  right: {
    flexShrink: 0,
    wordBreak: 'break-word',
    maxWidth: '45%',
  },
};

class ListItemBody extends Component {
  static propTypes = {
    description: PropTypes.string,
    right: PropTypes.node,
    title: PropTypes.string,
  };

  render() {
    const {
      description,
      right,
      title,
    } = this.props;

    return (
      <div style={styles.root}>
        <div style={styles.body} data-test="ListItemBody">
          <span>{title}</span>
          <div style={styles.description}>
            {description}
          </div>
        </div>
        <span style={styles.right} data-test="ListItemBodyRight">
          {right}
        </span>
      </div>
    );
  }
}

export default pure(ListItemBody);
