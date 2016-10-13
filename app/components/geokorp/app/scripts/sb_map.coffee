'use strict'
c = console

angular.module 'sbMap', [
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
  .directive  'sbMap', ['$compile', '$timeout', '$rootScope', ($compile, $timeout, $rootScope) ->
    link = (scope, element, attrs) ->
      scope.showMap = false
      
      scope.hoverTemplate = """<div class="hover-info">
                                <div class="swatch" style="background-color: {{color}}"></div><div style="display: inline; font-weight: bold; font-size: 15px">{{label}}</div>
                                <div><span>{{ 'map_name' | loc }}: </span> <span>{{point.name}}</span></div>
                                <div><span>{{ 'map_abs_occurrences' | loc }}: </span> <span>{{point.abs}}</span></div>
                                <div><span>{{ 'map_rel_occurrences' | loc }}: </span> <span>{{point.rel | number:2}}</span></div>
                             </div>"""
      
      map = angular.element (element.find ".map-container")
      scope.map = L.map(map[0], {minZoom: 1, maxZoom: 16}).setView [51.505, -0.09], 13
      scope.selectedMarkers = []

      stamenWaterColor = L.tileLayer.provider "Stamen.Watercolor"
      openStreetMap = L.tileLayer.provider "OpenStreetMap"

      createMarkerIcon = (color) -> 
        return L.divIcon { html: '<div class="geokorp-marker" style="background-color:' + color + '"></div>', iconSize: new L.Point(10,10) }

      shadeColor = (color, percent) ->
          f = parseInt(color.slice(1),16)
          t = if percent < 0 then 0 else 255 
          p = if percent < 0 then percent*-1 else percent 
          R = f>>16
          G = f>>8&0x00FF
          B = f&0x0000FF
          return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1)

      createClusterIcon = (cluster) ->
          elements = {}
          for child in cluster.getAllChildMarkers()
              color = child.markerData.color
              if not elements[color]
                  elements[color] = []
              elements[color].push '<div class="geokorp-marker" style="display: table-cell;background-color:' + color + '"></div>'

          res = []
          for elements in _.values elements
              res.push '<div style="display: table-row">' + elements.join(" ") + '</div>'
          return L.divIcon { html: '<div style="display: table">' + res.join(" ") + '</div>', iconSize: new L.Point(50, 50) }

          # TODO maybe use this
    #   canZoomToBounds = (cluster) {
    #       childClusters = cluster._childClusters.slice()
    #       map = cluster._group._map
    #       boundsZoom = map.getBoundsZoom(cluster._bounds)
    #       zoom = cluster._zoom + 1
    #       mapZoom = map.getZoom()
      # 
    #       #calculate how far we need to zoom down to see all of the markers
    #       while (childClusters.length > 0 && boundsZoom > zoom) {
    #           zoom++;
    #           newClusters = []; 
    #           for (i = 0; i < childClusters.length; i++)
    #              newClusters = newClusters.concat(childClusters[i]._childClusters)
    #        
    #           childClusters = newClusters;
    #       }
      # 
    #       if boundsZoom > zoom
    #           cluster._group._map.setView(cluster._latlng, zoom)
    #       else if (boundsZoom <= mapZoom) #If fitBounds wouldn't zoom us down, zoom us down instead
    #           cluster._group._map.setView(cluster._latlng, mapZoom + 1)
    #       else
    #           cluster._group._map.fitBounds(cluster._bounds)



      createMarkerCluster = () ->
          markerCluster = L.markerClusterGroup
              spiderfyOnMaxZoom: false
              showCoverageOnHover: false
              maxClusterRadius: 40
              zoomToBoundsOnClick: false
              iconCreateFunction: createClusterIcon

          markerCluster.on 'clustermouseover', (e) ->
              mouseOver _.map e.layer.getAllChildMarkers(), (layer) -> layer.markerData

          markerCluster.on 'clustermouseout', (e) ->
              if scope.selectedMarkers.length > 0
                  mouseOver scope.selectedMarkers
              else
                  mouseOut()

          markerCluster.on 'clusterclick', (e) ->
              scope.selectedMarkers = _.map e.layer.getAllChildMarkers(), (layer) -> layer.markerData
              mouseOver scope.selectedMarkers
              e.layer.zoomToBounds()

          markerCluster.on 'click', (e) ->
              scope.selectedMarkers = [e.layer.markerData]
              mouseOver scope.selectedMarkers

          markerCluster.on 'mouseover', (e) ->
              mouseOver [e.layer.markerData]

          markerCluster.on 'mouseout', (e) ->
              if scope.selectedMarkers.length > 0
                  mouseOver scope.selectedMarkers
              else
                  mouseOut()
              
          return markerCluster

      mouseOver = (markerData) ->
          $timeout (() ->
              scope.$apply () ->
                  content = []
                  sortedMarkerData = markerData.sort (markerData1, markerData2) ->
                      return markerData2.point.rel - markerData1.point.rel
                  for marker in markerData
                        msgScope =  $rootScope.$new true
                        msgScope.point = marker.point
                        msgScope.label = marker.label
                        msgScope.color = marker.color
                        compiled = $compile scope.hoverTemplate
                        markerDiv = compiled msgScope
                        do(marker) ->
                            markerDiv.bind 'click', () ->
                                scope.markerCallback marker
                        content.push markerDiv
                  hoverInfoElem  = angular.element (element.find ".hover-info-container")
                  hoverInfoElem.empty()
                  hoverInfoElem.append content
                  hoverInfoElem[0].scrollTop = 0
                  hoverInfoElem.css('opacity', '1')), 0

      mouseOut = () ->
          hoverInfoElem  = angular.element (element.find ".hover-info-container")
          hoverInfoElem.css('opacity','0')

      scope.markerCluster = createMarkerCluster()
      scope.map.addLayer scope.markerCluster

      scope.map.on 'click', (e) ->
          scope.selectedMarkers = []
          mouseOut()

      scope.$watchCollection("selectedGroups", (selectedGroups) ->
          markers = scope.markers
          
          scope.markerCluster.eachLayer (layer) ->
              scope.markerCluster.removeLayer layer

          for markerGroupId in selectedGroups
              markerGroup = markers[markerGroupId]
              color = markerGroup.color

              for marker_id in _.keys markerGroup.markers
                  markerData = markerGroup.markers[marker_id]
                  markerData.color = color
                  marker = L.marker [markerData.lat, markerData.lng], {icon: createMarkerIcon color}
                  marker.markerData = markerData
                  scope.markerCluster.addLayer marker
      )

      if scope.baseLayer == "Stamen Watercolor"
          stamenWaterColor.addTo scope.map
      else
          openStreetMap.addTo scope.map

      baseLayers = 
          "Stamen Watercolor": stamenWaterColor
          "OpenStreetMap": openStreetMap

      L.control.layers(baseLayers, null, {position: "bottomleft"}).addTo scope.map

      scope.map.setView [scope.center.lat, scope.center.lng], scope.center.zoom

      scope.showMap = true

    return {
      restrict: 'E',
      scope: {
        markers: '=sbMarkers'
        center: '=sbCenter'
        baseLayer: '=sbBaseLayer'
        markerCallback: '=sbMarkerCallback'
        selectedGroups: '=sbSelectedGroups'
      },
      link: link,
      templateUrl: 'template/sb_map.html'
    }
  ]
