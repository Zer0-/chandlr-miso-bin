// This file implements the JavaScript runtime logic for Haskell
// modules that use JSFFI. It is not an ESM module, but the template
// of one; the post-linker script will copy all contents into a new
// ESM module.

// Manage a mapping from 32-bit ids to actual JavaScript values.
class JSValManager {
  #lastk = 0;
  #kv = new Map();

  newJSVal(v) {
    const k = ++this.#lastk;
    this.#kv.set(k, v);
    return k;
  }

  // A separate has() call to ensure we can store undefined as a value
  // too. Also, unconditionally check this since the check is cheap
  // anyway, if the check fails then there's a use-after-free to be
  // fixed.
  getJSVal(k) {
    if (!this.#kv.has(k)) {
      throw new WebAssembly.RuntimeError(`getJSVal(${k})`);
    }
    return this.#kv.get(k);
  }

  // Check for double free as well.
  freeJSVal(k) {
    if (!this.#kv.delete(k)) {
      throw new WebAssembly.RuntimeError(`freeJSVal(${k})`);
    }
  }
}

// The actual setImmediate() to be used. This is a ESM module top
// level binding and doesn't pollute the globalThis namespace.
//
// To benchmark different setImmediate() implementations in the
// browser, use https://github.com/jphpsf/setImmediate-shim-demo as a
// starting point.
const setImmediate = await (async () => {
  // node, bun, or other scripts might have set this up in the browser
  if (globalThis.setImmediate) {
    return globalThis.setImmediate;
  }

  // deno
  if (globalThis.Deno) {
    try {
      return (await import("node:timers")).setImmediate;
    } catch {}
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/postTask
  if (globalThis.scheduler) {
    return (cb, ...args) => scheduler.postTask(() => cb(...args));
  }

  // Cloudflare workers doesn't support MessageChannel
  if (globalThis.MessageChannel) {
    // A simple & fast setImmediate() implementation for browsers. It's
    // not a drop-in replacement for node.js setImmediate() because:
    // 1. There's no clearImmediate(), and setImmediate() doesn't return
    //    anything
    // 2. There's no guarantee that callbacks scheduled by setImmediate()
    //    are executed in the same order (in fact it's the opposite lol),
    //    but you are never supposed to rely on this assumption anyway
    class SetImmediate {
      #fs = [];
      #mc = new MessageChannel();

      constructor() {
        this.#mc.port1.addEventListener("message", () => {
          this.#fs.pop()();
        });
        this.#mc.port1.start();
      }

      setImmediate(cb, ...args) {
        this.#fs.push(() => cb(...args));
        this.#mc.port2.postMessage(undefined);
      }
    }

    const sm = new SetImmediate();
    return (cb, ...args) => sm.setImmediate(cb, ...args);
  }

  return (cb, ...args) => setTimeout(cb, 0, ...args);
})();

