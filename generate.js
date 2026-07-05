const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const docsDir = path.join(__dirname, 'docs');
const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'));

const metadata = files.map(file => {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const titleMatch = content.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1] : file.replace('.md', '');

    let date;
    try {
        const gitDate = execSync(`git log --diff-filter=A --format=%aI -1 -- "${filePath}"`).toString().trim();
        date = gitDate ? new Date(gitDate) : fs.statSync(filePath).birthtime;
    } catch (e) {
        date = fs.statSync(filePath).birthtime;
    }

    return {
        id: file.replace('.md', ''),
        title,
        file: `docs/${file}`,
        date: date.toISOString()
    };
});

metadata.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync('metadata.json', JSON.stringify(metadata, null, 2));
console.log('metadata.json generated successfully');