
/* description: Parses CQP to a JSON representation. */

/* lexical grammar */
%lex
%%

"int(_.text_datefrom)"  return "DATE_TIME_KEY"
"int(_.text_dateto)"  return "DATE_TIME_KEY"
"int(_.text_timefrom)"  return "DATE_TIME_KEY"
"int(_.text_timeto)"  return "DATE_TIME_KEY"
\d{6,8}                 return "DATE_TIME_VAL"
"<="                  return "DATE_OP"
">="                  return "DATE_OP"
"<"                   return "DATE_OP"
">"                   return "DATE_OP"
"="                   return "DATE_OP"
' contains '          return 'contains'
'lbound'              return "FUNC"
'rbound'              return "FUNC"
'sentence'            return "FUNCVAL"
%"("                   /* skip */
%")"                   /* skip */
\s+                   /* skip whitespace */
\%[cd]+               return "FLAG"
'not'                 return 'not'
'!='                  return '!='
'^='                  return '^='
'&='                  return '&='
'_='                  return '_='
'!*='                  return '!*='
'*='                  return '*='
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


%start expressions

%% /* language grammar */

expressions
    : tokens EOF
        { /*typeof console !== 'undefined' ? console.log(JSON.stringify($1, null, 4)) : print($1);*/
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
    | or '|' or_block
        {$$ = [].concat([$1], $3)}

    | date_time_expr
        {
            for(key in $1) {
                $1[key] = Math.min.apply(null, $1[key])
            }
            var val = [$1["fromdate"], $1["todate"], $1["fromtime"], $1["totime"]].join(",");
            $$ = {type : "date_interval", op : "=", val: val}
            // var op = $2 == '<' ? "!=" : "=";
            // $$ =  {type : "date_interval", op : op, val: $3 + "," + $7}
        }
    ;

bool
    : "&"
        {$$ = $1}
    | "|"
        {$$ = $1}
    ;

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
    | date bool date_time_expr
        {
            $$ = {};
            for(key in $1) {
                $$[key] = $1[key].concat($1);
            }
        }
    ;



date
    : DATE_TIME_KEY DATE_OP DATE_VAL
        {
            if(!$$) $$ = {}
            var key = $1.split("_")[$1.split("_").length - 1]
            if(!key in $$) $$[key] = []

            if($2 == "=")
                $$[key].push($3)

        }
    ;


bound
    : FUNC FUNCVAL
        { $$ = $1}
    ;

infix_op
    : "="
        {$$ = "="}
    | "!="
        {$$ = "!="}
    | " contains "
        {$$ = "contains"}
    | " not contains "
        {$$ = "not contains"}
    | "^="
        {$$ = "^="}
    | "&="
        {$$ = "&="}
    | "*="
        {$$ = "*="}
    | "!*="
        {$$ = "!*="}
    | "_="
        {$$ = "_="}
    ;


