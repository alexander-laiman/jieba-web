/**
 * Jieba Chinese Text Segmentation - Full Browser Version
 * Extracted from jieba-js project with full dictionary support
 * 
 * Usage:
 *   const jieba = new JiebaSegmentFull();
 *   jieba.loadDictionary().then(() => {
 *     const result = jieba.cut("我爱北京天安门");
 *     console.log(result); // ["我", "爱", "北京", "天安门"]
 *   });
 */

class JiebaSegmentFull {
    constructor() {
        this.trie = {};
        this.FREQ = {};
        this.total = 0.0;
        this.min_freq = 0.0;
        this.initialized = false;
        this.dictionaryLoaded = false;
        
        // HMM states for finalseg
        this.states = ['B', 'M', 'E', 'S'];
        this.PrevStatus = {
            'B': ['E', 'S'],
            'M': ['M', 'B'],
            'S': ['S', 'E'],
            'E': ['B', 'M']
        };
        
        // Default minimal dictionary for basic functionality
        this.defaultDict = [
            ['我', 1], ['爱', 1], ['北京', 1], ['天安门', 1],
            ['的', 1], ['是', 1], ['在', 1], ['有', 1], ['和', 1],
            ['了', 1], ['不', 1], ['人', 1], ['都', 1], ['一', 1],
            ['个', 1], ['上', 1], ['也', 1], ['很', 1], ['到', 1],
            ['说', 1], ['要', 1], ['就', 1], ['去', 1], ['你', 1],
            ['他', 1], ['她', 1], ['它', 1], ['们', 1], ['这', 1],
            ['那', 1], ['什么', 1], ['怎么', 1], ['为什么', 1],
            ['中国', 1], ['中文', 1], ['学习', 1], ['工作', 1],
            ['生活', 1], ['时间', 1], ['地方', 1], ['朋友', 1],
            ['家人', 1], ['学校', 1], ['公司', 1], ['城市', 1],
            ['国家', 1], ['世界', 1], ['今天', 1], ['明天', 1],
            ['昨天', 1], ['现在', 1], ['以后', 1], ['以前', 1],
            ['天气', 1], ['很好', 1], ['公园', 1], ['散步', 1],
            ['人工智能', 1], ['技术', 1], ['正在', 1], ['快速', 1],
            ['发展', 1], ['改变', 1], ['我们', 1], ['方式', 1],
            ['学习', 1], ['中文', 1], ['有趣', 1], ['事情', 1],
            ['需要', 1], ['不断', 1], ['练习', 1], ['首都', 1],
            ['悠久', 1], ['历史', 1], ['丰富', 1], ['文化', 1]
        ];
        
        // Initialize with default dictionary
        this.initialize(this.defaultDict);
    }

    /**
     * Load the full dictionary from external source
     */
    async loadDictionary(dictionaryUrl = null) {
        if (this.dictionaryLoaded) {
            return Promise.resolve();
        }
        
        try {
            let dictionary;
            
            if (dictionaryUrl) {
                // Load from custom URL
                const response = await fetch(dictionaryUrl);
                const text = await response.text();
                // Parse the dictionary file (assuming it's in the format: var dictionary = [...])
                const match = text.match(/var\s+dictionary\s*=\s*(\[.*?\]);/s);
                if (match) {
                    dictionary = JSON.parse(match[1]);
                } else {
                    throw new Error('Invalid dictionary format');
                }
            } else {
                // Try to load from the original jieba-js dictionary
                try {
                    const response = await fetch('./scripts/data/dictionary.js');
                    const text = await response.text();
                    const match = text.match(/var\s+dictionary\s*=\s*(\[.*?\]);/s);
                    if (match) {
                        dictionary = JSON.parse(match[1]);
                    } else {
                        throw new Error('Could not parse dictionary');
                    }
                } catch (error) {
                    console.warn('Could not load full dictionary, using default:', error);
                    return Promise.resolve();
                }
            }
            
            this.buildTrie(dictionary);
            this.dictionaryLoaded = true;
            console.log('Full dictionary loaded successfully');
            
        } catch (error) {
            console.warn('Failed to load full dictionary, using default:', error);
        }
    }

