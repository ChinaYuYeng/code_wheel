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
        const run = () => {
            while(this.fulfilledQueue.length){
                this.fulfilledQueue.shift()(val)
            }
        }
        setTimeout(run,0)
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

