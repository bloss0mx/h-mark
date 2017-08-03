# h-markdown
简单的markdown解释器
A simple markdown Interpreter

现在是第一个小小小版本，只初步实现了markdown的部分语法。
使用hmark()来实现解释，hmark() 传入两个参数，输入者textarea的id、输出者div的id。
函数自动获取输入的文本，解释成HTML代码，传入输出者div显示出排版后的内容。

It is the first edition,it can interpret part of markdown syntax.
hmark() is the core function of the interpreter with two parameters,first one is id of textarea,second one is the receiver's id.
hmark() will get original text automatically and interpret to html code,send to receiver.then the browser will make every thing done.
