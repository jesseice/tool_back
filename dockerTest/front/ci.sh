TAG=$(date +%Y%m%d%H%M%S)
docker login -u aliyun1982926158 -p aa123456. crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com
docker build -t crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com/wyd_docker_hub/my_test:${TAG} .
docker push crpi-ogg5x271gknfp2i7.cn-guangzhou.personal.cr.aliyuncs.com/wyd_docker_hub/my_test:${TAG}
curl http://101.200.213.220:3001/deploy?tag=${TAG}
echo TAG: ${TAG}