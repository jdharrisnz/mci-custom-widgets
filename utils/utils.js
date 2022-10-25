(function() {
	// Load dependencies
		// d3-selection
		// Modified to name result "d3s"
		// https://d3js.org/d3-selection/ v3.0.0 Copyright 2010-2021 Mike Bostock
		!function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define(["exports"],n):n((t="undefined"!=typeof globalThis?globalThis:t||self).d3s=t.d3s||{})}(this,(function(t){"use strict";var n="http://www.w3.org/1999/xhtml",e={svg:"http://www.w3.org/2000/svg",xhtml:n,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function r(t){var n=t+="",r=n.indexOf(":");return r>=0&&"xmlns"!==(n=t.slice(0,r))&&(t=t.slice(r+1)),e.hasOwnProperty(n)?{space:e[n],local:t}:t}function i(t){return function(){var e=this.ownerDocument,r=this.namespaceURI;return r===n&&e.documentElement.namespaceURI===n?e.createElement(t):e.createElementNS(r,t)}}function o(t){return function(){return this.ownerDocument.createElementNS(t.space,t.local)}}function u(t){var n=r(t);return(n.local?o:i)(n)}function s(){}function c(t){return null==t?s:function(){return this.querySelector(t)}}function l(t){return null==t?[]:Array.isArray(t)?t:Array.from(t)}function a(){return[]}function f(t){return null==t?a:function(){return this.querySelectorAll(t)}}function h(t){return function(){return this.matches(t)}}function p(t){return function(n){return n.matches(t)}}var _=Array.prototype.find;function d(){return this.firstElementChild}var y=Array.prototype.filter;function m(){return Array.from(this.children)}function v(t){return new Array(t.length)}function g(t,n){this.ownerDocument=t.ownerDocument,this.namespaceURI=t.namespaceURI,this._next=null,this._parent=t,this.__data__=n}function w(t){return function(){return t}}function A(t,n,e,r,i,o){for(var u,s=0,c=n.length,l=o.length;s<l;++s)(u=n[s])?(u.__data__=o[s],r[s]=u):e[s]=new g(t,o[s]);for(;s<c;++s)(u=n[s])&&(i[s]=u)}function x(t,n,e,r,i,o,u){var s,c,l,a=new Map,f=n.length,h=o.length,p=new Array(f);for(s=0;s<f;++s)(c=n[s])&&(p[s]=l=u.call(c,c.__data__,s,n)+"",a.has(l)?i[s]=c:a.set(l,c));for(s=0;s<h;++s)l=u.call(t,o[s],s,o)+"",(c=a.get(l))?(r[s]=c,c.__data__=o[s],a.delete(l)):e[s]=new g(t,o[s]);for(s=0;s<f;++s)(c=n[s])&&a.get(p[s])===c&&(i[s]=c)}function b(t){return t.__data__}function S(t){return"object"==typeof t&&"length"in t?t:Array.from(t)}function E(t,n){return t<n?-1:t>n?1:t>=n?0:NaN}function N(t){return function(){this.removeAttribute(t)}}function C(t){return function(){this.removeAttributeNS(t.space,t.local)}}function L(t,n){return function(){this.setAttribute(t,n)}}function P(t,n){return function(){this.setAttributeNS(t.space,t.local,n)}}function T(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttribute(t):this.setAttribute(t,e)}}function B(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttributeNS(t.space,t.local):this.setAttributeNS(t.space,t.local,e)}}function M(t){return t.ownerDocument&&t.ownerDocument.defaultView||t.document&&t||t.defaultView}function q(t){return function(){this.style.removeProperty(t)}}function D(t,n,e){return function(){this.style.setProperty(t,n,e)}}function O(t,n,e){return function(){var r=n.apply(this,arguments);null==r?this.style.removeProperty(t):this.style.setProperty(t,r,e)}}function V(t,n){return t.style.getPropertyValue(n)||M(t).getComputedStyle(t,null).getPropertyValue(n)}function j(t){return function(){delete this[t]}}function R(t,n){return function(){this[t]=n}}function H(t,n){return function(){var e=n.apply(this,arguments);null==e?delete this[t]:this[t]=e}}function I(t){return t.trim().split(/^|\s+/)}function U(t){return t.classList||new X(t)}function X(t){this._node=t,this._names=I(t.getAttribute("class")||"")}function G(t,n){for(var e=U(t),r=-1,i=n.length;++r<i;)e.add(n[r])}function Y(t,n){for(var e=U(t),r=-1,i=n.length;++r<i;)e.remove(n[r])}function k(t){return function(){G(this,t)}}function z(t){return function(){Y(this,t)}}function F(t,n){return function(){(n.apply(this,arguments)?G:Y)(this,t)}}function J(){this.textContent=""}function K(t){return function(){this.textContent=t}}function Q(t){return function(){var n=t.apply(this,arguments);this.textContent=null==n?"":n}}function W(){this.innerHTML=""}function Z(t){return function(){this.innerHTML=t}}function $(t){return function(){var n=t.apply(this,arguments);this.innerHTML=null==n?"":n}}function tt(){this.nextSibling&&this.parentNode.appendChild(this)}function nt(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function et(){return null}function rt(){var t=this.parentNode;t&&t.removeChild(this)}function it(){var t=this.cloneNode(!1),n=this.parentNode;return n?n.insertBefore(t,this.nextSibling):t}function ot(){var t=this.cloneNode(!0),n=this.parentNode;return n?n.insertBefore(t,this.nextSibling):t}function ut(t){return t.trim().split(/^|\s+/).map((function(t){var n="",e=t.indexOf(".");return e>=0&&(n=t.slice(e+1),t=t.slice(0,e)),{type:t,name:n}}))}function st(t){return function(){var n=this.__on;if(n){for(var e,r=0,i=-1,o=n.length;r<o;++r)e=n[r],t.type&&e.type!==t.type||e.name!==t.name?n[++i]=e:this.removeEventListener(e.type,e.listener,e.options);++i?n.length=i:delete this.__on}}}function ct(t,n,e){return function(){var r,i=this.__on,o=function(t){return function(n){t.call(this,n,this.__data__)}}(n);if(i)for(var u=0,s=i.length;u<s;++u)if((r=i[u]).type===t.type&&r.name===t.name)return this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=e),void(r.value=n);this.addEventListener(t.type,o,e),r={type:t.type,name:t.name,value:n,listener:o,options:e},i?i.push(r):this.__on=[r]}}function lt(t,n,e){var r=M(t),i=r.CustomEvent;"function"==typeof i?i=new i(n,e):(i=r.document.createEvent("Event"),e?(i.initEvent(n,e.bubbles,e.cancelable),i.detail=e.detail):i.initEvent(n,!1,!1)),t.dispatchEvent(i)}function at(t,n){return function(){return lt(this,t,n)}}function ft(t,n){return function(){return lt(this,t,n.apply(this,arguments))}}g.prototype={constructor:g,appendChild:function(t){return this._parent.insertBefore(t,this._next)},insertBefore:function(t,n){return this._parent.insertBefore(t,n)},querySelector:function(t){return this._parent.querySelector(t)},querySelectorAll:function(t){return this._parent.querySelectorAll(t)}},X.prototype={add:function(t){this._names.indexOf(t)<0&&(this._names.push(t),this._node.setAttribute("class",this._names.join(" ")))},remove:function(t){var n=this._names.indexOf(t);n>=0&&(this._names.splice(n,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(t){return this._names.indexOf(t)>=0}};var ht=[null];function pt(t,n){this._groups=t,this._parents=n}function _t(){return new pt([[document.documentElement]],ht)}function dt(t){return"string"==typeof t?new pt([[document.querySelector(t)]],[document.documentElement]):new pt([[t]],ht)}pt.prototype=_t.prototype={constructor:pt,select:function(t){"function"!=typeof t&&(t=c(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,u,s=n[i],l=s.length,a=r[i]=new Array(l),f=0;f<l;++f)(o=s[f])&&(u=t.call(o,o.__data__,f,s))&&("__data__"in o&&(u.__data__=o.__data__),a[f]=u);return new pt(r,this._parents)},selectAll:function(t){t="function"==typeof t?function(t){return function(){return l(t.apply(this,arguments))}}(t):f(t);for(var n=this._groups,e=n.length,r=[],i=[],o=0;o<e;++o)for(var u,s=n[o],c=s.length,a=0;a<c;++a)(u=s[a])&&(r.push(t.call(u,u.__data__,a,s)),i.push(u));return new pt(r,i)},selectChild:function(t){return this.select(null==t?d:function(t){return function(){return _.call(this.children,t)}}("function"==typeof t?t:p(t)))},selectChildren:function(t){return this.selectAll(null==t?m:function(t){return function(){return y.call(this.children,t)}}("function"==typeof t?t:p(t)))},filter:function(t){"function"!=typeof t&&(t=h(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,u=n[i],s=u.length,c=r[i]=[],l=0;l<s;++l)(o=u[l])&&t.call(o,o.__data__,l,u)&&c.push(o);return new pt(r,this._parents)},data:function(t,n){if(!arguments.length)return Array.from(this,b);var e=n?x:A,r=this._parents,i=this._groups;"function"!=typeof t&&(t=w(t));for(var o=i.length,u=new Array(o),s=new Array(o),c=new Array(o),l=0;l<o;++l){var a=r[l],f=i[l],h=f.length,p=S(t.call(a,a&&a.__data__,l,r)),_=p.length,d=s[l]=new Array(_),y=u[l]=new Array(_),m=c[l]=new Array(h);e(a,f,d,y,m,p,n);for(var v,g,E=0,N=0;E<_;++E)if(v=d[E]){for(E>=N&&(N=E+1);!(g=y[N])&&++N<_;);v._next=g||null}}return(u=new pt(u,r))._enter=s,u._exit=c,u},enter:function(){return new pt(this._enter||this._groups.map(v),this._parents)},exit:function(){return new pt(this._exit||this._groups.map(v),this._parents)},join:function(t,n,e){var r=this.enter(),i=this,o=this.exit();return"function"==typeof t?(r=t(r))&&(r=r.selection()):r=r.append(t+""),null!=n&&(i=n(i))&&(i=i.selection()),null==e?o.remove():e(o),r&&i?r.merge(i).order():i},merge:function(t){for(var n=t.selection?t.selection():t,e=this._groups,r=n._groups,i=e.length,o=r.length,u=Math.min(i,o),s=new Array(i),c=0;c<u;++c)for(var l,a=e[c],f=r[c],h=a.length,p=s[c]=new Array(h),_=0;_<h;++_)(l=a[_]||f[_])&&(p[_]=l);for(;c<i;++c)s[c]=e[c];return new pt(s,this._parents)},selection:function(){return this},order:function(){for(var t=this._groups,n=-1,e=t.length;++n<e;)for(var r,i=t[n],o=i.length-1,u=i[o];--o>=0;)(r=i[o])&&(u&&4^r.compareDocumentPosition(u)&&u.parentNode.insertBefore(r,u),u=r);return this},sort:function(t){function n(n,e){return n&&e?t(n.__data__,e.__data__):!n-!e}t||(t=E);for(var e=this._groups,r=e.length,i=new Array(r),o=0;o<r;++o){for(var u,s=e[o],c=s.length,l=i[o]=new Array(c),a=0;a<c;++a)(u=s[a])&&(l[a]=u);l.sort(n)}return new pt(i,this._parents).order()},call:function(){var t=arguments[0];return arguments[0]=this,t.apply(null,arguments),this},nodes:function(){return Array.from(this)},node:function(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r=t[n],i=0,o=r.length;i<o;++i){var u=r[i];if(u)return u}return null},size:function(){let t=0;for(const n of this)++t;return t},empty:function(){return!this.node()},each:function(t){for(var n=this._groups,e=0,r=n.length;e<r;++e)for(var i,o=n[e],u=0,s=o.length;u<s;++u)(i=o[u])&&t.call(i,i.__data__,u,o);return this},attr:function(t,n){var e=r(t);if(arguments.length<2){var i=this.node();return e.local?i.getAttributeNS(e.space,e.local):i.getAttribute(e)}return this.each((null==n?e.local?C:N:"function"==typeof n?e.local?B:T:e.local?P:L)(e,n))},style:function(t,n,e){return arguments.length>1?this.each((null==n?q:"function"==typeof n?O:D)(t,n,null==e?"":e)):V(this.node(),t)},property:function(t,n){return arguments.length>1?this.each((null==n?j:"function"==typeof n?H:R)(t,n)):this.node()[t]},classed:function(t,n){var e=I(t+"");if(arguments.length<2){for(var r=U(this.node()),i=-1,o=e.length;++i<o;)if(!r.contains(e[i]))return!1;return!0}return this.each(("function"==typeof n?F:n?k:z)(e,n))},text:function(t){return arguments.length?this.each(null==t?J:("function"==typeof t?Q:K)(t)):this.node().textContent},html:function(t){return arguments.length?this.each(null==t?W:("function"==typeof t?$:Z)(t)):this.node().innerHTML},raise:function(){return this.each(tt)},lower:function(){return this.each(nt)},append:function(t){var n="function"==typeof t?t:u(t);return this.select((function(){return this.appendChild(n.apply(this,arguments))}))},insert:function(t,n){var e="function"==typeof t?t:u(t),r=null==n?et:"function"==typeof n?n:c(n);return this.select((function(){return this.insertBefore(e.apply(this,arguments),r.apply(this,arguments)||null)}))},remove:function(){return this.each(rt)},clone:function(t){return this.select(t?ot:it)},datum:function(t){return arguments.length?this.property("__data__",t):this.node().__data__},on:function(t,n,e){var r,i,o=ut(t+""),u=o.length;if(!(arguments.length<2)){for(s=n?ct:st,r=0;r<u;++r)this.each(s(o[r],n,e));return this}var s=this.node().__on;if(s)for(var c,l=0,a=s.length;l<a;++l)for(r=0,c=s[l];r<u;++r)if((i=o[r]).type===c.type&&i.name===c.name)return c.value},dispatch:function(t,n){return this.each(("function"==typeof n?ft:at)(t,n))},[Symbol.iterator]:function*(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r,i=t[n],o=0,u=i.length;o<u;++o)(r=i[o])&&(yield r)}};var yt=0;function mt(){return new vt}function vt(){this._="@"+(++yt).toString(36)}function gt(t){let n;for(;n=t.sourceEvent;)t=n;return t}function wt(t,n){if(t=gt(t),void 0===n&&(n=t.currentTarget),n){var e=n.ownerSVGElement||n;if(e.createSVGPoint){var r=e.createSVGPoint();return r.x=t.clientX,r.y=t.clientY,[(r=r.matrixTransform(n.getScreenCTM().inverse())).x,r.y]}if(n.getBoundingClientRect){var i=n.getBoundingClientRect();return[t.clientX-i.left-n.clientLeft,t.clientY-i.top-n.clientTop]}}return[t.pageX,t.pageY]}vt.prototype=mt.prototype={constructor:vt,get:function(t){for(var n=this._;!(n in t);)if(!(t=t.parentNode))return;return t[n]},set:function(t,n){return t[this._]=n},remove:function(t){return this._ in t&&delete t[this._]},toString:function(){return this._}},t.create=function(t){return dt(u(t).call(document.documentElement))},t.creator=u,t.local=mt,t.matcher=h,t.namespace=r,t.namespaces=e,t.pointer=wt,t.pointers=function(t,n){return t.target&&(t=gt(t),void 0===n&&(n=t.currentTarget),t=t.touches||[t]),Array.from(t,(t=>wt(t,n)))},t.select=dt,t.selectAll=function(t){return"string"==typeof t?new pt([document.querySelectorAll(t)],[document.documentElement]):new pt([l(t)],ht)},t.selection=_t,t.selector=c,t.selectorAll=f,t.style=V,t.window=M,Object.defineProperty(t,"__esModule",{value:!0})}));

		// d3-format
		// Modified to name result "d3f" and patch "f" formatter bug
		// https://d3js.org/d3-format/ v3.1.0 Copyright 2010-2021 Mike Bostock
		!function(t,i){"object"==typeof exports&&"undefined"!=typeof module?i(exports):"function"==typeof define&&define.amd?define(["exports"],i):i((t="undefined"!=typeof globalThis?globalThis:t||self).d3f=t.d3f||{})}(this,(function(t){"use strict";function i(t,i){if((r=(t=i?t.toExponential(i-1):t.toExponential()).indexOf("e"))<0)return null;var r,n=t.slice(0,r);return[n.length>1?n[0]+n.slice(2):n,+t.slice(r+1)]}function r(t){return(t=i(Math.abs(t)))?t[1]:NaN}var n,e=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function o(t){if(!(i=e.exec(t)))throw new Error("invalid format: "+t);var i;return new a({fill:i[1],align:i[2],sign:i[3],symbol:i[4],zero:i[5],width:i[6],comma:i[7],precision:i[8]&&i[8].slice(1),trim:i[9],type:i[10]})}function a(t){this.fill=void 0===t.fill?" ":t.fill+"",this.align=void 0===t.align?">":t.align+"",this.sign=void 0===t.sign?"-":t.sign+"",this.symbol=void 0===t.symbol?"":t.symbol+"",this.zero=!!t.zero,this.width=void 0===t.width?void 0:+t.width,this.comma=!!t.comma,this.precision=void 0===t.precision?void 0:+t.precision,this.trim=!!t.trim,this.type=void 0===t.type?"":t.type+""}function s(t,r){var n=i(t,r);if(!n)return t+"";var e=n[0],o=n[1];return o<0?"0."+new Array(-o).join("0")+e:e.length>o+1?e.slice(0,o+1)+"."+e.slice(o+1):e+new Array(o-e.length+2).join("0")}o.prototype=a.prototype,a.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(void 0===this.width?"":Math.max(1,0|this.width))+(this.comma?",":"")+(void 0===this.precision?"":"."+Math.max(0,0|this.precision))+(this.trim?"~":"")+this.type};var c={"%":(t,i)=>(100*t).toFixed(i),b:t=>Math.round(t).toString(2),c:t=>t+"",d:function(t){return Math.abs(t=Math.round(t))>=1e21?t.toLocaleString("en").replace(/,/g,""):t.toString(10)},e:(t,i)=>t.toExponential(i),f:(t,i)=>(Math.round(t*Number('1e'+i))/Number('1e'+i)).toFixed(i),g:(t,i)=>t.toPrecision(i),o:t=>Math.round(t).toString(8),p:(t,i)=>s(100*t,i),r:s,s:function(t,r){var e=i(t,r);if(!e)return t+"";var o=e[0],a=e[1],s=a-(n=3*Math.max(-8,Math.min(8,Math.floor(a/3))))+1,c=o.length;return s===c?o:s>c?o+new Array(s-c+1).join("0"):s>0?o.slice(0,s)+"."+o.slice(s):"0."+new Array(1-s).join("0")+i(t,Math.max(0,r+s-1))[0]},X:t=>Math.round(t).toString(16).toUpperCase(),x:t=>Math.round(t).toString(16)};function h(t){return t}var l,u=Array.prototype.map,f=["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];function d(t){var i,e,a=void 0===t.grouping||void 0===t.thousands?h:(i=u.call(t.grouping,Number),e=t.thousands+"",function(t,r){for(var n=t.length,o=[],a=0,s=i[0],c=0;n>0&&s>0&&(c+s+1>r&&(s=Math.max(1,r-c)),o.push(t.substring(n-=s,n+s)),!((c+=s+1)>r));)s=i[a=(a+1)%i.length];return o.reverse().join(e)}),s=void 0===t.currency?"":t.currency[0]+"",l=void 0===t.currency?"":t.currency[1]+"",d=void 0===t.decimal?".":t.decimal+"",m=void 0===t.numerals?h:function(t){return function(i){return i.replace(/[0-9]/g,(function(i){return t[+i]}))}}(u.call(t.numerals,String)),p=void 0===t.percent?"%":t.percent+"",g=void 0===t.minus?"−":t.minus+"",v=void 0===t.nan?"NaN":t.nan+"";function M(t){var i=(t=o(t)).fill,r=t.align,e=t.sign,h=t.symbol,u=t.zero,M=t.width,y=t.comma,x=t.precision,b=t.trim,w=t.type;"n"===w?(y=!0,w="g"):c[w]||(void 0===x&&(x=12),b=!0,w="g"),(u||"0"===i&&"="===r)&&(u=!0,i="0",r="=");var S="$"===h?s:"#"===h&&/[boxX]/.test(w)?"0"+w.toLowerCase():"",j="$"===h?l:/[%p]/.test(w)?p:"",k=c[w],P=/[defgprs%]/.test(w);function z(t){var o,s,c,h=S,l=j;if("c"===w)l=k(t)+l,t="";else{var p=(t=+t)<0||1/t<0;if(t=isNaN(t)?v:k(Math.abs(t),x),b&&(t=function(t){t:for(var i,r=t.length,n=1,e=-1;n<r;++n)switch(t[n]){case".":e=i=n;break;case"0":0===e&&(e=n),i=n;break;default:if(!+t[n])break t;e>0&&(e=0)}return e>0?t.slice(0,e)+t.slice(i+1):t}(t)),p&&0==+t&&"+"!==e&&(p=!1),h=(p?"("===e?e:g:"-"===e||"("===e?"":e)+h,l=("s"===w?f[8+n/3]:"")+l+(p&&"("===e?")":""),P)for(o=-1,s=t.length;++o<s;)if(48>(c=t.charCodeAt(o))||c>57){l=(46===c?d+t.slice(o+1):t.slice(o))+l,t=t.slice(0,o);break}}y&&!u&&(t=a(t,1/0));var z=h.length+t.length+l.length,A=z<M?new Array(M-z+1).join(i):"";switch(y&&u&&(t=a(A+t,A.length?M-l.length:1/0),A=""),r){case"<":t=h+t+l+A;break;case"=":t=h+A+t+l;break;case"^":t=A.slice(0,z=A.length>>1)+h+t+l+A.slice(z);break;default:t=A+h+t+l}return m(t)}return x=void 0===x?6:/[gprs]/.test(w)?Math.max(1,Math.min(21,x)):Math.max(0,Math.min(20,x)),z.toString=function(){return t+""},z}return{format:M,formatPrefix:function(t,i){var n=M(((t=o(t)).type="f",t)),e=3*Math.max(-8,Math.min(8,Math.floor(r(i)/3))),a=Math.pow(10,-e),s=f[8+e/3];return function(t){return n(a*t)+s}}}}function m(i){return l=d(i),t.format=l.format,t.formatPrefix=l.formatPrefix,l}t.format=void 0,t.formatPrefix=void 0,m({thousands:",",grouping:[3],currency:["$",""]}),t.FormatSpecifier=a,t.formatDefaultLocale=m,t.formatLocale=d,t.formatSpecifier=o,t.precisionFixed=function(t){return Math.max(0,-r(Math.abs(t)))},t.precisionPrefix=function(t,i){return Math.max(0,3*Math.max(-8,Math.min(8,Math.floor(r(i)/3)))-r(Math.abs(t)))},t.precisionRound=function(t,i){return t=Math.abs(t),i=Math.abs(i)-t,Math.max(0,r(i)-r(t))+1},Object.defineProperty(t,"__esModule",{value:!0})}));

	window.utils = {
		'getFieldDetails': function(systemName) {
			// Wrapper function for getting field details
			return new Promise(resolve => {
				DA.query.getFieldDetails({
					'systemName': systemName,
					cb: (err, data) => {
						resolve(data);
					}
				});
			});
		},
		'getFormattedValue': function(systemName, value) {
			// Wrapper function for getting formatted metric
			return new Promise(resolve => {
				DA.query.getFormattedValue({
					'systemName': systemName,
					'value': value,
					cb: (err, data) => {
						resolve(data);
					}
				});
			});
		},
		'metricFormatOptions': function(value) {
			// Generates metric format options for 'select'-type design options
			// Results (the ids) are to be used by d3.format as in the label code
			return [{ 'id': 0, 'label': 'System Default (Slow)' }].concat(
				[',.0f', ',.1f', ',.2f', ',.3s', '$,.0f', '$,.1f', '$,.2f', '$,.3s', ',.0%', ',.1%', ',.2%', ',.3%', ',.4%'].map(f => {
					return { 'id': f, 'label': d3f.format(f)(value) + ' (Static example: ' + d3f.format(f)(1234.56789) + ')' };
				})
			);
		},
		'setDesignOptions': function(options) {
			// Set design options (clearer wording, shorter than native)
			DA.widget.customDesignSettings.set(options);
		},
		'getDesignSettings': function() {
			// Wrapper function for getting design settings
			return new Promise(resolve => {
				DA.widget.customDesignSettings.get({ cb: (err, settings) => {
					resolve(settings);
				}});
			});
		},
		'getBotList': function() {
			// Wrapper function for getting the bot list
			return new Promise(resolve => {
				DA.api.EMI.getBotsSummary({ cb: (err, botList) => {
					resolve(botList);
				}});
			});
		},
		'getBotResults': function(botId) {
			// Wrapper function for getting a bot's results
			return new Promise(resolve => {
				DA.api.EMI.getInsightsByBotId({
					'botId': botId,
					cb: (err, botResults) => {
						resolve(botResults);
					}
				});
			});
		},
		'dayDiff': function(startDate, endDate) {
			// Function to get difference in days
			// Remove sub-day granularity
			startDate.setHours(0);
			endDate.setHours(0);
			// The large number turns milliseconds into days
			return Math.round((endDate - startDate) / (1000*60*60*24) + 1);
		},
		'hexToRgb': function(hex) {
			// Function to convert hex colour codes to RGB
			// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
			const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function(m, r, g, b) {
				return r + r + g + g + b + b;
			});

			const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			const result = [parseInt(rgb[1], 16), parseInt(rgb[2], 16), parseInt(rgb[3], 16)];

			if (hex.length == 9) {
				const rgba = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
				result.push(parseInt(rgb[4], 16) / 255);
			}

			return result;
		},
		'errorMessageTemplate': function() {
			const result = {};

			const appContent = d3s.select('#__da-app-content').html(null);
			const container = appContent.append('div')
				.style('color', 'rgba(0, 1, 2, 0.49)')
				.style('line-height', 'normal')
				.style('width', '100%')
				.style('height', '100%')
				.style('display', 'flex')
				.style('flex-direction', 'column')
				.style('justify-content', 'center')
				.style('align-items', 'center');

			result.title = container.append('div')
				.style('font-size', '16px')
				.style('font-weight', '600')
				.style('margin-bottom', '20px');

			result.svg = container.append('svg')
				.style('width', '56px')
				.style('height', '56px')
				.style('margin-bottom', '20px')
				.attr('viewBox', '-10 0 532 512')
				.attr('preserveAspectRatio', 'xMidYMid meet')
				.attr('fill', 'rgba(0, 1, 2, 0.2');
			result.svg.append('path')
				.attr('opacity', '0.4')
				.attr('d', 'M506 417l-213 -364q-14 -21 -37 -21t-37 21l-213 364q-12 22 0 42q11 20 37 21h426q26 -1 37 -21q12 -20 0 -42v0z');
			result.svg.append('path')
				.attr('d', 'M256 320q22 -2 24 -24v-128q-2 -22 -23 -24q-10 0 -17 7q-8 7 -8 17v128q2 22 24 24v0zM256 353q-13 0 -22 9v0q-9 9 -9 23q0 13 9 22t22 9t22 -9t9 -22q0 -14 -9 -23t-22 -9v0z');

			result.heading = container.append('div')
				.style('font-size', '14px')
				.style('margin-bottom', '3px');

			result.message = container.append('div')
				.style('font-size', '12px');

			return result;
		},
		'dataSet': class {
			#queryResult;

			constructor(options={}) {
				const self = this;

				return (async () => {
					self.#queryResult = DA.query.getQueryResult();


					if (self.#queryResult.rows.length > 0) {
						self.#queryResult.totals = self.#queryResult.totals[0].data[0].map(x => {
							return {
								'value': null,
								'formattedValue': x
							}
						});
					}
					const totalIndexAdj = self.#queryResult.fields.filter(x => x.type == 'dimension').length;
					
					if (options.constructor.name == 'Object' &&
						self.#queryResult.rows.length > 0) {
						for (const key of Object.keys(options)) {
							if (key == 'metricFormatDiscovery' &&
								options.metricFormatDiscovery === true) {
								// Identifies the used format piece by piece and sets 'format' function on the field
								// Identify the culture constants
								let decimal = null;
								let thousands = null;

								const systemDecimalMetrics = ['COMPETITIVE_TWEET_LIKES', 'DELIVERY_POSITIONS_WEIGHTED', 'CONVERSION_POST_IMPRESSION_TRANSACTIONS', 'COMPETITIVE_WEBSITE_TRAFFIC', 'DELIVERY_MEDIA_COST_MARGIN_ORIGINAL', 'CONVERSION_REVENUE_ORIGINAL', 'SOCIAL_SOCIAL_VIEWS_FREQUENCY', 'SEARCH_BUDGET_LOST_IMPRESSION_SHARE', 'DELIVERY_TOTAL_DISPLAY_TIME', 'WEB_ANALYTICS_POSITION', 'COMPETITIVE_FACEBOOK_POST_LIKES', 'DELIVERY_TOTAL_INTERACTION_TIME', 'COMPETITIVE_TOTAL_ENGAGEMENT', 'DELIVERY_BUY_DATA_IO_DAYS', 'ORDER_ITEM_TAX_ORIGINAL', 'COMPETITIVE_FACEBOOK_POST_COMMENTS', 'DELIVERY_FREQUENCY', 'ECOMMERCE_ORDER_SHIPPING_COST_ORIGINAL', 'COMPETITIVE_AVG_VISIT_DURATION_AVG', 'ORDER_ITEM_UNIT_COST_ORIGINAL', 'ECOMMERCE_ORDER_TOTAL_DISCOUNT_TAX_ORIGINAL', 'COMPETITIVE_BOUNCE_RATE', 'DELIVERY_POSITIONS', 'COMPETITIVE_TWEET_RETWEETS', 'TIME_IN_APP', 'ECOMMERCE_ORDER_TAX_ORIGINAL', 'PRODUCT_SALES_REVENUE_ORIGINAL', 'COMPETITIVE_AVG_VISIT_DURATION', 'COMPETITIVE_PAGES_PER_VISIT', 'WEB_SITE_TAGS_GOAL_VALUE_ORIGINAL', 'COMPETITIVE_REPLIES', 'COMPETITIVE_YOUTUBE_CHANNEL_LIKES', 'COMPETITIVE_WEBSITE_VISITS', 'COMPETITIVE_TWITTER_FOLLOWERS', 'SEARCH_RANK_LOST_IMPRESSION_SHARE', 'COMPETITIVE_SEARCH_RESULTS', 'COMPETITIVE_FACEBOOK_POSTS_COUNT', 'PRODUCT_UNIT_PRICE_ORIGINAL', 'ECOMMERCE_ORDER_TOTAL_DISCOUNT_ORIGINAL', 'COMPETITIVE_RETWEETS', 'DELIVERY_MEDIA_COST_ORIGINAL', 'PRODUCT_UNIT_COST_ORIGINAL', 'COMPETITIVE_YOUTUBE_VIDEO_VIEWS', 'COMPETITIVE_LIKES_LIFETIME', 'CONVERSION_POST_CLICK_TRANSACTIONS', 'SOCIAL_VIEW_DURATION', 'ORDER_ITEM_UNIT_PRICE_ORIGINAL', 'COMPETITIVE_LINKEDIN_FOLLOWERS', 'WEB_ANALYTICS_POSITION_WEIGHTED', 'SOCIAL_POST_CONSUMPTION_FREQUENCY', 'ECOMMERCE_ORDER_SUB_REVENUE_ORIGINAL', 'EMAIL_TOTAL_BOUNCES_DAILY', 'COMPETITIVE_WEBSITE_VISITS_SUM', 'BOOKED_COST_ORIGINAL', 'SEARCH_KEYWORD_RANK', 'COMPETITIVE_YOUTUBE_VIDEO_LIKES', 'COMPETITIVE_TWITTER_TWEETS_COUNT', 'ECOMMERCE_ORDER_SHIPPING_DISCOUNT_ORIGINAL', 'ECOMMERCE_ORDER_SHIPPING_TAX_ORIGINAL', 'COMPETITIVE_FACEBOOK_PAGE_LIKES', 'COMPETITIVE_YOUTUBE_CHANNEL_VIEWS', 'COMPETITIVE_TWEET_REPLIES', 'COMPETITIVE_FACEBOOK_NEW_PAGE_LIKES', 'CONVERSION_TOTAL_TRANSACTIONS', 'SEARCH_IMPRESSION_SHARE', 'DELIVERY_GRP', 'COMPETITIVE_PAGE_CUSTOM_RANK_2', 'COMPETITIVE_PAGE_CUSTOM_RANK_1', 'COMPETITIVE_PAGE_CUSTOM_RANK_3', 'WEB_SITE_TRANSACTION_VALUE', 'COMPETITIVE_FACEBOOK_POST_SHARES', 'COMPETITIVE_YOUTUBE_VIDEO_DISLIKES', 'ECOMMERCE_ORDER_TOTAL_REVENUE_ORIGINAL', 'ORDER_ITEM_REVENUE_ORIGINAL', 'COMPETITIVE_TWITTER_NEW_FOLLOWERS'];
								for (const metricName of systemDecimalMetrics) {
									const metricFormatted = await utils.getFormattedValue(metricName, 123456789.123456);
									const formatPunctuation = metricFormatted.match(/(?:\D)/g);
									if (formatPunctuation.length == 3) {
										decimal = formatPunctuation[2];
										thousands = formatPunctuation[0];
										break;
									}
								}

								// Identify the format string for each metric and set the formatter
									// Prefix helper function
									const prefixes = [1e3, 1e6, 1e9, 1e12];
									const autoPrefix = function(value) {
										const absValue = Math.abs(value);
										const myPrefixes = prefixes.slice().reverse().concat([0]);
										return myPrefixes.find(x => absValue >= x);
									}

									// Template for later
									let currency = ['', ''];
									let formatLocale = d3f.formatLocale({
										'decimal': decimal,
										'thousands': thousands,
										'grouping': [3],
										'percent': ' %', // MCI Percentage format uses a space
										'currency': currency // To be discovered later
									});

									// Formatter function, used for discovery
									const numberFormat = function(value, decimals, prefix, currency = '', locale=formatLocale) {
										if (value === '') { // MCI stores empty string for null
											return '--';
										}
										else if (value == 'NaN') { // MCI stores string 'NaN' for NaN
											return 'NaN';
										}

										// Prefix options: 'none', 'auto', value from auto prefix set
										// The d3 format string uses "$" to signify currency is in use
										currency = currency !== '' ? '$' : '';

										let myPrefix = '';
										switch(prefix) {
											case 'none':
												myPrefix = '0';
												break;
											case 'auto':
												myPrefix = autoPrefix(value);
												break;
											default:
												myPrefix = prefix;
												break;
										}

										let formattedValue = locale.formatPrefix(currency + ',.' + decimals, myPrefix)(value);
										formattedValue = formattedValue.replace(/(?<=\d)(k)/, 'K'); // Lowercase thousands to uppercase
										formattedValue = formattedValue.replace(/(?<=\d)(G)/, 'B'); // Giga to Billion
										
										return formattedValue;
									}

								for (const [fieldIndex, field] of self.#queryResult.fields.entries()) {
									if (field.type == 'metric' && !field.systemName.includes('_DIFF')) {
										// Get the largest absolute value for testing
										const metric = self.#queryResult.rows.reduce((a, b) => {
											return Math.abs(a[fieldIndex].value) > Math.abs(b[fieldIndex].value) ? a : b;
										})[fieldIndex];

										// Find the number of decimals for non-duration metrics
										const afterDecimal = metric.formattedValue.match(new RegExp('(?<=\\d\\' + decimal + ')(?:\\d*)'));
										const numOfDecimals = afterDecimal ? String(afterDecimal[0].length) : '0'; // Null means no decimal found, so zero

										if (metric.formattedValue.includes(':')) { // Format is Duration
											field.format = function(value) {
												let hours = Math.floor(value / 3600);
												let minutes = Math.floor((value - hours * 3600) / 60);
												let seconds = value - hours * 3600 - minutes * 60;

												hours = hours < 10 ? '0' + String(hours) : String(hours);
												minutes = minutes < 10 ? '0' + String(minutes) : String(minutes);
												seconds = seconds < 10 ? '0' + String(seconds) : String(seconds);

												return hours + ':' + minutes + ':' + seconds;
											};
										}
										else if (metric.formattedValue.includes('%')) { // Format is Percentage
											field.format = formatLocale.format(',.' + numOfDecimals + '%');
										}
										else { // Format is Number or Currency
											// Solve for friendly formatting
											let prefix = 'none';

											const formattingInUse = prefixes.some(prefix => {
												return metric.formattedValue.includes(
													numberFormat(metric.value, numOfDecimals, prefix)
												);
											});

											if (formattingInUse) {
												// 'Auto' friendly formatting is NOT in use if any row is formatted
												// with a prefix other than its auto prefix. Otherwise, assume auto.
												const incongruentFormat = self.#queryResult.rows.find(row => {
													if (Math.abs(row[fieldIndex].value) > 0) {
														return !row[fieldIndex].formattedValue.includes(
															numberFormat(row[fieldIndex].value, numOfDecimals, 'auto')
														);
													}
													else {
														return false;
													}
												});

												if (incongruentFormat) {
													prefix = prefixes.find(prefix => {
														return incongruentFormat[fieldIndex].formattedValue.includes(
															numberFormat(incongruentFormat[fieldIndex].value, numOfDecimals, prefix)
														);
													});
												}
												else {
													prefix = 'auto';
												}
											}

											// Update currency specifier
											// Returns an array of currency and blank, in the right order
											currency = metric.formattedValue.split(numberFormat(metric.value, numOfDecimals, prefix));
											
											// Set the final format locale
											formatLocale = d3f.formatLocale({
												'decimal': decimal,
												'thousands': thousands,
												'grouping': [3],
												'percent': ' %',
												'currency': currency
											});

											// Function for crystalising variables that might be different next iteration
											const saveFormat = function(d, p, c, l) {
												return function(value) {
													return numberFormat(value, d, p, c, l);
												}
											}

											// Set the final format function
											field.format = saveFormat(numOfDecimals, prefix, currency.join(''), formatLocale);
										}
									}
								};
							}
							else if (key == 'metricSummableDiscovery' &&
								options.metricSummableDiscovery === true &&
								options?.metricFormatDiscovery === true) {
								// Requires metricFormatDiscovery = true
								// Sums rows and checks the formatted result against the totals
								for (const [fieldIndex, field] of self.#queryResult.fields.entries()) {
									if (field.type == 'metric' && !field.systemName.includes('_DIFF')) {
										const sum = self.#queryResult.rows.map(x => x[fieldIndex].value).reduce((sum, b) => Math.abs(b) > 0 ? sum + b : sum, 0);
										const formattedValue = field.format(sum);
										if (self.#queryResult.totals[fieldIndex - totalIndexAdj].formattedValue.includes(formattedValue)) {
											field.summable = true;
											self.#queryResult.totals[fieldIndex - totalIndexAdj].value = sum;
										}
										else {
											field.summable = false;
										}
									}
								}
								// If a field isn't summable, check if it's calculable by dividing other summable fields
								const nonSummableMetrics = self.#queryResult.fields.filter(x => x.type == 'metric' && x.summable === false);
								for (const metric of nonSummableMetrics) {
									metric.index = self.#queryResult.fields.findIndex(field => field.systemName == metric.systemName);
								}
								const summableMetricIndexes = [];
								for (const [fieldIndex, field] of self.#queryResult.fields.entries()) {
									if (field.type == 'metric' && field.summable === true) {
										summableMetricIndexes.push(fieldIndex);
									}
								}
								const calcCombintations = summableMetricIndexes.map(x => summableMetricIndexes.filter(y => y !== x).map(y => [x, y])).flat();
								for (const field of nonSummableMetrics) {
									for (const [numerIndex, denomIndex] of calcCombintations) {
										field.calculable = null;
										field.perMille = null;
										for (const row of self.#queryResult.rows.filter(x => Math.abs(x[denomIndex].value > 0))) {
											const formattedValue = field.format(row[numerIndex].value / row[denomIndex].value);
											const formattedValuePerMille = field.format(row[numerIndex].value / row[denomIndex].value * 1000);

											field.calculable = (
												(row[field.index].formattedValue == formattedValue && (field?.calculable ?? true)) || // null counted as true for the first test
												(row[field.index].formattedValue == formattedValuePerMille && (field?.calculable ?? true))
											);
											field.perMille = row[field.index].formattedValue == formattedValuePerMille && (field?.perMille ?? true);
											if (field.calculable === false) {
												break;
											}
										}
										if (field.calculable === true) {
											field.numerator = self.#queryResult.fields.find((x, i) => i == numerIndex).systemName;
											field.denominator = self.#queryResult.fields.find((x, i) => i == denomIndex).systemName;
											break;
										}
									}
								}
							}
							else if (key == 'groupOthers' &&
								options.groupOthers.hasOwnProperty('top') === true &&
								options.groupOthers.hasOwnProperty('metricSystemNames') === true &&
								options.groupOthers.metricSystemNames.constructor.name == 'Array' &&
								options?.metricFormatDiscovery === true &&
								options?.metricSummableDiscovery === true) {
								// Requires successful metricFormat and metricSummable discoveries
								// Keeps only top X of combinations of metricSystemNames, discarding and grouping other rows
								// todo
							}
							else if (key == 'foldTimeComparisons' &&
								options.foldTimeComparisons === true) {
								// Identifies the time comparison fields, adds them as properties
								// of the regular fields, and deletes the original fields
								const fieldsToSplice = [];
								for (const [fieldIndex, field] of self.#queryResult.fields.entries()) {
									if (field.hasOwnProperty('compare')) {
										fieldsToSplice.push(fieldIndex);

										const origIndex = self.#queryResult.fields.map(x => x.systemName).indexOf(field.systemName);

										self.#queryResult.fields[origIndex].compare = field.compare;
										for (const row of self.#queryResult.rows) {
											row[origIndex].timeComparisonCompare = row[fieldIndex];
										};
										self.#queryResult.totals[origIndex - totalIndexAdj].timeComparisonCompare = self.#queryResult.totals[fieldIndex - totalIndexAdj];
									}
									else if (field.systemName.includes('_DIFF')) {
										fieldsToSplice.push(fieldIndex);

										const origSystemName = field.systemName.split('_DIFF')[0];
										const origIndex = self.#queryResult.fields.map(x => x.systemName).indexOf(origSystemName);

										for (const row of self.#queryResult.rows) {
											row[origIndex].timeComparisonDiff = row[fieldIndex];
										};
										self.#queryResult.totals[origIndex - totalIndexAdj].timeComparisonDiff = self.#queryResult.totals[fieldIndex - totalIndexAdj];
									}
								};

								fieldsToSplice.sort((a, b) => b - a);
								for (const i of fieldsToSplice) {
									self.#queryResult.fields.splice(i, 1);
									for (const row of self.#queryResult.rows) {
										row.splice(i, 1);
									};
									self.#queryResult.totals.splice(i - totalIndexAdj, 1);
								};
							}
							else if (key == 'convertAllDates' &&
								options.convertAllDates === true) {
								// Attempts to convert rows to dates and keeps if it works
								for (const [fieldIndex, field] of self.#queryResult.fields.entries()) {
									if (field.type == 'dimension') {
										for (const row of self.#queryResult.rows) {
											const date = new Date(row[fieldIndex].value);
											if (date != 'Invalid Date') {
												row[fieldIndex].value = date;
											} 
										}
									}
								}
							}
							else if (key == 'getFieldDetails' &&
								options.getFieldDetails === true) {
								for (const field of self.#queryResult.fields) {
									field.fieldDetails = await utils.getFieldDetails(field.systemName);
								}
							}
						}
					}

					// Label fields with indexes
					// For usability, happens after folding time comparisons has taken place
					for (const [i, field] of self.#queryResult.fields.entries()) {
						field.index = i;
					};

					// If any metrics are calculable, add labels for the indexes of their components
					for (const [i, field] of self.#queryResult.fields.entries()) {
						if (field?.calculable === true) {
							field.numeratorIndex = self.#queryResult.fields.find(x => x.systemName == field.numerator).index;
							field.denominatorIndex = self.#queryResult.fields.find(x => x.systemName == field.denominator).index;
						}
					}

					// Label row cells with their corresponding fields
					for (const row of self.#queryResult.rows) {
						for (const [i, cell] of row.entries()) {
							cell.field = self.#queryResult.fields[i];
						}
					};

					// Label total cells with their corresponding fields
					for (const [i, cell] of self.#queryResult.totals.entries()) {
						cell.field = self.#queryResult.fields[i + totalIndexAdj]
					};

					// Return fields
					self.fields = function() {
						return self.#queryResult.fields.map(field => { return {...field}; });
					}

					// Return headers, alias for fields
					self.headers = self.fields;

					// Return dimension fields
					self.dimensions = function() {
						return self.fields().filter(x => x.type == 'dimension');
					};

					// Return metric fields
					self.metrics = function() {
						return self.fields().filter(x => x.type == 'metric');
					};

					// Return rows
					self.rows = function() {
						return self.#queryResult.rows.map(row => row.map(cell => { return {...cell}; }));
					};

					// Return grand totals
					self.totals = function() {
						return self.#queryResult.totals.map(total => { return {...total}; });
					}

					// Return transposed data
					self.transpose = function() {
						const result = {};
						result.headers = Array(self.dimensions().length);
						result.rows = [];
						result.totals = self.totals();

						const getHeaderCombo = function(row) {
							const headerCombo = [];
							for (const dimension of self.dimensions()) {
								headerCombo.push(row[dimension.index].formattedValue);
							};

							return JSON.stringify(headerCombo);
						}

						const headerCombinations = Array.from(
							new Set(
								self.rows().map(row => getHeaderCombo(row))
							)
						).map(row => JSON.parse(row));

						for (const [i, dimension] of self.dimensions().entries()) {
							result.headers[i] = headerCombinations.map(x => x[i]);
						};

						for (const metric of self.metrics()) {
							const row = [];
							for (const headerCombo of headerCombinations) {
								row.push(
									self.rows().find(row => getHeaderCombo(row) == JSON.stringify(headerCombo))[metric.index]
								);
							};
							result.rows.push(row);
						};

						return result;
					};

					// Return pivoted data (i.e., certain row dimensions turned into column dimensions)
					self.pivot = function() {
						return 'todo';
					};

					// Return a nested table with subtotals
					self.nest = function(depth=0, maxDepth=self.dimensions().length, data=self.rows()) {
						if (depth === maxDepth) {
							return data;
						}
						else {
							const result = {};
							// Pass 1: Sort rows into groups and sum subtotals incrementally
							for (const row of data) {
								const name = row[0].formattedValue;
								if (!result.hasOwnProperty(name)) {
									result[name] = {
										'colPosition': depth,
										'colWidth': maxDepth - depth,
										'name': name,
										'subtotals': self.metrics().map(metric => { 
											if (metric?.summable === true) {
												if (Math.abs(row[metric.index - depth].value) > 0) {
													return { 'field': metric, 'value': row[metric.index - depth].value};
												}
												else {
													return { 'field': metric, 'value': 0 };
												}
											}
											else {
												return { 'field': metric, 'value': '', 'formattedValue': '' };
											}
										}),
										'values': [row]
									}
								}
								else {
									for (const subtotal of result[name].subtotals) {
										if (subtotal.field?.summable === true && Math.abs(row[subtotal.field.index - depth].value) > 0) {
											subtotal.value += row[subtotal.field.index - depth].value;
										}
									}
									result[name].values.push(row);
								}
							}
							// Pass 2: Format and calculate subtotals, and rerun the nest function on the trimmed data set
							for (const name of Object.keys(result)) {
								for (const [subIndex, subtotal] of result[name].subtotals.entries()) {
									if (subtotal.field?.summable === true) {
										subtotal.formattedValue = subtotal.field.format(subtotal.value);
									}
									else if (subtotal.field?.calculable === true) {
										const numerator = result[name].subtotals[subtotal.field.numeratorIndex - totalIndexAdj].value;
										const denominator = result[name].subtotals[subtotal.field.denominatorIndex - totalIndexAdj].value;
										const perMille = subtotal.field?.perMille === true ? 1000 : 1;
										subtotal.value = numerator / denominator * perMille;
										subtotal.formattedValue = subtotal.field.format(subtotal.value);
									}
								}
								result[name].values = self.nest(depth + 1, maxDepth, result[name].values.map(row => row.splice(1)));
							}
							return Object.values(result);
						}
					};

					// Calculate subtotals for a given dimension
					self.subtotals = function(dimIndex) {
						// Create a copy of the data with the selected
						// dimension in the first position
						const data = self.rows().map(row => {
							row.unshift(row[dimIndex]);
							row.splice(dimIndex + 1, 1);
							return row;
						});

						// Run the nest function for just one level
						return self.nest(0, 1, data);
					};

					// Provide a filled template for a common use case, and stop processing
					self.errorNoData = function(title=null) {
						if (self.rows().length === 0) {
							const myError = utils.errorMessageTemplate();

							myError.title.text(title);
							myError.svg
								.attr('viewBox', '0 0 20 20')
								.html(null)
							.append('path')
								.attr('d', 'M19 18.33 14.4 13.7a7.68 7.68 0 1 0-.71.71L18.33 19A.5.5 0 0 0 19 18.33Zm-10.38-3a6.66 6.66 0 1 1 6.66-6.66A6.66 6.66 0 0 1 8.66 15.31Z');
							myError.heading.text('No Data Available');
							myError.message.text('Check data or applied filters');

							throw new Error('The query result has no rows. Check data or applied filters.');
						}
					};

					return this;
				})();
			}
		}
	};

	// Extend the date class with getWeek()
	// ISO 8601: The week with the year's January 4 in it is w01, if weeks start on Monday (dowOffset 1)
	Date.prototype.getWeek = function(dowOffset=1) {
		// Validate dowOffset input
		dowOffset = [0,1,2,3,4,5,6].includes(dowOffset) ? dowOffset : 1;

		// Get last, this, and next year starts
		const yearStarts = [this.getFullYear() - 1, this.getFullYear(), this.getFullYear() + 1].map(x => {
			const weekOne = new Date(x, 0, 4);
			return new Date(weekOne - (weekOne.getDay() - dowOffset) * 1000*60*60*24);
		});

		// Calculate week number based on which week-year the date we're looking at is in
		// Round clears DST differences, floor + 1 puts all days in the right week
		const weekNum = this < yearStarts[1]
			? Math.floor(Math.round((this - yearStarts[0]) / (1000*60*60*24)) / 7) + 1
			: this > yearStarts[2]
			? Math.floor(Math.round((this - yearStarts[2]) / (1000*60*60*24)) / 7) + 1
			: Math.floor(Math.round((this - yearStarts[1]) / (1000*60*60*24)) / 7) + 1;

		return 'w' + '0'.repeat(2 - String(weekNum).length) + weekNum;
	};

	// Extend the date class with getQuarter()
	Date.prototype.getQuarter = function(quarterOffset=0) {
		// Validate quarterOffset input
		quarterOffset = [0,1,2,3,4,5,6,7,8,9,10,11].includes(quarterOffset) ? quarterOffset : 0;

		// Update the date with offset
		const offsetDate = new Date(this.getFullYear(), this.getMonth() - quarterOffset, 1);

		// Work out the year based on whether the ending month is yet to come this year
		if (this.getMonth() >= quarterOffset && quarterOffset !== 0) {
			yearAdd = 1;
		}
		else {
			yearAdd = 0;
		}
		const yearDate = new Date(this.getFullYear() + yearAdd, this.getMonth(), 1);

		// Return format example Q3 2021
		return 'Q' + Math.ceil((offsetDate.getMonth() + 1) / 3) + ' ' + yearDate.getFullYear();
	};
})();