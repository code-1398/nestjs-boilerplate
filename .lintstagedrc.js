const path = require('path');

const buildPrettierCommand = (filenames) =>
    `prettier --write ${filenames
        .map((f) => path.relative(process.cwd(), f))
        .join(' ')}`;

const buildEslintCommand = (filenames) =>
    `eslint --fix --max-warnings 0 ${filenames
        .map((f) => path.relative(process.cwd(), f))
        .join(' ')}`;

const buildTscCommand = () => 'tsc --noEmit';

module.exports = {
    '*.ts': [buildPrettierCommand, buildEslintCommand, buildTscCommand],
};
