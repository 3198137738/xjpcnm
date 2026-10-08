# XJPCNM 官网：Nginx 静态站点镜像，监听 8085 端口
# 使用非 root 运行的 Nginx 官方镜像，更安全
FROM nginxinc/nginx-unprivileged:1.27-alpine

# 站点配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 站点文件
COPY index.html privacy.html terms.html styles.css main.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

EXPOSE 8085

# 健康检查：首页可访问即视为健康
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8085/ || exit 1
