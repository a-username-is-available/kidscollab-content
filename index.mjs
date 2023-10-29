// im using node instead of deno bc im not bothered to change container

import { marked } from "marked";
import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path, { basename, relative } from "node:path";
// import { cwd } from "node:process";

const IN = './content/';
const OUT = './dist/';

const structure = [];
async function transferDirectory(path = '') {
    const directory = await readdir(IN + path);

    for (const file of directory) {
        const newPath = IN + path + '/' + file;

        if ((await lstat(newPath)).isDirectory()) {
            await transferDirectory(path + file);
            continue;
        }

        const baseName = file.split('.')[0];
        traverseByPath(structure, path).push(baseName);
    
        const html = marked(await readFile(newPath, { encoding: 'utf-8' }));
        await mkdir(OUT + path , { recursive: true });
        await writeFile(OUT + path + '/' + baseName + '.html', html); // Yes i know `${thing}other` exists im lazy
    }
}

function traverseByPath(array, path) {
    return path.split('/')
        .filter(a => a.trim() != '')
        .reduce((acc, curr) => {
            const index = acc.findIndex(a => a.name == curr);
            if (index === -1) {
                acc.push({ name: curr, content: [] });
                return acc[acc.length - 1].content;
            }
            return acc[index].content;
        }, array);
}

await transferDirectory();
await writeFile('nav.json', JSON.stringify(structure));