// im using node instead of deno bc im not bothered to change container

import { marked } from "marked";
import { v5 } from "uuid";
import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { normalize } from "node:path";

const IN = './content/';
const OUT = './dist/';
const UUID_NAMESPACE = '866cb8d6-ce7f-463d-ae10-666464fd2326';

const structure = [];
async function transferDirectory(path = '') {
    const directory = await readdir(IN + '/' +path);

    for (const file of directory) {
        const newPath = IN + '/' + path + '/' + file;

        if ((await lstat(newPath)).isDirectory()) {
            await transferDirectory(path + '/' + file);
            continue;
        }

        const baseName = file.split('.')[0];
        const uuid = v5(normalize(path + '/' + file), UUID_NAMESPACE);
        traverseByPath(structure, path).push({ name: baseName, uuid });
    
        const html = uuid + '\n' + marked(await readFile(newPath, { encoding: 'utf-8' }));
        await mkdir(OUT + '/' + path , { recursive: true });
        await writeFile(OUT + '/' + path + '/' + fixName(baseName) + '.html', html); // Yes i know `${thing}other` exists but it creates more noise
    }
}

function fixName(name) {
    return name.replaceAll(' ', '-').replaceAll(/[?#/]/g, '');
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