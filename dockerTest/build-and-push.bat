@echo off
REM Docker 镜像构建和推送到阿里云容器镜像服务
REM 用于测试将 test.txt 上传到镜像

setlocal enabledelayedexpansion

REM 配置信息
set REGISTRY=crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com
set VPC_REGISTRY=crpi-ogg5x271gknfp2i7-vpc.cn-guangzhou.personal.cr.aliyuncs.com
set USERNAME=aliyun1982926158
set NAMESPACE=wyd_docker_hub
set IMAGE_NAME=my_test
set TAG=%1
if "%TAG%"=="" set TAG=latest

echo ========================================
echo Docker 镜像构建和推送脚本
echo ========================================

REM 1. 构建镜像
echo.
echo [1/4] 开始构建镜像...
docker build -t %IMAGE_NAME%:%TAG% .

if errorlevel 1 (
    echo 构建失败!
    exit /b 1
)

echo 构建成功!
echo 镜像: %IMAGE_NAME%:%TAG%

REM 获取镜像ID（ImageId）
for /f "tokens=3" %%i in ('docker images -q %IMAGE_NAME%:%TAG%') do set IMAGE_ID=%%i
echo 镜像ID (ImageId): %IMAGE_ID%
echo 提示: 在 docker tag 命令中，可以使用以下任一方式:
echo   1. 镜像ID: %IMAGE_ID%
echo   2. 镜像名称:标签: %IMAGE_NAME%:%TAG%

REM 2. 登录阿里云容器镜像服务
echo.
echo [2/4] 登录阿里云容器镜像服务...
echo 请输入密码:
docker login --username=%USERNAME% %REGISTRY%

if errorlevel 1 (
    echo 登录失败!
    exit /b 1
)

echo 登录成功!

REM 3. 打标签
echo.
echo [3/4] 为镜像打标签...

set FULL_IMAGE_NAME=%REGISTRY%/%NAMESPACE%/%IMAGE_NAME%:%TAG%
docker tag %IMAGE_NAME%:%TAG% %FULL_IMAGE_NAME%

echo 标签: %FULL_IMAGE_NAME%

REM 4. 推送镜像
echo.
echo [4/4] 推送镜像到阿里云容器镜像服务...
docker push %FULL_IMAGE_NAME%

if errorlevel 1 (
    echo 推送失败!
    exit /b 1
)

echo 推送成功!

REM 显示镜像信息
echo.
echo ========================================
echo 镜像信息:
echo 完整地址: %FULL_IMAGE_NAME%
echo 拉取命令: docker pull %FULL_IMAGE_NAME%
echo ========================================

REM 可选：验证文件是否在镜像中
echo.
echo 验证镜像中的 test.txt 文件...
docker run --rm %IMAGE_NAME%:%TAG% cat /app/test.txt

if errorlevel 1 (
    echo 验证失败，但镜像已推送
) else (
    echo 验证成功! test.txt 文件已成功包含在镜像中
)

