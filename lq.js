// Copyright (c) 2012, Chuck Jazdzewski
// Licensed via the Microsoft Reciprocal License (MS-RL) (http://opensource.org/licenses/MS-RL)

function lq(a) {
    if (!(this instanceof lq)) return new lq(a);
    if (!Array.isArray(a) && a && a.length)
        a = Array.prototype.slice.call(a, 0);
    this.a = a;
}

function copy(l) {
    var result = new lq(l.a);
    if (l._cat) result._cat = l._cat.slice(0);
    if (l._where) result._where = l._where;
    if (l._select) result._select = l._select;
    if (l._skip) result._skip = l._skip;
    if (l._take) result._take = l._take;
    return result;
}

function realize(l) {
    return new lq(l.toArray());
}

function ident(v) { return v; }

lq.prototype._while = function (w, f) {
    var where = this._where || function () { return true; }
    var select = this._select || ident;
    var skip = this._skip || 0;
    var take = this._take || 0x7FFFFFF;
    if (take <= 0) return;
    var cat = this.a ? [this.a] : (this._cat || []);
    w = w === true || !(typeof w === "function") ? function () { return true; } : w;
    var more = true;
    for (var j = 0; more && j < cat.length; j++) {
        var a = cat[j];
        if (!Array.isArray(a)) {
            a = a.take(take).where(where).toArray();
        }
        for (var i = 0; i < a.length && (more = w()); i++) {
            var v = select(a[i], i);
            if (where(v, i) && --skip < 0) {
                f(v, i);
                if (--take <= 0) {
                    more = false;
                    break;
                }
            }
        }
    }
};

lq.prototype.where = function (predicate) {
    var result = copy(this);
    var old = result._where;
    if (old)
        result._where = function (v) {
            return old(v) && predicate(v);
        };
    else result._where = predicate;
    return result;
};

lq.prototype.select = function (selector) {
    var result, old;
    if (this._where)
        result = realize(this);
    else {
        old = this._select;
        result = copy(this);
    }
    if (old)
        result._select = function (v) {
            return selector(old(v));
        };
    else result._select = selector;
    return result;
};

lq.prototype.take = function (n) {
    var result = copy(this);
    result._take = (typeof this._take === "undefined" || this._take > n) ? n : this._take;
    return result;
};

lq.prototype.skip = function (n) {
    var result = typeof this._take === "undefined" ? copy(this) : realize(this);
    result._skip = (result._skip | 0) + n;
    return result;
};

lq.prototype.toArray = function () {
    var result = [];
    this._while(true, function (v) { result.push(v); });
    return result;
};

lq.prototype.realize = function () {
    if (this._cat || this._while || this._select || this._skip || (typeof this._take != "undefined"))
        return realize(this);
    return copy(this);
};

lq.prototype.first = function (predicate) {
    if (!predicate && this.a && !this._where && (this._skip || 0) < this.a.length) {
        var v = this.a[this._skip || 0];
        if (this._select) v = this._select(v);
        return v;
    }
    var result = null;
    var found = false;
    predicate = predicate || function () { return true; }
    this._while(function () { return !found; }, function (v) { found = predicate(v); if (found) result = v; });
    return result;
};

lq.prototype.last = function (predicate) {
    if (!predicate && this.a && !this._where) {
        var a = this.a;
        var l = a.length;
        var t = (this._skip | 0) + (this._take | l);
        if (t >= l) t = l - 1;
        var v = a[t];
        if (this._select) v = this._select(v);
        return v;
    }
    var result;
    predicate = predicate || function () { return true; };
    this._while(function () { return true; }, function (v) { if (predicate(v)) result = v; });
    return result;
};

lq.prototype.count = function () {
    if (this._where || !this.a) {
        var count = 0;
        var oldSelect = this._select;
        if (oldSelect) this._select = function (v) { return v; };
        try {
            this._while(true, function () { count++; });
        }
        finally {
            this._select = oldSelect;
        }
        return count;
    }
    else {
        var skip = this._skip || 0;
        var len = this.a.length - skip;
        if (len < 0) len = 0;
        var take = this._take || this.a.length;
        if (take >= len) return len;
        return take;
    }
};

lq.prototype.all = function (predicate) {
    var result = true;
    predicate = predicate || ident;
    this._while(function () { return result; }, function (v) { result = predicate(v); });
    return !!result;
};

lq.prototype.any = function (predicate) {
    var result = false;
    predicate = predicate || ident;
    this._while(function () { return !result; }, function (v) { result = !predicate || predicate(v); });
    return result;
};

lq.prototype.each = function (callback) {
    this._while(function () { return true; }, callback);
    return this;
};
lq.prototype.forEach = lq.prototype.each;

lq.prototype.concat = function () {
    var result = copy(this);
    var cat = result._cat = result._cat || [this.a];
    result.a = undefined;
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg !== undefined) {
            if (Array.isArray(arg) || arg instanceof lq)
                cat.push(arg);
            else
                cat.push([arg]);
        }
    }
    return result;
};

lq.prototype.toObject = function (keySelect) {
    var result = {};
    this.each(function (v) {
        result[keySelect(v)] = v;
    });
    return result;
};

function join(keySelect) {
    var result = {};
    for (var i = 1, len = arguments.length; i < len; i++) {
        arguments[i].each(function (item) {
            var key = keySelect(item);
            var slice = result[key];
            if (!slice) {
                slice = [];
                result[key] = slice;
            }
            slice[i - 1] = item;
        });
    }
    return fieldsOf(result).select(function (property) {
        return property.value;
    });
};

function fieldsOf(value) {
    var result = [];
    for (var n in value)
        result.push({ name: n, value: value[n] });
    return lq(result);
}

module.exports = exports = lq;
exports.of = lq;
exports.fieldsOf = fieldsOf;
exports.join = join;
exports.is = function (a) { return a instanceof lq; };