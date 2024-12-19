"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
define(['jquery', 'underscore', 'backbone', 'views/layout/tutorial', 'text!templates/layout/footer.html'], function ($, _, Backbone, Tutorial, FooterTemplate) {
  var Footer = Backbone.View.extend({
    el: $('#footer'),
    initialize: function initialize(options) {
      this.state = options.state;
      this.template = _.template(FooterTemplate);
      this.listenTo(this.state, 'change:city', this.render);
      this.render();
    },
    events: {
      'click .modal-link': 'onModalLink',
      'click #launch-tutorial-link': 'onHelpLink'
    },
    getModals: function getModals(city) {
      if (!city) return [];
      var modals = city.get('modals');
      if (!modals) return [];
      return Object.keys(modals).map(function (k) {
        return {
          id: k,
          label: modals[k].label || k
        };
      });
    },
    onModalLink: function onModalLink(evt) {
      if (typeof evt.preventDefault === 'function') evt.preventDefault();

      // Since this is a modal link, we need to make sure
      // our handler exists
      var modelFn = this.state.get('setModal');
      if (!_typeof(modelFn) === 'function') return false;
      modelFn(evt.target.dataset.modal);
      return false;
    },
    onHelpLink: function onHelpLink(evt) {
      var state = this.state;
      if (typeof evt.preventDefault === 'function') evt.preventDefault();
      var tutorial = new Tutorial({
        state: state
      });
      tutorial.render(0);
    },
    getFooterLinks: function getFooterLinks(city) {
      var rsp = {
        about: '/',
        download: '/',
        feedback: '/'
      };
      var footerLinks = city && city.get && city.get('footer');
      if (!footerLinks) footerLinks = {};
      rsp.about = footerLinks.about_link || '/';
      rsp.download = footerLinks.download_link || '/';
      rsp.feedback = footerLinks.feedback_link || '/';
      return rsp;
    },
    render: function render() {
      var city = this.state.get('city');
      var modals = this.getModals(city);
      var footerLinks = this.getFooterLinks(city);
      this.$el.html(this.template({
        modals: modals,
        footerLinks: footerLinks
      }));
      return this;
    }
  });
  return Footer;
});