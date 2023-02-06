// // * Source: https://blog.antoniolofiego.com/setting-up-a-nextjs-application-with-typescript-jit-tailwind-css-and-jestreact-testing-library
// // module.exports = {
// //   testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
// //   setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
// //   transform: {
// //     "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
// //   },
// //   // letting jest know that whenever it encounters a .css file import,
// //   // it should import `styleMock.js` instead
// //   moduleNameMapper: {
// //     "\\.(css|less|scss|sass)$": "<rootDir>/styles/__mocks__/styleMock.js",
// //   },
// // };
// // -----
// // -----
// // -----
// const nextJest = require("next/jest");

// const createJestConfig = nextJest({
//   // specifying jest.config.js directory location
//   dir: "./",
// });

// const customJestConfig = {
//   // ** ?
//   moduleDirectories: ["node_modules", "<rootDir>/"],

//   // specifying jsdom environment to accommodate Next.js'
//   // server-side rendering (default: `node`)
//   testEnvironment: "jest-environment-jsdom",

//   // setting up path patterns where tests will be ignored (if there are any)
//   testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],

//   // A list of paths to modules that run some code to configure or set up the
//   // testing framework before each test file in the suite is executed.
//   // Code is ran after setting up the env but before test code itself.
//   setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

//   // transforming jsx,ts,tsx files into js using `babel-jest`
//   transform: {
//     "\\.[jt]sx?$": "<rootDir>/node_modules/babel-jest",
//   },

//   // skipping the transformation of any files that match any of the
//   // patterns listed here
//   transformIgnorePatterns: ["node_modules/(?!variables/.*)"],

//   // letting jest know that whenever it encounters a .css file import,
//   // it should import `styleMock.js` instead
//   moduleNameMapper: {
//     "\\.(css|less|scss|sass)$": "<rootDir>/styles/__mocks__/styleMock.js",
//   },

//   // treating these files as ESM
//   extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],

//   // A TypeScript preprocessor `ts-jest` with source map support for Jest
//   // that lets you use Jest to test projects written in TypeScript.
//   preset: "ts-jest",
// };

// module.exports = createJestConfig(customJestConfig);
