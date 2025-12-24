import { _decorator, Color, color, Component, Node, Sprite, UITransform, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Food')
export class Food extends Component {
    
    start() {
        this.node.getComponent(Sprite).color=this.randomColor();
        this.node.setPosition(this.randomPos());
    }

    update(deltaTime: number) {
        
    }
    randomColor(){
        let red=Math.round(Math.random()*255);
        let green=Math.round(Math.random()*255);
        let blue=Math.round(Math.random()*255);

        return new Color(red,green,blue);
    }
    randomPos() {
        let width = this.node.parent.getComponent(UITransform).contentSize.width-200;
        let height = this.node.parent.getComponent(UITransform).contentSize.height-200;
        let x=Math.round(Math.random()*width)-width/2;
        let y=Math.round(Math.random()*height)-height/2;
        return v3(x,y,0);
    }
}


