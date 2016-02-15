/*
 * @project Promise lite
 * @author Amery(amery@xiangfa.org)
 */

(function (window) {
    'use strict';

    function Promise(deferred) {

        if (typeof deferred === 'function') {
            var promise = new Promise();
            deferred(promise.resolve.bind(promise), promise.reject.bind(promise));
            return promise;
        }
        this.state = 'pending';
        this.thenables = [];
        return this;
    }

    Promise.prototype.resolve = function PromiseResolve(value) {
        if (this.state !== 'pending') {
            return;
        }

        this.state = 'fulfilled';
        this.value = value;
        this._handleThen();
        return this;
    };

    Promise.prototype.reject = function PromiseReject(reason) {
        if (this.state !== 'pending') {
            return;
        }

        this.state = 'rejected';
        this.reason = reason;
        this._handleThen();
        return this;
    };

    Promise.prototype.then = function PromiseThen(onFulfilled, onRejected) {
        var thenable = {};
        if (typeof onFulfilled === 'function') {
            thenable.fulfill = onFulfilled;
        }

        if (typeof onRejected === 'function') {
            thenable.reject = onRejected;
        }

        if (this.state !== 'pending') {
            setTimeout(this._handleThen.bind(this), 0);
        }

        thenable.promise = new Promise();
        this.thenables.push(thenable);

        return thenable.promise;
    };

    Promise.prototype.all = function PromiseAll(promises) {
        var self = this,
            id = 0,
            values = [],
            count = promises.length;
        promises.forEach(function (promise) {
            var pid = id++;
            promise.then(function (value) {
                values[pid] = value;

                if (--count === 0) {
                    self.resolve(values);
                }
            }, function (reason) {
                self.reject(reason);
            });
        });
        return this;
    };

    Promise.prototype.race = function PromiseRace(promises) {
        var self = this;
        promises.forEach(function (promise) {
            promise.then(function (value) {
                self.resolve(value);
            }, function (reason) {
                self.reject(reason);
            });
        });
        return this;
    };

    Promise.prototype.catch = function PromiseCatch(onRejected) {
        return this.then(null, onRejected);
    };

    Promise.prototype._handleThen = function () {
        if (this.state === 'pending') {
            return;
        }

        while (this.thenables.length && this.thenables[0].promise) {
            var thenable = this.thenables[0],
                thenPromise = thenable.promise,
                returnedVal;
            try {
                if (this.state === 'fulfilled') {
                    if (thenable.fulfill) {
                        returnedVal = thenable.fulfill(this.value);
                    } else {
                        thenPromise.resolve(this.value);
                    }
                } else if (this.state === 'rejected') {
                    if (thenable.reject) {
                        returnedVal = thenable.reject(this.reason);
                    } else {
                        thenPromise.reject(this.reason);
                    }
                }

                if (returnedVal === null || returnedVal === undefined) {
                    thenPromise.resolve(this.value);
                } else if (returnedVal instanceof Promise || typeof returnedVal.then === 'function') {
                    returnedVal.then(thenPromise.resolve.bind(thenPromise), thenPromise.reject.bind(thenPromise));
                } else {
                    thenPromise.resolve(returnedVal);
                }
            } catch (e) {
                thenPromise.reject(e);
            }
            this.thenables.shift();
        }
    };
    
    if (!('Promise' in window)) {
        window.Promise = Promise;
    }
}(window));
