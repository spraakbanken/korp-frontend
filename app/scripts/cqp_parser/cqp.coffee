window.c = console


stringifyCqp = (cqp_obj, translate_ops = false) ->
    output = []

    for token in cqp_obj
        or_array = []
        or_array = for and_array in token.and_block
            for {type, op, val} in and_array
                if translate_ops
                    [val, op] = {
                        "^=" : [val + ".*", "="]
                        "_=" : [".*" + val + ".*", "="]
                        "&=" : [".*" + val, "="]
                        "*=" : [val, "="]
                    }[op] or [val, op]
                if type == "word" and val == ""
                    ""
                else 
                    "#{type} #{op} \"#{val}\"" 


        or_out = (x.join(" | ") for x in or_array)

        flags = ""
        if token.flags
            flags = " %" + token.flags.join("")
        out_token = "[#{or_out.join(' & ')}#{flags}]"
        if token.repeat
            out_token += "{#{token.repeat.join(',')}}"
        
        output.push out_token



    return output.join(" ")

window.CQP =
    parse : => CQPParser.parse arguments...
    stringify : stringifyCqp


# cqp = '[(word = "ge" | pos = "JJ" | lemma = "sdfsdfsdf") & deprel = "SS" & (word = "sdfsdf" | word = "b" | word = "a")]'
c.log CQP.stringify( CQP.parse('[(word &= "ge" | pos = "JJ")]'), true)
# c.log JSON.stringify (CQP.parse '[word = "apa"'), null, 2






c.log CQP.stringify [
    {
        "and_block": [
            [
                {
                    "type": "word",
                    "op": "!=",
                    "val": "value"
                },
                {
                    "type": "word",
                    "op": "&=",
                    "val": "value2",
                }
            ],
            [
                {
                    "type": "word",
                    "op": "not contains",
                    "val": "ge..vb.1"
                }
            ]
        ]
    },
    {
        "and_block":[
            [{"type": "word", "op": "=", "val": ""}]
        ],
        "repeat":[1,2]}
]