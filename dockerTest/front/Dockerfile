# 生成一个nginx的镜像，并把dist/文件复制到镜像中，然后显示文件内容
# 使用基础镜像 拉起Nginx
FROM registry.cn-hangzhou.aliyuncs.com/acs/nginx:latest

# 设置工作目录
WORKDIR /app

# 复制 dist/ 目录到镜像中
COPY dist/ /usr/share/nginx/html/

# 复制 nginx.conf 到镜像中
COPY nginx.conf /etc/nginx/nginx.conf

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]