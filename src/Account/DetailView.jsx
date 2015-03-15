'use strict';

var React = require('react');
var mui = require('material-ui');
var AppCanvas = mui.AppCanvas;
var AppBar = mui.AppBar;
var FloatingActionButton = mui.FloatingActionButton;

var ExpenseList = require('../Expense/ListView');
var action = require('./action');

var DetailView = React.createClass({
  propTypes: {
    account: React.PropTypes.object.isRequired,
  },

  onTouchTapAddExpense: function(event) {
    event.preventDefault();
    action.tapAddExpense();
  },

  onTouchTapClose: function() {
    action.tapClose();
  },

  render: function () {
    var self = this;

    return <AppCanvas predefinedLayout={1}>
      <AppBar title={this.props.account.name}
        showMenuIconButton={true}
        iconClassNameLeft="md-close"
        onMenuIconButtonTouchTap={this.onTouchTapClose}>
      </AppBar>
      <div className="mui-app-content-canvas">
        <ExpenseList expenses={this.props.account.expenses} />
        <div id="main-button">
          <FloatingActionButton
            iconClassName="md-add"
            secondary={true}
            onTouchTap={this.onTouchTapAddExpense} />
        </div>
      </div>
    </AppCanvas>;
  }
});

module.exports = DetailView;
