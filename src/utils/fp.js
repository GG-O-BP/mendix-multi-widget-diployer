// ===== FUNCTION COMPOSITION UTILITIES =====

export const pipe =
    (...fns) =>
    (x) =>
        fns.reduce((v, f) => f(v), x);

export const curry =
    (fn) =>
    (...args) =>
        args.length >= fn.length ? fn(...args) : curry(fn.bind(null, ...args));

// ===== GENERIC HELPERS =====

export const identity = (x) => x;

export const not =
    (fn) =>
    (...args) =>
        !fn(...args);

export const when = (predicate, fn) => (x) => (predicate(x) ? fn(x) : x);

// ===== STRING UTILITIES =====

export const trim = (str) => str.trim();

export const toLowerCase = (str) => str.toLowerCase();

export const isEmpty = (str) => !str || !str.trim();

export const isNotEmpty = not(isEmpty);

// ===== OBJECT UTILITIES =====

export const prop = (key) => (obj) => obj[key];

export const assoc = curry((key, value, obj) => ({
    ...obj,
    [key]: value,
}));

// ===== ARRAY UTILITIES =====

export const map = curry((fn, arr) => arr.map(fn));

export const filter = curry((fn, arr) => arr.filter(fn));

export const includes = curry((item, arr) => arr.includes(item));
