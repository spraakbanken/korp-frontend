
/* description: Parses CQP to a JSON representation. */


/* lexical grammar */
%lex
%%


\d{6,8}               return "DATE_TIME_VAL"
"int"                 return "int"
"<="                  return "DATE_OP"
"=>"                  return "DATE_OP"
"<"                   return "DATE_OP"
">"                   return "DATE_OP"
// "="                   return "DATE_OP"
' contains '          return 'contains'
'lbound'              return "FUNC"
'rbound'              return "FUNC"
'sentence'            return "FUNCVAL"
"("                   return "("
")"                   return ")"
\s+                   /* skip whitespace */
\%[cd]+               return "FLAG"
'not'                 return 'not'
'!='                  return 'INFIX_OP'
'^='                  return 'INFIX_OP'
'&='                  return 'INFIX_OP'
'_='                  return 'INFIX_OP'
'*='                  return 'INFIX_OP'
'='                   return '='
(_.)?[A-Za-z_]+       return 'TYPE'
["'].*?['"]           return 'VALUE'
"["\s*"]"             return 'EMPTY'
"["                   return '['
"]"                   return ']'
"|"                   return '|'
"&"                   return '&'
"{"                   return '{'
"}"                   return '}'
\d+                   return "INT"
","                   return ','
"%"                   return "%"
  
  
<<EOF>>               return 'EOF'

/lex

/* operator associations and precedence */

%left "&" "|"
// %left "|"

%start expressions

%% /* language grammar */

expressions
    : tokens EOF
        { typeof console !== 'undefined' ? console.log(JSON.stringify($1, null, 4)) : print($1);
          return $1; }
    ;


tokens
    : token
        {$$ = [$1]}
    | token tokens
        {$$ = [].concat([$1], $2)}
    ;


/*  */
token
    : 'EMPTY'
        {$$ = {"and_block":[[{type:"word",op:"=",val:""}]]}}
    | '[' and_block ']'
        {$$ = $2}
        
    | token repeat
        {$$ = $1; $1.repeat = $2}
    ;

repeat
    : "{" 'INT' "," "INT" "}"
        {$$ =  [Number($2), Number($4)]}
    | "{" 'INT' "," "}"
        {$$ = [Number($2)]}
    ;

and_block
    : or_block
        {$$ = {"and_block" : [$1]}}
    | bound_block
        {$$ = {"bound" : $1, "and_block" : []}}
    | or_block '&' and_block
        {$3.and_block.push($1); $$ = $3;}
    ;


bound_block
    : bound
        {$$ = {}; $$[$1] = true}
    | bound '&' bound_block
        {$$ = $3; $3[$1] = true}
    ;



or_block
    : or
        {$$ = [$1]}
    | date_time_expr[dte]
        {
            for(key in $dte) {
                if($dte[key].length > 1)
                    $dte[key] = $dte[key].filter(function(item) {
                        return item[0] == "=";
                    }); 
                $dte[key] = $dte[key][0][1]// only one item left, return value
            }
            var val = [$dte["_.fromdate"], $dte["_.todate"], $dte["_.fromtime"], $dte["_.totime"]].join(",");
            $$ = [{type : "date_interval", op : "=", val: val}]
        }
    | or '|' or_block
    // | "(" or '|' or_block ")"
        {$$ = [].concat([$or], $or_block)}
    | "(" or_block ")"
        {$$ = $2}
    ;

bool
    : "&"
        {$$ = $1}
    | "|"
        {$$ = $1}
    ;

/*type
    : TYPE
        {$$ = $1}
    | "int" "(" TYPE ")"
        {$$ = $3}
    ;*/



or 
    : TYPE infix_op VALUE
        {$$ =  {type : $1, op : $2, val: $3.slice(1, -1)}}

    | or FLAG
        {
            var chars = $2.slice(1).split("");
            $1.flags = {};
            for(var i = 0; i < chars.length; i++)
                $1.flags[chars[i]] = true;
                
            $$ = $1;
        }
    ;


date_time_expr 
    : date
        {
            $$ = $1;
        }
    | "(" date_time_expr[dte1] bool date_time_expr[dte2] ")"
    // | "(" date_time_expr[dte1] bool date_time_expr[dte2] ")"
        {
            $$ = _.merge({}, $dte1, $dte2, function(a, b) {
              return _.isArray(a) ? a.concat(b) : undefined;
            });
        }
    ;



