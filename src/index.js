require("./styles/style.css");
require("jquery");
var state = {
    calc_done: false,
    need_num: true,
    c_num: "0",
    stmt : [],
    opers : {
        '+' : {
            prior: 1,
            exec: function(o1, o2) {
                return o1+o2;
            },
            s: '+'
        },
        '-' : {
            prior: 1,
            exec: function(o1, o2) {
                return o1-o2;
            },
            s: '-'
        },
        'x' : {
            prior: 2,
            exec: function(o1, o2) {
                return o1*o2;
            },
            s: 'x'
        },
        '/' : {
            prior: 2,
            exec: function(o1, o2) {
                return o1/o2;
            },
            s: '/'
        },
        '%' : {
            prior: 1,
            exec: function(o1, o2) {
                return o1+o2;
            },
            s: '%'
        }
    },
    make_operand: function(o) {
        return {
            type: 'operand',
            s: parseFloat(o)
        };
    },
    make_operator: function(o) {
        var ret = {
            type: 'operator'
        };
        Object.assign(ret, state.opers[o]);
        return ret;
    },
    reset: function() {
        this.c_num = '0';
        this.stmt = [];
        this.calc_done = false;
    },
    render: function() {
        $('#d-up').html(this.c_num);
        if (this.stmt.length === 0)
            $('#d-down').html('0');
        else
            $('#d-down').html(this.stmt.reduce(function(res, e) {
                return res.concat(e.s);
            }, ''));
        $('#dbg').html(JSON.stringify(this.stmt, null, 2));
    },
    handle_num: function(num) {
        if (this.calc_done) {
            this.reset();
        }
        if (this.c_num==='0') this.c_num=num;
        else this.c_num+=num;
        this.need_num=false;
        this.render();
    },
    handle_oper: function(o) {
        if (this.need_num) return;
        if (this.calc_done) {
            this.calc_done=false;
            this.stmt=[];
        }
        this.stmt.push(this.make_operand(this.c_num));
        this.stmt.push(this.make_operator(o));
        this.c_num='0';
        this.need_num=true;
        this.render();
    },
    handle_exec: function() {
        if (this.need_num) return;
        if (!this.calc_done) {
            this.stmt.push(this.make_operand(this.c_num));
            var rpn=this.make_rpn();
            this.c_num=this.resolve_rpn(rpn);
            this.calc_done=true;
            this.render();
        }
    },
    make_rpn: function() {
        var stack=[];
        var output=[];
        for (var i=0; i<this.stmt.length; i++) {
            if (this.stmt[i].type === 'operand') {
                output.push(this.stmt[i]);
            }
            else {
                var priority=this.stmt[i].prior;
                if (stack.length > 0) {
                    var stack_priority=stack[stack.length-1].prior;
                    if (priority <= stack_priority) {
                        output.push(stack.pop());
                    }
                }
                stack.push(this.stmt[i]);
            }
        }
        while (stack.length>0) {
            output.push(stack.pop());
        }
        return output;
    },
    resolve_rpn: function(rpn) {
        var stack=[];
        for (var i=0; i<rpn.length; i++) {
            if (rpn[i].type==='operand') {
                stack.push(rpn[i]);
            }
            else {
                var o1=stack.pop();
                var o2=stack.pop();
                var onew=rpn[i].exec(o2.s, o1.s);
                stack.push(this.make_operand(onew));
            }
        }
        return stack[0].s;
    },
    handle_c: function() {
        this.reset();
        this.render();
    },
    handle_ce: function() {
        if (!this.calc_done) {
            if (this.c_num != '0') {
                this.c_num='0';
                this.need_num=true;
            }
            else {
                var operator=this.stmt.pop();
                var operand=this.stmt.pop();
                if (operand) this.c_num=operand.s;
                this.need_num=false;
            }
            this.render();
        }
    },
    handle_esc: function() {
        if (this.calc_done) this.handle_c();
        else this.handle_ce();
    }
};
function handle_num(e) {
    state.handle_num(this.outerText);
}
function handle_oper() {
    state.handle_oper(this.outerText);
}
function handle_exec() {
    state.handle_exec();
}
function handle_key_down(e) {
    $('button#'+e.which).toggleClass('active');
}
function handle_key_up(e) {
    $('button#'+e.which).removeClass('active');
    if (e.which >= 96 && e.which <= 105) state.handle_num((e.which-96).toString());
    switch (e.which) {
        case 27: state.handle_esc(); break;
        case 13: state.handle_exec(); break;
        case 107: state.handle_oper('+'); break;
        case 109: state.handle_oper('-'); break;
        case 106: state.handle_oper('x'); break;
        case 111: state.handle_oper('/'); break;
        case 110: state.handle_num('.'); break;
    }
}
function handle_c() {
    state.handle_c();
}
function handle_ce() {
    state.handle_ce();
}
$().ready(function() {
    $('button.b_num').on('click', handle_num);
    $('button.b_oper').on('click', handle_oper);
    $('button#13').on('click', handle_exec);
    $('button#id_c').on('click', handle_c);
    $('button#27').on('click', handle_ce);
    $(document).keyup(handle_key_up);
    $(document).keydown(handle_key_down);
});
