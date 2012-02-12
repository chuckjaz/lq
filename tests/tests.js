var yaut = require('yaut');
var lq = require('../lq');

var expect = yaut.expect;
var assert = console.assert;

yaut.report("Verify lq", {
    "simple where()": function () {
        var q = lq.of([1, 2, 3, 4, 5]).where(function (v) { return v > 3; });
        assert(q.count() === 2);
        assert(q.all(function (v) { return v > 3; }));
    },
    "simple select()": function () {
        assert(lq.of([1, 2, 3, 4, 5, 6]).select(function (v) { return v.toString(); }).all(function (v) { return typeof v === "string"; }));
    },
    "composed where()": function () {
        var q = lq.of([1, 2, 3, 4, 5, 6, 7, 8]).where(function (v) { return v > 3; }).where(function (v) { return v < 5; });
        assert(q.count() === 1 && q.first() === 4);
    },
    "composed select()": function () {
        var q = lq.of([1, 2, 3, 4, 5, 6, 7, 8]).select(function (v) { return v + 10; }).select(function (v) { return v.toString(); });
        assert(q.first() === "11");
    },
    "simple take()": function () {
        var q = lq.of([1, 2, 3, 4, 5, 6, 7, 8]);
        assert(q.take(2).count() === 2);
        assert(q.take(100).count() === 8);
        assert(q.take(5).all(function (v) { return v < 6; }));
    },
    "simple skip()": function () {
        var q = lq.of([1, 2, 3, 4, 5, 6, 7, 8]);
        assert(q.skip(2).count() === 6);
        assert(q.skip(100).count() === 0);
        assert(q.skip(5).all(function (v) { return v > 5; }));
        assert(q.skip(5).first() === 6);
    },
    "composed skip(), take()": function () {
        var q = lq.of([1, 2, 3, 4, 5, 6, 7, 8]);
        assert(q.skip(2).take(2).count() === 2);
        assert(q.take(2).skip(2).count() === 0);
        assert(q.skip(100).take(100).count() === 0);
        assert(q.take(100).skip(100).count() === 0);
        assert(q.skip(5).take(1).all(function (v) { return v > 5 && v < 7; }));
        assert(q.skip(5).skip(1).first() === 7);
        assert(q.skip(2).take(2).skip(1).first() === 4);
    },
    "any()": function () {
        var q = lq.of([1, 2, 3, 4, 5, 6, 7, 8]);
        assert(q.any(function (v) { return v > 5; }));
        assert(!q.any(function (v) { return v > 100 }));
    },
    "all()": function () {
        var q = lq.of([1, 2, 3, 4, 5, 6, 7, 8]);
        assert(q.all(function (v) { return v < 9; }));
        assert(!q.all(function (v) { return v > 10; }));
    },
    "concat()": function () {
        var q = lq.of([1, 2, 3, 4, 5, 6, 7, 8]);
        var qc = q.concat(q, q);
        assert(qc.count() === 24);
        assert(qc.where(function (v) { return v === 8; }).count() === 3);
        assert(qc.concat(8).where(function (v) { return v === 8; }).count() === 4);

        var qm = q.concat(9);
        assert(qm.count() == 9);
        assert(qm.last() == 9);

        var qm2 = qm.concat(10, 11, 12);
        assert(qm2.count() == 12);
        assert(qm2.last() == 12);
    }
});
