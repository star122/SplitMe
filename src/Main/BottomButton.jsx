import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import FlatButton from 'material-ui/lib/flat-button';
import colors from 'material-ui/lib/styles/colors';

import polyglot from 'polyglot';

const styles = {
  root: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    left: 0,
    textAlign: 'center',
    background: '#fff',
    borderTop: '1px solid #ccc',
  },
  button: {
    width: '100%',
    height: 50,
    color: colors.grey600,
  },
};

const BottomButton = React.createClass({
  propTypes: {
    onTouchTap: React.PropTypes.func.isRequired,
  },
  mixins: [
    PureRenderMixin,
  ],
  render() {
    return (
      <div style={styles.root} data-test="BottomButton">
        <FlatButton label={polyglot.t('delete')} onTouchTap={this.props.onTouchTap} style={styles.button} />
      </div>
    );
  },
});

export default BottomButton;
