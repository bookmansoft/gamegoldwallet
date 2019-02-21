# gamegoldwallet

#### 项目介绍

游戏金钱包

#### 版本要求

1.  node 8, cnpm
2.  python2.7,node-gyp
3.  Ioinic 3.19.2. Cordova 8.0.0

#### 安装说明

#####【环境安装】

###### 一、预装软件，并配置好以下所有软件的环境变量，在任意目录下可用：

1、nodejs8，并保证npm -v /node -v.
2、git
3、python 2.7
4、JDK8；不能使用高版本的JDK11等。
5、Android SDK（在cmd 下执行Android会弹窗），并安装所需要的SDK包（在后续npm install中会有异常提示）。
6、安装gradle 4.1(并配置在PATH中，使得命令行可用)
6、cmder，后续安装步骤在cmder环境下进行。

###### 二、安装全局包

如果安装过程存在依赖关系，根据实际情况调整。
1、npm install -g windows-build-tools 包。（是node-gyp的基础）
2、npm install -g node-gyp（C++扩展包，被node-sass等包使用）
3、npm install -g node-sass
4、npm install -g cordova
5、npm install -g ionic（此步骤可能要指定版本ioinc3，需要确认；实际我的环境安装的是最高版本，且可用）
6、npm install -g npm-run-all（这个包用途不明，需要确认）

###### 三、安装

1、npm i
2、在执行过程中，如果有网络连接错误，需要多执行几次，并尽可能排查错误。
3、如果已经install到非常后面的步骤，并且能够npm start成功，则可以忽略最后一个错误。
4、原安装手册认为需要使用cnpm i 命令，但在实践中发现并不需要。如果npm包文件下载困难，可以考虑更换为淘宝的npm镜像源；并在步骤通过后适当时候切换回原始位置。

###### 四、启动

npm start

###### 五、打包

cordova platform add android 添加安卓平台
cordova build android（打包apk成文件下载，需删除电脑目录的文件）
cordova run android（启动手机调试模式后直接传递，需删除手机和电脑目录的文件）

--------------------------------------------------------------------------------

【错误处理】
error MSB4132: 无法识别工具版本“2.0”。可用的工具版本为 "4.0"
npm config set msvs_version 2012 --global	
