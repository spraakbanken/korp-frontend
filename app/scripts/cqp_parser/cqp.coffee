window.c = console

prio = settings.cqp_prio or ['deprel', 'pos', 'msd', 'suffix', 'prefix', 'grundform', 'lemgram', 'saldo', 'word']

stringifyCqp = (cqp_obj, translate_ops = false) ->
    output = []
    cqp_obj = CQP.prioSort _.cloneDeep cqp_obj

    for token in cqp_obj
        if typeof token == "string"
            output.push token
            continue
        
        or_array = for and_array in token.and_block
            for {type, op, val, flags} in and_array
                # if op != "*="
                #     val = regescape val
                if translate_ops
                    [val, op] = {
                        "^=" : [val + ".*", "="]
                        "_=" : [".*" + val + ".*", "="]
                        "&=" : [".*" + val, "="]
                        "*=" : [val, "="]
                        "!*=" : [val, "!="]
                    }[op] or [val, op]

                flagstr = ""
                if flags and _.keys(flags).length
                    flagstr = " %" + _.keys(flags).join("")

                if type == "word" and val == ""
                    out = ""
                else if type == "date_interval"
                    [from, to] = val.split(",")
                    operator1 = ">="
                    operator2 = "<="
                    bool = "&"
                    if op == "!="
                        operator1 = "<"
                        operator2 = ">"
                        bool = "|"

                    tmpl = _.template("(int(_.text_datefrom) <%= op1 %> <%= from %> <%= bool %> int(_.text_dateto) <%= op2 %> <%= to %>)")
                    out = tmpl
                         op1 : operator1,
                         op2 : operator2,
                         bool : bool,
                         from : from,
                         to : to
                    unless from and to then out = ""
                else 
                    out = "#{type} #{op} \"#{val}\"" 

                out + flagstr


        or_out = for x in or_array
            if x.length > 1
                "(#{x.join(' | ')})"
            else
                x.join(' | ')
                
        if token.bound
            or_out = _.compact or_out
            for bound in _.keys (token.bound)
                or_out.push "#{bound}(sentence)"


        
        out_token = "[#{or_out.join(' & ')}]"
        if token.repeat
            out_token += "{#{token.repeat.join(',')}}"


        
        output.push out_token



    return output.join(" ")

window.CQP =
    parse : => CQPParser.parse arguments...
    stringify : stringifyCqp
    expandOperators : (cqpstr) ->
        CQP.stringify CQP.parse(cqpstr), true

    fromObj : (obj) ->
        CQP.parse "[#{obj.type} #{obj.op} '#{obj.val}']"

    # UNTESTED AND UNUSED
    and_merge : (cqpObjs...) ->

        for tup in _.zip cqpObjs...
            [first, rest...] = tup
            merged = [].concat (_.pluck rest, "and_block")...
            first.and_block = first.and_block.concat merged




    concat : (cqpObjs...) ->
        [].concat cqpObjs...

    prioSort : (cqpObjs) ->
        getPrio = (and_array) ->
            numbers = _.map and_array, (item) ->
                _.indexOf prio, item.type


            return Math.min numbers...

        for token in cqpObjs
            token.and_block = (_.sortBy token.and_block, getPrio).reverse()

        return cqpObjs





# cqp = '[(word = "ge" | pos = "JJ" | lemma = "sdfsdfsdf") & deprel = "SS" & (word = "sdfsdf" | word = "b" | word = "a")]'
c.log CQP.stringify( CQP.parse('[(word &= "ge" | pos = "JJ")]'), true)
# c.log JSON.stringify (CQP.parse '[word = "apa"'), null, 2






c.log CQP.stringify [
    {
        "and_block": [
            [
                {
                    "type": "date_interval",
                    "op" : "!="
                    "val" : "18870101,20101231"
                },
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