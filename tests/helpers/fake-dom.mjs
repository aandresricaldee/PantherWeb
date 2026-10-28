class TextNode {
  constructor(text) { this.tag = '#text'; this.text = text; }
  get textContent() { return this.text; }
}

export class FakeNode {
  constructor(tag) {
    this.tag = tag;
    this.attrs = {};
    this.children = [];
    this.listeners = {};
  }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  hasAttribute(k) { return k in this.attrs; }
  append(...nodes) {
    for (const n of nodes) this.children.push(typeof n === 'string' ? new TextNode(n) : n);
  }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes); }
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  set textContent(v) { this.children = [new TextNode(String(v))]; }
  get textContent() { return this.children.map((c) => c.textContent).join(''); }
}

export function installFakeDocument() {
  globalThis.document = {
    createElement: (tag) => new FakeNode(tag),
    createElementNS: (_ns, tag) => new FakeNode(tag),
  };
}

export function walk(node, visit) {
  visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

export function findAll(node, predicate) {
  const out = [];
  walk(node, (n) => { if (predicate(n)) out.push(n); });
  return out;
}

export const hasClass = (node, name) => (node.attrs?.class ?? '').split(/\s+/).includes(name);
export const byClass = (node, name) => findAll(node, (n) => hasClass(n, name));
export const fire = (node, type) => (node.listeners[type] ?? []).forEach((fn) => fn({ target: node }));
