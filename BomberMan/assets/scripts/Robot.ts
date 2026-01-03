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
  RigidBody2D,
  Vec2,
  AudioSource,
  AudioClip,
} from "cc";
import { Area } from "./Area";
const { ccclass, property } = _decorator;

@ccclass("Robot")
export class Robot extends Component {
  @property
  speed: number = 200;

  @property
  maxBombs: number = 1;

  @property({ tooltip: "每秒播放多少次脚步声 (速率)" })
  stepsPerSecond: number = 3;

  @property(AudioClip)
  walkVerticalClip: AudioClip | null = null;

  private _anim: Animation | null = null;
  private _rb: RigidBody2D | null = null;
  private _audioSource: AudioSource | null = null;
  private _walkHorizontalClip: AudioClip | null = null;
  private _moveDir: Vec3 = new Vec3();
  private _area: Area | null = null;

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
    this._rb = this.getComponent(RigidBody2D);
    this._audioSource = this.getComponent(AudioSource);
    if (this._audioSource) {
      this._walkHorizontalClip = this._audioSource.clip;
    }

    // Attempt to find Area component on parent
    if (this.node.parent) {
      this._area = this.node.parent.getComponent(Area);
    }

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
      case KeyCode.KEY_J:
        if (this._area) {
          // Check if we can place bomb (logic for counts can be here or in Area)
          // For now just allow 1 per press if successfully placed
          this._area.spawnBomb(this.node.position);
        }
        break;
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

    if (this._audioSource) {
      let targetClip: AudioClip | null = null;
      if (name === this._animState.left || name === this._animState.right) {
        targetClip = this._walkHorizontalClip;
      } else if (name === this._animState.up || name === this._animState.down) {
        targetClip = this.walkVerticalClip;
      }

      if (targetClip) {
        // If switching clips or starting new playback
        if (this._audioSource.clip !== targetClip || !this._isWalkingAudioPlaying) {
          // Stop any existing loop or schedule
          this.stopAudioSchedule();

          this._audioSource.clip = targetClip;
          this._audioSource.loop = false; // Disable loop, we control timing manually

          // Play immediately for responsiveness
          this._audioSource.playOneShot(targetClip);

          // Schedule repeated playback
          const interval = 1 / this.stepsPerSecond;
          this.schedule(this.playWalkSound, interval);

          this._isWalkingAudioPlaying = true;
        }
      }
    }
  }

  private _isWalkingAudioPlaying: boolean = false;

  playWalkSound() {
    if (this._audioSource && this._audioSource.clip) {
      this._audioSource.playOneShot(this._audioSource.clip);
    }
  }

  stopAudioSchedule() {
    this.unschedule(this.playWalkSound);
    if (this._audioSource) {
      this._audioSource.stop();
    }
    this._isWalkingAudioPlaying = false;
  }

  stopAnim() {
    if (this._anim) {
      this._anim.stop();
      this._curState = "";
    }

    this.stopAudioSchedule();
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
