
/* description: Parses CQP to a JSON representation. */

/* lexical grammar */
%lex
%%


' contains '        return 'contains'
'lbound'            return "FUNC"
'rbound'            return "FUNC"
'sentence'          return "FUNCVAL"
"("                 /* skip */
")"                 /* skip */
\s+                 /* skip whitespace */
\%[cd]+             return "FLAG"
'not'               return 'not'
(_.)?[A-Za-z]+      return 'TYPE'
'!='                return '!='
'^='                return '^='
'&='                return '&='
'_='                return '_='
'*='                return '*='
'='                 return '='
'"'\S*'"'           return 'VALUE'
"["\s*"]"           return 'EMPTY'
"["                 return '['
"]"                 return ']'
"|"                 return '|'
"&"                 return '&'
"{"                 return '{'
"}"                 return '}'
\d+                 return "INT"
","                 return ','
"%"                 return "%"

<<EOF>>             return 'EOF'

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
        {$$ = {"and_block" : [$1]}
    | bound_block
        {$$ = {"bound" : $1, "and_block" : []}
    | or_block '&' and_block
        {$$ = [].concat([$1], $3.and_block)}
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
    ;


or 
    : TYPE infix_op VALUE
        {$$ =  {type : $1, op : $2, val: $3.slice(1, -1)}}
    | or 'FLAG'
        {$1.flags = $2.slice(1).split(""); $$ = $1}
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
    | "_="
        {$$ = "_="}
    ;


