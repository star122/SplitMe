'use strict';

var React = require('react');
var _ = require('underscore');
var mui = require('material-ui');
var Checkbox = mui.Checkbox;
var FontIcon = mui.FontIcon;

var List = require('../List/View');
var Avatar = require('../Avatar/View');
var action = require('./action');
var AmountField = require('../AmountField/View');

var PaidForView = React.createClass({
  propTypes: {
    members: React.PropTypes.array.isRequired,
    paidFor: React.PropTypes.array.isRequired,
    split: React.PropTypes.string.isRequired,
    currency: React.PropTypes.string.isRequired,
    className: React.PropTypes.string,
  },

  onTouchTapAdd: function() {
    if ('production' === process.env.NODE_ENV) {
      navigator.contacts.pickContact(function(contact) {
        console.log(contact);
      }, function(error) {
        console.log(error);
      });
    }
  },

  getPaidForById: function(id) {
    return _.findWhere(this.props.paidFor, { contactId: id });
  },

  onTouchTapEqualy: function(id, ref, event) {
    var element = this.refs[ref];

    if(event.target.name !== 'paidFor') {
      element.setChecked(!element.isChecked());
    }

    var paidForItem = this.getPaidForById(id);
    paidForItem.split_equaly = element.isChecked();

    action.changePaidFor(this.props.paidFor);
  },

  onChangeUnEqualy: function(id, amount) {
    var paidForItem = this.getPaidForById(id);
    paidForItem.split_unequaly = amount;
    action.changePaidFor(this.props.paidFor);
  },

  onChangeShares: function(id, amount) {
    var paidForItem = this.getPaidForById(id);
    paidForItem.split_shares = amount;
    action.changePaidFor(this.props.paidFor);
  },

  render: function() {
    var self = this;

    var paidForList = _.map(this.props.members, function (member) {
      var right;
      var className;
      var onTouchTap;

      var paidFor = self.getPaidForById(member.id);

      switch(self.props.split) {
        case 'equaly':
          right = <Checkbox label="" name="paidFor" ref={member.id + '_checkbox'} value={member.id}
                    defaultSwitched={paidFor.split_equaly} />;
          className = 'mui-menu-item';
          onTouchTap = self.onTouchTapEqualy.bind(self, member.id, member.id + '_checkbox');
          break;

        case 'unequaly':
          right = <div>
                    <AmountField defaultValue={paidFor.split_unequaly}
                      onChange={self.onChangeUnEqualy.bind(self, member.id)} />
                    {self.props.currency}
                  </div>;
          break;

        case 'shares':
          right = <div>
                    <AmountField defaultValue={paidFor.split_shares} isInteger={true}
                      onChange={self.onChangeShares.bind(self, member.id)} />
                    share(s)
                  </div>;
          break;
      }

      var avatar = <Avatar contacts={[member]} />;

      return <List
        className={className}
        onTouchTap={onTouchTap}
        right={right}
        left={avatar}
        key={member.id}>
          {member.displayName}
      </List>;
    });

    var icon = <FontIcon className="md-add"/>;

    return <div className={this.props.className}>
      Split with
      {paidForList}
      <List className="mui-menu-item" left={icon} onTouchTap={this.onTouchTapAdd}>
        Add a new one
      </List>
    </div>;
  },
});

module.exports = PaidForView;
