//this 指向判断
//1、谁(必须是实例，window是特殊的实例由浏览器创建)调用这个方法，this就指向谁
//2、反过来，一个方法在没有明确的new关键字（或者字面量{}），call，apply改变this指向，那么方法在创建的时候都是指向window对象。this默认指向它
//如果在javascript语言里没有通过new（包括对象字面量定义）、call和apply改变函数的this指针，函数的this指针都是指向window的。

//test case

var name = "I am window";
global && (global.name =  'I am node envirment')
var obj = {
    name:"sharpxiajun",
    job:"Software",
    ftn01:function(obj){
        obj.show();
    },
    ftn02:function(ftn){
        ftn();
    },
    ftn03:function(ftn){
        ftn.call(this);
    },
    ftn04:function(){
        console.log(this.name)
    }
};

obj.ftn05 = function(){
    console.log(this.name)
}

obj.ftn06 = (function(){
    console.log('外层',this.name)
    return function(){
        console.log('内层',this.name)
    }
})()

obj.ftn07 = function(){
    "use strict"
    var a = function(){
        console.log(this.name)   
    }
    function b(){
        console.log(this.name)    
    }
    a()
    b()
}

obj.ftn08 = () => {
    console.log(this) //这个this，浏览器环境指向window，node指向{}不是global
    function a(){
        console.log(this.name)
    }
    a()
}

obj.ftn09 = function(){
    "use strict"
    var a = function(){
        console.log(this)   
    }
    function b(){
        console.log(this)    
    }
    a()
    b()
}

function Person(name){
    this.name = name;
    this.show = function(){
        console.log("姓名:" + this.name);
    }
}
var p = new Person("Person");
obj.ftn01(p);  //传对象，this是person
obj.ftn02(function(){  // 传方法不改变上下文，this是window
    // node 下undefined ，window下I am window
   console.log(this.name);
});
obj.ftn03(function(){ // 传方法改变上下文，this是obj
    console.log(this.name);
    // console.log(this);
})
obj.ftn04() //内部定义，this是obj

obj.ftn05() //外部定义，this是obj

obj.ftn06()//外层是window，内层是obj

obj.ftn07()//都是windows

obj.ftn08()

obj.ftn09() //严格模式下this不指向window
