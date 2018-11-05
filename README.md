# gamegoldwallet

#### 项目介绍

游戏金钱包

#### 版本要求

1.  node 8, cnpm
2.  python2.7,node-gyp
3.  Ioinic 3.19.2. Cordova 8.0.0

#### 安装说明

1.  全局安装 npm-run-all: npm i -g npm-run-all
2.  使用 git-bash:确保有 rm,cp 等命令. cmder 可在右下方选择{Bash}
3.  cnpm i
4.  如果出现:
    > Error: ENOENT: no such file or directory, scandir '\node_modules_node-sass@4.7.2@node-sass\vendor'
    > ,拷贝 bak 目录下文件至 node_modules 目录
5.  npm run start

### 环境切换

run-s e2e:update env:dev 切换到 dev

P.S.
e2e:update 时候下载 selenium 需要科学上网.

