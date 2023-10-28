import { marked } from "marked";
import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";

const IN = './content';
const OUT = './dist';

async function transferDirectory(path = '', currentFile = '') {
    const directory = await readdir(`${IN}/${path}/${currentFile}`);

    for (const file of directory) {
        const newPath = `${IN}/${path}/${currentFile}/${file}`;
        if ((await lstat(newPath)).isDirectory()) return transferDirectory(`${path}/${currentFile}/`, file);

        const html = marked(await readFile(newPath, { encoding: 'utf-8' }));
        const newName = `${file.split('.')[0]}.html`;
        await mkdir(`${OUT}/${path}/${currentFile}`, { recursive: true });
        await writeFile(`${OUT}/${path}/${currentFile}/${newName}`, html);
    }
}

await transferDirectory();