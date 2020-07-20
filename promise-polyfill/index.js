const isFunction = f => typeof f === 'function'
const PENDING = 'padding'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'
class myPromise {
    constructor(handler){
        this._status = PENDING
        this._value = null
        this.fulfilledQueue = []
        this.rejectedQueue = []
        if(isFunction(handler)){
            try {
                handler(this._resolve.bind(this),this._reject.bind(this))
            } catch (error) {
                this._reject(error)
            }
        }else {
            throw new Error('the first argument must be a function')
        }
    }

    _resolve(val){
        if(this._status !== PENDING) return
        this._status = FULFILLED
        this._value = val
        //封装成 回调队列 + 执行函数 的方式推入js事件循环机制下的microqueue（微任务队列）。这里没有直接能推入微任务队列，只能用settimeout方式推入宏任务队列
        const run = () => {
            while(this.fulfilledQueue.length){
                this.fulfilledQueue.shift()(val)
            }
        }
        setTimeout(run,0) //下一个tick执行的好处，一，完全结束resolve方法，如果同步的话执行过程长度不可控。二、Promise.resolve()的时候也会给与.then方法注册回调函数的时间
    }

    _reject(val){
        if(this._status !== PENDING) return
        this._status = REJECTED
        this._value = val
        const run = () => {
            while(this.rejectedQueue.length){
                this.rejectedQueue.shift()(val)
            }
        }
        setTimeout(run,0)
    }

    then(onresolve,onreject){
        return new myPromise((resolve,reject) => {
            //封装用户的回调函数，判断函数返回结果，使用不同的处理方式
            const resolved = value => {
                if(!isFunction(onresolve)){
                    resolve(value)
                    return
                }

                let res = null
                try {
                    res = onresolve(value)
                } catch (error) {
                    reject(error)
                }
                //调用下一个promise，使then生成的promise链，可以依次被执行
                if(res instanceof myPromise){
                    res.then(resolve,reject)
                }else{
                    resolve(res)
                }
            }

            const rejected = value=> {
                if(!isFunction(onreject)){
                    reject(value)
                    return
                }
                let res = null
                try {
                    res = onreject(value)
                } catch (error) {
                    reject(error)
                }
                if(res instanceof myPromise){
                    res.then(resolve,reject)
                }else{
                    reject(res)
                }
            }

            switch (this._status) {
                case PENDING:
                    this.fulfilledQueue.push(resolved)
                    this.rejectedQueue.push(rejected)
                    break;

                case FULFILLED:
                    resolved(this._value)
                    break;
                
                case REJECTED:
                    rejected(this._value)
                    break;
            }
        })
    }

    catch(onreject){
        return this.then(null,onreject)
    }

    finally(callback){
        this.then(res => {
            callback(res)
        },err => {
            callback(err)
        })
    }

    static resolve(value){
        if(value instanceof myPromise){
            return value
        }else if (isFunction(value)){
            return new myPromise(value)
        }else {
            return new myPromise((resolve,reject) => {
                resolve(value)
            })
        }
    }

    static reject(value){
        if(value instanceof myPromise){
            return value
        }else if (isFunction(value)){
            return new myPromise(value)
        }else {
            return new myPromise((resolve,reject) => {
                reject(value)
            })
        }
    }

    static all(promises){
        return new myPromise((resolve,reject) => {
            let count = 1
            let result = []
            promises.forEach((p,i) => {
                this.resolve(p).then(res => {
                    count++;
                    result[i] = res
                    if(count == promises.length) resolve(result)
                }).catch(err => {
                    reject(err)
                })
            })
        })
    }

    static race(promises){
        return new myPromise((resolve,reject) => {
            promises.forEach(p => {
                this.resolve(p).then(res=>{
                    resolve(res) 
                }).catch(err => {
                    reject(err)
                })
            })
        })
    }
}


//test case
new myPromise(function(resolve,reject){
    setTimeout(() => {
        resolve('uiuii')
    }, 1000);
}).then(val=>{
    return myPromise.resolve(resolve => {
        setTimeout(() => {
            resolve(val)
        }, 1000);
    })
}).then(val=>{
    console.log(val)
}).then(val=>{
    console.log(ttt)
}).catch(err=>{
    return new myPromise(function(resolve,reject){
        setTimeout(() => {
            console.log(err) 
            resolve(err)    
        }, 1000);
    })
}).then(res=>{
    console.log(res)
})

let p1 = myPromise.resolve('1')
let p2 = myPromise.resolve('2')
let p3 = myPromise.resolve('3')
let p4 = myPromise.resolve('4')

myPromise.all([p1,p2,p4,p3]).then(res=>{
    console.log(res)
}).catch(err => {
    console.log(err)
})

myPromise.race([p1,p2,p3,p4]).then(res=>{
    console.log(jjj)
}).catch(err => {
    console.log(err,1)
    return err
}).then(res => {
    console.log(res)
}).catch(err => {
    console.log(err,2)
}).finally(function(){
    console.log('this is finally')
})


//执行顺序case
new Promise((resolve, reject) => {
    console.log("外部promise");
    resolve();
  })
    .then(() => {
      console.log("外部第一个then");
      return new Promise((resolve, reject) => {
        console.log("内部promise");
        resolve();
      })
      .then(() => {
      console.log("内部第一个then");
      })
      .then(() => {
      console.log("内部第二个then");
      });
    })
    .then(() => {
      console.log("外部第二个then");
    });


    /*
    外部promise
    外部第一个then
    内部promise
    内部第一个then
    内部第二个then
    外部第二个then
        //"外部promise"先执行是因为promise在实例化的时候就会调用传入的回调函数
        //"外部第二个then"最后执行是因为需要等待"内部第二个then"promise的返回结果
        new promise 和 then方法是同步代码，then方法是对用户回调函数的封装并且注册到该promise的回调队列，最后返回一个新的promise
        当promise的状态改变时,就会把他的回调队列的执行方法（一般是依次执行）推入到微任务队列（上面的源码只推入到宏任务队列）
    */

   new Promise((resolve, reject) => {
    console.log("外部promise");
    resolve();
  })
    .then(() => {
      console.log("外部第一个then");
      new Promise((resolve, reject) => {
        console.log("内部promise");
        resolve();
      })
        .then(() => {
          console.log("内部第一个then");
        })
        .then(() => {
          console.log("内部第二个then");
        });
    })
    .then(() => {
      console.log("外部第二个then");
    });

    /**
     * 外部promise
        外部第一个then
        内部promise
        内部第一个then
        外部第二个then
        内部第二个then
        
        "外部promise"被resolve，把他的回调队列执行方法推入微任务队列，微任务队列是不同步的，接着then方注册回调函数。"外部第一个then"被执行 接着"内部promise" 把"内部promise"的回调队列的执行函数推入微任务队列
        这时"外部第一个then"结束。"外部第二个then"的回调队列执行方法推入微任务队列。微任务队列依次执行。把"内部第二个then"的回调队列执行方法推入微任务队列，执行
     */

    new Promise((resolve, reject) => {
        console.log("外部promise");
        resolve();
      })
        .then(() => {
          console.log("外部第一个then");
          let p = new Promise((resolve, reject) => {
            console.log("内部promise");
            resolve();
          })
          p.then(() => {
              console.log("内部第一个then");
            })
          p.then(() => {
              console.log("内部第二个then");
            });
        })
        .then(() => {
          console.log("外部第二个then");
        });

/**
 * 外部promise
外部第一个then
内部promise
内部第一个then
内部第二个then
外部第二个then
内部1、2同时执行，是因为同在"内部promise"的回调队列中
 */