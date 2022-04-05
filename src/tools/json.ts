import * as prettier from 'prettier/standalone';
import * as parserJson5 from 'prettier/parser-babel';

export const beautify = (code: string, {tab = 4} = {}) => {
    return prettier.format(code, {
        parser: "json5",
        plugins: [parserJson5],
        quoteProps: "preserve",
        trailingComma: "none",
        tabWidth: tab,
        printWidth: 1
    });
};
