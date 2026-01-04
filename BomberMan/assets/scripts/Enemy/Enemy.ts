import {
  _decorator,
  Component,
  Collider2D,
  Contact2DType,
  IPhysics2DContact,
  RigidBody2D,
  Animation,
} from "cc";
import { Fire } from "../Fire";
const { ccclass, property } = _decorator;

@ccclass("Enemy")
export class Enemy extends Component {
  @property
  speed: number = 40;

  protected _rb: RigidBody2D | null = null;
  protected _anim: Animation | null = null;
  protected _collider: Collider2D | null = null;
  protected _isDead: boolean = false;

  start() {
    this._rb = this.getComponent(RigidBody2D);
    this._anim = this.getComponent(Animation);
    this._collider = this.getComponent(Collider2D);

    if (this._collider) {
      this._collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }
  }

  onDestroy() {
    if (this._collider) {
      this._collider.off(
        Contact2DType.BEGIN_CONTACT,
        this.onBeginContact,
        this
      );
    }
  }

  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    if (this._isDead) return;

    // Die if hit by Fire
    if (otherCollider.getComponent(Fire)) {
      this.die();
    }
  }

  protected die() {
    if (this._isDead) return;
    this._isDead = true;
    console.log(`${this.node.name} died`);

    // Disable physics
    if (this._collider) this._collider.enabled = false;
    if (this._rb)
      this._rb.linearVelocity = Object.freeze({ x: 0, y: 0 }) as any; // Stop moving

    // Play death animation if exists, or just destroy
    // For now, let's assume specific enemies override this or we just destroy
    this.node.destroy();
  }
}
