import {
	ansiColorFormatter,
	configure,
	getConsoleSink,
	getLogger,
	getRotatingFileSink,
} from "@logtape/logtape";

if (!Bun.env.OPENPLEB_LOG_FILE_NAME) {
	console.error("OPENPLEB_LOG_FILE_NAME environment variable is not set");
	process.exit(1);
}

await configure({
	sinks: {
		console: getConsoleSink({ formatter: ansiColorFormatter }),
		file: getRotatingFileSink(Bun.env.OPENPLEB_LOG_FILE_NAME, {
			maxSize: 0x400 * 0x400 * 5,
			maxFiles: 5,
		}),
	},
	loggers: [
		{
			category: "openpleb-app",
			lowestLevel: "debug",
			sinks: ["console", "file"],
		},
	],
});
export const log = getLogger(["openpleb-app"]);
