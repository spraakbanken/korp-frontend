'use strict'
c = console

angular.module 'sbMap', [
  'leaflet-directive',
  'sbMapTemplate'
  ]
  .factory 'places', ['$q', '$http', ($q, $http) ->

    class Places

      constructor: () ->
        @places = null

      getLocationData: () ->
        def = $q.defer()

        if not @places
          $http.get('components/geokorp/dist/data/places.json')
            .success((data) =>
              @places = data: data
              def.resolve @places
            )
            .error(() =>
              def.reject()
              c.log "failed to get place data for sb map"
            )
        else
          def.resolve @places

        return def.promise

    return new Places()
  ]
  .factory 'nameMapper', ['$q','$http', ($q, $http) ->

    class NameMapper

      constructor: () ->
        @mapper = null

      getNameMapper: () ->
        def = $q.defer()

        if not @mapper
          $http.get('components/geokorp/dist/data/name_mapping.json')
            .success((data) ->
              def.resolve(data: data)
            )
            .error(() ->
              c.log "failed to get name mapper for sb map"
              def.reject()
            )
        else
          def.resolve @mapper
        return  def.promise

    return new NameMapper()
  ]
  .factory 'lbTitles', ['$q', '$http', ($q, $http) ->
    parseXML = (data) ->
      xml = null
      tmp = null
      return null if not data or typeof data isnt "string"
      try
        if window.DOMParser # Standard
          tmp = new DOMParser()
          xml = tmp.parseFromString(data, "text/xml")
        else # IE
          xml = new ActiveXObject("Microsoft.XMLDOM")
          xml.async = "false"
          xml.loadXML data
      catch e
        xml = 'undefined'
      jQuery.error "Invalid XML: " + data  if not xml or not xml.documentElement or xml.getElementsByTagName("parsererror").length
      xml

    http = (config) ->
      defaultConfig =
        method : "GET"
        params:
          username : "app"
        transformResponse : (data, headers) ->
          output = parseXML(data)
          if $("fel", output).length
            c.log "xml parse error:", $("fel", output).text()
          return output

      $http(_.merge defaultConfig, config)


    deferred = $q.defer()
    http(
      url: "http://litteraturbanken.se/query/lb-anthology.xql?action=get-works",
      headers: { "accept" : "application/xml"}
    ).then (response) ->
      tree = response.data
      works = []
      temp = []
      for item in jQuery(tree).find('item')
        work_id = item.getAttribute('lbworkid')
        work_short_title = item.getAttribute('shorttitle')
        authors = []
        for author in jQuery(item).find('author')
          authors.push author.getAttribute("fullname")
        work_authors = authors.join(', ')

        if work_id not in temp
          temp.push work_id
          works.push ({ short_title : work_short_title, authors : work_authors })

      deferred.resolve works
    deferred.promise
  ]
  .factory 'markers', ['$rootScope', '$q', '$http', 'places', 'nameMapper', ($rootScope, $q, $http, places, nameMapper) ->
    icon =
      type: 'div',
      iconSize: [5, 5],
      html: '<span class="dot"></span>',
      popupAnchor:  [0, 0]

    return (nameData) ->
      deferred = $q.defer()
      $q.all([places.getLocationData(), nameMapper.getNameMapper()]).then ([placeResponse, nameMapperResponse]) ->
        names = _.keys nameData
        usedNames = []
        markers = {}

        mappedLocations = {}
        for name in names
          mappedName = null
          nameLow = name.toLowerCase()
          if nameMapperResponse.data.hasOwnProperty nameLow
            mappedName = nameMapperResponse.data[nameLow]
          else if placeResponse.data.hasOwnProperty nameLow
            mappedName = nameLow
          if mappedName
            locs = mappedLocations[mappedName]
            if not locs
              locs = {}
            locs[name] = nameData[name]
            mappedLocations[mappedName] = locs

        for own name, locs of mappedLocations
            do(name, locs) ->
              [lat, lng] = placeResponse.data[name]
              s = $rootScope.$new(true)
              s.names = locs

              id = name.replace(/-/g , "")
              markers[id] =
                icon : icon
                lat : lat
                lng : lng

              markers[id].getMessageScope = () -> s

        deferred.resolve markers
      deferred.promise
  ]
  .factory "timeData", ["$http", "places", ($http, places) ->
    yearToCity = {}
    first = 1611
    last = 2015

    getSeriesData = (data) ->
      delete data[""]
      # TODO: getTimeInterval should take the corpora of this parent tab instead of the global ones.
      # [first, last] = settings.corpusListing.getTimeInterval()



      parseDate = (granularity, time) ->
        [year,month,day] = [null,0,1]
        switch granularity
          when "y" then year = time
          when "m"
            year = time[0...4]
            month = time[4...6]
          when "d"
            year = time[0...4]
            month = time[4...6]
            day = time[6...8]

        return moment([Number(year), Number(month), Number(day)])

      fillMissingDate = (data) ->
        dateArray = _.pluck data, "x"
        min = _.min dateArray, (mom) -> mom.toDate()
        max = _.max dateArray, (mom) -> mom.toDate()

        duration = switch "y"
          when "y"
            duration = moment.duration year :  1
            diff = "year"
          when "m"
            duration = moment.duration month :  1
            diff = "month"
          when "d"
            duration = moment.duration day :  1
            diff = "day"

        n_diff = moment(max).diff min, diff

        momentMapping = _.object _.map data, (item) ->
          [moment(item.x).unix(), item.y]

        newMoments = []
        for i in [0..n_diff]
          newMoment = moment(min).add(diff, i)
          maybeCurrent = momentMapping[newMoment.unix()]
          if typeof maybeCurrent != 'undefined'
            lastYVal = maybeCurrent
          else
            newMoments.push {x : newMoment, y : lastYVal}


        return [].concat data, newMoments



      firstVal = parseDate "y", first
      lastVal = parseDate "y", last.toString()

      hasFirstValue = false
      hasLastValue = false
      output = for [x, y] in (_.pairs data)
        mom = (parseDate "y", x)
        if mom.isSame firstVal then hasFirstValue = true
        if mom.isSame lastVal then hasLastValue = true
        {x : mom, y : y}

      unless hasFirstValue
        output.push {x : firstVal, y:0}

      output = fillMissingDate output


      output =  output.sort (a, b) ->
        a.x.unix() - b.x.unix()

      #remove last element
      output.splice(output.length-1, 1)

      for tuple in output
        tuple.x = tuple.x.unix()

      return output


    (markers) ->
      cqps = _.map markers, (name) -> """(word = "#{name.message}")"""
      c.log cqps
      tokenWrap = (expr) -> "[" + expr + "]"
      cqp = tokenWrap (cqps).join(" | ")

      params = {
        command : "count_time"
        corpus : "LB"
        cqp : cqp
      }
      for expr, i in cqps
        params["subcqp" + i] = tokenWrap expr


      $http(
        method : "GET"
        url : "http://spraakbanken.gu.se/ws/korp"
        params: params
      ).then (response) ->
        c.log "time response", response.data

        combined = response.data.combined
        delete combined[""] # deal with rest data later?

        allData = []

        places.then (placeResponse) ->

          for item in combined
            series = getSeriesData item.relative
            name = item.cqp or "&Sigma;"
            if name.match('"(.*?)"') is null then continue
            city = name.match('"(.*?)"')[1]
            for val in series
              if val.y
                year = moment.unix(val.x).year()
                if not yearToCity[year]? then yearToCity[year] = []
                [lat, lng] = placeResponse.data[city.toLowerCase()]
                yearToCity[moment.unix(val.x).year()].push
                  val: val.y
                  name : city
                  lat: lat
                  lng : lng
        yearToCity
  ]

  .filter 'sbDateFilter', () ->
    (input, date, filterEnabled) ->
      out = input || []
      if filterEnabled
        out = {}
        for key, marker of input
          if marker.date == date
            out[key] = marker
      out

  .directive  'sbMap', ['$compile', '$timeout', 'leafletData', 'leafletEvents', ($compile, $timeout, leafletData, leafletEvents) ->
    link = (scope, element, attrs) ->

      scope.$on('leafletDirectiveMarker.mouseover', (event, marker) ->
          index = marker.modelName
          msgScope = scope.markers[index].getMessageScope()

          $timeout (() ->
               scope.$apply () ->
                  compiled = $compile scope.hoverTemplate
                  content = compiled msgScope
                  angular.element('#hover-info').empty()
                  angular.element('#hover-info').append content
                  angular.element('.hover-info').css('opacity', '1')), 0
      )

      scope.$on('leafletDirectiveMarker.mouseout', (event) ->
          angular.element('.hover-info').css('opacity','0')
      )

      scope.show_map = false
      leafletData.getMap().then (map) ->

          watercolor = L.tileLayer.provider('Stamen.Watercolor')
          osm = L.tileLayer.provider('OpenStreetMap')

          if scope.baseLayer is "Open Street Map"
              osm.addTo map
          else
              watercolor.addTo map

          baseLayers =
              "Stamen Watercolor" : watercolor
              "Open Street Map" : osm

          layerControl = L.control.layers baseLayers, null, { position: "bottomleft" }
          map.addControl layerControl

          map.on 'baselayerchange', (a) =>
              scope.baseLayer = a.name

          scope.show_map = true

    return {
      restrict: 'E',
      scope: {
        markers: '=sbMarkers'
        center: '=sbCenter'
        showTime: '=sbShowTime'
        hoverTemplate: '=sbHoverTemplate'
        baseLayer: '=sbBaseLayer'
      },
      link: link,
      templateUrl: 'template/sb_map.html'
    }
  ]
