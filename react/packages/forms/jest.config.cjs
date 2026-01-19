module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './.babelrc.json' }]
  },
  moduleNameMapper: {
    '^@wordpress/element$': 'react',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};