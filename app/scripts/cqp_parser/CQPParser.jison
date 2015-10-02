
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

%ebnf

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
    // | '[' and_block ']'
    //     {$$ = $2}
    | '[' expr1 ('&' expr1)* ']'
    // | '[' expr3 ']'
        {$$ = $2}
        
    // | token repeat
    //     {$$ = $1; $1.repeat = $2}
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


expr0
    : date
        // {$$ = {date : $1}}
    | or
        // {$$ = {or : $1}}
    | "(" expr1 ")"
        {$$ = $2}
    ;


expr1
    : expr0
        {
            // if(!_.isArray($expr0))
            //     // $$ = [(_.values($expr0)[0])]
            //     $$ = [($expr0)]
            // else
            $$ = $expr0
        }
    | expr1 bool expr0
        {  
            c.log("has child", !!$expr1.child)

            if($bool == "|")
                $$ = [$expr1]

            // if(typeof $expr1.parent == "undefined") 
            //     $expr1.parent = []
            // if(typeof $expr1.sibling == "undefined") 
            //     $expr1.sibling = []

            // if($bool == "&")
            //     $expr1.parent.push($expr0)
            // else if($bool == "|")
            //     $expr1.sibling.push($expr0)
            // $expr0.bool = $bool
            // $expr1.child = $expr0;

            return;
            var isTerminal = !_.isArray($expr0)

            function stripKey(item) {
                if("or" in item || "date" in item)
                    return _.values(item)[0]
                else 
                    return item
            }
            // $$ = output.map(stripKey);

            // isTerminal

            if($bool == "&")
                c.log("expr", $expr1, $expr0, isTerminal)

            output = [].concat($expr1, $expr0)
            $$ = output

            // c.log("expr", $expr1, $bool, $expr0 )
            // c.log("expr", isTerminal, $expr0 )
            // var output = []
            if(_.isArray($expr0))
                output = [].concat($expr1, $expr0)
            else {
                $expr1.push($expr0)
                output = $expr1
            }
            

            // c.log("expr0", $expr1)
            $$ = output
            // if("date" in $expr0) {
                
            // }
        }
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

var c = console;