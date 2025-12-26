import {
  _decorator,
  Animation,
  animation,
  AudioClip,
  Collider2D,
  Component,
  Contact2DType,
  Input,
  input,
  IPhysics2DContact,
  Node,
  RigidBody2D,
  SkelAnimDataHub,
  Vec2,
  Vec3,
} from "cc";
import { Tags } from "./Tags";
import { GameManager } from "./GameManager";
import { AudioMgr } from "./AudioMgr";
const { ccclass, property } = _decorator;

@ccclass("Bird")
export class Bird extends Component {
  private rgd2D: RigidBody2D = null;

  @property
  rotateSpeed: number = 30;

  @property(AudioClip)
  clickAudio: AudioClip = null;

  private _canControl: boolean = false;

  onLoad() {
    input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);

    // 注册单个碰撞体的回调函数
    let collider = this.getComponent(Collider2D);
    if (collider) {
      collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    this.rgd2D = this.getComponent(RigidBody2D);
  }

  onDestroy() {
    input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);

    let collider = this.getComponent(Collider2D);
    if (collider) {
      collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
      collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
  }

  onTouchStart() {
    // 点击一下向上跳10
    if (this._canControl == false) return;
    this.rgd2D.linearVelocity = new Vec2(0, 10);
    // this.node.setRotationFromEuler(new Vec3(0,0,30));
    this.node.angle = 30;
    AudioMgr.inst.playOneShot(this.clickAudio);
  }

  protected update(dt: number): void {
    if (this._canControl == false) return;
    this.node.angle -= this.rotateSpeed * dt;
    if (this.node.angle < -60) {
      this.node.angle = -60;
    }
  }

  public enableControl() {
    this.getComponent(Animation).enabled = true;
    this.rgd2D.enabled = true;
    this._canControl = true;
  }
  public disableControl() {
    this.getComponent(Animation).enabled = false;
    this.rgd2D.enabled = false;
    this._canControl = false;
  }
  public disableControlNotRGD() {
    this.getComponent(Animation).enabled = false;
    this._canControl = false;
  }

  onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    console.log(otherCollider.tag);
    if (otherCollider.tag === Tags.LAND || otherCollider.tag === Tags.PIPE) {
      GameManager.inst().transitionToGameOverState();
    }
  }
  onEndContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    if (otherCollider.tag === Tags.PIPE_MIDDLE) {
      GameManager.inst().addScore();
    }
  }
}
