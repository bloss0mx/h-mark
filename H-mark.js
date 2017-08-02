//公共参数：
var Index; //访问每个originElement，初始化时置0;
var originElement = Array(0); //内容按行分割
var lastOrigin; //上一次的内容
var definitions = new Array(0); //参考式定义

//使用方法：输入两个参数，输入者textarea的id、输出者div的id
//hmark('input','output');
function hmark(inputId, outputId) {
    //初始化
    Index = 0;
    var inputDom = document.getElementById(inputId);
    var outputDom = document.getElementById(outputId);
    var str = inputDom.value.replace(/\&/g, '&amp;').replace(/</g, '&lt;'); //.replace(/\n{2,}/g, '\n\n'); //转义
    originElement = str.replace(/\"/g, '&quot;').split(/\n/g); //分割
    str = null;
    //处理开始
    var test1 = new Div("div");
    outputDom.replaceChild(test1.process(), outputDom.firstChild);
    redefine(definitions, outputDom);
}
//重新定位参考式链接-----------------------
function redefine(definitions, ptOfRoot) {
    var elementArrayTmp = ptOfRoot.getElementsByTagName('a');
    var elementArray = new Array(0);
    for (var i = 0; i < elementArrayTmp.length; i++) {
        if (elementArrayTmp[i].getAttribute('class') == 'uLinks') {
            elementArray.push(elementArrayTmp[i]);
        }
    }
    if (definitions.length > 0) {
        for (var i = 0; i < elementArray.length; i++) {
            for (var j = 0; j < definitions.length; j++) {
                var _name = /\[[^\n<>\[\]]*\]/;
                var name = definitions[j].match(_name).toString().replace(/\[/, "").replace(/\]/, "");
                var href = definitions[j].match(/[a-zA-z]+:\/\/[^\s()]*/).toString().replace(/\[[^\n<>\[\]]*\]/, '');
                if (name == elementArray[i].firstChild.nodeValue) {
                    elementArray[i].setAttribute("href", href);
                }
            }
        }
    }
    return ptOfRoot;
}
function Element(father) {
    this.children = Array(0); //子元素
    this.father = father;
}
Element.prototype = {
    MakeText: new Text(),
    tag: "div",
    process: function () {
        return this.check(this.make());
    },
    make: function () {
        var elm = document.createElement(this.tag);
        return elm;
    },
    check: function (elm) {
        var that = this;
        function running(func) {
            var runThis = new func(that);
            that.children.push(runThis);
            elm.appendChild(runThis.process());
            //console.log(Index + ":" + runThis.tag);
        }
        do {
            if (Index >= originElement.length)
                break;
            if (originElement[Index].match(/^$/)) {
                Index++;
            }
            else if (originElement[Index].match(/^ {0,3}> /)) {
                running(Blockquote);
            }
            else if (originElement[Index].match(/^ {0,3}#{1,} /)) {
                running(H);
            }
            else if (originElement[Index].match(/^ {0,3}[-*+] /)) {
                running(Ul);
            }
            else if (originElement[Index].match(/^ {0,3}\d\. /)) {
                running(Ol);
            }
            else if (originElement[Index].match(/^ {0,3}```/)) {
                running(MultiCode);
            }
            else {
                running(P);
            }
        } while (true);
        return elm;
    }
};
function Div(father) {
    Element.call(this, father);
}
Div.prototype = new Element();
Div.prototype.tag = "div";
function MultiCode(father) {
    Element.call(this, father);
}
MultiCode.prototype = new Element();
MultiCode.prototype.tag = "pre";
MultiCode.prototype.check = function (elm) {
    var codeArray = Array(0);
    var tmp = "";
    var color = 0;
    var type = originElement[Index].replace(/`/g, "");
    do {
        Index++;
        if (Index >= originElement.length)
            break;
        if (originElement[Index].match(/^ {0,3}```/))
            break;
        codeArray.push(originElement[Index]);
    } while (true);
    for (var i = 0; i < codeArray.length; i++) {
        tmp = "<code>" + codeArray[i] + "</code>";
        elm.innerHTML += tmp;
    }
    Index++;
    return elm;
};
function H(father) {
    Element.call(this, father);
}
H.prototype = new Element();
H.prototype.tag = "h";
H.prototype.make = function () {
    var hCounter = originElement[Index].match(/#* /g);
    var hLength = hCounter[0].length - 1;
    this.tag = this.tag + hLength;
    var h = document.createElement(this.tag);
    h.innerHTML = this.MakeText.makeText().replace(/^ {0,3}#* /, "").replace(/#*$/, "");
    Index++;
    return h;
};
H.prototype.check = null;
H.prototype.process = function () {
    return this.make();
};
//暂时只做单行
function P(father) {
    Element.call(this, father);
} //内容块
P.prototype = new Element();
P.prototype.tag = "p";
P.prototype.check = function (elm) {
    do {
        var text = this.MakeText.makeText();
        elm.innerHTML += text;
        Index++;
        if (Index >= originElement.length)
            break;
        if (!originElement[Index].match(/^ {0,3}> |^ {0,3}[-*+] |^ {0,3}\d\. |^$|^ {0,3}#{1,} |^ {0,3}```/))
            elm.innerHTML += "<br>"; //下行不跳出
    } while (!originElement[Index].match(/^ {0,3}> |^ {0,3}[-*+] |^ {0,3}\d\. |^$|^ {0,3}#{1,} |^ {0,3}```/)); //跳出
    return elm;
};
function Blockquote(father) {
    Element.call(this, father);
}
Blockquote.prototype = new Div();
Blockquote.prototype.tag = "blockquote";
Blockquote.prototype.check = function (elm) {
    do {
        var text = this.MakeText.makeText();
        elm.innerHTML += text.replace(/^ {0,3}> /, "");
        elm.innerHTML += "<br>"; //NOTICE!
        Index++;
        if (Index >= originElement.length)
            break;
    } while (!originElement[Index].match(/^ {0,3}[-*+] |^ {0,3}\d\. |^$|^ {0,3}#{1,} |^ {0,3}```/));
    return elm;
};
function Ul(father) {
    Element.call(this, father);
}
Ul.prototype = new Blockquote();
Ul.prototype.li = new Li(); //共享的
Ul.prototype.tag = "ul";
Ul.prototype.makeLi = function (elm) {
    var li = document.createElement("li");
    var text = this.li.process();
    li.innerHTML = text.replace(/^ {0,3}\d\. |^ {0,3}[-*+] /, "");
    return li;
};
Ul.prototype.check = function (elm) {
    do {
        elm.appendChild(this.makeLi(elm));
        Index++;
        if (Index >= originElement.length)
            break;
    } while (!originElement[Index].match(/^ {0,3}> |^ {0,3}\d\. |^$|^ {0,3}#{1,} |^ {0,3}```/));
    return elm;
};
function Ol(father) {
    Element.call(this, father);
}
Ol.prototype = new Ul();
Ol.prototype.tag = "ol";
Ol.prototype.check = function (elm) {
    do {
        elm.appendChild(this.makeLi(elm));
        Index++;
        if (Index >= originElement.length)
            break;
    } while (!originElement[Index].match(/^ {0,3}> |^ {0,3}[-*+] |^$|^ {0,3}#{1,} |^ {0,3}```/));
    return elm;
};
function Li() { }
Li.prototype.MakeText = new Text();
Li.prototype.process = function () {
    var text = "";
    var tmp = "";
    do {
        tmp = this.MakeText.makeText();
        text += tmp;
        Index++;
        if (Index >= originElement.length)
            break;
        if (originElement[Index].match(/^ {0,3}> |^ {0,3}[-*+] |^ {0,3}\d\. |^$|^ {0,3}#{1,} |^ {0,3}```/)) {
            Index--;
            break;
        }
        text += "<br>";
    } while (true);
    return text;
};
function Text() {
    this.that = this;
    this.regExpurlTitle = /\[[^\n\[\!]*\]/g; //参考式链接的标题"[]"
    this.regExpurl = /[a-zA-z]+:\/\/[^\s()]*/g; //内含链接"http://www"
    this.regExpitalic = /\*[\S\s^\*]{1,}\*/g;
    this.regExpstrong = /\*\*[\S\s^\*\*]{1,}\*\*/g;
    this.regExptitleWithUrl = /\[[^\n]*\]\(\S{1,}\)/g; //带标题链接"[](http://www)"
    // this.regExptitleWithUrl = /\[[^\n\[]*\]\([a-zA-z]+:\/\/[^\s\[\)]*\)/g; //带标题链接"[](http://www)"
    this.regExpidWithUrl = /\[[^\n]*\]\:[a-zA-z]+:\/\/[^\s]*/g; //参考链接"[]:http://www"
    this.regExppicByUrl = /!\[[^\n\(]*\([^\n\(]*\)/g; //图片的链接"![]:http://www"
    this.regExppicAddWithUrl = /\[\!\[[^\n\[\(\)]*\]\([^\n\[\(\}]*\)\]\([a-zA-z]+:\/\/[^\s()]*\)/g; //"带图标的链接"[![]](http://www)"
    this.regExpnudeUrl = / [a-zA-z]+:\/\/[^\s()\>:]*/g; //显式链接" http://www"
    this.regExpsinglineCode = /`[^\n`]*`/g; //单行code"`xxx`"
}
Text.prototype.makeText = function () {
    return this.check();
    // return originElement[Index];
};
Text.prototype.check = function () {
    var str = originElement[Index];
    str = this.checkEachReg(str, this.regExpstrong, this.strong);
    str = this.checkEachReg(str, this.regExpitalic, this.ilalic);
    str = this.checkEachReg(str, this.regExppicAddWithUrl, this.picAddWithUrl);
    str = this.checkEachReg(str, this.regExppicByUrl, this.picByUrl);
    str = this.checkEachReg(str, this.regExptitleWithUrl, this.titleWithUrl);
    str = this.checkEachReg(str, this.regExpidWithUrl, this.idWithUrl);
    str = this.checkEachReg(str, this.regExpnudeUrl, this.nudeUrl);
    str = this.checkEachReg(str, this.regExpsinglineCode, this.singlineCode);
    str = this.checkEachReg(str, this.regExpurlTitle, this.urlTitle);
    return str;
};
Text.prototype.checkEachReg = function (str, regExp, processMethod) {
    var matches;
    var matchesArray = Array(0);
    var indexArray = Array(0);
    do {
        matches = regExp.exec(str);
        if (matches != null) {
            str = processMethod(str, matches[0], matches.index, this.reCombine);
        }
        else
            break;
    } while (true);
    return str;
};
Text.prototype.reCombine = function (origStr, matches, index, result) {
    var str = "";
    var left = origStr.slice(0, index);
    var right = origStr.slice(index + matches.length, origStr.length);
    str = left + result + right;
    return str;
};
////////////////////////////////////////////////////////////////////////////////////////////////////////
Text.prototype.urlTitle = function (str, matches, index, reCombine) {
    var result = matches.match(/\[[^\n\[\!]*\]/).toString().replace(/\[/, '').replace(/\]/, '');
    result = '<a class=\'uLinks\'>' + result + '</a>';
    return reCombine(str, matches, index, result);
};
Text.prototype.titleWithUrl = function (str, matches, index, reCombine) {
    var value = matches.match(/\[[^\n\!]*\]/).toString().replace(/\[/, '').replace(/\]/, '').replace(' ', "");
    var result = "\<a class=\"links\" href=" + matches.match(/\(\S{1,}\)/g).toString().replace(/\(/g, '').replace(/\)/g, '') + "\>" + value + "\</a\>";
    // console.log(result);
    return reCombine(str, matches, index, result);
};
Text.prototype.strong = function (str, matches, index, reCombine) {
    var result = matches.replace(/\*/g, "");
    result = "<strong>" + result + "</strong>";
    return reCombine(str, matches, index, result);
};
Text.prototype.ilalic = function (str, matches, index, reCombine) {
    var result = matches.replace(/\*/g, "");
    result = "<i>" + result + "</i>";
    return reCombine(str, matches, index, result);
};
Text.prototype.idWithUrl = function (str, matches, index, reCombine) {
    var value = matches.match(/\[[^\n\[\!]*\]/g).toString().replace(/\[/, '').replace(/\]/, '').replace(' ', "");
    var href = "[" + value + "]" + matches.match(/[a-zA-z]+:\/\/[^\s()]*/g);
    definitions.push(href);
    var result = "";
    return reCombine(str, matches, index, result);
};
Text.prototype.picByUrl = function (str, matches, index, reCombine) {
    var result = "\<img class=\"img\" src=" + matches.match(this.regExpurl).toString().replace(' ', "") + "\>";
    return reCombine(str, matches, index, result);
};
Text.prototype.picAddWithUrl = function (str, matches, index, reCombine) {
    // alert("picAddWithUrl")
    var address = matches.match(/[a-zA-z]+:\/\/[^\s()]*/g);
    var src = address[0].replace(' ', "");
    var href = address[1].replace(' ', "");
    var result = "\<a href=" + href + "\>" + "<img class=\"img\" src=" + src + "></a>";
    return reCombine(str, matches, index, result);
};
Text.prototype.nudeUrl = function (str, matches, index, reCombine) {
    var result = matches.replace(/ /g, "");
    result = "<a class=\"links\" href=\"" + result + "\">" + result + "</a>";
    return reCombine(str, matches, index, result);
};
Text.prototype.singlineCode = function (str, matches, index, reCombine) {
    var result = matches.replace(/\`/g, '').replace(' ', "");
    result = "\<code class=\"single\"\>" + result + "\</code\>";
    return reCombine(str, matches, index, result);
};
