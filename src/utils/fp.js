// ===== FUNCTION COMPOSITION UTILITIES =====

export const pipe =
    (...fns) =>
    (x) =>
        fns.reduce((v, f) => f(v), x);

export const compose =
    (...fns) =>
    (x) =>
        fns.reduceRight((v, f) => f(v), x);

export const curry =
    (fn) =>
    (...args) =>
        args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args));

// ===== GENERIC HELPERS =====

export const identity = (x) => x;

export const constant = (x) => () => x;

export const not =
    (fn) =>
    (...args) =>
        !fn(...args);

export const when = (predicate, fn) => (x) => (predicate(x) ? fn(x) : x);

export const unless = (predicate, fn) => (x) => (predicate(x) ? x : fn(x));

export const tap = (fn) => (x) => {
    fn(x);
    return x;
};

export const either =
    (fn1, fn2) =>
    (...args) =>
        fn1(...args) || fn2(...args);

export const both =
    (fn1, fn2) =>
    (...args) =>
        fn1(...args) && fn2(...args);

export const defaultTo = (defaultValue) => (value) =>
    value == null ? defaultValue : value;

// ===== STRING UTILITIES =====

export const trim = (str) => str.trim();

export const toLowerCase = (str) => str.toLowerCase();

export const toUpperCase = (str) => str.toUpperCase();

export const isEmpty = (str) => !str || !str.trim();

export const isNotEmpty = not(isEmpty);

export const split = curry((separator, str) => str.split(separator));

export const join = curry((separator, arr) => arr.join(separator));

export const replace = curry((pattern, replacement, str) =>
    str.replace(pattern, replacement),
);

export const startsWith = curry((prefix, str) => str.startsWith(prefix));

export const endsWith = curry((suffix, str) => str.endsWith(suffix));

// ===== OBJECT UTILITIES =====

export const prop = (key) => (obj) => obj[key];

export const props = (keys) => (obj) => keys.map((key) => obj[key]);

export const assoc = curry((key, value, obj) => ({
    ...obj,
    [key]: value,
}));

export const dissoc = curry((key, obj) => {
    const { [key]: _, ...rest } = obj;
    return rest;
});

export const merge = curry((a, b) => ({ ...a, ...b }));

export const mergeDeep = curry((a, b) => {
    const result = { ...a };
    for (const key in b) {
        if (b.hasOwnProperty(key)) {
            if (
                typeof b[key] === "object" &&
                b[key] !== null &&
                !Array.isArray(b[key])
            ) {
                result[key] = mergeDeep(a[key] || {}, b[key]);
            } else {
                result[key] = b[key];
            }
        }
    }
    return result;
});

export const path = (keys) => (obj) =>
    keys.reduce((acc, key) => acc?.[key], obj);

export const pathOr = curry(
    (defaultValue, keys, obj) => path(keys)(obj) ?? defaultValue,
);

export const pick = curry((keys, obj) =>
    keys.reduce((acc, key) => {
        if (key in obj) acc[key] = obj[key];
        return acc;
    }, {}),
);

export const omit = curry((keys, obj) =>
    Object.keys(obj).reduce((acc, key) => {
        if (!keys.includes(key)) acc[key] = obj[key];
        return acc;
    }, {}),
);

export const evolve = curry((transformations, obj) =>
    Object.keys(obj).reduce((acc, key) => {
        acc[key] = transformations[key]
            ? transformations[key](obj[key])
            : obj[key];
        return acc;
    }, {}),
);

// ===== ARRAY UTILITIES =====

export const map = curry((fn, arr) => arr.map(fn));

export const filter = curry((fn, arr) => arr.filter(fn));

export const reduce = curry((fn, initial, arr) => arr.reduce(fn, initial));

export const find = curry((fn, arr) => arr.find(fn));

export const findIndex = curry((fn, arr) => arr.findIndex(fn));

export const includes = curry((item, arr) => arr.includes(item));

export const concat = curry((a, b) => [...a, ...b]);

export const head = (arr) => arr[0];

export const tail = (arr) => arr.slice(1);

export const last = (arr) => arr[arr.length - 1];

export const init = (arr) => arr.slice(0, -1);

export const take = curry((n, arr) => arr.slice(0, n));

