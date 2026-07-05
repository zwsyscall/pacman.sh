const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const docsDir = path.join(__dirname, 'docs');

function getAllMdFiles(dir, fileList = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getAllMdFiles(fullPath, fileList);
        } else if (entry.name.endsWith('.md')) {
            fileList.push(fullPath);
        }
    }
    return fileList;
}

const files = getAllMdFiles(docsDir);

const metadata = files.map(filePath => {
    const relativePath = path.relative(docsDir, filePath).replace(/\\/g, '/');

    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : path.basename(filePath, '.md');

    let date;
    try {
        const gitDate = execSync(`git log --diff-filter=A --format=%aI -1 -- "${filePath}"`).toString().trim();
        date = gitDate ? new Date(gitDate) : fs.statSync(filePath).birthtime;
    } catch (e) {
        date = fs.statSync(filePath).birthtime;
    }

    const slashIndex = relativePath.indexOf('/');
    const folder = slashIndex !== -1 ? relativePath.substring(0, slashIndex) : 'root';

    const id = relativePath.replace(/\.md$/, '').replace(/\//g, '-');

    return {
        id,
        title,
        file: `docs/${relativePath}`,
        date: date.toISOString(),
        folder
    };
});

metadata.sort((a, b) => new Date(b.date) - new Date(a.date));
fs.writeFileSync('metadata.json', JSON.stringify(metadata, null, 2));
console.log('metadata.json generated successfully');