require("./styles/style.css");
require("jquery");
var state = {
    precision: 10000000000,
    MAX_NUM: 99999999999,
    MIN_NUM: 0.0000000001,
    MAX_DECIMALS: 11,
    calc_done: false,
    calc_error: false,
    c_num: null,
    stmt : [],
    opers : {
        '+' : {
            prior: 1,
            exec: function(o1, o2) {
                return o1+o2;
            },
            s: '+',
            type:'operator'
        },
        '-' : {
            prior: 1,
            exec: function(o1, o2) {
                return o1-o2;
            },
            s: '-',
            type:'operator'
        },
        'x' : {
            prior: 2,
            exec: function(o1, o2) {
                return o1*o2;
            },
            s: 'x',
            type:'operator'
        },
        '/' : {
            prior: 2,
            exec: function(o1, o2) {
                return o1/o2;
            },
            s: '/',
            type:'operator'
        },
        '%' : {
            prior: 3,
            exec: function(o1, o2) {
                return (o1*o2)/100;
            },
            s: '%',
            type:'operator'
        }
    },
    make_operand: function(o) {
        return {
            type: 'operand',
            s: parseFloat(o)
        };
    },
    make_operator: function(o) {
        return state.opers[o];
    },
    reset: function() {
        this.c_num = null;
        this.stmt = [];
        this.calc_done = false;
        this.calc_error = false;
    },
    render: function() {
        if (this.calc_error) {
            $('#d-up').html('Err');
            $('#d-down').html('Buffer Overflow');
            return;
        }
        if (this.c_num === null) $('#d-up').html('0');
        else $('#d-up').html(this.c_num);
        if (this.stmt.length === 0)
            $('#d-down').html('0');
        else
            $('#d-down').html(this.stmt.reduce(function(res, e) {
                return res.concat(e.s);
            }, ''));
        //$('#dbg').html(JSON.stringify(this.stmt, null, 2));
    },
    handle_error: function() {
        if (this.calc_error) {
            this.reset();
        }
    },
    handle_num: function(num) {
        this.handle_error();
        if (this.calc_done) {
            this.reset();
        }
        if (this.c_num===null) this.c_num=num;
        else {
            if (this.MAX_DECIMALS > this.c_num.length)
                this.c_num+=num;
        }
        this.render();
    },
    handle_oper: function(o) {
        this.handle_error();
        if (this.c_num === null) return;
        if (this.calc_done) {
            this.calc_done=false;
            this.stmt=[];
        }
        this.stmt.push(this.make_operand(this.c_num));
        this.stmt.push(this.make_operator(o));
        this.c_num=null;
        this.render();
    },
    handle_exec: function() {
        this.handle_error();
        if (!this.calc_done) {
            this.stmt.push(this.make_operand(this.c_num));
            var rpn=this.make_rpn();
            var result=this.resolve_rpn(rpn);
            if (result > this.MAX_NUM || result < this.MIN_NUM) {
                this.calc_error=true;
            }
            this.c_num=result.toString().substr(0, this.MAX_DECIMALS);
            //this.c_num=(Math.round(result*this.precision)/this.precision).toString();
            /*if (this.c_num.length > this.max_decs) {
                this.c_num='Buffer overflow';
                this.calc_error=true;
            }
            else */this.calc_done=true;
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
        this.handle_error();
        if (!this.calc_done) {
            if (this.c_num != null) {
                this.c_num=null;
            }
            else {
                var operator=this.stmt.pop();
                var operand=this.stmt.pop();
                if (operand) this.c_num=operand.s;
            }
            this.render();
        }
    },
    handle_esc: function() {
        this.handle_error();
        if (this.calc_done) this.handle_c();
        else this.handle_ce();
    }
};
function handle_num(e) {
    state.handle_num(this.innerText);
    $(this).blur();
}
function handle_oper() {
    state.handle_oper(this.innerText);
    $(this).blur();
}
function handle_exec() {
    state.handle_exec();
    $(this).blur();
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
    $(this).blur();
}
function handle_ce() {
    state.handle_ce();
    $(this).blur();
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
