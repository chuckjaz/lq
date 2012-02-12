# lq - A query like library

**lq** is a query like library that is inspired by the LINQ library from .NET.

**lq** instance will attempt to delay the calculation of intermediate values
to avoid the time an memory such intermediate values will cost. For example,

```javascript
var a = [0, 1, 2, 3, 4, 5];
var q = lq(a).where(function (v) { return v % 2 == 0 });
q.each(function (v) { console.info(v) });
```

will print all the even numbers without producing an array that contains all
the even number. In this example, calling `.where()` returns immediately and
the callback function is only invoked when `.each()` is invoked.

## Module

### lq(a)

The **lq** module is a function that returns an query that wraps the array. 

## Module Functions

### lq.of(a)

`lq.of()` is an alias for `lq()` and is sometime easier to read.

### lq.fieldsOf(o)

`fieldsOf()` returns a query that contains an array of fields and their values
of the for `{ name: <field-name>, value: <value> }`.

### lq.join(keySelect, a1 ... an)

Experimental

### lq.is(o)

Returns `true` if `o` is a **lq** query, `false` otherwise.

## Query Functions

### .count()

Returns the number of values in the query.

### .all(predicate)

Returns `true` if all the `predicate` returns `true` for all the values in the query.

### .any(predicate)

Returns `true` if the `predicate` returns `true` for any of the values in the query.

### .concat(q1, [... qn])

Returns a query that is the concatentaion of one or more queries passed as parameters.

### .each(callback)

Calls `callback` with the values in the query. The `callback` is `callback(value, index)`
where the `value` is the value in the query and the `index` is the position the value would be
if `toArray()` where called on the **lq** instance.

### .first()

Returns the first value in the query.

### .forEach()

This is an alias for `.each()`.

### .last()

Returns the last value in the query.

### .realize()

Ensure that all the `selector` and `predicate` functions are invoked. This is used to ensure 
that expensive work in the `selector` and `predicate` functions are not repeated. `realize()`
should be inserted to optimize a query.

### .select(selector)

Produce a projection of qyer where all the values in the query is replaced with the result of 
the selector. The `selector` might not be called immediately and might be called multiple times 
on the same value.

### .skip(count)

Produce a query that skips at least the `count` values. If the query has fewer than `count` 
values then the query is empty.

### .take(count)

Produce a query that contains at most the first `count` values. 

### .toArray()

Produce a fresh array that contains the values included in query.

### .toObject(keySelector)

Produces an object with the properties with the values of the query and the with the name returned
by `keySelector(value)`.

### .where(predicate)

Returns a query that only contains values where `predicate` returns true.  `predicate` is called 
as `predicate(value)` where the `value` is the value in the query.

