Sidebar =
  options: {
    displayOrder : [
      "pos",
      "posset",
      "lemma",
      "lex",
      "saldo",
      "variants"
    ].reverse()
  }
  _init: ->

  updateContent: (sentenceData, wordData, corpus) ->
    @element.html "<div id=\"selected_sentence\" /><div id=\"selected_word\" />"
    corpusObj = settings.corpora[corpus]
    $("<div />").html("<h4 rel='localize[corpus]'></h4> <p>#{corpusObj.title}</p>").prependTo "#selected_sentence"
    unless $.isEmptyObject(corpusObj.attributes)
      $("#selected_word").append $("<h4>").localeKey("word_attr")
      
      @renderContent(wordData, corpusObj.attributes).appendTo "#selected_word"
    unless $.isEmptyObject(corpusObj.struct_attributes)
      $("#selected_sentence").append $("<h4>").localeKey("sentence_attr")
      
      @renderContent(sentenceData, corpusObj.struct_attributes).appendTo "#selected_sentence"
      
    @element.localize()
    @applyEllipse()

  renderContent: (wordData, corpus_attrs) ->
    pairs = _.pairs(wordData)
    order = @options.displayOrder
    pairs.sort ([a], [b]) ->
      $.inArray(b, order) - $.inArray(a, order)
    items = for [key, value] in pairs when corpus_attrs[key]
      @renderItem key, value, corpus_attrs[key]
    
    return $(items)
    
  renderItem: (key, value, attrs) -> 
    if attrs.displayType == "hidden" or attrs.displayType == "date_interval"
      return ""
    output = $("<p><span rel='localize[#{attrs.label}]'>#{key}</span>: </p>")
    output.data("attrs", attrs)
    if value == "|" or value == ""
      output.append "<i rel='localize[empty]' style='color : grey'>${util.getLocaleString('empty')}</i>"
      
    
    
    if attrs.type == "set"
      pattern = attrs.pattern or '<span data-key="<% key %>"><%= val %></span>'
      ul = $("<ul>")
      getStringVal = (str) ->
        return _.reduce(_.invoke(_.invoke(str, "charCodeAt", 0), "toString"), (a,b) -> a + b);
    
      valueArray = _.filter(value.split("|"), Boolean)
      if key == "variants"
