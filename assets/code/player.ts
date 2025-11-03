import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('player')
export class player extends Component {


    // 让箭靶节点旋转：先获取节点
    @property(Node)
    Target_Node: Node = null
    Target_Angel = 0 //箭靶初始角度

    @property
    Target_Speed = 5 //箭靶旋转速度
    start() {

    }

    update(deltaTime: number) {
        
        if(this.Target_Angel >= 360){this.Target_Angel = 0} //防止一直增加角度变成无穷大 设定角度范围
        this.Target_Angel += this.Target_Speed * deltaTime //帧时间补偿
        this.Target_Node.angle = this.Target_Angel
    }
}


