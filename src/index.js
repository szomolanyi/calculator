require("./styles/style.css");
require("jquery");
var keys={
    49: '1'
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
    /*return {
        type: 'operand',
        value: {
            s: parseFloat(o)
        }
    };*/
}
function make_operator(o) {
    var ret = {
        type: 'operator'
    };
    Object.assign(ret, state.opers[o]);
    return ret;
    /*
    return {
        type: 'operator',
        value: state.opers[o]
    };*/
}
function stmt_toString() {
    return state.stmt.reduce(function(res, e) {
        return res.concat(e.s);
    }, '');
}
function handle_num(e) {
    console.log('click:'+this.id+this.outerText);
    if (state.c_num==='0') state.c_num=this.outerText;
    else state.c_num=state.c_num.concat(this.outerText);
    $('#d-up').html(state.c_num);
    $('#d-down').html(stmt_toString());
}
function handle_oper() {
    console.log('click:'+this.id+this.outerText);
    state.stmt.push(make_operand(state.c_num));
    state.stmt.push(make_operator(this.outerText));
    state.c_num='0';
    $('#d-up').html(state.c_num);
    $('#d-down').html(stmt_toString());
    $('#dbg').html(JSON.stringify(state.stmt, null, 2));
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
            var onew=rpn[i].exec(o1.s, o2.s);
            stack.push(make_operand(onew));
        }
    }
    return stack[0].s;
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
function handle_key(e) {
    console.log(e.which);
}
$().ready(function() {
    console.log("Start");
    $('button.b_num').on('click', handle_num);
    $('button.b_oper').on('click', handle_oper);
    $('button#id_eq').on('click', handle_exec);
    $(document).keypress(handle_key);
});


