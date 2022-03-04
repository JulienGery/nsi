// import Complex from './node_modules/complex.js/complex.js';
// import Parser from './node_modules/expr-eval/dist/bundle.js';
const fs = require('fs')
const Complex = require('complex.js')
const Parser = require('expr-eval').Parser;
const parser = new Parser();
const PI = Math.PI;


function isEven(number) {
    if (number % 2 == 0) {
        return true
    }
    return false
}

function fft(a) {
    let tmp = []
    for (let k = 0; k <= a.length - 1; k++) {
        let buf = new Complex("0+0i")
        for (let m = 0; m <= a.length - 1; m++) {
            buf = buf.add(Complex({ phi: -2 * PI * ((m * k) / a.length), r: a[m] }))
        }
        tmp.push([buf.re,buf.im])
    }
    return tmp
}

function fftfreqEven(n, p, div) {
    let tmp = []
    for (let i = 0; i <= n / 2 - 1; i++) {
        tmp.push(parseFloat((i / div).toFixed(p)))
    }
    for (let i = n - tmp.length; i != 0; i--) {
        tmp.push(parseFloat((-i / div).toFixed(p)))
    }
    return tmp
}
function fftfreqOdd(n, p, div) {
    let tmp = []
    for (let i = 0; i <= (n - 1) / 2; i++) {
        tmp.push(parseFloat((i / div).toFixed(p)))
    }
    for (let i = n - tmp.length; i != 0; i--) {
        tmp.push(parseFloat((-i / div).toFixed(p)))
    }
    return tmp
}

function fftfreq(n, d = 1) {
    let div = n * d
    return isEven(n) ? fftfreqEven(n, precision(d), div) : fftfreqOdd(n, precision(d), div)
}

function myUnpack(a){
    let tmp = []
    let realTmp = []
    let imgTmp = []
    for (let i in a){
        tmp.push(a[i][0])
        realTmp.push(a[i][1][0])
        imgTmp.push(a[i][1][1])
    }
    return [tmp,realTmp,imgTmp]
}

function myPack(a,b){
    let tmp = []
    for(let i in a){
        tmp.push([a[i],b[i]])
    }
    tmp.sort(function(a, c){return a[0]-c[0]})
    return myUnpack(tmp)
}

function precision(n) {
    return (n % 1).toString().length
}

function arange(start, stop, step) {
    let tmp = [];
    let p = precision(step);
    for (let i = start; i < stop - step; i += step) {
        tmp.push(parseFloat(i.toFixed(p)));
    }
    return tmp;
}

function CreateSignal(signal, t, T1, T2) {
    let tmp = [];
    let conv = parser.parse(signal)
    for (let i in t) {
        tmp.push(conv.evaluate({PI: PI, T1: T1, T2: T2, t: t[i]}));
    }
    return tmp;
}

class Myfft{
    constructor(signal, T1, T2, dt){
        this.T1 = T1;
        this.T2 = T2;
        this.dt = dt;
        this.t = arange(0, T1 * T2, dt);
        this.signal = CreateSignal(signal, this.t, this.T1, this.T2);
        this.freq = fftfreq(this.signal.length, this.dt);
        [this.freqGraph, this.real, this.img] = myPack(this.freq, fft(this.signal));
    }
}

let myExpression = "2*cos(2*PI/T1*t) + sin(2*PI/T2*t)"
let test = new Myfft(myExpression, 2, 5, 0.03); //1: calcule 2: T1 3: T2 4: Δt 
//t = arange = nombre de 0 a T1*T2 avec un espacement de Δt



let myStr = "<!DOCTYPE html>\n<html>\n\n<head>\n\t<script src='https://cdn.jsdelivr.net/npm/chart.js'></script>\n\t<title>fft</title>\n\n</head>\n\n<body>\n\t<canvas id='mySignal'></canvas>\n\t<canvas id='myChart'></canvas>\n\n\t<script>\n\t\tlet myChart = document.getElementById('myChart').getContext('2d');\n\t\tlet mySignal = document.getElementById('mySignal').getContext('2d');\n\t\tlet signalChart = new Chart(mySignal, {\n\t\t\ttype: 'bar',\n\t\t\tdata: {\n\t\t\t\tlabels: ["+test.t.toString()+"],\n\t\t\tdatasets: [\n\t\t\t\t\t{\n\t\t\t\tlabel: 'signal',\n\t\t\t\tdata: ["+test.signal.toString()+"],\n\t\t\t\tborderColor: 'rgb(75, 192, 192)',\n\t\t\t\tbackgroundColor: 'rgb(75, 192, 192)',\n\t\t\t\toptions: {},\n}\n],\n},\n});\n\t\tlet massPopChart = new Chart(myChart, {\n\t\t\ttype: 'bar',\n\t\t\tdata: {\n\t\t\t\tlabels: ["+test.freqGraph.toString()+"],\n\t\t\t\tdatasets: [\n{\n\t\t\t\t\tlabel: 'real',\n\t\t\t\t\tdata: ["+test.real.toString()+"],\n\t\t\t\t\tborderColor: 'rgb(75, 192, 192)',\n\t\t\t\t\t\tbackgroundColor: 'rgb(75, 192, 192)',\n},\n{\t\t\t\t\tlabel: 'img',\n\t\t\t\t\tdata: ["+test.img.toString()+"],\n\t\t\t\t\tborderColor: '#0c8291',\n\t\t\t\t\tbackgroundColor: '#0c8291',\n}\n],\n},\n\t\t\toptions: {},\n});\n\t</script>\n</body>\n\n</html>"


fs.writeFile('./ftt.html', myStr, {flag: 'w+'}, err=>{
    if(err){
        console.error(err)
        return
    }
})
