import { _decorator, Collider2D, Component, Contact2DType, director, Director, Input, input, instantiate, Label, Node, Prefab, tween, Vec3, resources, JsonAsset, Animation, AudioClip, AudioSource } from 'cc';
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

    Target_Speed = 45

    Score:number = 0
    Total_count = 0
    Goal: number = 0
    Speed = 0
    a = false // 默认
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
    level: number = 0 // 初始化 第0关

    @property(Animation) //获取动画组件
    Button_Animation: Animation = null

    // 导入音频资源 => 获取音频组件 => 指定音频资源 => 播放音频
    @property(AudioClip)
    Win: AudioClip = null
    @property(AudioClip)
    Colide: AudioClip = null

    @property(Node)
    Bg: Node = null!

    
    

    onLoad() {
        input.on(Input.EventType.TOUCH_START, this.Touch_Start, this)
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_START, this.Touch_Start, this)
    }

    Touch_Start(){
        
        const Arrow_Node = instantiate(this.Arrow_Prefab) // instantiate(预制体) 预制体实例化
        // 每次触摸屏幕 都会生成一个新的箭矢并且平移到指定坐标。
        this.Exam_Arrow.active = false
        Arrow_Node.setParent(this.Arrow_Parent) //设置预制体的父节点
        Arrow_Node.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.Arrow_Colide, this) // 箭矢生成后开始监听是否有碰撞
        tween(Arrow_Node).to(0.3, {position: new Vec3(25, 80, 0)}).call(
            () =>{// .call都是在箭矢粘在箭靶后发生的事情
                
                Arrow_Node.getComponent(Collider2D).off(Contact2DType.BEGIN_CONTACT, this.Arrow_Colide, this); //当箭矢粘在箭靶上后，表明发射成功，就不需要监听了，注销。
                Arrow_Node.setParent(this.Target_Node, true) // 箭矢粘住箭靶后需要跟着箭靶一起旋转
                if(this.Is_Ture_Scroe){
                this.Get_Score() // 计分
                this.Win_Audio_play() // 计分了才能播放
                if(this.Score == this.Goal){
                    this.a = true
                    input.off(Input.EventType.TOUCH_START, this.Touch_Start, this) //注销触碰生成箭矢事件 当前关卡结束或失败就不再生成新箭矢
                    this.Tips_UI(true) // 5分就成功
                }
                this.Exam_Arrow.active = true
                
            }
        }
        ).start() //箭矢平滑移动动画
    }


    BGM_control(b:boolean){
        const bgm = this.Bg.getComponent(AudioSource)
        if(b){
            bgm.loop = true
            bgm.play()
        }else{
            bgm.stop()
        }
    }

    // 射箭音效
    Win_Audio_play(){
        // 获取音频组件 => 指定音频资源 => 开始播放音频
        const Audio = this.node.getComponent(AudioSource) // 获取音频组件
        Audio.clip = this.Win // 指定音频资源
        Audio.play() // 开始播放音频

    }

    // 碰撞音效
    Colide_Audio_play(){
        // 获取音频组件 => 指定音频资源 => 开始播放音频
        const Audio = this.node.getComponent(AudioSource) // 获取音频组件
        Audio.clip = this.Colide // 指定音频资源
        Audio.play() // 开始播放音频

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
        
        input.off(Input.EventType.TOUCH_START, this.Touch_Start, this) //注销触碰生成箭矢事件 当前关卡结束或失败就不再生成新箭矢
        this.Is_Ture_Scroe = false // 碰到了就不计分
        this.Tips_UI(this.a) // 成功失败判断
    }

    Tips_UI(a:boolean){
        this.BGM_control(false)
        this.Tips.active = true // 提示框
        this.Button_Animation.play('button')
        this.Is_Turn = false // 箭靶停止移动
        if(!a){
            this.Colide_Audio_play()
            console.log("失败")
            this.Tips_Label.string = "失败!重新挑战"
        }else{
            console.log("成功")
            this.Tips_Label.string = "成功!进入下一关"
            this.level++
        }
        
    }

    Restart(){ 
        // 按钮触发执行函数
        console.log("进入下一关")
        this.Next_level(this.level) // 关卡失败后重新开始该关卡, 成功就进入下一关, 只需要一个按钮就可以了
    }

    Next_level(level:number ){ // 下一关按钮逻辑
        
        if(this.level>3){
            console.log("你可以看见神了")
            director.loadScene("God") //通关
        }else{this.initLevel(this.level) //进入下一关
            }
        this.Tips.active = false // 提示框关闭
        input.on(Input.EventType.TOUCH_START, this.Touch_Start, this) // 触碰逻辑要再次开启
    }

    

    initLevel(level:number){
        this.BGM_control(true)
        this.a = false
        this.Is_Ture_Scroe = true // 允许记分
        this.Exam_Arrow.active = true
        this.Is_Turn = true // 让箭靶重新移动
        this.Target_Node.removeAllChildren() // 移除所有箭矢
        this.Target_Angel = 0 // 箭靶调整回初始角度
        // 初始化关卡参数
        resources.load("configs/level", JsonAsset, (err, jsonAsset) => {
            if (err) {
                console.error("❌ 加载关卡配置失败：", err);
                return;
            }

            const levelData = jsonAsset.json; // 这里得到的就是 JSON 文件里的数组
            this.Target_Speed = levelData[level].Speed
            this.Goal = levelData[level].goal
            this.Total_count = levelData[level].total_count
            this.Score = 0 // 分数清0
            console.log("✅ 关卡配置加载成功：", levelData);

            this.Score_Label.string = "Score: " + this.Score
            this.Goal_Label.string = "目标 : 射中" + this.Total_count + "个"
            });
        
    }

    start() {
        this.initLevel(this.level)
    }

    update(deltaTime: number) {
        if(!this.Is_Turn){return} // 箭靶停止移动
        if(this.Target_Angel >= 360){this.Target_Angel = 0} //防止一直增加角度变成无穷大 设定角度范围
        this.Target_Angel += this.Target_Speed * deltaTime //帧时间补偿 
        this.Target_Node.angle = this.Target_Angel
        console.log("Speed: ", this.Target_Speed)
    }
}


