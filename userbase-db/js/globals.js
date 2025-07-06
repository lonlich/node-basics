global.log = (...args) => {
    console.log("📋 Logger:\n", ...args);
    console.log("=====================");
};

global.warn = (message) => {
    console.warn(`⚠️  ${message}`);
};

