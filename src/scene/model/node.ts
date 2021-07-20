import { ReadonlyMat4 } from 'gl-matrix';
import { Camera } from './camera';
import { Mesh } from './mesh';
import { Transform } from './transform';

let nodeId = 1;

const tmpNodeList: Node[] = [];

/**
 * A node in the node hierarchy.
 */
export class Node {
  /** Updatable components. */
  public static readonly updatables: string[] = ['camera'];

  /** Updatable components to be post-updated after scene traversal. */
  public static readonly postUpdatables: string[] = [];

  /** Unique ID of the node. */
  public readonly id: number = nodeId++;

  /** Optional name of the node.  */
  public name?: string;

  /** Optional flag that, if true, prevents the node hierarchy from being rendered. */
  public hidden?: string;

  /** This node's transform. */
  public transform?: Transform;

  /** Optional camera attached to this node. */
  public camera?: Camera;

  /** Optional mesh attached to this node. */
  public mesh?: Mesh;

  /** Extra properties of this node. */
  [k: string]: unknown;

  /**
   * This node's children.
   * To append a child, set child's parent to this node.
   */
  public readonly children: readonly Node[] = [];

  /** This node's parent. */
  private _parent: Node | null = null;

  public constructor(
    /** This node's parent. */
    parent: Node | null = null,
    hasTransform = true
  ) {
    this.parent = parent;
    hasTransform && (this.transform = new Transform());
  }

  /** This node's parent. */
  public get parent(): Node | null {
    return this._parent;
  }

  /** Set this node's parent. */
  public set parent(parent: Node | null) {
    if (this._parent) {
      const children = this._parent.children as Node[];
      const thisIndex = children.indexOf(this);
      if (thisIndex >= 0) {
        // Swap with last element and pop
        children[thisIndex] = children[children.length - 1];
        children.pop();
      }
    }
    this._parent = parent;
    parent && (parent.children as Node[]).push(this);
  }

  /**
   * Traverse this node hierarchy.
   * @param callback function to call for each node. Return true from callback to stop traversing the children of a node.
   */
  public traverse(callback: (node: Node) => boolean | void): void {
    if (!callback(this)) {
      for (const node of this.children) {
        node.traverse(callback);
      }
    }
  }

  /**
   * Update the transforms of this node hierarchy.
   * @param callback function to call for each node. Return true from callback to stop traversing the children of a node.
   */
  public update(callback?: (node: Node) => boolean | void): void {
    // Traverse and update node hierarchy
    tmpNodeList.length = 0;
    this.traverse((node) => {
      node.transform?.updateModel(node.parent?.transform?.model);
      for (const component of Node.updatables) {
        (node[component] as UpdatableNodeComponent)?.updateModel(node?.transform?.model);
      }

      // Collect post-updated components to be be updated later
      for (const component of Node.postUpdatables) {
        if (node[component]) {
          tmpNodeList.push(node);
          break;
        }
      }

      return callback && callback(node);
    });

    // Post-update components and clear the tmp node list
    for (const node of tmpNodeList) {
      for (const component of Node.postUpdatables) {
        (node[component] as UpdatableNodeComponent)?.updateModel(node?.transform?.model);
      }
    }
    tmpNodeList.length = 0;
  }
}

/**
 * An updatable node component.
 */
export interface UpdatableNodeComponent {
  /**
   * Update the component from node model matrix.
   *
   * @param model model matrix to use. Defaults to the identity matrix.
   */
  updateModel(model?: ReadonlyMat4): void;
}
