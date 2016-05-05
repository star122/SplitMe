import React, {PropTypes, Component} from 'react';
import pure from 'recompose/pure';
import Immutable from 'immutable';
import {createSelector} from 'reselect';
import AppBar from 'material-ui-build/src/AppBar';
import Paper from 'material-ui-build/src/Paper';
import IconButton from 'material-ui-build/src/IconButton';
import IconMoreVert from 'material-ui-build/src/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui-build/src/IconMenu';
import MenuItem from 'material-ui-build/src/MenuItem';
import ListItem from 'material-ui-build/src/List/ListItem';
import EventListener from 'react-event-listener';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import moment from 'moment';
import DocumentTitle from 'react-document-title';

import API from 'API';
import locale from 'locale';
import polyglot from 'polyglot';
import accountUtils from 'main/account/utils';
import CanvasHead from 'main/canvas/Head';
import CanvasBody from 'main/canvas/Body';
import MemberAvatars from 'main/member/Avatars';
import MainActionButton from 'main/MainActionButton';
import AccountListItemBalance from 'main/account/ListItemBalance';
import ListItemBody from 'main/ListItemBody';
import AccountListEmpty from 'main/account/ListEmpty';
import accountActions from 'main/account/actions';

const styles = {
  content: {
    paddingBottom: 60,
  },
  // Fix for displaying element at the right of the ListItem
  avatar: {
    top: 16,
  },
  // End of fix
};

class AccountList extends Component {
  static propTypes = {
    accountsSorted: PropTypes.instanceOf(Immutable.List).isRequired,
    dispatch: PropTypes.func.isRequired,
    isAccountsFetched: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    this.props.dispatch(accountActions.fetchList());
  }

  handleBackButton = () => {
    if (process.env.PLATFORM === 'android') {
      window.navigator.app.exitApp();
    } else if (process.env.NODE_ENV !== 'production') {
      console.info('Trigger exit the app'); // eslint-disable-line no-console
    }
  };

  onTouchTapList = (account, event) => {
    event.preventDefault();

    setTimeout(() => {
      this.props.dispatch(push(`/account/${
        API.accountRemovePrefixId(account.get('_id'))
        }/expenses`));
    }, 0);
  };

  handleTouchTapAddExpense = (event) => {
    event.preventDefault();

    setTimeout(() => {
      this.props.dispatch(push('/expense/add'));
    }, 0);
  };

  handleTouchTapSettings = (event) => {
    event.preventDefault();

    setTimeout(() => {
      this.props.dispatch(push('/settings'));
    }, 0);
  };

  handleTouchTapAddAccount = () => {
    event.preventDefault();

    setTimeout(() => {
      this.props.dispatch(push('/account/add'));
    }, 0);
  };

  render() {
    const {
      accountsSorted,
      isAccountsFetched,
    } = this.props;

    const appBarRight = (
      <IconMenu
        iconButtonElement={<IconButton><IconMoreVert /></IconButton>}
        className="testAccountListMore"
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem
          primaryText={polyglot.t('account_add_new')}
          onTouchTap={this.handleTouchTapAddAccount}
          data-test="AccountAddNew"
        />
        <MenuItem
          primaryText={polyglot.t('settings')}
          onTouchTap={this.handleTouchTapSettings}
          data-test="Settings"
        />
      </IconMenu>
    );

    return (
      <div>
        {(process.env.PLATFORM === 'browser' || process.env.PLATFORM === 'server') &&
          <DocumentTitle title={polyglot.t('my_accounts')} />
        }
        <EventListener elementName="document" onBackButton={this.handleBackButton} />
        <CanvasHead>
          <AppBar
            title={polyglot.t('my_accounts')}
            data-test="AppBar"
            showMenuIconButton={false}
            iconElementRight={appBarRight}
          />
        </CanvasHead>
        <CanvasBody style={styles.content}>
          <Paper rounded={false}>
            {accountsSorted.map((account) => {
              const avatar = <MemberAvatars members={account.get('members')} style={styles.avatar} />;
              const accountListItemBalance = <AccountListItemBalance account={account} />;

              let description;

              if (account.get('expenses').size > 0) {
                const date = locale.dateTimeFormat(locale.current, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(moment(account.get('dateLatestExpense'), 'YYYY-MM-DD')); // Sep 13, 2015
                description = polyglot.t('expense_latest', {date: date});
              } else {
                description = polyglot.t('expense_no');
              }

              return (
                <ListItem
                  key={account.get('_id')}
                  leftAvatar={avatar}
                  onTouchTap={this.onTouchTapList.bind(this, account)}
                  data-test="ListItem"
                >
                  <ListItemBody
                    title={accountUtils.getNameAccount(account)}
                    right={accountListItemBalance}
                    description={description}
                  />
                </ListItem>
              );
            })}
          </Paper>
          {isAccountsFetched && accountsSorted.size === 0 && <AccountListEmpty />}
        </CanvasBody>
        <MainActionButton onTouchTap={this.handleTouchTapAddExpense} />
      </div>
    );
  }
}

function getAccountsSorted(accounts) {
  // DESC date order
  return accounts.sort((accountA, accountB) => {
    // Use 'a' > [0-9] to prioritize account without expenses.
    const dateLatestExpenseA = accountA.get('dateLatestExpense') || 'a';
    const dateLatestExpenseB = accountB.get('dateLatestExpense') || 'a';

    if (dateLatestExpenseA < dateLatestExpenseB) {
      return 1;
    } else if (dateLatestExpenseA === dateLatestExpenseB) {
      return accountA.get('dateUpdated') < accountB.get('dateUpdated') ? 1 : -1;
    } else {
      return -1;
    }
  });
}

const accountSortedSelector = createSelector(
  (state) => state.getIn(['account', 'accounts']),
  (accounts) => {
    return getAccountsSorted(accounts);
  }
);

function mapStateToProps(state) {
  return {
    accountsSorted: accountSortedSelector(state),
    isAccountsFetched: state.getIn(['account', 'isAccountsFetched']),
  };
}

export default pure(connect(mapStateToProps)(AccountList));