    /**
     * Initialize the segmentation engine with dictionary data
     */
    initialize(dictionary = null) {
        if (dictionary) {
            this.buildTrie(dictionary);
        } else {
            this.buildTrie(this.defaultDict);
        }
    }

    /**
     * Build the trie data structure from dictionary
     */
    buildTrie(dictionary) {
        const lfreq = {};
        const trie = {};
        let ltotal = 0.0;

        for (let i = 0; i < dictionary.length; i++) {
            const entry = dictionary[i];
            const word = entry[0];
            const freq = entry[1];
            lfreq[word] = freq;
            ltotal += freq;
            
            let p = trie;
            for (let ci = 0; ci < word.length; ci++) {
                const c = word[ci];
                if (!(c in p)) {
                    p[c] = {};
                }
                p = p[c];
            }
            p[''] = ''; // ending flag
        }

        this.trie = trie;
        this.FREQ = lfreq;
        this.total = ltotal;

        // Normalize frequencies
        let min_freq = Infinity;
        for (let k in this.FREQ) {
            const v = this.FREQ[k];
            this.FREQ[k] = Math.log(v / this.total);
            if (this.FREQ[k] < min_freq) {
                min_freq = this.FREQ[k];
            }
        }
        this.min_freq = min_freq;
        this.initialized = true;
    }

    /**
     * Get Directed Acyclic Graph (DAG) for a sentence
     */
    getDAG(sentence) {
        const N = sentence.length;
        let i = 0;
        let j = 0;
        let p = this.trie;
        const DAG = {};

        while (i < N) {
            const c = sentence[j];
            if (c in p) {
                p = p[c];
                if ('' in p) {
                    if (!(i in DAG)) {
                        DAG[i] = [];
                    }
                    DAG[i].push(j);
                }
                j += 1;
                if (j >= N) {
                    i += 1;
                    j = i;
                    p = this.trie;
                }
            } else {
                p = this.trie;
                i += 1;
                j = i;
            }
        }

        // Ensure every position has at least itself
        for (i = 0; i < sentence.length; i++) {
            if (!(i in DAG)) {
                DAG[i] = [i];
            }
        }
        return DAG;
    }

    /**
     * Calculate optimal segmentation route using dynamic programming
     */
    calc(sentence, DAG, route) {
        const N = sentence.length;
        route[N] = [0.0, ''];
        
        for (let idx = N - 1; idx > -1; idx--) {
            const candidates = [];
            const candidates_x = [];
            
            for (let xi in DAG[idx]) {
                const x = DAG[idx][xi];
                const word = sentence.substring(idx, x + 1);
                const f = (word in this.FREQ) ? this.FREQ[word] : this.min_freq;
                candidates.push(f + route[x + 1][0]);
                candidates_x.push(x);
            }
            
            const m = Math.max(...candidates);
            route[idx] = [m, candidates_x[candidates.indexOf(m)]];
        }
    }

    /**
     * Cut sentence using DAG without HMM (simpler version)
     */
    cutDAGNoHMM(sentence) {
        const re_eng = /[a-zA-Z0-9]/;
        const route = {};
        const yieldValues = [];

        const DAG = this.getDAG(sentence);
        this.calc(sentence, DAG, route);

        let x = 0;
        let buf = '';
        const N = sentence.length;

        while (x < N) {
            const y = route[x][1] + 1;
            const l_word = sentence.substring(x, y);
            
            if (l_word.match(re_eng) && l_word.length === 1) {
                buf += l_word;
                x = y;
            } else {
                if (buf.length > 0) {
                    yieldValues.push(buf);
                    buf = '';
                }
                yieldValues.push(l_word);
                x = y;
            }
        }

        if (buf.length > 0) {
            yieldValues.push(buf);
        }
        return yieldValues;
    }

