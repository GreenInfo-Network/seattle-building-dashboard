"use strict";

define(['jquery', 'underscore', 'backbone', 'views/layout/tutorial', 'text!templates/layout/splash_modal.html'], function ($, _, Backbone, Tutorial, SplashTemplate) {
  var Splash = Backbone.View.extend({
    el: $('#splash'),
    initialize: function initialize(options) {
      this.state = options.state;
      this.$el.html(_.template(SplashTemplate));
      // check the value of the cookie, to know whether to show the splash or not
      var skip = this.getCookie('skip_tutorial') || 'false';
      // will either parse 'true'/'false' string from the cookie or 'false' from the fallback 
      skip = JSON.parse(skip);
      if (!skip) {
        // don't skip the turorial, render it
        this.render();
      }
      return this;
    },
    getCookie: function getCookie(name) {
      var value = "; ".concat(document.cookie);
      var parts = value.split("; ".concat(name, "="));
      if (parts.length === 2) return parts.pop().split(';').shift();
    },
    events: {
      'click button#splash-close': 'onModalClose',
      'click button#skip-tutorial': 'onModalClose',
      'click button#start-tutorial': 'onStartTutorial',
      'change input#opt-in': 'onCheckOptIn'
    },
    onCheckOptIn: function onCheckOptIn(evt) {
      if (typeof evt.preventDefault === 'function') evt.preventDefault();
      var target = $(evt.target);
      var checked = target.is(':checked');

      // if unchecked, set a cookie to skip this splash screen next time
      if (!checked) {
        document.cookie = "skip_tutorial=true; path=/; max-age=".concat(60 * 60 * 24 * 365, ";");
      } else {
        // they won't normally even see the checkbox to check it, but 
        // someone could quickly uncheck and then change their mind before closing the dialog
        document.cookie = "skip_tutorial=true; path=/; max-age=0;";
      }
    },
    onStartTutorial: function onStartTutorial(evt) {
      if (typeof evt.preventDefault === 'function') evt.preventDefault();
      var state = this.state;
      var tutorial = new Tutorial({
        state: state
      });
      tutorial.render(1000);
      this.$el.hide();
    },
    onModalClose: function onModalClose(evt) {
      if (evt.preventDefault) evt.preventDefault();
      this.$el.hide();
    },
    render: function render() {
      this.$el.show();
      $('.splash-content').focus();
      return this;
    }
  });
  return Splash;
});