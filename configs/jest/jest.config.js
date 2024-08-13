/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    testEnvironment: "node",
    transform: {
        "^.+.ts?$": ["ts-jest", {}],
    },
    coveragePathIgnorePatterns: [
        '\\\\node_modules\\\\'
    ],
    moduleDirectories: [
        'node_modules'
    ],
    modulePaths: [
        '<rootDir>src'
    ],
    moduleFileExtensions: [
        'js',
        'mjs',
        'cjs',
        'jsx',
        'ts',
        'tsx',
        'json',
        'node'
    ],
    rootDir: '../../',
    testMatch: ['<rootDir>packages/**/*(*.)(spec|test).ts|js']
};