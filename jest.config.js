const nxPreset = require('@nx/jest/preset').default;

/** @type {import('jest').Config} */
module.exports = {
    ...nxPreset,
    testEnvironment: 'node',
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/out-tsc/'],
};
