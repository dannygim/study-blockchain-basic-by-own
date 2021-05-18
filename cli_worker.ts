
import { readLines } from "https://deno.land/std@0.96.0/io/mod.ts";
import * as path from "https://deno.land/std@0.96.0/path/mod.ts";

import { Input } from "https://deno.land/x/cliffy@v0.18.2/prompt/mod.ts";

// cmd : help
async function cmdHelp() {
    const filename = path.join(Deno.cwd(), "help.txt");
    const fileReader = Deno.openSync(filename);
    for await (let line of readLines(fileReader)) {
        console.log(line, '\n');
    }
    fileReader.close();
}

async function main() {
    do {
        const command = await Input.prompt('Enter ');
        switch (command) {
            case 'help':
                await cmdHelp();
                break;

            case 'exit':
                return;

            default:
                console.log('?? ', command);
                break;
        }
    } while (true);
}

// command
console.log("\r\x1b[96m[CLI Server]\x1b[0m \x1b[92mstarted.\x1b[0m");
await main();
console.log('bye');
self.close();