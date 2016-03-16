GLOBAL.p = console.log;
GLOBAL.pr = function(params) {
    p(util.inspect(params, {depth: null, colors: true}));
};
