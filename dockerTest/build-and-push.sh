#!/bin/bash

# Docker 镜像构建和推送到阿里云容器镜像服务
# 用于测试将 test.txt 上传到镜像

# 配置信息
REGISTRY="crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com"
VPC_REGISTRY="crpi-ogg5x271gknfp2i7-vpc.cn-guangzhou.personal.cr.aliyuncs.com"
USERNAME="aliyun1982926158"
NAMESPACE="wyd_docker_hub"
IMAGE_NAME="my_test"
TAG=${1:-"latest"}  # 默认使用 latest 标签，可通过参数指定

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Docker 镜像构建和推送脚本${NC}"
echo -e "${BLUE}========================================${NC}"

# 1. 构建镜像
echo -e "\n${BLUE}[1/4] 开始构建镜像...${NC}"
docker build -t ${IMAGE_NAME}:${TAG} .

if [ $? -ne 0 ]; then
    echo -e "${RED}构建失败!${NC}"
    exit 1
fi

echo -e "${GREEN}构建成功!${NC}"
echo -e "${GREEN}镜像: ${IMAGE_NAME}:${TAG}${NC}"

# 获取镜像ID（ImageId）
IMAGE_ID=$(docker images -q ${IMAGE_NAME}:${TAG})
echo -e "${BLUE}镜像ID (ImageId): ${IMAGE_ID}${NC}"
echo -e "${YELLOW}提示: 在 docker tag 命令中，可以使用以下任一方式:${NC}"
echo -e "${YELLOW}  1. 镜像ID: ${IMAGE_ID}${NC}"
echo -e "${YELLOW}  2. 镜像名称:标签: ${IMAGE_NAME}:${TAG}${NC}"

# 2. 登录阿里云容器镜像服务
echo -e "\n${BLUE}[2/4] 登录阿里云容器镜像服务...${NC}"
echo -e "${YELLOW}请输入密码:${NC}"
docker login --username=${USERNAME} ${REGISTRY}

if [ $? -ne 0 ]; then
    echo -e "${RED}登录失败!${NC}"
    exit 1
fi

echo -e "${GREEN}登录成功!${NC}"

# 3. 打标签
echo -e "\n${BLUE}[3/4] 为镜像打标签...${NC}"

# 使用公网地址
FULL_IMAGE_NAME="${REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${TAG}"
docker tag ${IMAGE_NAME}:${TAG} ${FULL_IMAGE_NAME}

# 可选：同时打 VPC 地址标签（如果在内网环境）
# VPC_IMAGE_NAME="${VPC_REGISTRY}/${NAMESPACE}/${IMAGE_NAME}:${TAG}"
# docker tag ${IMAGE_NAME}:${TAG} ${VPC_IMAGE_NAME}

echo -e "${GREEN}标签: ${FULL_IMAGE_NAME}${NC}"

# 4. 推送镜像
echo -e "\n${BLUE}[4/4] 推送镜像到阿里云容器镜像服务...${NC}"
docker push ${FULL_IMAGE_NAME}

if [ $? -ne 0 ]; then
    echo -e "${RED}推送失败!${NC}"
    exit 1
fi

echo -e "${GREEN}推送成功!${NC}"

# 显示镜像信息
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}镜像信息:${NC}"
echo -e "${BLUE}完整地址: ${FULL_IMAGE_NAME}${NC}"
echo -e "${BLUE}拉取命令: docker pull ${FULL_IMAGE_NAME}${NC}"
echo -e "${BLUE}========================================${NC}"

# 可选：验证文件是否在镜像中
echo -e "\n${BLUE}验证镜像中的 test.txt 文件...${NC}"
docker run --rm ${FULL_IMAGE_NAME} cat /app/test.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}验证成功! test.txt 文件已成功包含在镜像中${NC}"
else
    echo -e "${YELLOW}验证失败，但镜像已推送${NC}"
fi

