import {
  _decorator,
  Component,
  director,
  Label,
  Color,
  Input,
  input,
  EventKeyboard,
  KeyCode,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Menu")
export class Menu extends Component {
  @property(Label)
  startLabel: Label | null = null;

  @property(Label)
  continueLabel: Label | null = null;

  private _isStartSelected: boolean = true;

  start() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    this.updateColors();
  }

  onDestroy() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
      case KeyCode.KEY_A:
      case KeyCode.ARROW_LEFT:
      case KeyCode.KEY_D:
      case KeyCode.ARROW_RIGHT:
        this._isStartSelected = !this._isStartSelected;
        this.updateColors();
        break;
      case KeyCode.ENTER:
        if (this._isStartSelected) {
          this.startGame();
        } else {
          console.log("Continue selected (not implemented yet)");
        }
        break;
    }
  }

  updateColors() {
    const selectedColor = new Color(255, 0, 0, 255); // Red
    const normalColor = new Color(255, 255, 255, 255); // White

    if (this.startLabel) {
      this.startLabel.color = this._isStartSelected
        ? selectedColor
        : normalColor;
    }
    if (this.continueLabel) {
      this.continueLabel.color = this._isStartSelected
        ? normalColor
        : selectedColor;
    }
  }

  startGame() {
    director.loadScene("area");
  }
}
