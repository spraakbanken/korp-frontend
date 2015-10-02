window.c = console

prio = settings.cqp_prio or ['deprel', 'pos', 'msd', 'suffix', 'prefix', 'grundform', 'lemgram', 'saldo', 'word']


parseDateInterval = (op, val, expanded_format) ->
    val = _.invoke val, "toString"
    unless expanded_format
        return "$date_interval #{op} '#{val.join(",")}'"

    [fromdate, todate, fromtime, totime] = val

    m_from = moment(fromdate, "YYYYMMDD")
    m_to = moment(todate, "YYYYMMDD")

    fieldMapping = 
        text_datefrom : fromdate
        text_dateto : todate
        text_timefrom : fromtime
        text_timeto : totime

    op = (field, operator, valfield) ->
        val = if valfield then fieldMapping[valfield] else fieldMapping[field]
        "int(_.#{field}) #{operator} #{val}"


    days_diff = m_from.diff(m_to, "days")
    c.log "days_diff", days_diff

    if days_diff == 0  # same day
        out = "#{op('text_datefrom', '=')} &
        #{op('text_timefrom', '>=')} &
        #{op('text_dateto', '=')} &
        #{op('text_timeto', '<=')}"
        
    else if days_diff == -1 # one day apart
        out = "((#{op('text_datefrom', '=')} & #{op('text_timefrom', '>=')}) | #{op('text_datefrom', '=', 'text_dateto')}) &
        (#{op('text_dateto', '=', 'text_datefrom')} | (#{op('text_dateto', '=')} & #{op('text_timeto', '<=')}))"
        

    else
        out = "((#{op('text_datefrom', '=')} & #{op('text_timefrom', '>=')}) | 
        (#{op('text_datefrom', '>')} & #{op('text_datefrom', '<=', 'text_dateto')})) &
        (#{op('text_dateto', '<')} | (#{op('text_dateto', '=')} & #{op('text_timeto', '<=')}))"
        

    out = out.replace(/\s+/g, " ")

    unless fromdate and todate then out = ""

    return out

stringifyCqp = (cqp_obj, expanded_format = false) ->
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
                if expanded_format
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
                    out = parseDateInterval(op, val, expanded_format)
                    
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

    getTimeInterval : (obj) ->
        from = []
        to = []
        for token in obj
            for or_block in token.and_block
                for item in or_block
                    if item.type == "date_interval"
                        from.push moment("#{item.val[0]}#{item.val[2]}", "YYYYMMDDhhmmss")
                        to.push moment("#{item.val[1]}#{item.val[3]}", "YYYYMMDDhhmmss")

        unless from.length then return
        from = _.min from, (mom) -> mom.toDate()
        to = _.max to, (mom) -> mom.toDate()

        return [from, to]





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