export const drop = curry((n, arr) => arr.slice(n));

export const sort = curry((compareFn, arr) => [...arr].sort(compareFn));

export const reverse = (arr) => [...arr].reverse();

export const uniq = (arr) => [...new Set(arr)];

export const uniqBy = curry((fn, arr) => {
    const seen = new Set();
    return arr.filter((item) => {
        const key = fn(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
});

export const groupBy = curry((fn, arr) =>
    arr.reduce((acc, item) => {
        const key = fn(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {}),
);

export const partition = curry((predicate, arr) =>
    arr.reduce(
        ([pass, fail], elem) =>
            predicate(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]],
        [[], []],
    ),
);

export const every = curry((predicate, arr) => arr.every(predicate));

export const some = curry((predicate, arr) => arr.some(predicate));

export const none = curry((predicate, arr) => !arr.some(predicate));

// ===== COMPARISON UTILITIES =====

export const equals = curry((a, b) => a === b);

export const gt = curry((a, b) => b > a);

export const gte = curry((a, b) => b >= a);

export const lt = curry((a, b) => b < a);

export const lte = curry((a, b) => b <= a);

// ===== MATH UTILITIES =====

export const add = curry((a, b) => a + b);

export const subtract = curry((a, b) => a - b);

export const multiply = curry((a, b) => a * b);

export const divide = curry((a, b) => a / b);

export const modulo = curry((a, b) => a % b);

export const negate = (n) => -n;

export const sum = reduce(add, 0);

export const product = reduce(multiply, 1);

export const min = curry((a, b) => Math.min(a, b));

export const max = curry((a, b) => Math.max(a, b));

// ===== ASYNC UTILITIES =====

export const mapAsync = curry(async (fn, arr) => Promise.all(arr.map(fn)));

export const filterAsync = curry(async (predicate, arr) => {
    const results = await mapAsync(
        async (item) => ({ item, keep: await predicate(item) }),
        arr,
    );
    return results.filter(({ keep }) => keep).map(({ item }) => item);
});

export const reduceAsync = curry(async (fn, initial, arr) => {
    let acc = initial;
    for (const item of arr) {
        acc = await fn(acc, item);
    }
    return acc;
});

export const pipeAsync =
    (...fns) =>
    async (x) => {
        let result = x;
        for (const fn of fns) {
            result = await fn(result);
        }
        return result;
    };

export const composeAsync = (...fns) => pipeAsync(...fns.reverse());

// ===== MONAD-LIKE UTILITIES =====

export const Maybe = {
    of: (value) => ({
        map: (fn) => (value == null ? Maybe.of(null) : Maybe.of(fn(value))),
        flatMap: (fn) => (value == null ? Maybe.of(null) : fn(value)),
        filter: (predicate) =>
            value == null || !predicate(value)
                ? Maybe.of(null)
                : Maybe.of(value),
        getOrElse: (defaultValue) => (value == null ? defaultValue : value),
        isNothing: () => value == null,
        isJust: () => value != null,
        value,
    }),
};

export const Result = {
    Ok: (value) => ({
        map: (fn) => Result.Ok(fn(value)),
        flatMap: (fn) => fn(value),
        mapError: (_) => Result.Ok(value),
        fold: (onError, onSuccess) => onSuccess(value),
        getOrElse: (_) => value,
        isOk: () => true,
        isError: () => false,
        value,
    }),
    Error: (error) => ({
        map: (_) => Result.Error(error),
        flatMap: (_) => Result.Error(error),
        mapError: (fn) => Result.Error(fn(error)),
        fold: (onError, onSuccess) => onError(error),
        getOrElse: (defaultValue) => defaultValue,
        isOk: () => false,
        isError: () => true,
        error,
    }),
};

// ===== UTILITY TYPE CHECKS =====

export const isNull = (x) => x === null;

export const isUndefined = (x) => x === undefined;

export const isNil = (x) => x == null;

export const isFunction = (x) => typeof x === "function";

export const isObject = (x) =>
    x !== null && typeof x === "object" && !Array.isArray(x);

export const isArray = Array.isArray;

export const isString = (x) => typeof x === "string";

export const isNumber = (x) => typeof x === "number" && !isNaN(x);

export const isBoolean = (x) => typeof x === "boolean";
