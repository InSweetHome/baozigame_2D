import { _decorator, Component, Input, input, instantiate, Node, Prefab, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('player')
export class player extends Component {

    // 箭矢预制体绑定
    @property(Prefab)
    Arrow_Prefab: Prefab = null
    // 箭矢节点的父节点
    @property(Node)
    Arrow_Parent: Node = null
    // 箭矢节点 实例化的时候赋值
    Arrow_Node: Node = null

    // 让箭靶节点旋转：先获取节点
    @property(Node)
    Target_Node: Node = null
    Target_Angel = 0 //箭靶初始角度

    @property
    Target_Speed = 5 //箭靶旋转速度
    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.Touch_Start, this)
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.Touch_Start, this)
    }

    Touch_Start(){
        // 每次触摸屏幕 都会生成一个新的箭矢并且平移到指定坐标。
        this.Arrow_Node = instantiate(this.Arrow_Prefab) // instantiate(预制体) 预制体实例化
        this.Arrow_Node.setParent(this.Arrow_Parent) //设置预制体的父节点
        // let World_pos = this.Arrow_Node.getWorldPosition()
        tween(this.Arrow_Node).to(0.1, {position: new Vec3(28, 67, 0)}).call(
            () =>{
                console.log("arrow1st pos = ", this.Arrow_Node.position) // call都是在tween动画播放结束后执行 所以此时相对坐标就是终点的坐标(25, 80, 0)
                //let World_pos = this.Arrow_Node.getWorldPosition() // 世界坐标也是到达终点后的世界坐标
                //console.log("world pos2 = ", World_pos)
                this.Arrow_Node.setParent(this.Target_Node,true)
                // this.Arrow_Node.setWorldPosition(World_pos)
                // this.Arrow_Node.angle = -this.Target_Node.angle - 134
            }
        ).start() //箭矢平滑移动动画
    }

    start() {
        
    }

    update(deltaTime: number) {
        
        if(this.Target_Angel >= 360){this.Target_Angel = 0} //防止一直增加角度变成无穷大 设定角度范围
        this.Target_Angel += this.Target_Speed * deltaTime //帧时间补偿
        this.Target_Node.angle = this.Target_Angel
    }
}


