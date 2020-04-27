
export class Hook {
    constructor(obj) {
        let ret = function (f) {
            if (typeof f == "function") {
                ret.bind(f);
            } else {
                ret.trigger.apply(ret.obj, arguments);
            }
        };
        ret.obj = obj;
        ret.hooks = [];
        ret.bind = function(f) {
            ret.hooks.push(f);
        };
        ret.trigger = function() {
            for(let i=0; i<ret.hooks.length; i++) {
                let f = ret.hooks[i];
                f.apply(ret.obj,arguments);
            }
        };
        return ret;
    }
}
