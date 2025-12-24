import { _decorator, AudioClip, AudioSource, CCFloat, CCInteger, CircleCollider2D, Collider2D, Component, Contact2DType, director, instantiate, Label, Node, Prefab, RichText, UITransform, v2, v3, Vec3 } from 'cc';
import { Joystick } from './Joystick';
const { ccclass, property } = _decorator;

@ccclass('Head')
export class Head extends Component {

    //#region 预制件引用
    @property(Prefab)
    public bodyPrefab: Prefab = null;//蛇身预制体
    @property(Prefab)
    public foodPrefab: Prefab = null;//食物预制体
    //#endregion

    //#region 变量
    @property(Array(Node))
    public bodyArray: Node[] = [];//蛇身体数组(包含蛇头)
    @property(CCInteger)
    bodyNum: number = 2;//初始蛇身数量
    @property(CCFloat)
    bodyDistance: number = 50;//蛇身之间的距离
    speed: number = 200;//蛇移动速度
    @property(Vec3)
    snakeDir: Vec3;//蛇头的方向
    previousMoveDir:Vec3//保存上一帧的移动方向
    @property(Number)
    Score:number=0;
    @property(AudioClip)
    public eatSound:AudioClip=null;
    @property(AudioClip)
    public DieSound:AudioClip=null; 
    //#endregion

    //#region UI
    @property(RichText)
    public txt_Score:RichText=null;
    @property(Node)
    public startPanel:Node=null;
    @property(Node)
    public gameOverPanel:Node=null;
    @property(Node)
    public joystick: Node = null;
    //#endregion



    protected onLoad(): void {
        
        this.previousMoveDir=this.node.position.clone().normalize();
        this.bodyArray.push(this.node);
        this.rotateHead(this.node.position);

        for (let i = 1; i <= this.bodyNum; i++) {
            this.getNewBody();
        }
        this.node.setPosition(this.randomPos());
    }
    start() {
        if(!director.isPaused()){
            director.pause();
        }
        this.schedule(function() {
        this.moveBody()
        },0.2);
        this.node.parent.addChild(instantiate(this.foodPrefab));
        let collider=this.node.getComponent(Collider2D);
        collider.on(Contact2DType.BEGIN_CONTACT,this.onBeginContact,this);
    }
    update(deltaTime: number) {
        this.snakeDir = this.joystick.getComponent(Joystick).dir.normalize();
        if(this.snakeDir.length()==0){
            this.snakeDir=this.previousMoveDir.clone().normalize();
        }else{
            this.node.angle=this.joystick.getComponent(Joystick).calculateAngle()-90;
            this.previousMoveDir=this.snakeDir;
        }
        let newPos = this.node.position.clone().add(this.snakeDir.clone().multiplyScalar(this.speed * deltaTime));
        this.node.setPosition(newPos);
    }
    //初始化蛇身和增加蛇身的方法
    getNewBody() {
        let newBody = instantiate(this.bodyPrefab);

        //如果蛇身为1（只有蛇头的时候）
        if (this.bodyArray.length<3) {
            let dir = this.node.position.clone().normalize();
            newBody.setPosition(this.node.position.clone().subtract(dir.multiplyScalar(this.bodyDistance)));
        }
        else {
            let lastBody = this.bodyArray[this.bodyArray.length - 1];
            let lastBoBody = this.bodyArray[this.bodyArray.length - 2];
            let dir = lastBoBody.position.clone().subtract(lastBody.position).normalize();
            newBody.setPosition(lastBody.position.clone().subtract(dir.multiplyScalar(this.bodyDistance)));
            newBody.getComponent(CircleCollider2D).group=16;
        }
        //将实例化的新蛇身放入canvas画布
        this.node.parent.addChild(newBody);
        //将新蛇身放入数组
        this.bodyArray.push(newBody);
        this.changZIndex();

    }
    moveBody() {
        let headPos = this.node.position;//保存蛇头移动前的位置
        for (let i = this.bodyArray.length - 2; i >= 0; i--) {//从后往前开始遍历移动蛇身
            this.bodyArray[i + 1].position = this.bodyArray[i].position//每一个蛇身都移动到它前面一个节点的位置
        }
        this.bodyArray[1].position = headPos;
    }

    //旋转蛇头的方法
    rotateHead(headPos) {
        let angle = v2(1, 0).signAngle(headPos) * 180 / Math.PI;
        this.node.angle = angle - 90;
    }
    //随机蛇生成的位置
    randomPos() {
        let width = this.node.parent.getComponent(UITransform).contentSize.width - 200;
        let height = this.node.parent.getComponent(UITransform).contentSize.height - 200;
        let x = Math.round(Math.random() * width) - width / 2;
        let y = Math.round(Math.random() * height) - height / 2;
        return v3(x, y, 0);
    }
    changZIndex(){
        let lastIndex=this.node.parent.children.length-1
        for(let i=0;i<this.bodyArray.length;i++){
            this.bodyArray[i].setSiblingIndex(lastIndex-i);
        }
    }
  
    startGame(){
        if(director.isPaused){
            director.resume();
        }
        this.startPanel.active=false;
    }
    restartGame(){
        director.resume();
        director.loadScene("scene1");
    }
    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D) {
        // 只在两个碰撞体开始接触时被调用一次
        if(otherCollider.group==4){
            otherCollider.node.removeFromParent();
            this.Score++;
            //右上角得分显示
            this.txt_Score.string="<color=#000000>"+this.Score.toString()+"</color>";
            //产生食物
            let newFood=instantiate(this.foodPrefab);
            this.node.parent.addChild(newFood);
            //更新身体
            this.getNewBody();
            this.node.getComponent(AudioSource).playOneShot(this.eatSound);
        }
        if(otherCollider.group==8||otherCollider.group==16){
            this.gameOverPanel.active=true;
            this.gameOverPanel.getChildByName("Txt_Score").getComponent(Label).string="得分:"+this.Score.toString();
            this.node.getComponent(AudioSource).playOneShot(this.DieSound);
            director.pause();
        }
    }


}