export default (__exports) => {
const __ghc_wasm_jsffi_jsval_manager = new JSValManager();
const __ghc_wasm_jsffi_finalization_registry = globalThis.FinalizationRegistry ? new FinalizationRegistry(sp => __exports.rts_freeStablePtr(sp)) : { register: () => {}, unregister: () => true };
return {
newJSVal: (v) => __ghc_wasm_jsffi_jsval_manager.newJSVal(v),
getJSVal: (k) => __ghc_wasm_jsffi_jsval_manager.getJSVal(k),
freeJSVal: (k) => __ghc_wasm_jsffi_jsval_manager.freeJSVal(k),
scheduleWork: () => setImmediate(__exports.rts_schedulerLoop),
ZC0ZCchandlrzm0zi1zi0zi0zminplacezmchandlrZCJSFFIziProfileZC: () => (window.displayTotals()),
ZC1ZCchandlrzm0zi1zi0zi0zminplacezmchandlrZCJSFFIziProfileZC: ($1) => (window.sectionEnd($1)),
ZC2ZCchandlrzm0zi1zi0zi0zminplacezmchandlrZCJSFFIziProfileZC: ($1) => (window.sectionStart($1)),
ZC0ZCmisozm1zi9zi0zi0zminplaceZCMisoZC: async () => {// ts/miso/dom.ts
function diff(c, n, parent, context) {
  if (!c && !n)
    return;
  else if (!c)
    create(n, parent, context);
  else if (!n)
    destroy(c, parent, context);
  else if (c.type === 2 /* VText */ && n.type === 2 /* VText */) {
    diffVText(c, n, context);
  } else if (c.type === 0 /* VComp */ && n.type === 0 /* VComp */) {
    if (n.key === c.key) {
      n.child = c.child;
      return;
    }
    replace(c, n, parent, context);
  } else if (c.type === 1 /* VNode */ && n.type === 1 /* VNode */) {
    if (n.tag === c.tag && n.key === c.key) {
      n.domRef = c.domRef;
      diffAttrs(c, n, context);
    } else {
      replace(c, n, parent, context);
    }
  } else
    replace(c, n, parent, context);
}
function diffVText(c, n, context) {
  if (c.text !== n.text)
    context.setTextContent(c.domRef, n.text);
  n.domRef = c.domRef;
  return;
}
function drill(c) {
  if (!c.child)
    throw new Error("'drill' called on an unmounted Component. This should never happen, please make an issue.");
  switch (c.child.type) {
    case 0 /* VComp */:
      return drill(c.child);
    default:
      return c.child.domRef;
  }
}
function getDOMRef(tree) {
  switch (tree.type) {
    case 0 /* VComp */:
      return drill(tree);
    default:
      return tree.domRef;
  }
}
function replace(c, n, parent, context) {
  switch (c.type) {
    case 2 /* VText */:
      break;
    default:
      callBeforeDestroyedRecursive(c);
      break;
  }
  createElement(parent, 1 /* REPLACE */, getDOMRef(c), n, context);
  switch (c.type) {
    case 2 /* VText */:
      break;
    default:
      callDestroyedRecursive(c);
      break;
  }
}
function destroy(c, parent, context) {
  switch (c.type) {
    case 2 /* VText */:
      break;
    default:
      callBeforeDestroyedRecursive(c);
      break;
  }
  context.removeChild(parent, getDOMRef(c));
  switch (c.type) {
    case 2 /* VText */:
      break;
    default:
      callDestroyedRecursive(c);
      break;
  }
}
function callDestroyedRecursive(c) {
  callDestroyed(c);
  switch (c.type) {
    case 1 /* VNode */:
      for (const child of c.children) {
        if (child.type === 1 /* VNode */ || child.type === 0 /* VComp */) {
          callDestroyedRecursive(child);
        }
      }
      break;
    case 0 /* VComp */:
      if (c.child) {
        if (c.child.type === 1 /* VNode */ || c.child.type === 0 /* VComp */)
          callDestroyedRecursive(c.child);
      }
      break;
  }
}
function callDestroyed(c) {
  if (c.type === 1 /* VNode */ && c.onDestroyed)
    c.onDestroyed();
  if (c.type === 0 /* VComp */)
    unmountComponent(c);
}
function callBeforeDestroyed(c) {
  switch (c.type) {
    case 0 /* VComp */:
      if (c.onBeforeUnmounted)
        c.onBeforeUnmounted();
      break;
    case 1 /* VNode */:
      if (c.onBeforeDestroyed)
        c.onBeforeDestroyed();
      break;
    default:
      break;
  }
}
function callBeforeDestroyedRecursive(c) {
  callBeforeDestroyed(c);
  switch (c.type) {
    case 1 /* VNode */:
      for (const child of c.children) {
        if (child.type === 2 /* VText */)
          continue;
        callBeforeDestroyedRecursive(child);
      }
      break;
    case 0 /* VComp */:
      if (c.child) {
        if (c.child.type === 1 /* VNode */ || c.child.type === 0 /* VComp */)
          callBeforeDestroyedRecursive(c.child);
      }
      break;
  }
}
function diffAttrs(c, n, context) {
  diffProps(c ? c.props : {}, n.props, n.domRef, n.ns === "svg", context);
  diffClass(c ? c.classList : null, n.classList, n.domRef, context);
  diffCss(c ? c.css : {}, n.css, n.domRef, context);
  diffChildren(c ? c.children : [], n.children, n.domRef, context);
  drawCanvas(n);
}
function diffClass(c, n, domRef, context) {
  if (!c && !n) {
    return;
  }
  if (!c) {
    for (const className of n) {
      context.addClass(className, domRef);
    }
    return;
  }
  if (!n) {
    for (const className of c) {
      context.removeClass(className, domRef);
    }
    return;
  }
  for (const className of c) {
    if (!n.has(className)) {
      context.removeClass(className, domRef);
    }
  }
  for (const className of n) {
    if (!c.has(className)) {
      context.addClass(className, domRef);
    }
  }
  return;
}
function diffProps(cProps, nProps, node, isSvg, context) {
  var newProp;
  for (const c in cProps) {
    newProp = nProps[c];
    if (newProp === undefined) {
      if (isSvg || !(c in node) || c === "disabled") {
        context.removeAttribute(node, c);
      } else {
        context.setAttribute(node, c, "");
      }
    } else {
      if (newProp === cProps[c] && c !== "checked" && c !== "value")
        continue;
      if (isSvg) {
        if (c === "href") {
          context.setAttributeNS(node, "http://www.w3.org/1999/xlink", "href", newProp);
        } else {
          context.setAttribute(node, c, newProp);
        }
      } else if (c in node && !(c === "list" || c === "form")) {
        node[c] = newProp;
      } else {
        context.setAttribute(node, c, newProp);
      }
    }
  }
  for (const n in nProps) {
    if (cProps && cProps[n])
      continue;
    newProp = nProps[n];
    if (isSvg) {
      if (n === "href") {
        context.setAttributeNS(node, "http://www.w3.org/1999/xlink", "href", newProp);
      } else {
        context.setAttribute(node, n, newProp);
      }
    } else if (n in node && !(n === "list" || n === "form")) {
      node[n] = nProps[n];
    } else {
      context.setAttribute(node, n, newProp);
    }
  }
}
function diffCss(cCss, nCss, node, context) {
  context.setInlineStyle(cCss, nCss, node);
}
function shouldSync(cs, ns) {
  if (cs.length === 0 || ns.length === 0)
    return false;
  for (var i = 0;i < cs.length; i++) {
    if (cs[i].key === null || cs[i].key === undefined) {
      return false;
    }
  }
  for (var i = 0;i < ns.length; i++) {
    if (ns[i].key === null || ns[i].key === undefined) {
      return false;
    }
  }
  return true;
}
function diffChildren(cs, ns, parent, context) {
  if (shouldSync(cs, ns)) {
    syncChildren(cs, ns, parent, context);
  } else {
    for (let i = 0;i < Math.max(ns.length, cs.length); i++)
      diff(cs[i], ns[i], parent, context);
  }
}
function populateDomRef(c, context) {
  if (c.ns === "svg") {
    c.domRef = context.createElementNS("http://www.w3.org/2000/svg", c.tag);
  } else if (c.ns === "mathml") {
    c.domRef = context.createElementNS("http://www.w3.org/1998/Math/MathML", c.tag);
  } else {
    c.domRef = context.createElement(c.tag);
  }
}
function callCreated(parent, n, context) {
  switch (n.type) {
    case 0 /* VComp */:
      mountComponent(parent, 0 /* APPEND */, null, n, context);
      break;
    case 1 /* VNode */:
      if (n.onCreated)
        n.onCreated(n.domRef);
      break;
  }
}
function createElement(parent, op, replacing, n, context) {
  switch (n.type) {
    case 2 /* VText */:
      n.domRef = context.createTextNode(n.text);
      switch (op) {
        case 2 /* INSERT_BEFORE */:
          context.insertBefore(parent, n.domRef, replacing);
          break;
        case 0 /* APPEND */:
          context.appendChild(parent, n.domRef);
          break;
        case 1 /* REPLACE */:
          context.replaceChild(parent, n.domRef, replacing);
          break;
      }
      break;
    case 0 /* VComp */:
      mountComponent(parent, op, replacing, n, context);
      break;
    case 1 /* VNode */:
      if (n.onBeforeCreated)
        n.onBeforeCreated();
      populateDomRef(n, context);
      if (n.onCreated)
        n.onCreated(n.domRef);
      diffAttrs(null, n, context);
      switch (op) {
        case 2 /* INSERT_BEFORE */:
          context.insertBefore(parent, n.domRef, replacing);
          break;
        case 0 /* APPEND */:
          context.appendChild(parent, n.domRef);
          break;
        case 1 /* REPLACE */:
          context.replaceChild(parent, n.domRef, replacing);
          break;
      }
      break;
  }
}
function drawCanvas(c) {
  if (c.tag === "canvas" && c.draw)
    c.draw(c.domRef);
}
function unmountComponent(c) {
  if (c.onUnmounted)
    c.onUnmounted(drill(c));
  c.unmount(c.componentId);
}
function mountComponent(parent, op, replacing, n, context) {
  if (n.onBeforeMounted)
    n.onBeforeMounted();
  n.mount(parent, (componentId, componentTree) => {
    n.componentId = componentId;
    n.child = componentTree;
    componentTree.parent = n;
    if (componentTree.type !== 0 /* VComp */) {
      const childDomRef = getDOMRef(componentTree);
      if (op === 1 /* REPLACE */ && replacing) {
        context.replaceChild(parent, childDomRef, replacing);
      } else if (op === 2 /* INSERT_BEFORE */) {
        context.insertBefore(parent, childDomRef, replacing);
      }
    }
  });
  if (n.onMounted)
    n.onMounted(drill(n));
}
function create(n, parent, context) {
  createElement(parent, 0 /* APPEND */, null, n, context);
}
function insertBefore(parent, n, o, context) {
  context.insertBefore(parent, getDOMRef(n), o ? getDOMRef(o) : null);
}
function removeChild(parent, n, context) {
  context.removeChild(parent, getDOMRef(n));
}
function swapDOMRef(oLast, oFirst, parent, context) {
  context.swapDOMRefs(getDOMRef(oLast), getDOMRef(oFirst), parent);
}
function syncChildren(os, ns, parent, context) {
  var oldFirstIndex = 0, newFirstIndex = 0, oldLastIndex = os.length - 1, newLastIndex = ns.length - 1, tmp, nFirst, nLast, oLast, oFirst, found, node;
  for (;; ) {
    if (newFirstIndex > newLastIndex && oldFirstIndex > oldLastIndex) {
      break;
    }
    nFirst = ns[newFirstIndex];
    nLast = ns[newLastIndex];
    oFirst = os[oldFirstIndex];
    oLast = os[oldLastIndex];
    if (oldFirstIndex > oldLastIndex) {
      diff(null, nFirst, parent, context);
      insertBefore(parent, nFirst, oFirst, context);
      os.splice(newFirstIndex, 0, nFirst);
      newFirstIndex++;
    } else if (newFirstIndex > newLastIndex) {
      tmp = oldLastIndex;
      while (oldLastIndex >= oldFirstIndex) {
        removeChild(parent, os[oldLastIndex--], context);
      }
      os.splice(oldFirstIndex, tmp - oldFirstIndex + 1);
      break;
    } else if (oFirst.key === nFirst.key) {
      diff(os[oldFirstIndex++], ns[newFirstIndex++], parent, context);
    } else if (oLast.key === nLast.key) {
      diff(os[oldLastIndex--], ns[newLastIndex--], parent, context);
    } else if (oFirst.key === nLast.key && nFirst.key === oLast.key) {
      swapDOMRef(oLast, oFirst, parent, context);
      swap(os, oldFirstIndex, oldLastIndex);
      diff(os[oldFirstIndex++], ns[newFirstIndex++], parent, context);
      diff(os[oldLastIndex--], ns[newLastIndex--], parent, context);
    } else if (oFirst.key === nLast.key) {
      insertBefore(parent, oFirst, oLast.nextSibling, context);
      os.splice(oldLastIndex, 0, os.splice(oldFirstIndex, 1)[0]);
      diff(os[oldLastIndex--], ns[newLastIndex--], parent, context);
    } else if (oLast.key === nFirst.key) {
      insertBefore(parent, oLast, oFirst, context);
      os.splice(oldFirstIndex, 0, os.splice(oldLastIndex, 1)[0]);
      diff(os[oldFirstIndex++], nFirst, parent, context);
      newFirstIndex++;
    } else {
      found = false;
      tmp = oldFirstIndex;
      while (tmp <= oldLastIndex) {
        if (os[tmp].key === nFirst.key) {
          found = true;
          node = os[tmp];
          break;
        }
        tmp++;
      }
      if (found) {
        os.splice(oldFirstIndex, 0, os.splice(tmp, 1)[0]);
        diff(os[oldFirstIndex++], nFirst, parent, context);
        insertBefore(parent, node, os[oldFirstIndex], context);
        newFirstIndex++;
      } else {
        createElement(parent, 2 /* INSERT_BEFORE */, getDOMRef(oFirst), nFirst, context);
        os.splice(oldFirstIndex++, 0, nFirst);
        newFirstIndex++;
        oldLastIndex++;
      }
    }
  }
}
function swap(os, l, r) {
  const k = os[l];
  os[l] = os[r];
  os[r] = k;
}

// ts/miso/event.ts
function delegate(mount, events, getVTree, debug, context) {
  for (const event of events) {
    context.addEventListener(mount, event.name, function(e) {
      listener(e, mount, getVTree, debug, context);
    }, event.capture);
  }
}
function undelegate(mount, events, getVTree, debug, context) {
  for (const event of events) {
    context.removeEventListener(mount, event.name, function(e) {
      listener(e, mount, getVTree, debug, context);
    }, event.capture);
  }
}
function listener(e, mount, getVTree, debug, context) {
  getVTree(function(vtree) {
    if (Array.isArray(e)) {
      for (const key of e) {
        dispatch(key, vtree, mount, debug, context);
      }
    } else {
      dispatch(e, vtree, mount, debug, context);
    }
  });
}
function dispatch(ev, vtree, mount, debug, context) {
  var target = context.getTarget(ev);
  if (target) {
    let stack = buildTargetToElement(mount, target, context);
    delegateEvent(ev, vtree, stack, debug, context);
  }
}
function buildTargetToElement(element, target, context) {
  var stack = [];
  while (!context.isEqual(element, target)) {
    stack.unshift(target);
    if (target && context.parentNode(target)) {
      target = context.parentNode(target);
    } else {
      return stack;
    }
  }
  return stack;
}
function delegateEvent(event, obj, stack, debug, context) {
  if (!stack.length) {
    if (debug) {
      console.warn('Event "' + event.type + '" did not find an event handler to dispatch on', obj, event);
    }
    return;
  } else if (stack.length > 1) {
    if (obj.type === 2 /* VText */) {
      return;
    } else if (obj.type === 0 /* VComp */) {
      if (!obj.child) {
        if (debug) {
          console.error("VComp has no child property set during event delegation", obj);
          console.error("This means the Component has not been fully mounted, this should never happen");
          throw new Error("VComp has no .child property set during event delegation");
        }
        return;
      }
      return delegateEvent(event, obj.child, stack, debug, context);
    } else if (obj.type === 1 /* VNode */) {
      if (context.isEqual(obj.domRef, stack[0])) {
        const eventObj = obj.events.captures[event.type];
        if (eventObj) {
          const options = eventObj.options;
          if (options.preventDefault)
            event.preventDefault();
          if (!event["captureStopped"]) {
            eventObj.runEvent(event, obj.domRef);
          }
          if (options.stopPropagation) {
            event["captureStopped"] = true;
          }
        }
        stack.splice(0, 1);
        for (const child of obj.children) {
          if (context.isEqual(getDOMRef(child), stack[0])) {
            delegateEvent(event, child, stack, debug, context);
          }
        }
      }
      return;
    }
  } else {
    if (obj.type === 0 /* VComp */) {
      if (obj.child) {
        delegateEvent(event, obj.child, stack, debug, context);
      }
    } else if (obj.type === 1 /* VNode */) {
      const eventCaptureObj = obj.events.captures[event.type];
      if (eventCaptureObj && !event["captureStopped"]) {
        const options = eventCaptureObj.options;
        if (context.isEqual(stack[0], obj.domRef)) {
          if (options.preventDefault)
            event.preventDefault();
          eventCaptureObj.runEvent(event, stack[0]);
          if (options.stopPropagation)
            event["captureStopped"] = true;
        }
      }
      const eventObj = obj.events.bubbles[event.type];
      if (eventObj && !event["captureStopped"]) {
        const options = eventObj.options;
        if (context.isEqual(stack[0], obj.domRef)) {
          if (options.preventDefault)
            event.preventDefault();
          eventObj.runEvent(event, stack[0]);
          if (!options.stopPropagation) {
            propagateWhileAble(obj.parent, event);
          }
        }
      } else {
        if (!event["captureStopped"]) {
          propagateWhileAble(obj.parent, event);
        }
      }
    }
  }
}
function propagateWhileAble(vtree, event) {
  while (vtree) {
    switch (vtree.type) {
      case 2 /* VText */:
        break;
      case 1 /* VNode */:
        const eventObj = vtree.events.bubbles[event.type];
        if (eventObj) {
          const options = eventObj.options;
          if (options.preventDefault)
            event.preventDefault();
          eventObj.runEvent(event, vtree.domRef);
          if (options.stopPropagation) {
            return;
          }
        }
        vtree = vtree.parent;
        break;
      case 0 /* VComp */:
        if (!vtree.eventPropagation)
          return;
        vtree = vtree.parent;
        break;
    }
  }
}
function eventJSON(at, obj) {
  if (typeof at[0] === "object") {
    var ret = [];
    for (var i = 0;i < at.length; i++) {
      ret.push(eventJSON(at[i], obj));
    }
    return ret;
  }
  for (const a of at)
    obj = obj[a];
  var newObj;
  if (obj instanceof Array || "length" in obj && obj["localName"] !== "select") {
    newObj = [];
    for (var j = 0;j < obj.length; j++) {
      newObj.push(eventJSON([], obj[j]));
    }
    return newObj;
  }
  newObj = {};
  for (var key in getAllPropertyNames(obj)) {
    if (obj["localName"] === "input" && (key === "selectionDirection" || key === "selectionStart" || key === "selectionEnd")) {
      continue;
    }
    if (typeof obj[key] == "string" || typeof obj[key] == "number" || typeof obj[key] == "boolean") {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}
function getAllPropertyNames(obj) {
  var props = {}, i = 0;
  do {
    var names = Object.getOwnPropertyNames(obj);
    for (i = 0;i < names.length; i++) {
      props[names[i]] = null;
    }
  } while (obj = Object.getPrototypeOf(obj));
  return props;
}

// ts/miso/hydrate.ts
function collapseSiblingTextNodes(vs) {
  var ax = 0, adjusted = vs.length > 0 ? [vs[0]] : [];
  for (var ix = 1;ix < vs.length; ix++) {
    if (adjusted[ax].type === 2 /* VText */ && vs[ix].type === 2 /* VText */) {
      adjusted[ax].text += vs[ix].text;
      continue;
    }
    adjusted[++ax] = vs[ix];
  }
  return adjusted;
}
function hydrate(logLevel, mountPoint, vtree, context, drawingContext) {
  if (!vtree || !mountPoint)
    return false;
  let node = drawingContext.getRoot() === mountPoint ? mountPoint.firstChild : mountPoint;
  if (!walk(logLevel, vtree, node, context, drawingContext)) {
    if (logLevel) {
      console.warn("[DEBUG_HYDRATE] Could not copy DOM into virtual DOM, falling back to diff");
    }
    while (context.firstChild(node))
      drawingContext.removeChild(node, context.lastChild(node));
    return false;
  } else {
    if (logLevel) {
      console.info("[DEBUG_HYDRATE] Successfully prerendered page");
    }
  }
  return true;
}
function diagnoseError(logLevel, vtree, node) {
  if (logLevel)
    console.warn("[DEBUG_HYDRATE] VTree differed from node", vtree, node);
}
function parseColor(input) {
  if (input.substr(0, 1) == "#") {
    const collen = (input.length - 1) / 3;
    const fact = [17, 1, 0.062272][collen - 1];
    return [
      Math.round(parseInt(input.substr(1, collen), 16) * fact),
      Math.round(parseInt(input.substr(1 + collen, collen), 16) * fact),
      Math.round(parseInt(input.substr(1 + 2 * collen, collen), 16) * fact)
    ];
  } else
    return input.split("(")[1].split(")")[0].split(",").map((x) => {
      return +x;
    });
}
function integrityCheck(vtree, context, drawingContext) {
  return check(true, vtree, context, drawingContext);
}
function check(result, vtree, context, drawingContext) {
  if (vtree.type == 2 /* VText */) {
    if (context.getTag(vtree.domRef) !== "#text") {
      console.warn("VText domRef not a TEXT_NODE", vtree);
      result = false;
    } else if (vtree.text !== context.getTextContent(vtree.domRef)) {
      console.warn("VText node content differs", vtree);
      result = false;
    }
  } else if (vtree.type === 1 /* VNode */) {
    if (vtree.tag.toUpperCase() !== context.getTag(vtree.domRef).toUpperCase()) {
      console.warn("Integrity check failed, tags differ", vtree.tag.toUpperCase(), context.getTag(vtree.domRef));
      result = false;
    }
    if ("children" in vtree && vtree.children.length !== context.children(vtree.domRef).length) {
      console.warn("Integrity check failed, children lengths differ", vtree, vtree.children, context.children(vtree.domRef));
      result = false;
    }
    for (const key in vtree.props) {
      if (key === "href" || key === "src") {
        const absolute = window.location.origin + "/" + vtree.props[key], url = context.getAttribute(vtree.domRef, key), relative = vtree.props[key];
        if (absolute !== url && relative !== url && relative + "/" !== url && absolute + "/" !== url) {
          console.warn("Property " + key + " differs", vtree.props[key], context.getAttribute(vtree.domRef, key));
          result = false;
        }
      } else if (key === "height" || key === "width") {
        if (parseFloat(vtree.props[key]) !== parseFloat(context.getAttribute(vtree.domRef, key))) {
          console.warn("Property " + key + " differs", vtree.props[key], context.getAttribute(vtree.domRef, key));
          result = false;
        }
      } else if (key === "class" || key === "className") {
        if (vtree.props[key] !== context.getAttribute(vtree.domRef, "class")) {
          console.warn("Property class differs", vtree.props[key], context.getAttribute(vtree.domRef, "class"));
          result = false;
        }
      } else if (vtree.props[key] !== context.getAttribute(vtree.domRef, key)) {
        console.warn("Property " + key + " differs", vtree.props[key], context.getAttribute(vtree.domRef, key));
        result = false;
      }
    }
    for (const key in vtree.css) {
      if (key === "color") {
        if (parseColor(context.getInlineStyle(vtree.domRef, key)).toString() !== parseColor(vtree.css[key]).toString()) {
          console.warn("Style " + key + " differs", vtree.css[key], context.getInlineStyle(vtree.domRef, key));
          result = false;
        }
      } else if (vtree.css[key] !== context.getInlineStyle(vtree.domRef, key)) {
        console.warn("Style " + key + " differs", vtree.css[key], context.getInlineStyle(vtree.domRef, key));
        result = false;
      }
    }
    for (const child of vtree.children) {
      const value = check(result, child, context, drawingContext);
      result = result && value;
    }
  }
  return result;
}
function walk(logLevel, vtree, node, context, drawingContext) {
  switch (vtree.type) {
    case 0 /* VComp */:
      if (!walk(logLevel, vtree.child, node, context, drawingContext)) {
        return false;
      }
      break;
    case 2 /* VText */:
      if (node.nodeType !== 3 || vtree.text.trim() !== node.textContent.trim()) {
        diagnoseError(logLevel, vtree, node);
        return false;
      }
      vtree.domRef = node;
      break;
    case 1 /* VNode */:
      if (node.nodeType !== 1) {
        diagnoseError(logLevel, vtree, node);
        return false;
      }
      vtree.domRef = node;
      vtree.children = collapseSiblingTextNodes(vtree.children);
      callCreated(node, vtree, drawingContext);
      for (var i = 0;i < vtree.children.length; i++) {
        const vdomChild = vtree.children[i];
        const domChild = node.childNodes[i];
        if (!domChild) {
          diagnoseError(logLevel, vdomChild, domChild);
          return false;
        }
        if (!walk(logLevel, vdomChild, domChild, context, drawingContext)) {
          return false;
        }
      }
      break;
  }
  return true;
}

// ts/miso/util.ts
var version = "1.9.0.0";
function callFocus(id, delay) {
  var setFocus = function() {
    var e = document.getElementById(id);
    if (e && e.focus)
      e.focus();
  };
  delay > 0 ? setTimeout(setFocus, delay) : setFocus();
}
function callBlur(id, delay) {
  var setBlur = function() {
    var e = document.getElementById(id);
    if (e && e.blur)
      e.blur();
  };
  delay > 0 ? setTimeout(setBlur, delay) : setBlur();
}
function callSelect(id, delay) {
  var setSelect = function() {
    var e = document.getElementById(id);
    if (e && typeof e["select"] === "function")
      e.select();
  };
  delay > 0 ? setTimeout(setSelect, delay) : setSelect();
}
function callSetSelectionRange(id, start, end, delay) {
  var setSetSelectionRange = function() {
    var e = document.getElementById(id);
    if (e && typeof e["setSelectionRange"] === "function")
      e.setSelectionRange(start, end, "none");
  };
  delay > 0 ? setTimeout(setSetSelectionRange, delay) : setSetSelectionRange();
}
function fetchCore(url, method, body, requestHeaders, successful, errorful, responseType) {
  var options = { method, headers: requestHeaders };
  if (body) {
    options["body"] = body;
  }
  let headers = {};
  let status = null;
  try {
    fetch(url, options).then((response) => {
      status = response.status;
      for (const [key, value] of response.headers) {
        headers[key] = value;
      }
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      if (responseType == "json") {
        return response.json();
      } else if (responseType == "text") {
        return response.text();
      } else if (responseType === "arrayBuffer") {
        return response.arrayBuffer();
      } else if (responseType === "blob") {
        return response.blob();
      } else if (responseType === "bytes") {
        return response.bytes();
      } else if (responseType === "formData") {
        return response.formData();
      } else if (responseType === "none") {
        return successful({ error: null, body: null, headers, status });
      }
    }).then((body2) => successful({ error: null, body: body2, headers, status })).catch((body2) => errorful({ error: null, body: body2, headers, status }));
  } catch (err) {
    errorful({ body: null, error: err.message, headers, status });
  }
}
function websocketConnect(url, onOpen, onClose, onMessageText, onMessageJSON, onMessageBLOB, onMessageArrayBuffer, onError, textOnly) {
  try {
    let socket = new WebSocket(url);
    socket.onopen = function() {
      onOpen();
    };
    socket.onclose = function(e) {
      onClose(e);
    };
    socket.onerror = function(error) {
      console.error(error);
      onError("WebSocket error received");
    };
    socket.onmessage = function(msg) {
      if (typeof msg.data === "string") {
        try {
          if (textOnly) {
            if (onMessageText)
              onMessageText(msg.data);
            return;
          }
          const json = JSON.parse(msg.data);
          if (onMessageJSON)
            onMessageJSON(json);
        } catch (err) {
          if (textOnly && onMessageText) {
            onMessageText(msg.data);
          } else {
            onError(err.message);
          }
        }
      } else if (msg.data instanceof Blob) {
        if (onMessageBLOB)
          onMessageBLOB(msg.data);
      } else if (msg.data instanceof ArrayBuffer) {
        if (onMessageArrayBuffer)
          onMessageArrayBuffer(msg.data);
      } else {
        console.error("Received unknown message type from WebSocket", msg);
        onError("Unknown message received from WebSocket");
      }
    };
    return socket;
  } catch (err) {
    onError(err.message);
  }
}
function websocketClose(socket) {
  if (socket) {
    socket.close();
    socket = null;
  }
}
function websocketSend(socket, message) {
  if (message && socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  }
}
function eventSourceConnect(url, onOpen, onMessageText, onMessageJSON, onError, textOnly) {
  try {
    let eventSource = new EventSource(url);
    eventSource.onopen = function() {
      onOpen();
    };
    eventSource.onerror = function() {
      onError("EventSource error received");
    };
    eventSource.onmessage = function(msg) {
      try {
        if (textOnly) {
          if (onMessageText)
            onMessageText(msg.data);
          return;
        }
        const json = JSON.parse(msg.data);
        if (onMessageJSON)
          onMessageJSON(json);
      } catch (err) {
        if (textOnly && onMessageText) {
          onMessageText(msg.data);
        } else {
          onError(err.message);
        }
      }
    };
    return eventSource;
  } catch (err) {
    onError(err.message);
  }
}
function eventSourceClose(eventSource) {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
}
function populateClass(vnode, classes) {
  if (!vnode.classList) {
    vnode.classList = new Set;
  }
  for (const str of classes) {
    for (const c of str.trim().split(" ")) {
      if (c)
        vnode.classList.add(c);
    }
  }
}

// ts/miso/context/dom.ts
var eventContext = {
  addEventListener: (mount, event, listener2, capture) => {
    mount.addEventListener(event, listener2, capture);
  },
  removeEventListener: (mount, event, listener2, capture) => {
    mount.removeEventListener(event, listener2, capture);
  },
  isEqual: (x, y) => {
    return x === y;
  },
  getTarget: (e) => {
    return e.target;
  },
  parentNode: (node) => {
    return node.parentNode;
  }
};
var hydrationContext = {
  getInlineStyle: (node, key) => {
    return node.style[key];
  },
  firstChild: (node) => {
    return node.firstChild;
  },
  lastChild: (node) => {
    return node.lastChild;
  },
  getAttribute: (node, key) => {
    if (key === "class")
      return node.className;
    if (key in node)
      return node[key];
    return node.getAttribute(key);
  },
  getTag: (node) => {
    return node.nodeName;
  },
  getTextContent: (node) => {
    return node.textContent;
  },
  children: (node) => {
    return node.childNodes;
  }
};
var componentContext = {
  mountComponent: function(events, componentId, model) {
    return;
  },
  unmountComponent: function(componentId) {
    return;
  },
  modelHydration: function(model) {
    return;
  }
};
var drawingContext = {
  nextSibling: (node) => {
    if (node.nextSibling) {
      switch (node.nextSibling.type) {
        case 0 /* VComp */:
          return drill(node.nextSibling);
        default:
          return node.nextSibling.domRef;
      }
    }
    return null;
  },
  createTextNode: (s) => {
    return document.createTextNode(s);
  },
  createElementNS: (ns, tag) => {
    return document.createElementNS(ns, tag);
  },
  appendChild: (parent, child) => {
    return parent.appendChild(child);
  },
  replaceChild: (parent, n, old) => {
    return parent.replaceChild(n, old);
  },
  removeChild: (parent, child) => {
    return parent.removeChild(child);
  },
  createElement: (tag) => {
    return document.createElement(tag);
  },
  addClass: (className, domRef) => {
    if (className)
      domRef.classList.add(className);
  },
  removeClass: (className, domRef) => {
    if (className)
      domRef.classList.remove(className);
  },
  insertBefore: (parent, child, node) => {
    return parent.insertBefore(child, node);
  },
  swapDOMRefs: (oLast, oFirst, p) => {
    const tmp = oLast.nextSibling;
    p.insertBefore(oLast, oFirst);
    p.insertBefore(oFirst, tmp);
    return;
  },
  setInlineStyle: (cCss, nCss, node) => {
    var result;
    for (const key in cCss) {
      result = nCss[key];
      if (!result) {
        if (key in node.style) {
          node.style[key] = "";
        } else {
          node.style.setProperty(key, "");
        }
      } else if (result !== cCss[key]) {
        if (key in node.style) {
          node.style[key] = result;
        } else {
          node.style.setProperty(key, result);
        }
      }
    }
    for (const n in nCss) {
      if (cCss && cCss[n])
        continue;
      if (n in node.style) {
        node.style[n] = nCss[n];
      } else {
        node.style.setProperty(n, nCss[n]);
      }
    }
    return;
  },
  setAttribute: (node, key, value) => {
    return node.setAttribute(key, value);
  },
  setAttributeNS: (node, ns, key, value) => {
    return node.setAttributeNS(ns, key, value);
  },
  removeAttribute: (node, key) => {
    return node.removeAttribute(key);
  },
  setTextContent: (node, text) => {
    node.textContent = text;
    return;
  },
  flush: () => {
    return;
  },
  getRoot: function() {
    return document.body;
  }
};

// ts/index.ts
globalThis["miso"] = {
  hydrationContext,
  eventContext,
  drawingContext,
  componentContext,
  diff,
  hydrate,
  version,
  delegate,
  callBlur,
  callFocus,
  callSelect,
  callSetSelectionRange,
  eventJSON,
  fetchCore,
  eventSourceConnect,
  eventSourceClose,
  websocketConnect,
  websocketClose,
  websocketSend,
  undelegate,
  populateClass,
  integrityCheck,
  setDrawingContext: function(name) {
    const drawing = globalThis[name]["drawingContext"];
    const events = globalThis[name]["eventContext"];
    if (!drawing) {
      console.error('Custom rendering engine ("drawingContext") is not defined at globalThis[name].drawingContext', name);
    }
    if (!events) {
      console.error('Custom event delegation ("eventContext") is not defined at globalThis[name].eventContext', name);
    }
    globalThis["miso"]["drawingContext"] = drawing;
    globalThis["miso"]["eventContext"] = events;
  }
};
},
ZC0ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC: ($1,$2) => ((new TextDecoder('utf-8', {fatal: true})).decode(new Uint8Array(__exports.memory.buffer, $1, $2))),
ZC1ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC: ($1,$2,$3) => ((new TextEncoder()).encodeInto($1, new Uint8Array(__exports.memory.buffer, $2, $3)).written),
ZC2ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC: ($1) => ($1.length),
ZC6ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC: ($1) => ((...args) => __exports.ghczuwasmzujsffiZC5ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC($1, ...args)),
ZC8ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC: ($1) => ((...args) => __exports.ghczuwasmzujsffiZC7ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC($1, ...args)),
ZC10ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC: ($1) => ((...args) => __exports.ghczuwasmzujsffiZC9ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC($1, ...args)),
ZC11ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC: async ($1,$2,$3) => {        var jsaddle_values = new Map();
        var jsaddle_free = new Map();
        jsaddle_values.set(0, null);
        jsaddle_values.set(1, undefined);
        jsaddle_values.set(2, false);
        jsaddle_values.set(3, true);
        jsaddle_values.set(4, globalThis);
        var jsaddle_index = 100;
        var expectedBatch = 1;
        var lastResults = [0, {"tag": "Success", "contents": [[], []]}];
        var inCallback = 0;
        var asyncBatch = null;

var syncDepth = 0;
(async () => {
  while (true) {
    const batch = JSON.parse(await $3());
  var runBatch = function(firstBatch, initialSyncDepth) {
    var processBatch = function(timestamp) {
      var batch = firstBatch;
      var callbacksToFree = [];
      var results = [];
      inCallback++;
      try {
        syncDepth = initialSyncDepth || 0;
        for(;;){
          if(batch[2] === expectedBatch) {
            expectedBatch++;
            var nCommandsLength = batch[0].length;
            for (var nCommand = 0; nCommand != nCommandsLength; nCommand++) {
                var cmd = batch[0][nCommand];
                if (cmd.Left) {
                    var d = cmd.Left;
                    switch (d.tag) {
                            case "FreeRef":
                                var refsToFree = jsaddle_free.get(d.contents[0]) || [];
                                refsToFree.push(d.contents[1]);
                                jsaddle_free.set(d.contents[0], refsToFree);
                                break;
                            case "FreeRefs":
                                var refsToFree = jsaddle_free.get(d.contents) || [];
                                for(var nRef = 0; nRef != refsToFree.length; nRef++)
                                    jsaddle_values.delete(refsToFree[nRef]);
                                jsaddle_free.delete(d.contents);
                                break;
                            case "SetPropertyByName":
                                jsaddle_values.get(d.contents[0])[d.contents[1]]=jsaddle_values.get(d.contents[2]);
                                break;
                            case "SetPropertyAtIndex":
                                jsaddle_values.get(d.contents[0])[d.contents[1]]=jsaddle_values.get(d.contents[2]);
                                break;
                            case "EvaluateScript":
                                var n = d.contents[1];
                                jsaddle_values.set(n, eval(d.contents[0]));
                                break;
                            case "StringToValue":
                                var n = d.contents[1];
                                jsaddle_values.set(n, d.contents[0]);
                                break;
                            case "JSONValueToValue":
                                var n = d.contents[1];
                                jsaddle_values.set(n, d.contents[0]);
                                break;
                            case "GetPropertyByName":
                                var n = d.contents[2];
                                jsaddle_values.set(n, jsaddle_values.get(d.contents[0])[d.contents[1]]);
                                break;
                            case "GetPropertyAtIndex":
                                var n = d.contents[2];
                                jsaddle_values.set(n, jsaddle_values.get(d.contents[0])[d.contents[1]]);
                                break;
                            case "NumberToValue":
                                var n = d.contents[1];
                                jsaddle_values.set(n, d.contents[0]);
                                break;
                            case "NewEmptyObject":
                                var n = d.contents;
                                jsaddle_values.set(n, {});
                                break;
                            case "NewAsyncCallback":
                                (function() {
                                    var nFunction = d.contents;
                                    var func = function() {
                                        var nFunctionInFunc = ++jsaddle_index;
                                        jsaddle_values.set(nFunctionInFunc, func);
                                        var nThis = ++jsaddle_index;
                                        jsaddle_values.set(nThis, this);
                                        var args = [];
                                        for (var i = 0; i != arguments.length; i++) {
                                            var nArg = ++jsaddle_index;
                                            jsaddle_values.set(nArg, arguments[i]);
                                            args[i] = nArg;
                                        }
                                        $1(JSON.stringify({"tag": "Callback", "contents": [lastResults[0], lastResults[1], nFunction, nFunctionInFunc, nThis, args]}));
                                    };
                                    jsaddle_values.set(nFunction, func);
                                })();
                                break;
                            case "NewSyncCallback":
                                (function() {
                                    var nFunction = d.contents;
                                    var func = function() {
                                        var nFunctionInFunc = ++jsaddle_index;
                                        jsaddle_values.set(nFunctionInFunc, func);
                                        var nThis = ++jsaddle_index;
                                        jsaddle_values.set(nThis, this);
                                        var args = [];
                                        for (var i = 0; i != arguments.length; i++) {
                                            var nArg = ++jsaddle_index;
                                            jsaddle_values.set(nArg, arguments[i]);
                                            args[i] = nArg;
                                        }
                                        if(inCallback > 0) {
                                          $1(JSON.stringify({"tag": "Callback", "contents": [lastResults[0], lastResults[1], nFunction, nFunctionInFunc, nThis, args]}));
                                        } else {
                                          runBatch(JSON.parse($2(JSON.stringify({"tag": "Callback", "contents": [lastResults[0], lastResults[1], nFunction, nFunctionInFunc, nThis, args]}))), 1);
                                        }
                                    };
                                    jsaddle_values.set(nFunction, func);
                                })();
                                break;
                            case "FreeCallback":
                                callbacksToFree.push(d.contents);
                                break;
                            case "CallAsFunction":
                                var n = d.contents[3];
                                jsaddle_values.set(n,
                                    jsaddle_values.get(d.contents[0]).apply(jsaddle_values.get(d.contents[1]),
                                        d.contents[2].map(function(arg){return jsaddle_values.get(arg);})));
                                break;
                            case "CallAsConstructor":
                                var n = d.contents[2];
                                var r;
                                var f = jsaddle_values.get(d.contents[0]);
                                var a = d.contents[1].map(function(arg){return jsaddle_values.get(arg);});
                                switch(a.length) {
                                    case 0 : r = new f(); break;
                                    case 1 : r = new f(a[0]); break;
                                    case 2 : r = new f(a[0],a[1]); break;
                                    case 3 : r = new f(a[0],a[1],a[2]); break;
                                    case 4 : r = new f(a[0],a[1],a[2],a[3]); break;
                                    case 5 : r = new f(a[0],a[1],a[2],a[3],a[4]); break;
                                    case 6 : r = new f(a[0],a[1],a[2],a[3],a[4],a[5]); break;
                                    case 7 : r = new f(a[0],a[1],a[2],a[3],a[4],a[5],a[6]); break;
                                    default:
                                        var ret;
                                        var temp = function() {
                                            ret = f.apply(this, a);
                                        };
                                        temp.prototype = f.prototype;
                                        var i = new temp();
                                        if(ret instanceof Object)
                                            r = ret;
                                        else {
                                            i.constructor = f;
                                            r = i;
                                        }
                                }
                                jsaddle_values.set(n, r);
                                break;
                            case "NewArray":
                                var n = d.contents[1];
                                jsaddle_values.set(n, d.contents[0].map(function(v){return jsaddle_values.get(v);}));
                                break;
                            case "SyncWithAnimationFrame":
                                var n = d.contents;
                                jsaddle_values.set(n, timestamp);
                                break;
                            case "StartSyncBlock":
                                syncDepth++;
                                break;
                            case "EndSyncBlock":
                                syncDepth--;
                                break;
                            default:
                                $1(JSON.stringify({"tag": "ProtocolError", "contents": e.data}));
                                return;
                    }
                } else {
                    var d = cmd.Right;
                    switch (d.tag) {
                            case "ValueToString":
                                var val = jsaddle_values.get(d.contents);
                                var s = val === null ? "null" : val === undefined ? "undefined" : val.toString();
                                results.push({"tag": "ValueToStringResult", "contents": s});
                                break;
                            case "ValueToBool":
                                results.push({"tag": "ValueToBoolResult", "contents": jsaddle_values.get(d.contents) ? true : false});
                                break;
                            case "ValueToNumber":
                                results.push({"tag": "ValueToNumberResult", "contents": Number(jsaddle_values.get(d.contents))});
                                break;
                            case "ValueToJSON":
                                var s = jsaddle_values.get(d.contents) === undefined ? "" : JSON.stringify(jsaddle_values.get(d.contents));
                                results.push({"tag": "ValueToJSONResult", "contents": s});
                                break;
                            case "ValueToJSONValue":
                                results.push({"tag": "ValueToJSONValueResult", "contents": jsaddle_values.get(d.contents)});
                                break;
                            case "DeRefVal":
                                var n = d.contents;
                                var v = jsaddle_values.get(n);
                                var c = (v === null           ) ? [0, ""] :
                                        (v === undefined      ) ? [1, ""] :
                                        (v === false          ) ? [2, ""] :
                                        (v === true           ) ? [3, ""] :
                                        (typeof v === "number") ? [-1, v.toString()] :
                                        (typeof v === "string") ? [-2, v]
                                                                : [-3, ""];
                                results.push({"tag": "DeRefValResult", "contents": c});
                                break;
                            case "IsNull":
                                results.push({"tag": "IsNullResult", "contents": jsaddle_values.get(d.contents) === null});
                                break;
                            case "IsUndefined":
                                results.push({"tag": "IsUndefinedResult", "contents": jsaddle_values.get(d.contents) === undefined});
                                break;
                            case "InstanceOf":
                                results.push({"tag": "InstanceOfResult", "contents": jsaddle_values.get(d.contents[0]) instanceof jsaddle_values.get(d.contents[1])});
                                break;
                            case "StrictEqual":
                                results.push({"tag": "StrictEqualResult", "contents": jsaddle_values.get(d.contents[0]) === jsaddle_values.get(d.contents[1])});
                                break;
                            case "PropertyNames":
                                var result = [];
                                for (name in jsaddle_values.get(d.contents)) { result.push(name); }
                                results.push({"tag": "PropertyNamesResult", "contents": result});
                                break;
                            case "Sync":
                                results.push({"tag": "SyncResult", "contents": []});
                                break;
                            default:
                                results.push({"tag": "ProtocolError", "contents": e.data});
                        }
                }
            }
            if(syncDepth <= 0) {
              lastResults = [batch[2], {"tag": "Success", "contents": [callbacksToFree, results]}];
              $1(JSON.stringify({"tag": "BatchResults", "contents": [lastResults[0], lastResults[1]]}));
              break;
            } else {
              lastResults = [batch[2], {"tag": "Success", "contents": [callbacksToFree, results]}];
              batch = JSON.parse($2(JSON.stringify({"tag": "BatchResults", "contents": [lastResults[0], lastResults[1]]})));
              results = [];
              callbacksToFree = [];
            }
          } else {
            if(syncDepth <= 0) {
              break;
            } else {
              if(batch[2] === expectedBatch - 1) {
                batch = JSON.parse($2(JSON.stringify({"tag": "BatchResults", "contents": [lastResults[0], lastResults[1]]})));
              } else {
                batch = JSON.parse($2(JSON.stringify({"tag": "Duplicate", "contents": [batch[2], expectedBatch]})));
              }
              results = [];
              callbacksToFree = [];
            }
          }
        }
      }
      catch (err) {
        var n = ++jsaddle_index;
        jsaddle_values.set(n, err);
        console.log(err);
        $1(JSON.stringify({"tag": "BatchResults", "contents": [batch[2], {"tag": "Failure", "contents": [callbacksToFree, results, n, String(err)]}]}));
      }
      if(inCallback == 1) {
          while(asyncBatch !== null) {
              var b = asyncBatch;
              asyncBatch = null;
              if(b[2] == expectedBatch) runBatch(b);
          }
      }
      inCallback--;
    };
    if(batch[1] && (initialSyncDepth || 0) === 0) {
        globalThis.requestAnimationFrame(processBatch);
    }
    else {
        processBatch(globalThis.performance ? globalThis.performance.now() : null);
    }
  };
  runBatch(batch);

  }
})();
},
ZC12ZCjsaddlezmwasmzm0zi1zi2zi1zme79f1f8c3b688a545c575ffae8e9659d8f9a5d9005982606326ce8a68ed08102ZCLanguageziJavascriptziJSaddleziWasmziInternalZC: async () => {globalThis["h$isNumber"] = function(o) {    return typeof(o) === 'number';
};

// returns true for null, but not for functions and host objects
globalThis["h$isObject"] = function(o) {
    return typeof(o) === 'object';
};

globalThis["h$isString"] = function(o) {
    return typeof(o) === 'string';
};

globalThis["h$isSymbol"] = function(o) {
    return typeof(o) === 'symbol';
};

globalThis["h$isBoolean"] = function(o) {
    return typeof(o) === 'boolean';
};

globalThis["h$isFunction"] = function(o) {
    return typeof(o) === 'function';
};

globalThis["h$jsTypeOf"] = function(o) {
    var t = typeof(o);
    if(t === 'undefined') return 0;
    if(t === 'object')    return 1;
    if(t === 'boolean')   return 2;
    if(t === 'number')    return 3;
    if(t === 'string')    return 4;
    if(t === 'symbol')    return 5;
    if(t === 'function')  return 6;
    return 7; // other, host object etc
};

globalThis["h$jsonTypeOf"] = function(o) {
    if (!(o instanceof Object)) {
        if (o == null) {
            return 0;
        } else if (typeof o == 'number') {
            if (h$isInteger(o)) {
                return 1;
            } else {
                return 2;
            }
        } else if (typeof o == 'boolean') {
            return 3;
        } else {
            return 4;
        }
    } else {
        if (Object.prototype.toString.call(o) == '[object Array]') {
            // it's an array
            return 5;
        } else if (!o) {
            // null 
            return 0;
        } else {
            // it's an object
            return 6;
        }
    }

};
globalThis["h$roundUpToMultipleOf"] = function(n,m) {
  var rem = n % m;
  return rem === 0 ? n : n - rem + m;
};

globalThis["h$newByteArray"] = function(len) {
  var len0 = Math.max(h$roundUpToMultipleOf(len, 8), 8);
  var buf = new ArrayBuffer(len0);
  return { buf: buf
         , len: len
         , i3: new Int32Array(buf)
         , u8: new Uint8Array(buf)
         , u1: new Uint16Array(buf)
         , f3: new Float32Array(buf)
         , f6: new Float64Array(buf)
         , dv: new DataView(buf)
         }
};
globalThis["h$wrapBuffer"] = function(buf, unalignedOk, offset, length) {
  if(!unalignedOk && offset && offset % 8 !== 0) {
    throw ("h$wrapBuffer: offset not aligned:" + offset);
  }
  if(!buf || !(buf instanceof ArrayBuffer))
    throw "h$wrapBuffer: not an ArrayBuffer"
  if(!offset) { offset = 0; }
  if(!length || length < 0) { length = buf.byteLength - offset; }
  return { buf: buf
         , len: length
         , i3: (offset%4) ? null : new Int32Array(buf, offset, length >> 2)
         , u8: new Uint8Array(buf, offset, length)
         , u1: (offset%2) ? null : new Uint16Array(buf, offset, length >> 1)
         , f3: (offset%4) ? null : new Float32Array(buf, offset, length >> 2)
         , f6: (offset%8) ? null : new Float64Array(buf, offset, length >> 3)
         , dv: new DataView(buf, offset, length)
         };
};
globalThis["h$newByteArrayFromBase64String"] = function(base64) {
  var bin = globalThis.atob(base64);
  var ba = h$newByteArray(bin.length);
  var u8 = ba.u8;
  for (var i = 0; i < bin.length; i++) {
    u8[i] = bin.charCodeAt(i);
  }
  return ba;
};
globalThis["h$byteArrayToBase64String"] = function(off, len, ba) {
  var bin = '';
  var u8 = ba.u8;
  var end = off + len;
  for (var i = off; i < end; i++) {
    bin += String.fromCharCode(u8[i]);
  }
  return globalThis.btoa(bin);
};
},
ZC0ZCghczminternalZCGHCziInternalziWasmziPrimziExportsZC: ($1,$2) => ($1.reject(new WebAssembly.RuntimeError($2))),
ZC18ZCghczminternalZCGHCziInternalziWasmziPrimziExportsZC: ($1,$2) => ($1.resolve($2)),
ZC19ZCghczminternalZCGHCziInternalziWasmziPrimziExportsZC: ($1) => ($1.resolve()),
ZC20ZCghczminternalZCGHCziInternalziWasmziPrimziExportsZC: ($1) => {$1.throwTo = () => {};},
ZC21ZCghczminternalZCGHCziInternalziWasmziPrimziExportsZC: ($1,$2) => {$1.throwTo = (err) => __exports.rts_promiseThrowTo($2, err);},
ZC22ZCghczminternalZCGHCziInternalziWasmziPrimziExportsZC: () => {let res, rej; const p = new Promise((resolve, reject) => { res = resolve; rej = reject; }); p.resolve = res; p.reject = rej; return p;},
ZC23ZCghczminternalZCGHCziInternalziWasmziPrimziExportsZC: ($1,$2) => (__ghc_wasm_jsffi_finalization_registry.register($1, $2, $1)),
ZC18ZCghczminternalZCGHCziInternalziWasmziPrimziImportsZC: ($1,$2) => ($1.then(() => __exports.rts_promiseResolveUnit($2), err => __exports.rts_promiseReject($2, err))),
ZC0ZCghczminternalZCGHCziInternalziWasmziPrimziTypesZC: ($1) => (`${$1.stack ? $1.stack : $1}`),
ZC1ZCghczminternalZCGHCziInternalziWasmziPrimziTypesZC: ($1,$2) => ((new TextDecoder('utf-8', {fatal: true})).decode(new Uint8Array(__exports.memory.buffer, $1, $2))),
ZC2ZCghczminternalZCGHCziInternalziWasmziPrimziTypesZC: ($1,$2,$3) => ((new TextEncoder()).encodeInto($1, new Uint8Array(__exports.memory.buffer, $2, $3)).written),
ZC3ZCghczminternalZCGHCziInternalziWasmziPrimziTypesZC: ($1) => ($1.length),
ZC4ZCghczminternalZCGHCziInternalziWasmziPrimziTypesZC: ($1) => {try { __ghc_wasm_jsffi_finalization_registry.unregister($1); } catch {}},
ZC0ZCghczminternalZCGHCziInternalziWasmziPrimziConcziInternalZC: async ($1) => (new Promise(res => setTimeout(res, $1 / 1000))),
};
};
