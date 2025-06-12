module.exports = function (api) {
  var validEnv = ['development', 'test', 'production']
  var currentEnv = api.env()
  var isDevelopmentEnv = api.env('development')
  var isProductionEnv = api.env('production')
  var isTestEnv = api.env('test')

  if (!validEnv.includes(currentEnv)) {
    throw new Error(
      'Please specify a valid `NODE_ENV` or ' +
      '`BABEL_ENV` environment variables. Valid values are "development", ' +
      '"test", and "production". Instead, received: ' +
      JSON.stringify(currentEnv) +
      '.'
    )
  }

  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: isTestEnv ? { node: 'current' } : { browsers: ['defaults'] },
          modules: isTestEnv ? 'auto' : false
        }
      ],
      '@babel/preset-react'
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-private-methods'
    ]
  }
}
