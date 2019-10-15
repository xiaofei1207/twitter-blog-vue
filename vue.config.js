module.exports = {
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/assets/css/_variable.scss";
        `
      },
    }
  },
  configureWebpack: config => {},
  runtimeCompiler: true,
  devServer: {
    // 配置代理
    proxy: {
      '/api': {
        ws: false, //禁用websocket
        target: 'http://106.12.221.34:8848/',
        changeOrigin: true,
      }
    },
    port: 12322
  },
}