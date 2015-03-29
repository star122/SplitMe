'use strict';

var assert = require('assert');
var fixture = require('../fixture');

describe('add new expense', function() {
  before(function(done) {
    var account = fixture.getAccount('AccountName1', '10');

    var expense = fixture.getExpense('10');
    expense.accounts = [account];

    browser
    .url('http://0.0.0.0:8000')
    .timeoutsAsyncScript(5000)
    .executeAsync(function(expense, done) { // browser context
      var API = window.tests.API;
      var expenseStore = window.tests.expenseStore;

      API.destroyAll().then(function() {
        expenseStore.save(null, expense).then(function() {
          done();
        });
      });
    }, expense, function(err, ret) { // node.js context
      if(err) {
        throw(err);
      }
    })
    .call(done);
  });

  it('should show account when we delete an expense', function(done) {
    browser
    .waitFor('.mui-paper:nth-child(1) .list', 1000)
    .click('.mui-paper:nth-child(1) .list')
    .waitFor('.mui-paper:nth-child(1) .list', 1000)
    .click('.mui-paper:nth-child(1) .list')
    .setValue('.expense-detail > .mui-text-field input', 'descriptionEdit')
    .setValue('.expense-detail-item:nth-child(2) input', 10)
    .click('.expense-save')
    .pause(200) // Wait update
    .getText('.list:nth-child(1) .list-content span', function(err, text) {
      assert.equal(text, 'descriptionEdit');
    })
    .getText('.list:nth-child(1) .list-right', function(err, text) {
      assert.equal(text, '10 €');
    })
    .click('.mui-app-bar-navigation-icon-button') // Close
    .getText('.list:nth-child(1) .mui-font-style-title', function(err, text) {
      assert.equal(text, '5 €');
    })
    .call(done);
  });
});
