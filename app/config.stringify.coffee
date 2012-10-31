
class DefaultStringifier
  constructor : ->
    @type = "deprel" 
    
    
  sidebar : (data) ->
    "sidebar" + JSON.stringify(data)
    
  stats : (data) ->
    "stats" + JSON.stringify(data)
    

class DeprelStringifier
  constructor : ->
    @type = "deprel" 
    
    
  sidebar : (data) ->
    "sidebar" + JSON.stringify(data) 


class StringifyRegistry
  constructor : (@defaultFactory) ->
    @mapping = {}
  
  register : (stringifier) ->
    @mapping[stringifier.name] = stringifier
    return this
  
  retrieve : (type) ->
     return @mapping[type] or @defaultFactory()
  

window.settings.stringifyRegistry = new StringifyRegistry(DefaultStringifier)

window.settings.stringifyRegistry.register(DeprelStringifier)

