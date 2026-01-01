module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\.[jt]sx?$': ['babel-jest', { configFile: './.babelrc.json' }]
  },
  moduleNameMapper: {
    '^@wordpress/element$': 'react'
  }
};