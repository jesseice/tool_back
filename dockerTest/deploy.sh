# 接受一个参数，TAG
TAG=$1

# 检查并停止正在运行的容器（基于端口80）
RUNNING_CONTAINER=$(docker ps -q -f "publish=80")
if [ ! -z "$RUNNING_CONTAINER" ]; then
  echo "发现正在运行的容器，正在停止..."
  docker stop $RUNNING_CONTAINER
  docker rm $RUNNING_CONTAINER
  echo "容器已停止并删除"
fi

docker login -u aliyun1982926158 -p aa123456. crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com
docker pull crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com/wyd_docker_hub/my_test:${TAG}
docker run -d -p 80:80 crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com/wyd_docker_hub/my_test:${TAG}