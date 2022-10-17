//这里只需要写加载哪些js即可，直接闭包方式
;(function(window){
    //获取IDM的加载队列最后一条信息
    var lastMdule;
    if(window.IDM&&window.IDM.module&&window.IDM.module.queue&&window.IDM.module.queue.moduleMain.length>0){
        lastMdule = window.IDM.module.queue.moduleMain[window.IDM.module.queue.moduleMain.length-1];
    }

    //代码包的内部代码路径，注意js的加载顺序，否则会找不到对象报错之类的问题
    var resource={
        js:{
            vendors:"js/chunk-vendors",
            index:"js/index",
        },
        css:["css/index","css/chunk-vendors"]
    },
    doc = document, config = {},
    //获取当前所在目录
    getPath = function(){
        var head = doc.getElementsByTagName('head')[0] || doc.head || doc.documentElement;
        var js = head.getElementsByTagName("script"), jsPath = js[js.length - 1].src;
        console.log(jsPath);
        if(lastMdule){
            jsPath = IDM.url.getWebPath("@"+lastMdule.codeSrc,"",lastMdule.projectNo);
        }
        
        return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
    }(),
    //异常提示
    error = function(msg){
        window.console && console.error && console.error('IDM hint: ' + msg);
    },
    isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]';

    config.resources = {}; //记录资源物理路径
    config.status = {}; //记录资源加载状态
    config.timeout = 10; //符合规范的资源请求最长等待秒数
    function loadjs(apps,rcallback){
        var that = this;
        if(rcallback){
            this.callback = rcallback;
        }
        apps = typeof apps === 'string' ? [apps] : apps;
        var dir = getPath;
        var head = doc.getElementsByTagName('head')[0];
        var item = apps[0], timeout = 0;
        if(apps.length === 0){
            return rcallback&&rcallback(this);
        }
        //加载模块
        var node = doc.createElement('script'), url =  dir + (resource.js[item] || item) + '.js';
        node.async = true;
        node.charset = 'utf-8';
        node.src = url;
        node.setAttribute('objectID', "IDM-Module-"+url);
        function onScriptLoad(e, url){
          var readyRegExp = navigator.platform === 'PLaySTATION 3' ? /^complete$/ : /^(complete|loaded)$/
          if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
            config.status[item] = true;
            config.resources[item] = url;
            head.removeChild(node);
            (function poll() {
              if(++timeout > config.timeout * 1000 / 4){
                onCallback(apps);
                return error(item +":"+url + ' is not a valid js');
              };
              config.status[item] ? onCallback(apps) : setTimeout(poll, 4);
            }());
          }
        }
        //首次加载
        if(!config.resources[item]){
            head.appendChild(node);
            if(node.attachEvent && !(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) && !isOpera){
                node.attachEvent('onreadystatechange', function(e){
                    onScriptLoad(e, url,item,apps,that);
                });
            } else {
                node.addEventListener('load', function(e){
                    onScriptLoad(e, url,item,apps,that);
                }, false);
            }
        } else {
            (function poll() {
            if(++timeout > config.timeout * 1000 / 4){
                onCallback(apps) 
                return error(item+":"+url + ' is not a valid js');
            };
            (typeof config.resources[item] === 'string' && config.status[item]) 
            ? onCallback(apps) 
            : setTimeout(poll, 4);
            }());
        }
        function onCallback(apps){
            apps.length > 1 ?
            loadjs(apps.slice(1), this.callback)
            : ( typeof this.callback === 'function' && this.callback.call(this) );
        }
        
        config.resources[item] = url;
        return that;
    }
    /**
     * 加载外部css
     * @param {*} src 
     * @param {*} reload 
     * @param {*} fun 
     */
    function loadcss(src,reload, fun){
        var head = document.getElementsByTagName('head')[0] || document.head || document.documentElement;
        
        var linkList = head.getElementsByTagName("link");
        var isExists = false;
        for (var index = 0; index < linkList.length; index++) {
            var element = linkList[index];
            if(element.getAttribute("objectID")=="IDM-Module-"+src){
                if(reload){
                    element.remove();
                }else{
                    isExists = true;
                }
            }
        }
        if(isExists){
            //存在则不再次加载css
            fun&&fun();
            return;
        }

        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('type', 'text/css');
        link.setAttribute('href', src);
        link.setAttribute('objectID', "IDM-Module-"+src);

        if (typeof fun === 'function') {
            if (window.attachEvent) {
                link.onreadystatechange = function () {
                    var r = link.readyState;
                    if (r === 'loaded' || r === 'complete') {
                        link.onreadystatechange = null;
                        fun();
                    }
                };
            } else {
                link.onload = fun;
            }
        }
        head.appendChild(link);
    }
    var jsArray= [];
    Object.keys(resource.js).forEach(function(key){
        jsArray.push(key)
    });
    loadjs(jsArray,function(){
        //js组件加载完成
        console.log("加载完成")
        if(lastMdule&&lastMdule.callback){
            lastMdule.callback.call(this,lastMdule)
        }
    });
    resource.css&&resource.css.forEach(function(item){
        var url = getPath + item + '.css';
        loadcss(url,false);
    })
})(window);