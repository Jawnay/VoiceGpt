module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/VoiceGpt/'
    : '/',
  devServer: {
    proxy: {
      '/api': {
        target: 'https://voicegpt-o6b1.onrender.com', // Change this to match the URL of your API server
        changeOrigin: true,
        pathRewrite: {'^/api' : ''}
      }
    }
  }
}