var current_page = 0;
var num_result = 0;

function handlePaginationClick(new_page_index, pagination_container) {
	if(new_page_index != current_page){
		var items_per_page = parseInt($("#num_hits").val());
		
		var cqp 	= $("#cqp_string").val();
		var corpus 	= $("#corpus_id").val();
		
		var start 	= new_page_index*items_per_page;
		var end 		= (start + items_per_page);
				
		makeRequest(cqp, corpus, start, end);
		current_page = new_page_index;
	}
    
   return false;
}

function makeRequest(cqp, corpus, start, end){
	$('#results').html(language.loading);
	
	var selected_corpus = settings.corpora[getCorpus()];
	var attributes = ['msd','lemma'];

	var data = {
					command:'query',
					corpus:corpus,
					cqp:cqp,
					start:start,
					end:end,
					context:'1 sentence',
					show:[],
				};

	$.each(selected_corpus.attributes, function(key,val){
		data.show.push(key);
	})	

	$.ajax({ url: settings.cgi_script+'?callback=?', 
				dataType: "jsonp", 
				data:data,
				traditional:true,
				success: corpus_results});
	
	setJsonLink(data);
}

function setJsonLink(data){
	$.ajaxSetup({ traditional: true }); //fix the problem with show[]=...
	$('#json-link').attr('href', url);
	$('#json-link').css('display', 'inline');
}

function submitFormToServer(){
	num_result = 0;
	$('#results').html(language.loading);
	
	var cqp 	= $("#cqp_string").val();
	var corpus 	= $("#corpus_id").val();
	
	var start 	= 0;
	var end 	= $("#num_hits").val()-1;
		
	makeRequest(cqp, corpus, start, end);
	
	$('#results-wraper').css('display', 'block');	
}

function buildPager(number_of_hits){
	var items_per_page = $("#num_hits").val();
	
	if(number_of_hits > items_per_page){
		$("#Pagination").pagination(number_of_hits, {
			items_per_page:items_per_page, 
			callback:handlePaginationClick,
			next_text: language.next,
			prev_text: language.prev,
			link_to:"#",
			num_edge_entries:2,
			ellipse_text: '..'
		});
	}else{
		$("#Pagination").html('');
	}
}

function corpus_results(data){
	
	var corpus = settings.corpora[getCorpus()];
	
	//if this is the first result-set
	if(num_result == 0){
		buildPager(data.hits);
	}
	$('#num-result').html(data.hits);
	num_result = data.hits;
	
	var output = '<table class="result_table"><tbody>';
	
	$.each(data.kwic, function(i,item){
		output += '<tr>';
		if(corpus.attributes.sentence != null)
			output += '<td class="sentence"><a href="#"><img src="img/sentence.png" /></a></td>';
		
		/*Left */
		output += '<td class="left">';
		
		var from = 0;
		if(item.match.start > 12)
			from = item.match.start-12;
		for (var i = from; i < item.match.start; i++) { 
			output +='<span class="token">';
			output +='<span class="word">'+item.tokens[i].word+'</span> ';
			
			$.each(corpus.attributes, function(key,val){
				if(item.tokens[i][key] != null){
					output +='<span class="attr '+key+'">'+item.tokens[i][key]+'</span> ';
				}
			})			
			output +='</span>';
		}
		output += '</td>';
		
		/*Match */
		output += '<td class="match">';
		for (var i = item.match.start; i < item.match.end; i++) { 
			output +='<span class="token">';
			output +='<span class="word">'+item.tokens[i].word+'</span> ';
			
			$.each(corpus.attributes, function(key,val){
				if(item.tokens[i][key] != null){
					output +='<span class="attr '+key+'">'+item.tokens[i][key]+'</span> ';
				}
			})			
			output +='</span>';
		}
		output += '</td>';
		
		/*Right */
		var len=item.tokens.length;

		var to = len;
		if((len-item.match.end) > 12)
			to = item.match.end+12;
		
		output += '<td class="right">';
		for (var i = item.match.end; i < to; i++) { 
			output +='<span class="token">';
			output +='<span class="word">'+item.tokens[i].word+'</span> ';
			
			$.each(corpus.attributes, function(key,val){
				if(item.tokens[i][key] != null){
					output +='<span class="attr '+key+'">'+item.tokens[i][key]+'</span> ';
				}
			})			
			output +='</span>';
		}
		output += '</td></tr>';
	});
	
	output += '</tbody></table>';
	$('#results').html(output);

	//show selected attributes
	$.each(corpus.attributes, function(key,val){
		if($('input[value='+key+']').is(':checked')){
			$('.'+key).css('display', 'inline');
		}
	})	
	
	$('.result_table tr:even').addClass('alt'); 
	
	$('.token').hover(
			function(){
				console.log('in '+$(this).html());
				$(this).addClass('token_hover'); 
			}, 
			function(){
				console.log('out '+$(this).html());
				$(this).removeClass('token_hover');
			}
	);
}

function tooltipIn(object){
	//<span class='token'><span class='word'><span></span></span>
	console.log('in'+$(object).html());
}

function tooltipOut(object){
	console.log('out');
}


function renderToken(token){
	var output = '<span class="token"><span class="attr word">'+token.word+'</span><span class="attr pos">'+token.word+'</span><span class="attr lemma">'+tokens.lemma+'</span></span> ';
	return output;
}

/*******************
 * Read args
 */
$(document).ready(function(){
	//var vars = $.getUrlVars();
	//alert(vars['word']);
	//$('.arg_value').value(vars['word']);

});

// Read a page's GET URL variables and return them as an associative array.
$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});

$.extend({URLEncode:function(c){var o='';var x=0;c=c.toString();var r=/(^[a-zA-Z0-9_.]*)/;
  while(x<c.length){var m=r.exec(c.substr(x));
    if(m!=null && m.length>1 && m[1]!=''){o+=m[1];x+=m[1].length;
    }else{if(c[x]==' ')o+='+';else{var d=c.charCodeAt(x);var h=d.toString(16);
    o+='%'+(h.length<2?'0':'')+h.toUpperCase();}x++;}}return o;},
URLDecode:function(s){var o=s;var binVal,t;var r=/(%[^%]{2})/;
  while((m=r.exec(o))!=null && m.length>1 && m[1]!=''){b=parseInt(m[1].substr(1),16);
  t=String.fromCharCode(b);o=o.replace(m[1],t);}return o;}
});

