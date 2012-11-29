/* zero.js - simple JS lib, for browser shizzle */
(function(z, global){
  //how to expose?
  if(typeof define === 'function' && define.amd !== void(0)){
    //AMD style
    define(z);
  }else if(typeof module !== 'undefined' && module.exports){
    //CommonJS style
    module.exports = z();
  }else{
    //via Global Variable $ is traditional, but add a noConflict!
    var $ = global.$, Zero = z();
    global.$ = Zero;
    Zero.noConflict = function(){
      global.$ = $;
      return Zero;
    };
  }
})(function(){
  var VERSION = "0.0.1",
    reType = /^\[object ([^\]]+)\]$/,
    undef,
    noop = function(){},
    slice = function(o){ return Array.prototype.slice.call(o); },
    hasProp = function(o,p){ return Object.prototype.hasOwnProperty.call(o, p); };
  function Zero(s,c){
    var type;
    //passthru in double case
    if(s instanceof Zero){ return s; }
    //in case we called this without 'new' (most common case!)
    if(!(this instanceof Zero)){ return new Zero(s,c); }
    //now do different things based on what was passed (see jQuery source! blatantly used their tests)
    if(!s){ return this; }
    //DOM Element
    if(s.nodeType){ this.nodes = [s]; return; }
    //NodeList?
    type = this.type(s);
    if(type === 'NodeList'){
      this.nodes = slice(s);
    }
    //string type
    else if(type === 'String'){
      if(s[0] === '<'){ //assume a DOM string!
        this.nodes = slice(createDOM(s));
      }else{ //selector
        this.nodes = slice((c||document).querySelectorAll(s));
      }
    }else{
      //not nodelist, DOMElement, or string. FAIL!
      throw new TypeError("Zero can't work with type: "+type);
    }
    arrayAccess(this);
  }
  var arrayAccess = function(z){
    z.each(function(i){ z[i] = this; });
  };
  Zp = Zero.prototype = Zero.fn = { "nodes": [] };
  Object.defineProperty(Zp, "VERSION", { value: VERSION });
  Object.defineProperty(Zp, "constructor", {value: Zero});
  Object.defineProperty(Zp, "length", { get: function(){ return this.nodes.length; } });
  //subset of results.
  Zp.find = function(sel){
    var z = Zero(); //out holder for results.
    this.each(function(){ z.nodes.push(this); });
    arrayAccess(z);
    return z;
  };
  /* the iterator - break on false */
  Zp.each = function(fn){
    for(var i = 0; i < this.nodes.length; i++){
      if(fn.call(this.nodes[i], i) === false){ break; }
    }
    return this;
  };
  //get a node by index
  Zp.get = function(index){
    if(index === undef){ index = 0; }
    if(this.nodes[index]){ return this.nodes[index]; }
    //throw range error?
    return undef;
  };
  //get the type of a variable.
  Zp.type = Zero.type = function(o){ return Object.prototype.toString.call(o).replace(reType, '$1'); };
  //extend an object
  Zp.extend = Zero.extend = function(){
    var args = slice(Arguments), base = args.shift(), next, i;
    while( (next = args.shift()) !== undef ){
      for(i in next){
        if(hasProp(next,i)){ base[i] = next[i]; }
      }
    }
    return base;
  };
  /* DOM helpers */
  function createFragment(z){
    var frag = document.createDocumentFragment();
    Zero(z).each(function(){ frag.appendChild(this); });
    return frag;
  }
  function createDOM(s){
    var f = document.createElement('div');
    f.insertAdjacentHTML('beforeend', s);
    return f.childNodes;
  }
  //append another object to this.
  Zp.append = function(z){
    var frag = createFragment(z);
    return this.each(function(){
      this.appendChild(frag);
    });
  };
  //append to another object
  Zp.appendTo = function(z){
    Zero(z).append(this);
    return this;
  };
  //Prepend another object to this.
  Zp.prepend = function(z){
    var frag = createFragment(z);
    return this.each(function(){
      this.insertBefore(frag, this.firstChild);
    });
  };
  //prepend to another Zero object
  Zp.prependTo = function(z){
    Zero(z).prepend(this);
    return this;
  };
  //Set innerHTML
  Zp.html = function(s){
    if(s === undef){
      return this.get().innerHTML; //get first element HTML
    }
    return this.each(function(){ this.innerHTML = s; }); //set
  };
  //Set textNode context
  Zp.text = function(s){
    if(s === undef){
      return this.get().textContent; //get first element Text
    }
    return this.each(function(){ this.textContent = s; }); //set
  };
  //Attribute manipulation
  Zp.attr = function(key, val){
    if(val === undef){
      //get value from first only
      return this.get(0).getAttribute(key);
    }else if(val === null){
      //remove attr
      return this.each(function(){ this.removeAttribute(key); });
    }else{
      //set attribute
      return this.each(function(){ this.setAttribute(key, val); });
    }
  };
  //Data Attributes...
  Zp.data = function(key, val){
    if(val === undef){
      //get value from first only
      return this.get(0).dataset[key];
    }else if(val === null){
      //remove attr
      return this.each(function(){ delete this.dataset[key]; });
    }else{
      //set attribute
      return this.each(function(){ this.dataset[key] = val; });
    }
  };
  //Class manipluation
  var reWS = /\s+/;
  Zp.addClass = function(c){
    return this.each(function(){ var el = this; c.split(reWS).forEach(function(x){ el.classList.add(x); }); });
  };
  Zp.removeClass = function(c){
    return this.each(function(){ var el = this; c.split(reWS).forEach(function(x){ el.classList.remove(x); }); });
  };
  Zp.toggleClass = function(c){
    return this.each(function(){ var el = this; c.split(reWS).forEach(function(x){ el.classList.toggle(x); }); });
  };
  Zp.hasClass = function(c){
    return this.get(0).classList.contains(c); //just check the first one...
  };
  //CSS manipulation
  Zp.css = function(obj){
    //apply objects prop => val as CSS to all nodes.
    //2 arguments should be prop,val
    if(arguments.length === 2){
      var tmp = obj; obj = {};
      obj[tmp] = arguments[1];
    }
    return this.each(function(){
      for(var i in obj){
        if(hasProp(obj,i)){
          this.style[i] = obj[i];
        }
      }
    });
  };
  //Event binding/delegation
  //Unfortunately we need to keep a reference to the bound functions, so that we can unbind ALL
  //at once. And we want to use a WeakMap for that but our browser probably doesn't support that, so we'll have to shim it...
  if(typeof(WeakMap) === 'undefined'){
    //a really crappy weakmap standin...
    var ShimWeakMap = function(){}
    ShimWeakMap.prototype = {
      keys: [], values: [],
      set: function(key, value){ var i = this.keys.indexOf(key); if(!!~i){ this.values[i] = value; }else{ this.keys.push(key); this.values.push(value); } },
      get: function(key){ var i = this.keys.indexOf(key); return !!~i ? this.values[i] : undef; },
      has: function(key){ return !!~this.keys.indexOf(key); },
     'delete': function(key){ var i = this.keys.indexOf(key); if(!!~i){ this.keys.splice(i,1); this.values.splice(i,1); } }
    };
    console.log('Had to shim the WeakMap! Not ideal!');
    window.WeakMap = ShimWeakMap;
  }
  //this will hold our events.
  var Events = new WeakMap();
  //We put a wrapper around this, so the object is always in the WeakMap.
  var GetEvents = function(elem){
    if(Events.has(elem)){
      return Events.get(elem);
    }else{
      var o = { bub: {}, cap: {}, del: { bub: {}, cap: {} } };
      Events.set(elem, o);
      return o;
    }
  };
  //actually bind
  function bind(element, eventName, fn, capture, isDelegate, delegateSelector){
    capture = undef !== capture ? capture : false;
    element.addEventListener(eventName, fn, capture);
    var evts=GetEvents(element), bc=capture?'cap':'bub', name=isDelegate?eventName+delegateSelector:eventName;
    if(isDelegate){ evts = evts.del; }
    evts = evts[bc][name] = evts[bc][name] || [];
    evts.push(isDelegate ? fn._0o : fn);
  }
  //really unbind
  function unbind(element, eventName, fn, capture, isDelegate, delegateSelector){
    var evts=GetEvents(element), bc=capture?'cap':'bub', name=isDelegate?eventName+delegateSelector:eventName;
    if(isDelegate){ evts = evts.del; }
    evts = evts[bc][name] || [];
    if(evts.length === 0){ return; }
    if(typeof fn !== 'function'){ //remove all!
      evts.forEach(function(f){ element.removeEventListener(eventName, isDelegate ? f._0d : f, capture); });
      evts.length = 0; //truncate.
    }else{ //single function.
      element.removeEventListener(eventName, isDelegate ? fn._0d : fn, capture);
      evts.splice(evts.indexOf(fn),1); //remove from our list.
    }
  }
  //bind a set of events.
  Zp.bind = function(eventName, fn, capture){
    return this.each(function(){ bind(this, eventName, fn, capture, false); });
  };
  Zp.unbind = function(eventName, fn, capture){
    return this.each(function(){ unbind(this, eventName, fn, capture, false); });
  };
  var matches = (function(d){
    var mfn = d.matches||d.matchesSelector||d.mozMatchesSelector||d.webkitMatchesSelector||d.oMatchesSelector||d.msMatchesSelector;
    return function(el, selector){
      return mfn.call(el, selector);
    };
  })(document.documentElement);
  Zp.delegate = function(eventName, selector, fn, capture){
    //simply wrap the fn and bind.
    fn._0d = function(ev){ if(matches(ev.target, selector)){ fn.call(ev.target, ev); } };
    //add some pointers each way, so we can store the original to match against, and the dele to bind/unbind with
    fn._0d._0o = fn;
    return this.each(function(){ bind(this, eventName, fn._0d, capture, true, selector); });
  };
  Zp.undelegate = function(eventName, selector, fn, capture){
    return this.each(function(){ unbind(this, eventName, fn, capture, true, selector); });
  };
  //Ajax! (not a prototype method!)
  Zero.ajax = function(url, method, async, user, password){
    var xhr = new XMLHttpRequest();
    xhr.open(method === undef ? 'GET' : method, url, async === undef ? true : async, user, password);
    //return a wrapped XHR object that we can do stuff to and chain.
    var success = [], error = [], load = function(e, cb, eb){
      if(Math.floor(xhr.status/100) === 2){
        if(typeof cb === 'function'){
          fn.call(xhr, xhr.response);
        }else{
          success.forEach(function(f){ f.call(xhr, xhr.response); });
        }
      }else{
        if(typeof eb === 'function'){
          eb.call(xhr);
        }else{
          error.forEach(function(f){ f.call(xhr); });
        }
      }
    };
    xhr.addEventListener('load', load);
    var wrapper = {
      xhr:     function(fn){ fn.call(xhr); return wrapper; },
      success: function(fn){ if(xhr.readyState < 4){ success.push(fn); }else{ load(null, fn, noop); } return wrapper; },
      error:   function(fn){ if(xhr.readyState < 4){ error.push(fn); }else{ load(null, noop, fn); } return wrapper; },
      json:    function(){ xhr.responseType = "json"; return wrapper; },
      send:    function(data){ xhr.send(data); return wrapper; },
      abort:   function(){ xhr.abort(); return wrapper;}
    };
    return wrapper;
  };
  //export
  return Zero;
}, this);