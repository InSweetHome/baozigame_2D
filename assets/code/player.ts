import { _decorator, Collider2D, Component, Contact2DType, director, Director, Input, input, instantiate, Label, Node, Prefab, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('player')
export class player extends Component {

    // 示例节点
    @property(Node)
    Exam_Arrow: Node = null
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
    Is_Turn = true // 箭靶是否旋转
    @property
    Target_Speed = 5 //箭靶旋转速度

    Score:number = 0
    Total_count = 20
    Goal: number = 20

    // 提示框
    @property(Node)
    Tips: Node = null
    @property(Label)
    Tips_Label: Label = null
    @property(Label)
    Goal_Label: Label = null
    @property(Label)
    Score_Label: Label = null
    Is_Ture_Scroe = true // 更新开关 避免第五根箭碰到了也计分

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.Touch_Start, this)
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.Touch_Start, this)
    }

    Touch_Start(){
        // 每次触摸屏幕 都会生成一个新的箭矢并且平移到指定坐标。
        this.Exam_Arrow.active = false
        const Arrow_Node = instantiate(this.Arrow_Prefab) // instantiate(预制体) 预制体实例化
        Arrow_Node.setParent(this.Arrow_Parent) //设置预制体的父节点
        Arrow_Node.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.Arrow_Colide, this) // 箭矢生成后开始监听是否有碰撞
        tween(Arrow_Node).to(0.3, {position: new Vec3(25, 80, 0)}).call(
            () =>{// .call都是在箭矢粘在箭靶后发生的事情
                Arrow_Node.getComponent(Collider2D).off(Contact2DType.BEGIN_CONTACT, this.Arrow_Colide, this); //当箭矢粘在箭靶上后，表明发射成功，就不需要监听了，注销。
                Arrow_Node.setParent(this.Target_Node, true) // 箭矢粘住箭靶后需要跟着箭靶一起旋转
                if(this.Is_Ture_Scroe){this.Get_Score() // 计分}
                if(this.Score == this.Goal){
                    this.Tips_UI(true) // 5分就成功
                }
                this.Exam_Arrow.active = true
            }
        }
        ).start() //箭矢平滑移动动画
    }

    Get_Score(){
        // 分数改变
        this.Score++ //分数增加
        this.Total_count--
        this.Score_Label.string = "Score: " + this.Score
        this.Goal_Label.string = "目标 : 射中" + this.Total_count + "个"
    }

    Arrow_Colide(){
        //箭矢碰撞触发执行函数
        this.Is_Ture_Scroe = false // 碰到了就不计分
        this.Tips_UI(false) // 成功失败判断
    }

    Tips_UI(a){
        this.Tips.active = true // 失败提示框
        this.Is_Turn = false // 箭靶停止移动
        if(!a){
            console.log("失败")
            this.Tips_Label.string = "失败!"
        }else{
            console.log("成功")
            this.Tips_Label.string = "成功!"
        }
        input.off(Input.EventType.TOUCH_START, this.Touch_Start, this) //注销触碰生成箭矢事件 游戏失败不再生成新箭矢
    }

    Restart(){
        // 按钮触发执行函数
        console.log("重新开始")
        director.loadScene("C1")
    }

    start() {
        this.Exam_Arrow.active = true
        this.Score_Label.string = "Score: " + this.Score //初始化 游戏一开始就显示
        this.Goal_Label.string = "目标 : 射中" + this.Total_count + "个"
    }

    update(deltaTime: number) {
        if(!this.Is_Turn){return} // 箭靶停止移动
        if(this.Target_Angel >= 360){this.Target_Angel = 0} //防止一直增加角度变成无穷大 设定角度范围
        this.Target_Angel += this.Target_Speed * deltaTime //帧时间补偿
        this.Target_Node.angle = this.Target_Angel
    }
}


