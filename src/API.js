'use strict';

var PouchDB = require('pouchdb');
var moment = require('moment');
var _ = require('underscore');
var Lie = require('lie');

var db = new PouchDB('db');

function handleResult(result) {
  return _.map(result.rows, function(row) {
    return row.doc;
  });
}

var API = {
  setUpDataBase: function() {
    var ddoc = {
      _id: '_design/by_member_id',
      views: {
        by_member_id: {
          map: function (doc) {
            if (doc.type === 'account') {
              emit(doc.members[1].id);
            }
          }.toString()
        }
      }
    };

    return db.put(ddoc)
      .catch(function(err) {
        if (err.status !== 409) { // Not a conflict
          throw err;
        }
      });
  },
  destroyAll: function() {
    var promises = [];

    promises.push(db.destroy().then(function() {
      db = new PouchDB('db');
      API.setUpDataBase();
    }));

    return Lie.all(promises);
  },
  putAccountsOfExpense: function(expense) {
    var promises = [];
    var self = this;

    _.each(expense.accounts, function(account) {
      promises.push(self.putAccount(account));
    });

    return new Lie.all(promises);
  },
  putExpense: function(expense) {
    if(!expense._id) {
      expense._id = 'expense_1_' + moment().valueOf().toString();
    }

    expense.type = 'expense';

    var expenseToStore = _.clone(expense);
    expenseToStore.accounts = [];

    _.each(expense.accounts, function(account) {
      var id;

      if (typeof account === 'string') {
        id = account;
      } else if(account._id) {
        id = account._id;
      } else {
        id = 'account_1_' + moment().valueOf().toString();
        account._id = id;
      }

      expenseToStore.accounts.push(id);
    });

    return db.put(expenseToStore).then(function(response) {
      expense._rev = response.rev;
    });
  },
  removeExpense: function(expense) {
    return db.remove(expense);
  },
  putAccount: function(account) {
    if(!account._id) {
      account._id = 'account_1_' + moment().valueOf().toString();
    }

    account.type = 'account';

    var accountToStore = _.clone(account);
    accountToStore.expenses = [];

    _.each(account.expenses, function(expense) {
      var id;

      if (typeof expense === 'string') {
        id = expense;
      } else if(expense._id) {
        id = expense._id;
      } else {
        id = 'expense_1_' + moment().valueOf().toString();
        expense._id = id;
      }

      accountToStore.expenses.push(id);
    });

    return db.put(accountToStore).then(function(response) {
      account._rev = response.rev;
    });
  },
  fetchExpense: function(id) {
    return db.get(id);
  },
  fetchAccountAll: function() {
    return db.allDocs({
      include_docs: true,
      startkey: 'account_1_',
      endkey: 'account_2_',
    }).then(handleResult);
  },
  fetchAccount: function(id) {
    return db.get(id);
  },
  fetchAccountsByMemberId: function(id) {
    return db.query('by_member_id', {
        key: id,
        include_docs: true,
      })
      .then(handleResult);
  },
  isExpensesFetched: function(expenses) {
    if(expenses.length > 0 && typeof expenses[0] === 'string') {
      return false;
    } else {
      return true;
    }
  },
  fetchExpensesOfAccount: function(account) {
    var expenses = account.expenses;

    // Load
    if(!this.isExpensesFetched(expenses)) {
      return db.allDocs({
        include_docs: true,
        keys: expenses,
      }).then(function(result) {
        account.expenses = handleResult(result);

        return true; // firstFetched
      });
    } else {
      return new Lie(function(resolve) {
        resolve(false); // firstFetched
      });
    }
  },
  fetchAccountsNext: function(account) {
    var accountsHash = {};
    var accountToFetch = [];

    // Fetch
    for(var i = 0; i < account.expenses.length; i++) {
      var expense = account.expenses[i];

      for(var j = 0; j < expense.accounts.length; j++) {
        var accountExpense = expense.accounts[j];

        if(typeof accountExpense === 'string' && !accountsHash[accountExpense]) {
          accountToFetch.push(accountExpense);
          accountsHash[accountExpense] = true;
        }
      }
    }

    if(accountToFetch.length > 0) {
      return db.allDocs({
        include_docs: true,
        keys: accountToFetch,
      }).then(function(result) {
        _.each(result.rows, function(row) {
          accountsHash[row.doc._id] = row.doc;
        });

        for(var i = 0; i < account.expenses.length; i++) {
          var expense = account.expenses[i];

          for(var j = 0; j < expense.accounts.length; j++) {
            expense.accounts[j] = accountsHash[expense.accounts[j]];
          }
        }

        return true; // New data
      });
    } else {
      return new Lie(function(resolve) {
        resolve(false); // No new data
      });
    }
  },
};

module.exports = API;
