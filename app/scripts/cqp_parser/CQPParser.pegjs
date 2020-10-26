{
  function makeObj(type, op, val, flags) {
    return {type : type, op : op, val: val, flags: flags}
  }

  function unpack(target, source) {
    var output = [].concat(target)
    source.forEach(function(item) {
      output.push(item[1])
    })
    return output
  }

  var _ = window._
  var c = console

}


start
  = tokens

tokens
  = t1:token t2:(" " t2:token)*
  {
    return unpack([t1], t2)
  }


token
  = "[" "]" repeat:repeat? {
    var result = {"and_block":[[{type:"word",op:"=",val:""}]]}
    if(repeat)
      result.repeat = repeat
    return result
  }
  / "[" left:and right:(" & " and)* "]" repeat:repeat? {
    var output = left
    right.forEach(function(item) {
      var val = item[1]
      output = _.mergeWith(output, val, function(a, b) {
        return _.isArray(a) ? a.concat(b) : undefined;
      })
    })

    if(repeat)
      output.repeat = repeat
    return output
 }

repeat
   = "{" from:[0-9]+ "," to:[0-9]* "}"
    {
      var output = [Number(from.join(""))]
      if(to.length)
        output.push(Number(to.join("")))
      return output
    }


bound = val:("lbound" / "rbound") "(" "sentence" ")" {
  return val
}


bound_block
  = first:bound rest:(" & " bound)*
  {
    return unpack([first], rest)
  }

and
  =  left:or right:(" | " or)* {
    return {and_block : [unpack([left], right)]}
  }
  / bound:bound_block {
    bound = _.fromPairs(bound.map(function(item) {
      return [item, true]
    }))
    return {"bound" : bound, "and_block" : []}
  }
  / "(" and:and ")" {return and}


or
  = lhs:("_."? [A-Za-z_0-9]+) " "? infix_op:infix_op " "? rhs:value_expr flags:(" %"[lcd]+)? {
    var prefix = ""
    if(lhs[0])
      prefix = lhs[0]

    if(flags) {
      flags = _.zipObject(flags[1], _.map(flags[1], function() { return true; }));
    }
    return makeObj(prefix + lhs[1].join(""), infix_op, rhs, flags)
  }
  / date

value_expr
    = ["] rhs:('""' / [^"])* ["] {
        return rhs.join("");
    }
    / ['] rhs:("\\'" / [^'])* ['] {
        return rhs.join("");
    }

// date_expr

date
  = "$" "date_interval" " "? op:("!=" / "=") " "? ["'] val:([0-9]+ "," [0-9]+ "," [0-9]+ "," [0-9]+) ['"]
{

  val = _.filter(val, _.isArray).map(function(item) {
    return item.join("")
  })
  return makeObj("date_interval", op, val)
}

infix_op
  = "^="
  / "&="
  / "_="
  / "*="
  / "!="
  / "="
  / "!*="
  / "not contains"
  / "contains"
  / "highest_rank"
  / "not_highest_rank"
  / "rank_contains"
  / "not_rank_contains"
  / "regexp_contains"
  / "not_regexp_contains"
  / "starts_with_contains"
  / "ends_with_contains"
  / "incontains_contains"
  / "not_starts_with_contains"
  / "not_ends_with_contains"
  / "not_incontains_contains"

date_op
  = " <= "
  / " => "
  / " > "
  / " = "
  / " < "


bool
  = " & "
  / " | "
