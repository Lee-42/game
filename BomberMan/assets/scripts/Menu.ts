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
  Node,
  UITransform,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Menu")
export class Menu extends Component {
  @property(Label)
  startLabel: Label | null = null;

  @property(Label)
  continueLabel: Label | null = null;

  @property(Node)
  arrow: Node | null = null;

  private _isStartSelected: boolean = true;

  start() {
    input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    this.updateSelection();
  }

  onDestroy() {
    input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
  }

  onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
      case KeyCode.ARROW_LEFT:
        this._isStartSelected = true;
        this.updateSelection();
        break;
      case KeyCode.ARROW_RIGHT:
        this._isStartSelected = false;
        this.updateSelection();
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

  updateSelection() {
    if (!this.arrow) return;

    let targetNode: Node | null = null;
    if (this._isStartSelected && this.startLabel) {
      targetNode = this.startLabel.node;
    } else if (!this._isStartSelected && this.continueLabel) {
      targetNode = this.continueLabel.node;
    }

    if (targetNode) {
      const transform = targetNode.getComponent(UITransform);
      const arrowTransform = this.arrow.getComponent(UITransform);
      
      if (transform && arrowTransform) {
        const targetWorldPos = targetNode.worldPosition;
        const targetSize = transform.contentSize;
        const targetAnchor = transform.anchorPoint;

        const offsetX = - (targetAnchor.x * targetSize.width);
        
        // Target World Left X
        const worldLeftX = targetWorldPos.x + offsetX;

        const arrowSize = arrowTransform.contentSize;
        const arrowAnchor = arrowTransform.anchorPoint;
        
        // Closer padding. Reduced from 10 to 0 or even negative if needed. 
        // Let's try 0 for "closer".
        const padding = -65;
        const arrowTargetX = worldLeftX - padding - (1 - arrowAnchor.x) * arrowSize.width;

        // Keep current Y and Z
        const currentPos = this.arrow.worldPosition;
        this.arrow.setWorldPosition(arrowTargetX, currentPos.y, currentPos.z);
      } else {
        // Fallback
        const currentPos = this.arrow.worldPosition;
        this.arrow.setWorldPosition(targetNode.worldPosition.x - 60, currentPos.y, currentPos.z);
      }
    }
  }

  startGame() {
    director.loadScene("game");
  }
}
