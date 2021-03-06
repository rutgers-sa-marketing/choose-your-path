/**
 * Simple decision tree parser and traversal.
 * @author njmcode
 * @param data - object {
 *     initial: [], (list of choice IDs for the root node)
 *     choices: {}  (keyed object of all possible choices)
 * }
**/
var DecisionTree = function(data) {
  
  this.initial = data.initial;
  this.choices = data.choices;
  
  /* Return an array of choice objects for the root of the tree */
  this.getInitial = function() {
    
    if (!this.initial) throw 'DecisionTree: no initial choice(s) specified';
    return this.getChoices(this.initial);
    
  };
  
  /* Get full choice data by specific id */
  this.getChoice = function(id) {

    if (!(id in this.choices)) return false;
    if (!('id' in this.choices[id])) this.choices[id].id = id;
    return this.choices[id];
    
  };
  
  /* As above, but passing an array of choice IDs */
  this.getChoices = function(idList) {
    if(!idList) return [];
    var list = [];
    for(var i = 0, ln = idList.length; i < ln; i++) {
      var childChoice = this.getChoice(idList[i]);
      list.push(childChoice);
    }
    return list;
    
  };
  
  /* Get an array of choice data for a parent id */
  this.getChildren = function(parentId) {
    
    if (!(parentId in this.choices)) return false;
    if (!('children' in this.choices[parentId])) return false;
    
    var childIds = this.choices[parentId].children;
    return this.getChoices(childIds);
    
  };
  
  /* Get an array of choice data for the parent(s) of an id */
  this.getParents = function(id) {
    
    var parents = [];
    var node = this.getChoice(id);
    
    while(node.parent) {
      node = this.getChoice(node.parent);
      parents.unshift(node);
    }
    
    return parents;
    
  };
  
  /* Get just an array of ids for the parents of a specific id */
  this.getParentIds = function(id) {
    var parents = this.getParents(id);
    var parentIds = [];
    for(var i = 0, ln = parents.length; i < ln; i++) {
      parentIds.push(parents[i].id);
    }
    return parentIds;
  };
  
  /* Get the 'name' prop for the parent of an id */
  this.getParentName = function(id) {
    var parent = this.getParents(id).pop();
    if(!parent) {
      return false;
    } else {
      return parent.name;
    }
  };
  
  /* Init - insert ids into choice objects, check dups, associate parents, etc */
  this.init = function() {
    
    var idList = [];
    for(var k in this.choices) {
      if(idList.indexOf(k) !== -1) throw 'DecisionTree: duplicate ID "' + k + '" in choice set';
      
      var choice = this.getChoice(k);
      choice.id = k;
      
      var children = this.getChildren(k);
      for(var i = 0; i < children.length; i++) {
        
        var child = children[i];
        if(child.parent) throw 'DecisionTree: tried to assign parent "' + k + '" to child "' + choice.children[i] + '" which already has parent "' + child.parent + '"';
        child.parent = k;
       
      }
      
    }
    
    console.log('init', this.initial, this.choices);
    
  };
  
  this.init();
  
};


/*** TEST DATA ***/

var data = {
  initial: ['stay-in', 'go-out'],
  choices: {
    
    // TOP LEVEL
    
    'stay-in': {
      name: 'Stay In',
      children: ['watch-movie', 'watch-tv', 'cook']
    },
    
    'go-out': {
      name: 'Go Out',
      children: ['cinema', 'drink', 'restaurant']
    },
    
    // STAY IN
    
    'watch-movie': {
      name: 'Watch a movie',
      children: ['romantic', 'scary', 'action', 'comedy']
    },
    'watch-tv': {
      name: 'Watch a TV show',
      children: ['drama', 'sport', 'comedy-tv']
    },
    'cook': {
      name: 'Cook a meal',
      children: ['spicy', 'traditional']
    },
    
    // GO OUT
    
    'cinema': {
      name: 'Go to the cinema',
      children: ['romantic-cine', 'scary-cine']
    },
    'drink': {
      name: 'Have a drink',
      children: ['beer', 'whiskey']
    },
    'restaurant': {
      name: 'Visit a restaurant',
      children: ['italian', 'bbq']
    },
    
    // WATCH MOVIE
    
    'romantic': {
      name: 'Holding hands'
    },
    'scary': {
      name: 'Terrified'
    },
    'action': {
      name: 'On the edge of our seats'
    },
    'comedy': {
      name: 'Spit out our popcorn'
    },
    
    // WATCH TV 
    
    'drama': {
      name: 'Nail-biting suspense'
    },
    'sport': {
      name: 'Cheer for the winner'
    },
    'comedy-tv': {
      name: 'Cry with laughter'
    },
    
    // COOK
    'spicy': {
      name: 'Hot and spicy'
    },
    'traditional': {
      name: 'Like Mum used to make'
    },
    
    // CINEMA
    'romantic-cine': {
      name: 'Make out at the back'
    },
    'scary-cine': {
      name: 'Covering our faces'
    },
    
    // DRINK
    'beer': {
      name: 'Pisswasser'
    },
    'whiskey': {
      name: 'Black Bush'
    },
    
    // RESTAURANT
    'italian': {
      name: 'Spag bol'
    },
    'bbq': {
      name: 'Meat in a bap'
    }
    
  }
};

/** TEST CODE **/

$(function() {
  
  var tree = new DecisionTree(data);
  var $list = $('#choices');
  var $title = $('h1');
  
  var current_id = null;
  
  var renderList = function(items) {
    
    var title = tree.getParentName(items[0].id);
    if(title) {
      $title.text(title);
    } else {
      $title.text('Do what?');
    }
    
    $list.empty();
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      $list.append('<li><a href="#" data-choice="' + item.id + '">' + item.name + '</a></li>');
    }
  };
  
  var _doInitial = function() {
      var initData = tree.getInitial();
      current_id = null;
      renderList(initData);
  };
  
  $(document).on('click', '#choices a', function(e) {
    e.preventDefault();
    var choiceId = $(this).data('choice');
    console.log('clicked', choiceId);
    
    var kids = tree.getChildren(choiceId);
    if(kids) {
      current_id = choiceId;
      renderList(kids);
    }
  });
  
  $('#back').on('click', function(e) {
    e.preventDefault();
    if(!current_id) return false;
    console.log('back button clicked', current_id);
    
    var parents = tree.getParents(current_id);
   
    if(parents.length > 0) {
      var prev_node = parents.pop();
      current_id = prev_node.id;
      renderList(tree.getChildren(prev_node.id));
    } else {
      _doInitial();
    }
    
  });
  
  $('#go').on('click', function(e) {
    e.preventDefault();
    
    var cid = $('#show-id').val();
    if(!cid || !(cid in data,choices)) return false;
    console.log('show parents for', cid);
    
    var parentData = tree.getParents(cid);
    $('#results').val(JSON.stringify(parentData, null, 4));
    
  });

  _doInitial();

  
});

