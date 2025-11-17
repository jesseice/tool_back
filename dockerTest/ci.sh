# 生成个tag为时间戳
TAG=$(date +%s)
docker login -u aliyun1982926158 -p aa123456. crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com
docker build -t crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com/wyd_docker_hub/my_test:${TAG} .
docker push crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com/wyd_docker_hub/my_test:${TAG}
echo TAG: ${TAG}