    /**
     * Main segmentation function
     */
    cut(sentence, useHMM = false) {
        if (!this.initialized) {
            this.initialize();
        }

        const yieldValues = [];
        const re_han = /([\u4E00-\u9FA5a-zA-Z0-9+#&\._]+)/;
        const re_skip = /(\r\n|\s)/;

        const blocks = sentence.split(re_han);
        const cut_block = useHMM ? this.cutDAG : this.cutDAGNoHMM;

        for (let b in blocks) {
            const blk = blocks[b];
            if (blk.length === 0) {
                continue;
            }

            if (blk.match(re_han)) {
                const cutted = cut_block.call(this, blk);
                for (let w in cutted) {
                    const word = cutted[w];
                    yieldValues.push(word);
                }
            } else {
                const tmp = blk.split(re_skip);
                for (let i = 0; i < tmp.length; i++) {
                    const x = tmp[i];
                    if (x.match(re_skip)) {
                        yieldValues.push(x);
                    } else {
                        for (let xi in x) {
                            yieldValues.push(x[xi]);
                        }
                    }
                }
            }
        }
        return yieldValues;
    }

    /**
     * Cut with HMM (placeholder - would need full finalseg implementation)
     */
    cutDAG(sentence) {
        // For now, fall back to non-HMM version
        // In a full implementation, this would use the HMM finalseg module
        return this.cutDAGNoHMM(sentence);
    }

    /**
     * Cut all possible segments (returns all possible word combinations)
     */
    cutAll(sentence) {
        if (!this.initialized) {
            this.initialize();
        }

        const DAG = this.getDAG(sentence);
        const result = [];
        
        for (let i = 0; i < sentence.length; i++) {
            for (let j of DAG[i]) {
                if (j >= i) {
                    result.push(sentence.substring(i, j + 1));
                }
            }
        }
        return result;
    }

    /**
     * Extract keywords from text (simple frequency-based)
     */
    extractKeywords(text, topK = 10) {
        const words = this.cut(text);
        const freq = {};
        
        // Count word frequencies
        for (let word of words) {
            if (word.length > 1 && /[\u4E00-\u9FA5]/.test(word)) {
                freq[word] = (freq[word] || 0) + 1;
            }
        }
        
        // Sort by frequency
        const sorted = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topK)
            .map(entry => entry[0]);
            
        return sorted;
    }

    /**
     * Add custom words to dictionary
     */
    addWord(word, freq = 1) {
        if (!this.initialized) {
            this.initialize();
        }
        
        // Add to frequency table
        this.FREQ[word] = Math.log(freq / this.total);
        
        // Add to trie
        let p = this.trie;
        for (let ci = 0; ci < word.length; ci++) {
            const c = word[ci];
            if (!(c in p)) {
                p[c] = {};
            }
            p = p[c];
        }
        p[''] = '';
    }

    /**
     * Check if dictionary is loaded
     */
    isDictionaryLoaded() {
        return this.dictionaryLoaded;
    }

    /**
     * Get dictionary statistics
     */
    getDictionaryStats() {
        return {
            totalWords: Object.keys(this.FREQ).length,
            totalFrequency: this.total,
            minFrequency: this.min_freq,
            isFullDictionary: this.dictionaryLoaded
        };
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JiebaSegmentFull;
} else if (typeof define === 'function' && define.amd) {
    define([], function() {
        return JiebaSegmentFull;
    });
} else {
    window.JiebaSegmentFull = JiebaSegmentFull;
}

// Example usage:
/*
// Basic usage with default dictionary
const jieba = new JiebaSegmentFull();
console.log(jieba.cut("我爱北京天安门")); // ["我", "爱", "北京", "天安门"]

// Load full dictionary
jieba.loadDictionary().then(() => {
    console.log('Dictionary loaded:', jieba.getDictionaryStats());
    const result = jieba.cut("人工智能技术正在快速发展");
    console.log(result);
});

// With custom dictionary URL
jieba.loadDictionary('./path/to/dictionary.js').then(() => {
    const result = jieba.cut("测试文本");
    console.log(result);
});
*/
