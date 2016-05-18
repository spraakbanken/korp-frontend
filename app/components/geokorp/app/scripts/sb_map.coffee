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

      scope.showMap = false

      angular.extend(scope, {
          layers: {
              baselayers: {
              },
              overlays: {
                  clusterlayer: {
                      name: "Real world data",
                      type: "markercluster",
                      visible: true,
                      layerParams: {
                          showOnSelector: false,
                          spiderfyOnMaxZoom: false,
                          showCoverageOnHover: false,
                          # zoomToBoundsOnClick: false,
                          maxClusterRadius: 40,
                          # iconCreateFunction: (cluster) -> return L.divIcon({ html: '<b>' + cluster.getChildCount() + '</b>' })
                      }
                  }
              }
          },
          defaults: {
              controls: {
                  layers: {
                      visible: true,
                      position: 'bottomleft',
                      collapsed: true,
                  }
              }
          }
      })

      osmLayer = {
                    name: 'OpenStreetMap',
                    type: 'xyz',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                }
      
      stamenLayer = {
                      name: 'Stamen Watercolor',
                      type: 'xyz',
                      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png',
                      layerOptions: {
                          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
                      }
                   }
      
      if scope.baseLayer == "Stamen Watercolor"
          scope.layers.baselayers.watercolor  = stamenLayer
          scope.layers.baselayers.osm  = osmLayer
      else
          scope.layers.baselayers.osm  = osmLayer
          scope.layers.baselayers.watercolor  = stamenLayer

      scope.showMap = true

    return {
      restrict: 'E',
      scope: {
        markers: '=sbMarkers'
        center: '=sbCenter'
        hoverTemplate: '=sbHoverTemplate'
        baseLayer: '=sbBaseLayer'
      },
      link: link,
      templateUrl: 'template/sb_map.html'
    }
  ]
