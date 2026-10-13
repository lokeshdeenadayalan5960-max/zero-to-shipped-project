const { getDocument, extractText } = require('unpdf');

const parsePDF = async (buffer) => {
    try {
        const pdf = await getDocument({ data: new Uint8Array(buffer) });
        const { text } = await extractText(pdf, { mergePages: true });
        return text;
    } catch (error) {
        throw new Error('Error parsing PDF: ' + error.message);
    }
};

module.exports = {
    parsePDF
};