#         TODO: this doesn't sort quite as expected
        valueArray.sort (a, b) -> 
          splita = util.splitLemgram(a);
          splitb = util.splitLemgram(b);
          strvala = getStringVal(splita.form) + splita.index + getStringVal(splita.pos); 
          strvalb = getStringVal(splitb.form) + splitb.index + getStringVal(splitb.pos); 
                  
          return parseInt(strvala) - parseInt(strvalb);
        
      
      
      lis = for x in valueArray when x.length
        val = (attrs.stringify or _.identity)(x)
         
        inner = $(_.template(pattern, {key : x, val : val}))
        if attrs.translationKey
          prefix = attrs.translationKey or ""
          inner.localeKey(prefix + x)
        li = $("<li></li>").data("key", x).append inner
        if attrs.externalSearch
          address = _.template(attrs.externalSearch, {val : x})
          li.append $("<a href='#{address}' class='external_link' target='_blank'></a>")
                          .click (event) -> event.stopImmediatePropagation() 
        if attrs.internalSearch
          li.addClass("link").click -> 
            cqpVal = $(this).data("key")
            $.bbq.pushState({"search": "cqp|[#{key} contains '#{cqpVal}']"})
            # $("#search-tab ul li:nth(2)").click()
            # extendedSearch.reset()
            # extendedSearch.$main.find(".arg_type:first").val(key)
            # extendedSearch.$main.find(".arg_value:first").val()
            
            
        li
      ul.append lis
      output.append ul
      
      return output
      
    
    value = (attrs.stringify or _.identity)(value) 
    
    
    if attrs.type == "url"
      return output.append "<a href='#{value}' class='exturl sidebar_url'>#{decodeURI(value)}</a>" 
        
    else if key == "msd"
      return output.append """<span class='msd'>#{value}</span>
                                <a href='markup/msdtags.html' target='_blank'>
                                  <span id='sidbar_info' class='ui-icon ui-icon-info'></span>
                                </a> 
                              </span>  
                            """
    else if attrs.pattern
      return output.append _.template(attrs.pattern)
    
    else
      if attrs.translationKey
        return output.append "<span rel='localize[#{attrs.translationKey}#{value}]'></span>"
      else
        return output.append "<span>#{value || ''}</span>"
    
    

  applyEllipse: ->
    oldDisplay = @element.css("display")
    @element.css "display", "block"
    totalWidth = @element.width()
    
    # ellipse for too long links of type=url
    @element.find(".sidebar_url").css("white-space", "nowrap").each ->
      while $(this).width() > totalWidth
        oldtext = $(this).text()
        a = $.trim(oldtext, "/").replace("...", "").split("/")
        domain = a.slice(2, 3)
        midsection = a.slice(3).join("/")
        midsection = "..." + midsection.slice(2)
        $(this).text ["http:/"].concat(domain, midsection).join("/")
        break  if midsection is "..."

    @element.css "display", oldDisplay

  _parseLemma: (attr, tmplVal) ->
    seq = []
    if attr?
      seq = $.map(attr.split("|"), (item) ->
        lemma = item.split(":")[0]
        if tmplVal.pattern
          $.format tmplVal.pattern, [lemma, lemma]
        else
          lemma
      )
    seq = $.grep(seq, (itm) ->
      itm and itm.length
    )
    $.arrayToHTMLList(seq).outerHTML()
  ###
  _sidebarSaldoFormat: ->
    $("#sidebar_lex, #sidebar_prefix, #sidebar_suffix, #sidebar_dalinlem, #sidebar_saldolem, #sidebar_variants").each ->
      idArray = $.grep($(this).text().split("|"), (itm) ->
        itm and itm.length
      ).sort()
      attr = $(this).attr("id").split("_")[1]
      labelArray = util.sblexArraytoString(idArray)
      
      $(this).html($.arrayToHTMLList(labelArray)).find("li").wrap("<a href='javascript:void(0)' />").click(->
        id = idArray[$(this).parent().index()]
        split = util.splitLemgram(id)
        id = $.format("%(form)s..%(pos)s.%(index)s", split)
        c.log "sidebar click", split, idArray, $(this).parent().index(), $(this).data("lemgram")
        unless $.inArray(attr, ["dalinlem", "saldolem"]) is -1
          advancedSearch.setCQP $.format("[%s contains '%s']", [attr, id])
          advancedSearch.onSubmit()
        else
          simpleSearch.selectLemgram id
      ).hoverIcon "ui-icon-search"

    $saldo = $("#sidebar_saldo")
    saldoidArray = $.grep($saldo.text().split("|"), (itm) ->
      itm and itm.length
    ).sort((a, b) ->
      parseInt(a.split("..")[1]) - parseInt(b.split("..")[1])
    )
    saldolabelArray = util.sblexArraytoString(saldoidArray, util.saldoToString)
    $saldo.html($.arrayToHTMLList(saldolabelArray)).find("li").each((i, item) ->
      id = saldoidArray[i].match(util.saldoRegExp).slice(1, 3).join("..")
      $(item).wrap $.format("<a href='http://spraakbanken.gu.se/karp/#search-tab=1&search=cql|(saldo+%3D+\"%s\")&lang=%s' target='_blank' />", [id, $.bbq.getState("lang") or "sv"])
    ).hoverIcon "ui-icon-extlink"
  ###
  
  # hacked in at the last minute
  
  #
  #   var fsvbase = $("#sidebar_fsvbaseform"); 
  #   var labelArray = $.grep(fsvbase.text().split("|"), Boolean).sort();
  #
  #   fsvbase.html($.arrayToHTMLList(labelArray))
  #   .find("li")
  #   .each(function(i, item){
  #     $(this).wrap($.format('<a href="http://spraakbanken.gu.se/karp/#search=cql%7Cgf%7C%s" target="_blank" />', $(this).text()));
  #   })
  #   .hoverIcon("ui-icon-extlink");
  #   
  #   function getStringVal(str) {
  #     return _.reduce(_.invoke(_.invoke(str, "charCodeAt", 0), "toString"), function(a,b) {return a + b});
  #   }
  #   
  #   $("#sidebar_fsvlemgram,#sidebar_variants").each(function() {
  #     
  #     var saldoidArray = $.grep($(this).text().split("|"), function(itm) {
  #       return itm && itm.length;  
  #     }).sort(function(a, b) {
  #       var splita = util.splitLemgram(a);
  #       var splitb = util.splitLemgram(b);
  #       var strvala = getStringVal(splita.form) + getStringVal(splita.pos) + splita.index; 
  #       var strvalb = getStringVal(splitb.form) + getStringVal(splitb.pos) + splitb.index; 
  #               
  #       return parseInt(strvala) - parseInt(strvalb);
  #       
  #     });
  #     var saldolabelArray = util.sblexArraytoString(saldoidArray, util.lemgramToString);
  #
  #     $(this).html($.arrayToHTMLList(saldolabelArray))
  #     .find("li")
  #     .each(function(i, item){
  #       $(this).wrap($.format('<a href="http://spraakbanken.gu.se/karp/#search=lemgram%7Cfsvm:%s" target="_blank" />', saldoidArray[i] )); 
  #     })
  #     .hoverIcon("ui-icon-extlink");
  #     
  
  #     var labelArray = $.grep($(this).text().split("|"), Boolean).sort();
  #     
  #     $(this).html($.arrayToHTMLList(labelArray))
  #     .find("li")
  #     .each(function(i, item){
  #       var label = util.lemgramToString($(this).text());
  #       $(this).wrap($.format('<a href="http://spraakbanken.gu.se/karp/#search=lemgram%7C%s" target="_blank">%s</a>', 
  #           [$(this).text().split("..")[0], label] ));
  #     })
  #     .hoverIcon("ui-icon-extlink");
  
  #   });
  refreshContent: (mode) ->
    self = this
    if mode is "lemgramWarning"
      $.Deferred((dfd) ->
        self.element.load "markup/parse_warning.html", ->
          util.localize()
          self.element.addClass("ui-state-highlight").removeClass "kwic_sidebar"
          dfd.resolve()

      ).promise()
    else
      @element.removeClass("ui-state-highlight").addClass "kwic_sidebar"
      instance = $("#result-container").korptabs("getCurrentInstance")
      instance.selectionManager.selected.click()  if instance and instance.selectionManager.selected

  updatePlacement: ->
    max = Math.round($("#columns").position().top)
    if $(window).scrollTop() < max
      @element.removeClass "fixed"
    else @element.addClass "fixed"  if $("#left-column").height() > $("#sidebar").height()

  show: (mode) ->
    self = this
    
    # make sure that both hide animation and content load is done before showing
    $.when(@element).pipe(->
      self.refreshContent mode
    ).done ->
      self.element.show "slide",
        direction: "right"

      $("#left-column").animate
        right: 265
      , null, null, ->
        $.sm.send "sidebar.show.end"



  hide: ->
    return  if $("#left-column").css("right") is "0px"
    self = this
    self.element.hide "slide",
      direction: "right"

    $("#left-column").animate
      right: 0
    , null, null, ->
      $.sm.send "sidebar.hide.end"

 


$.widget("ui.sidebar", Sidebar);