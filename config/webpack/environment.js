const { environment } = require('@rails/webpacker')
const webpack = require('webpack')

// Add support for JSX and React
environment.loaders.prepend('babel', {
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader'
    // This will use the babel.config.js file automatically
  }
})

// Patch: Transpile chart.js, @ant-design/charts, @ant-design/graphs, and @antv/* in node_modules
const transpileNodeModules = [
  /node_modules\/chart\.js/,
  /node_modules\/@ant-design\/charts/,
  /node_modules\/@ant-design\/graphs/,
  /node_modules\/@antv/
];

const babelLoader = environment.loaders.get('babel');
babelLoader.exclude = (modulePath) => {
  // Exclude all node_modules except the ones we want to transpile
  if (/node_modules/.test(modulePath)) {
    return !transpileNodeModules.some((regex) => regex.test(modulePath));
  }
  return false;
};

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

// Ignore @antv/layout/lib/worker.js to avoid import.meta.url errors
environment.plugins.append('IgnoreAntvLayoutWorker',
  new webpack.IgnorePlugin({
    resourceRegExp: /@antv\/layout\/lib\/worker\.js$/
  })
);

module.exports = environment
