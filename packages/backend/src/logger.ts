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

let logLevel = Bun.env.OPENPLEB_LOG_LEVEL as "debug" | "info" | "error" | "warning" | "fatal";

if (!logLevel) {
	console.error(`OPENPLEB_LOG_LEVEL not set. defaulting to 'info'`);
	logLevel = "info"
}

else if (!["debug" ,"info" ,"error" ,"warning" ,"fatal"].includes(logLevel)) {
	console.error(`Unknown log level set in OPENPLEB_LOG_LEVEL = ${Bun.env.OPENPLEB_LOG_LEVEL}  defaulting to 'info'`);
	logLevel = "info"
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
			lowestLevel: logLevel,
			sinks: ["console", "file"],
		},
	],
});
export const log = getLogger(["openpleb-app"]);
