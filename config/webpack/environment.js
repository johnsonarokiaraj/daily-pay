const { environment } = require('@rails/webpacker')

// Add support for JSX and React
environment.loaders.prepend('babel', {
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader'
    // This will use the babel.config.js file automatically
  }
})

// Add support for Less files (for Ant Design)
environment.loaders.prepend('less', {
  test: /\.less$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'less-loader',
      options: {
        lessOptions: {
          modifyVars: {
            'primary-color': '#c85ea2',
            'link-color': '#7385d5',
            'success-color': '#10b981',
            'warning-color': '#f59e0b',
            'error-color': '#ef4444',
            'border-radius-base': '10px',
          },
          javascriptEnabled: true,
        },
      },
    },
  ],
})

module.exports = environment
