require("./styles/style.css");
require("jquery");
var key_map={
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    43: '+',
    45: '-',
    42: '*',
    47: '/',
    13: '='
};
var state = {
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
};
function make_operand(o) {
    return {
        type: 'operand',
        s: parseFloat(o)
    };
}
function make_operator(o) {
    var ret = {
        type: 'operator'
    };
    Object.assign(ret, state.opers[o]);
    return ret;
}
function stmt_toString() {
    return state.stmt.reduce(function(res, e) {
        return res.concat(e.s);
    }, '');
}

function handle_num_(num) {
    if (state.c_num==='0') state.c_num=num;
    else state.c_num+=num;
    $('#d-up').html(state.c_num);
    $('#d-down').html(stmt_toString());
}

function handle_num(e) {
    console.log('click:'+this.id+this.outerText);
    handle_num_(this.outerText);
}
function handle_oper_(o) {
    console.log('click:'+this.id+o);
    state.stmt.push(make_operand(state.c_num));
    state.stmt.push(make_operator(o));
    state.c_num='0';
    $('#d-up').html(state.c_num);
    $('#d-down').html(stmt_toString());
    $('#dbg').html(JSON.stringify(state.stmt, null, 2));
}
function handle_oper() {
    console.log('click:'+this.id+this.outerText);
    handle_oper_(this.outerText);
}
function handle_exec() {
    state.stmt.push(make_operand(state.c_num));
    rpn=make_rpn();
    $('#dbg').html(JSON.stringify(rpn, null, 2));
    console.log(rpn);
    
    result=resolve_rpn(rpn);//compute(0);
    state.c_num='0';
    $('#d-up').html(result);
    $('#d-down').html(stmt_toString()+'=');
}
function make_rpn() {
    var stack=[];
    var output=[];
    for (var i=0; i<state.stmt.length; i++) {
        if (state.stmt[i].type === 'operand') {
            output.push(state.stmt[i]);
        }
        else {
            var priority=state.stmt[i].prior;
            if (stack.length > 0) {
                var stack_priority=stack[stack.length-1].prior;
                if (priority <= stack_priority) {
                    output.push(stack.pop());
                }
            }
            stack.push(state.stmt[i]);
        }
    }
    while (stack.length>0) {
        output.push(stack.pop());
    }
    return output;
}
function resolve_rpn(rpn) {
    var stack=[];
    for (var i=0; i<rpn.length; i++) {
        if (rpn[i].type==='operand') {
            stack.push(rpn[i]);
        }
        else {
            var o1=stack.pop();
            var o2=stack.pop();
            var onew=rpn[i].exec(o2.s, o1.s);
            stack.push(make_operand(onew));
        }
    }
    return stack[0].s;
}
function handle_key(e) {
    console.log(e.which);
    if (e.which >= 48 && e.which <= 57) handle_num_((e.which-48).toString());
    switch (e.which) {
        case 13: handle_exec(); break;
        case 43: handle_oper_('+'); break;
        case 45: handle_oper_('-'); break;
        case 42: handle_oper_('x'); break;
        case 47: handle_oper_('/'); break;
        case 46: handle_num_('.'); break;
    }
}
function handle_spec_key(e) {
    console.log(e.which);
    if (e.which === 27) handle_c();
}
function handle_c() {
    $('#d-up').html('0');
    $('#d-down').html('0'); 
    state.c_num='0';
    state.stmt=[];
}
$().ready(function() {
    console.log("Start");
    $('button.b_num').on('click', handle_num);
    $('button.b_oper').on('click', handle_oper);
    $('button#id_eq').on('click', handle_exec);
    $('button#id_c').on('click', handle_c);
    $(document).keypress(handle_key);
    $(document).keyup(handle_spec_key);
});


