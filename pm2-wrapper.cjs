(async () => {
  try {
    const config = await import("./piper.config.js");

    // Check if the config has a default export
    if (!config.default) {
      throw new Error("Configuration must have a default export.");
    }

    module.exports = config.default;
  } catch (error) {
    console.error("Error loading PM2 configuration:", error.message);
    process.exit(1); // Exit with a failure code
  }
})();
