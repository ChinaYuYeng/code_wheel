//在编程语言中，作用域一般可以分为四类：块级作用域、函数作用域、动态作用域、词法作用域（也称静态作用域).而javascript只有函数作用域和静态作用域，es6加入了筷级作用域
//javascript在解析的时候进行了代码执行前的预处理，也就是创建词法环境LE（静态作用域），多个静态作用域就是js的作用域链
/**
 * 词法环境就是描述环境的对象，主要包含两个部分:

   环境记录(Environment Record)
      记录相应环境中的形参，函数声明，变量声明等

   对外部环境的引用(out reference)

   初始化词法环境顺序
    先确定当前环境的外部引用(函数环境与该函数的scope属性有关)

    在执行全局代码或者函数代码之前,先扫描相应环境中的形参,函数声明,变量声明并将其记录在环境记录中(Environment Record)

    全局代码执行前,先初始化全局环境

    函数代码执行前,先初始化函数环境
 */
//作用域和this指代的上下文是2回事，他们不是同一个东西，具体可以看另一篇this的内容
//window很特殊既可以是this的指代的上下文顶层，又可以是作用域的顶层

var x = 10;
function foo(y){
    var z = 30;
    function bar(q){
        return x + y + z + q;
    }
    return bar;
}
var bar = foo(20);
bar(40);
//foo()函数在执行之前会进行foo环境的环境初始化
//先设置foo环境的外部引用(通过foo()函数的scope属性)
//将形参y:20,z:undefined记录在环境记录中
//在初始化环境记录遇到函数声明时会创建一个内部函数对象,这个函数对象有一个scope属性指向函数声明所在的环境,如在该代码示例中,
//扫描到bar()函数声明时会在foo environment中创建一个内部函数对象,其scope属性指向bar()函数声明所在的foo environment,
//重要的一点是:当开始执行bar()函数前初始化bar()函数的环境时,就把bar()函数的scope属性指向的foo environment 赋值给bar环境的out reference作为其外部引用
//图示./scope.jpg


/**
 * 变量提升，函数提升，同名冲突
 * 
 *  
 * 
 */

console.log(a); //undefined 变量提升的结果
console.log(b); //报错
console.log(c); //方法定义，声明方法提升
console.log(d);//undefined,变量提升
var a = 1;
b = 2;
function c(){
    console.log('c');
}

var d = function(){
   console.log('d');
}

/**
 * LE{
    a:undefined
    没有b
    c:对函数的一个引用
    d:undefined
}
 */


function f(a,b){
    alert(a);
    alert(b);
    
    var b = 100;
    function a(){}
}
f(1,2);

/**
 * a和b名字冲突并且伴有提升，函数优先级高覆盖之前的，变量忽略之后的,处理函数声明有冲突时，会覆盖；处理变量声明有冲突时，会忽略
 * LE{
    b:2
    a:指向函数的引用
    arguments：2
}
 */

function f(){
    alert(x);
}
// f [[scope]]  == LE ==  window
//创建一个作用域对象f [[scope]]，它等于创建它时候的词法环境LE（据前面的知识我们又可以知道此时的词法环境等于window）

function f1(){
        //在词法解析阶段，就已经确定了相关的作用域。作用域还会形成一个相关的链条，我们称之为作用域链
    var x = 1;
    f(); //因此不会打印1
}


