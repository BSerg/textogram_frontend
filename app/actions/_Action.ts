var Dispatcher = require('flux').Dispatcher;
var Microevent = require('../assets/js/microevent.js');

function Action(params, dispatcher) {
    this.name = params.name || ('action[' + Math.random().toString().substr(2, 7) + ']');
    this.action = params.action;
    this.__changeEvent = params.changeEvent || 'change';
    this.__store = {};
    Microevent.mixin(this.__store);
    this.__dispatcher = dispatcher || new Dispatcher();
    this.__dispatchToken = this.__dispatcher.register(function (payload) {
        switch (payload.action) {
            case this.name:
                this.action(this.__store, payload.data);
                this.__store.trigger(this.__changeEvent);
                break;
        }
        return true;
    }.bind(this));
}

Action.prototype.getStore = function () {
    return this.__store;
};

Action.prototype.getDispatcher = function () {
    return this.__dispatcher;
};

Action.prototype.getDispatchToken = function () {
    return this.__dispatchToken;
};

Action.prototype.waitFor = function (...dispatchTokens) {
    this.__dispatcher.waitFor(dispatchTokens);
};

Action.prototype.do = function (actionData) {
    var _data = {action: this.name};
    if (actionData !== undefined) {
        _data.data = actionData;
    }
    this.__dispatcher.dispatch(_data);
};

Action.prototype.onChange = function (callback) {
    this.__store.bind(this.__changeEvent, callback);
};

Action.prototype.unbind = function (callback) {
    this.__store.unbind(this.__changeEvent, callback);
};

Action.prototype.register = function (actionName, callback) {
    this.__dispatcher.register(function (payload) {
        switch (payload.action) {
            case actionName:
                callback(this.__store, payload.data);
                this.__store.trigger(actionName + '__update');
                break;
        }
    }.bind(this));
};

Action.prototype.doAction = function (actionName, actionData) {
    this.__dispatcher.dispatch({action: actionName, data: actionData});
};

Action.prototype.onChangeAction = function (actionName, callback) {
    this.__store.bind(actionName + '__update', callback);
};

Action.prototype.unbindAction = function (actionName, callback) {
    this.__store.unbind(actionName + '__update', callback);
};


module.exports = Action;
