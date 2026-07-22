/**
 * @file QuestionRepository.js
 * @description 負責題庫資料的獲取與解析，與 UI 完全解耦。
 */

export const QuestionRepository = {
    questionsList: [],
    
    async load() {
        try {
            const res = await fetch('./src/data/questions.md');
            const text = await res.text();
            this.parseMarkdown(text);
        } catch (e) {
            console.error("Failed to load questions.md", e);
            // Fallback
            this.questionsList = [
                { question: "題目載入失敗，請問 1+1=?", options: ["1", "2", "3", "4"], answerIndex: 1 }
            ];
        }
    },
    
    parseMarkdown(md) {
        this.questionsList = [];
        const blocks = md.split('# ').filter(b => b.trim() !== '');
        
        for (const block of blocks) {
            const lines = block.split('\n').map(l => l.trim()).filter(l => l !== '');
            if (lines.length < 5) continue; // title, question, 4 options (at least)
            
            const questionText = lines[1];
            const options = [];
            let answerIndex = 0;
            
            for (let i = 2; i < lines.length; i++) {
                const line = lines[i];
                if (line.startsWith('- ')) {
                    if (line.startsWith('- [x] ')) {
                        answerIndex = options.length;
                        options.push(line.substring(6).trim());
                    } else {
                        options.push(line.substring(2).trim());
                    }
                }
            }
            
            if (options.length > 0) {
                this.questionsList.push({ question: questionText, options, answerIndex });
            }
        }
    },

    getRandomQuestion() {
        if (this.questionsList.length === 0) {
            return null;
        }
        return this.questionsList[Math.floor(Math.random() * this.questionsList.length)];
    }
};
