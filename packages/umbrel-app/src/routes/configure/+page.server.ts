import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { env } from '$env/dynamic/private';

// Base path for configuration files
const CONFIG_BASE_PATH = env.CONFIG_PATH || './data/config';

// List of files to load
const configFiles = [
	'frontend/.env',
	'backend/.env',
	'admin-frontend/.env',
	'db/.env'
];

export const load: PageServerLoad = async () => {
	try {
		// Create an object to store all file contents
		const configData: Record<string, string> = {};
		
		// Read each file and store its content
		for (const filePath of configFiles) {
			try {
				const fullPath = path.resolve(path.join(CONFIG_BASE_PATH, "/", filePath));
				console.log(fullPath)
				const content = fs.existsSync(fullPath) 
					? fs.readFileSync(fullPath, 'utf-8')
					: ''; // Empty string if file doesn't exist
				configData[filePath] = content;
			} catch (fileErr) {
				console.warn(`Could not read config file ${filePath}:`, fileErr);
				configData[filePath] = ''; // Empty string for files with errors
			}
		}
		
		return {
			configData
		};
	} catch (err) {
		console.error('Error loading config files:', err);
		throw error(500, 'Failed to load configuration data');
	}
};
