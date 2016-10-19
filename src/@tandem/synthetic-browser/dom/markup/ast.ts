// TODO - visitor pattern here

import * as sift from "sift";
import {
  INamed,
  IRange,
  cloneRange,
  bindable,
  TreeNode,
  patchable,
  IASTNode,
  IExpression,
  BaseExpression,
  register as registerSerializer,
} from "@tandem/common";

export enum MarkupExpressionKind {
  FRAGMENT = 1,
  ATTRIBUTE = FRAGMENT + 1,
  ELEMENT   = ATTRIBUTE + 1,
  TEXT = ELEMENT + 1,
  COMMENT   = TEXT + 1
}

export interface IMarkupExpression extends IExpression {
  readonly kind: MarkupExpressionKind;
  accept(visitor: IMarkupExpressionVisitor);
}

export interface IMarkupExpressionVisitor {
  visitElement(expression: MarkupElementExpression);
  visitComment(expression: MarkupCommentExpression);
  visitText(expression: MarkupTextExpression);
  visitAttribute(attribute: MarkupAttributeExpression);
  visitDocumentFragment(attribute: MarkupFragmentExpression);
}

export function serializeMarkupExpression(expression: MarkupExpression): Object {
  return expression.accept({
    visitAttribute({ kind, name, value, position }) {
      return { kind, name, value, position };
    },
    visitComment({ kind, nodeValue, position  }) {
      return { kind, nodeValue, position  };
    },
    visitDocumentFragment({ kind, childNodes, position  }) {
      return { kind, position, childNodes: childNodes.map(child => child.accept(this))}
    },
    visitText({ kind, nodeValue, position  }) {
      return { kind, nodeValue, position  };
    },
    visitElement({ kind, attributes, childNodes, position  }) {
      return { kind, position, attribute: attributes.map(attribute => attribute.accept(this)), childNodes: childNodes.map(child => child.accept(this)) };
    }
  })
}

export function deserializeMarkupExpression(data: any): MarkupExpression {
  switch(data.kind) {
    case MarkupExpressionKind.ATTRIBUTE: return new MarkupAttributeExpression(data.name, data.value, data.position);
    case MarkupExpressionKind.COMMENT: return new MarkupCommentExpression(data.nodeValue, data.position);
    case MarkupExpressionKind.TEXT: return new MarkupTextExpression(data.nodeValue, data.position);
    case MarkupExpressionKind.FRAGMENT: return new MarkupFragmentExpression(data.childNodes.map(deserializeMarkupExpression), data.position);
    case MarkupExpressionKind.ELEMENT: return new MarkupElementExpression(data.nodeName, data.attributes.map(deserializeMarkupExpression), data.childNodes.map(deserializeMarkupExpression), data.position);
  }
}

export interface IMarkupValueNodeExpression extends IMarkupExpression {
  nodeValue: any;
}

export abstract class MarkupExpression extends BaseExpression implements IMarkupExpression {
  abstract readonly kind: MarkupExpressionKind;
  constructor(position: IRange) {
    super(position);
  }
  abstract accept(visitor: IMarkupExpressionVisitor);
  abstract clone();
}

export abstract class MarkupNodeExpression extends MarkupExpression {
  public parent: MarkupContainerExpression;
  constructor(public nodeName: string, position: IRange) {
    super(position);
  }
  abstract clone();
}

export abstract class MarkupContainerExpression extends MarkupNodeExpression {
  constructor(name: string, readonly childNodes: Array<MarkupNodeExpression>, position: IRange) {
    super(name, position);
    childNodes.forEach((child) => child.parent = this);
  }
  removeChild(child: MarkupNodeExpression) {
    const i = this.childNodes.indexOf(child);
    if (i !== -1) {
      child.parent = undefined;
      this.childNodes.splice(i, 1);
    }
  }
  appendChild(child: MarkupNodeExpression) {
    this.childNodes.push(child);
  }

  insertBefore(child: MarkupNodeExpression, referenceNode: MarkupNodeExpression) {
    const index = this.childNodes.indexOf(referenceNode);
    this.childNodes.splice(index, 0, child);
  }

  replaceChild(newChild: MarkupNodeExpression, oldChild: MarkupNodeExpression) {
    const index = this.childNodes.indexOf(oldChild);
    this.childNodes.splice(index, 1, newChild);
  }
}

export class MarkupFragmentExpression extends MarkupContainerExpression implements IMarkupExpression {
  readonly kind = MarkupExpressionKind.FRAGMENT;
  constructor(childNodes: Array<MarkupNodeExpression>, position: IRange) {
    super("#document-fragment", childNodes, position);
  }

  accept(visitor: IMarkupExpressionVisitor) {
    return visitor.visitDocumentFragment(this);
  }
  clone() {
    return new MarkupFragmentExpression(
      this.childNodes.map((child) => child.clone()),
      cloneRange(this.position)
    );
  }
}
/**
 * Markup
 */

export class MarkupElementExpression extends MarkupContainerExpression {
  readonly kind = MarkupExpressionKind.ELEMENT;
  constructor(
    name: string,
    readonly attributes: Array<MarkupAttributeExpression>,
    childNodes: Array<MarkupNodeExpression>,
    position: IRange) {
    super(name, childNodes, position);
    attributes.forEach((attribute) => attribute.parent = this);
  }
  getAttribute(name: string) {
    for (const attribute of this.attributes) {
      if (attribute.name === name) return attribute.value;
    }
  }
  setAttribute(name: string, value: string) {
    for (const attribute of this.attributes) {
      if (attribute.name === name) {
        attribute.value = value;
        return;
      }
    }
    this.attributes.push(new MarkupAttributeExpression(name, value, null));
  }
  removeAttribute(name: string) {
    for (let i = 0, n = this.attributes.length; i < n; i++) {
      const attribute = this.attributes[i];
      if (attribute.name === name) {
        this.attributes.splice(i, 1);
        return;
      }
    }
  }
  accept(visitor: IMarkupExpressionVisitor) {
    return visitor.visitElement(this);
  }
  clone() {
    return new MarkupElementExpression(
      this.nodeName,
      this.attributes.map((child) => child.clone()),
      this.childNodes.map((child) => child.clone()),
      cloneRange(this.position)
    );
  }
}

export class MarkupAttributeExpression extends MarkupExpression {
  readonly kind = MarkupExpressionKind.ATTRIBUTE;
  public parent: MarkupElementExpression;
  constructor(readonly name: string, public value: any, position: IRange) {
    super(position);
  }
  accept(visitor: IMarkupExpressionVisitor) {
    return visitor.visitAttribute(this);
  }
  clone() {
    return new MarkupAttributeExpression(this.name, this.value, cloneRange(this.position));
  }
}

export class MarkupTextExpression extends MarkupNodeExpression implements IMarkupValueNodeExpression {
  readonly kind = MarkupExpressionKind.TEXT;
  constructor(public nodeValue: string, position: IRange) {
    super("#text", position);
  }
  accept(visitor: IMarkupExpressionVisitor) {
    return visitor.visitText(this);
  }
  clone() {
    return new MarkupTextExpression(this.nodeValue, cloneRange(this.position));
  }
}

export class MarkupCommentExpression extends MarkupNodeExpression implements IMarkupValueNodeExpression {
  readonly kind = MarkupExpressionKind.COMMENT;
  constructor(public nodeValue: string, position: IRange) {
    super("#comment", position);
  }
  accept(visitor: IMarkupExpressionVisitor) {
    return visitor.visitComment(this);
  }
  clone() {
    return new MarkupCommentExpression(this.nodeValue, cloneRange(this.position));
  }
}

