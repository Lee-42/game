import {
  _decorator,
  Component,
  Node,
  Input,
  input,
  EventKeyboard,
  KeyCode,
  Animation,
  Vec3,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Robot")
export class Robot extends Component {
  @property
  speed: number = 200;

  private _anim: Animation | null = null;
  private _moveDir: Vec3 = new Vec3();

  // Map existing animations states
  // These strings must match the Animation Clip names in the Animation component
  private _animState = {
    idle: "idle",
    up: "walk-up",
    down: "walk-down",
    left: "walk-left",
    right: "walk-right",
  };

  private _curState: string = "";

  start() {
    this._anim = this.getComponent(Animation);

    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  onDestroy() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
  }

  onKeyDown(event: EventKeyboard) {
    console.log(event.keyCode);
    switch (event.keyCode) {
      case KeyCode.KEY_W:
        this._moveDir.y = 1;
        this._moveDir.x = 0;
        this.playAnim(this._animState.up);
        break;
      case KeyCode.KEY_S:
        this._moveDir.y = -1;
        this._moveDir.x = 0;
        this.playAnim(this._animState.down);
        break;
      case KeyCode.KEY_A:
        this._moveDir.x = -1;
        this._moveDir.y = 0;
        this.playAnim(this._animState.left);
        break;
      case KeyCode.KEY_D:
        this._moveDir.x = 1;
        this._moveDir.y = 0;
        this.playAnim(this._animState.right);
        break;
    }
  }

  onKeyUp(event: EventKeyboard) {
    switch (event.keyCode) {
      case KeyCode.KEY_W:
        if (this._moveDir.y === 1) this._moveDir.y = 0;
        break;
      case KeyCode.KEY_S:
        if (this._moveDir.y === -1) this._moveDir.y = 0;
        break;
      case KeyCode.KEY_A:
        if (this._moveDir.x === -1) this._moveDir.x = 0;
        break;
      case KeyCode.KEY_D:
        if (this._moveDir.x === 1) this._moveDir.x = 0;
        break;
    }

    if (this._moveDir.x === 0 && this._moveDir.y === 0) {
      this.stopAnim();
    } else {
      // Re-evaluate direction if one key lifted but another held
      if (this._moveDir.y > 0) this.playAnim(this._animState.up);
      else if (this._moveDir.y < 0) this.playAnim(this._animState.down);
      else if (this._moveDir.x < 0) this.playAnim(this._animState.left);
      else if (this._moveDir.x > 0) this.playAnim(this._animState.right);
    }
  }

  playAnim(name: string) {
    if (this._curState === name) return;
    if (this._anim) {
      this._anim.play(name);
      this._curState = name;
    }
  }

  stopAnim() {
    if (this._anim) {
      this._anim.stop();
      this._curState = "";
    }
  }

  update(deltaTime: number) {
    if (this._moveDir.equals(Vec3.ZERO)) return;

    const currentPos = this.node.position;
    this.node.setPosition(
      currentPos.x + this._moveDir.x * this.speed * deltaTime,
      currentPos.y + this._moveDir.y * this.speed * deltaTime,
      currentPos.z
    );
  }
}
