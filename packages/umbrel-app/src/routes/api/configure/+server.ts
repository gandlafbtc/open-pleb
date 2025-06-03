import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { env } from '$env/dynamic/private';

// Base path for configuration files
const CONFIG_BASE_PATH = env.CONFIG_BASE_PATH || './data/config';

// POST endpoint to save config file content
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { files } = await request.json() as { files: Record<string, string> };
        
        if (!files || Object.keys(files).length === 0) {
            return json({ success: false, error: 'No configuration content provided' });
        }
        
        // Process each file
        for (const [filePath, content] of Object.entries(files)) {
            try {
                // Ensure the directory exists
                const fullPath = path.resolve(path.join(CONFIG_BASE_PATH, filePath));
                const directory = path.dirname(fullPath);
                
                if (!fs.existsSync(directory)) {
                    fs.mkdirSync(directory, { recursive: true });
                }
                
                // Write the file
                fs.writeFileSync(fullPath, content, 'utf-8');
                console.log(`Successfully saved configuration file: ${filePath}`);
            } catch (fileErr) {
                console.error(`Error saving configuration file ${filePath}:`, fileErr);
                const errorMessage = fileErr instanceof Error ? fileErr.message : 'Unknown error';
                return json({ 
                    success: false, 
                    error: `Failed to save ${filePath}: ${errorMessage}` 
                });
            }
        }
        
        return json({ success: true });
        
    } catch (err) {
        console.error('Error processing configuration files:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return new Response(JSON.stringify({ 
            success: false,
            error: `Failed to save configuration files: ${errorMessage}`
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