date
    : "int" "(" TYPE ")" date_op DATE_TIME_VAL
        {
            // console.log("DATE_TIME_VAL", $DATE_TIME_VAL)
            if(!_.isPlainObject($$)) $$ = {}
            

            if(typeof $$[$3] == "undefined") $$[$3] = []

            // if($5 == "=")
            $$[$3].push([$5, $6])

        }
    // | "(" date ")"
    //     {$$ = $2}
    ;


bound
    : FUNC FUNCVAL
        { $$ = $1}
    ;

date_op
    : "DATE_OP"
        {$$ = $1}
    | "="
        {$$ = "="}
    ;

infix_op
    : "="
        {$$ = "="}
    | INFIX_OP
        {$$ = $1}
/*    | "!="
        // {$$ = "!="}*/
    | " contains "
        {$$ = "contains"}
    | " not contains "
        {$$ = "not contains"}
    /*| "^="
        {$$ = "^="}
    | "&="
        {$$ = "&="}
    | "*="
        {$$ = "*="}
    | "!*="
        {$$ = "!*="}
    | "_="
        {$$ = "_="}*/
    ;


%%

if(typeof require != "undefined")
    var _ = require("../../components/lodash/lodash")._


// var _ = {};
// _.isArray = function(value) {
//   return value ? (typeof value == 'object' && toString.call(value) == arrayClass) : false;
// };
// _.isObject = function(value) {
//   // check if the value is the ECMAScript language type of Object
//   // http://es5.github.com/#x8
//   // and avoid a V8 bug
//   // http://code.google.com/p/v8/issues/detail?id=2291
//   return value ? objectTypes[typeof value] : false;
// }
// _.isPlainObject = function(value) {
//   if (!(value && toString.call(value) == objectClass) || (!support.argsClass && isArguments(value))) {
//     return false;
//   }
//   var valueOf = value.valueOf,
//       objProto = typeof valueOf == 'function' && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

//   return objProto
//     ? (value == objProto || getPrototypeOf(value) == objProto)
//     : shimIsPlainObject(value);
// };
// _.merge = function(object, source, deepIndicator) {
//   var args = arguments,
//       index = 0,
//       length = 2;

//   if (!isObject(object)) {
//     return object;
//   }
//   if (deepIndicator === indicatorObject) {
//     var callback = args[3],
//         stackA = args[4],
//         stackB = args[5];
//   } else {
//     stackA = [];
//     stackB = [];

//     // allows working with `_.reduce` and `_.reduceRight` without
//     // using their `callback` arguments, `index|key` and `collection`
//     if (typeof deepIndicator != 'number') {
//       length = args.length;
//     }
//     if (length > 3 && typeof args[length - 2] == 'function') {
//       callback = lodash.createCallback(args[--length - 1], args[length--], 2);
//     } else if (length > 2 && typeof args[length - 1] == 'function') {
//       callback = args[--length];
//     }
//   }
//   while (++index < length) {
//     (_.isArray(args[index]) ? forEach : forOwn)(args[index], function(source, key) {
//       var found,
//           isArr,
//           result = source,
//           value = object[key];

//       if (source && ((isArr = _.isArray(source)) || isPlainObject(source))) {
//         // avoid merging previously merged cyclic sources
//         var stackLength = stackA.length;
//         while (stackLength--) {
//           if ((found = stackA[stackLength] == source)) {
//             value = stackB[stackLength];
//             break;
//           }
//         }
//         if (!found) {
//           var isShallow;
//           if (callback) {
//             result = callback(value, source);
//             if ((isShallow = typeof result != 'undefined')) {
//               value = result;
//             }
//           }
//           if (!isShallow) {
//             value = isArr
//               ? (_.isArray(value) ? value : [])
//               : (isPlainObject(value) ? value : {});
//           }
//           // add `source` and associated `value` to the stack of traversed objects
//           stackA.push(source);
//           stackB.push(value);

//           // recursively merge objects and arrays (susceptible to call stack limits)
//           if (!isShallow) {
//             value = merge(value, source, indicatorObject, callback, stackA, stackB);
//           }
//         }
//       }
//       else {
//         if (callback) {
//           result = callback(value, source);
//           if (typeof result == 'undefined') {
//             result = source;
//           }
//         }
//         if (typeof result != 'undefined') {
//           value = result;
//         }
//       }
//       object[key] = value;
//     });
//   }
//   return object;
// }
