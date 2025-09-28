# Jieba Chinese Text Segmentation - Browser Standalone

This package contains extracted Chinese text segmentation functionality from the jieba-js project, packaged for easy use in web browsers.

## Files

- `jieba-segment.js` - Lightweight version with basic dictionary
- `jieba-segment-full.js` - Full version with support for loading complete dictionary
- `test-jieba-segment.html` - Interactive test page
- `README-segmentation.md` - This documentation

## Quick Start

### Basic Usage (Lightweight Version)

```html
<!DOCTYPE html>
<html>
<head>
    <script src="jieba-segment.js"></script>
</head>
<body>
    <script>
        // Create instance
        const jieba = new JiebaSegment();
        
        // Segment text
        const result = jieba.cut("我爱北京天安门");
        console.log(result); // ["我", "爱", "北京", "天安门"]
        
        // Extract keywords
        const keywords = jieba.extractKeywords("这是一段测试文本");
        console.log(keywords);
    </script>
</body>
</html>
```

### Full Dictionary Version

```html
<!DOCTYPE html>
<html>
<head>
    <script src="jieba-segment-full.js"></script>
</head>
<body>
    <script>
        // Create instance
        const jieba = new JiebaSegmentFull();
        
        // Load full dictionary (optional)
        jieba.loadDictionary().then(() => {
            console.log('Dictionary loaded:', jieba.getDictionaryStats());
            
            // Segment text
            const result = jieba.cut("人工智能技术正在快速发展");
            console.log(result);
        });
        
        // Or use immediately with default dictionary
        const result = jieba.cut("我爱北京天安门");
        console.log(result);
    </script>
</body>
</html>
```

## API Reference

### JiebaSegment / JiebaSegmentFull

#### Constructor
```javascript
const jieba = new JiebaSegment(); // or JiebaSegmentFull()
```

#### Methods

##### `cut(sentence, useHMM = false)`
Segment Chinese text into words.

**Parameters:**
- `sentence` (string): Text to segment
- `useHMM` (boolean): Whether to use HMM for unknown words (not fully implemented)

**Returns:** Array of segmented words

**Example:**
```javascript
const result = jieba.cut("我爱北京天安门");
// Returns: ["我", "爱", "北京", "天安门"]
```

##### `cutAll(sentence)`
Return all possible word combinations.

**Parameters:**
- `sentence` (string): Text to segment

**Returns:** Array of all possible segments

**Example:**
```javascript
const result = jieba.cutAll("我爱北京");
// Returns: ["我", "爱", "北", "京", "我爱", "北京", "我爱北京"]
```

##### `extractKeywords(text, topK = 10)`
Extract keywords from text based on frequency.

**Parameters:**
- `text` (string): Text to analyze
- `topK` (number): Number of top keywords to return

**Returns:** Array of keywords sorted by frequency

**Example:**
```javascript
const keywords = jieba.extractKeywords("人工智能技术正在快速发展，改变着我们的生活方式", 5);
// Returns: ["人工智能", "技术", "发展", "改变", "生活"]
```

##### `addWord(word, freq = 1)`
Add custom word to dictionary.

**Parameters:**
- `word` (string): Word to add
- `freq` (number): Frequency/weight of the word

**Example:**
```javascript
jieba.addWord("自定义词", 10);
```

##### `initialize(dictionary)`
Initialize with custom dictionary.

**Parameters:**
- `dictionary` (array): Array of [word, frequency] pairs

**Example:**
```javascript
const customDict = [
    ['自定义词', 10],
    ['另一个词', 5]
];
jieba.initialize(customDict);
```

### JiebaSegmentFull Additional Methods

##### `loadDictionary(dictionaryUrl = null)`
Load full dictionary from external source.

**Parameters:**
- `dictionaryUrl` (string, optional): URL to dictionary file

**Returns:** Promise that resolves when dictionary is loaded

**Example:**
```javascript
// Load from default location
await jieba.loadDictionary();

// Load from custom URL
await jieba.loadDictionary('./path/to/dictionary.js');
```

##### `isDictionaryLoaded()`
Check if full dictionary is loaded.

**Returns:** Boolean

##### `getDictionaryStats()`
Get dictionary statistics.

**Returns:** Object with dictionary information

**Example:**
```javascript
const stats = jieba.getDictionaryStats();
console.log(stats);
// {
//   totalWords: 1234,
//   totalFrequency: 5678,
//   minFrequency: -12.34,
//   isFullDictionary: true
// }
```

## Dictionary Format

The dictionary should be an array of arrays, where each inner array contains:
- `[0]`: Word (string)
- `[1]`: Frequency (number)

```javascript
const dictionary = [
    ['我', 1],
    ['爱', 1],
    ['北京', 1],
    ['天安门', 1]
];
```

## Browser Compatibility

- Modern browsers with ES6 support
- No external dependencies
- Works with or without module systems (CommonJS, AMD, or global)

## Performance Notes

- **Lightweight version**: Fast initialization, good for basic use cases
- **Full version**: Slower initial load when loading complete dictionary, but better segmentation accuracy
- Dictionary loading is asynchronous and doesn't block the main thread
- Memory usage scales with dictionary size

## Examples

### Basic Text Segmentation
```javascript
const jieba = new JiebaSegment();
const text = "今天天气很好，我们去公园散步吧。";
const words = jieba.cut(text);
console.log(words); // ["今天", "天气", "很好", "，", "我们", "去", "公园", "散步", "吧", "。"]
```

### Keyword Extraction
```javascript
const jieba = new JiebaSegment();
const text = "人工智能技术正在快速发展，改变着我们的生活方式。";
const keywords = jieba.extractKeywords(text, 5);
console.log(keywords); // ["人工智能", "技术", "发展", "改变", "生活"]
```

### Custom Dictionary
```javascript
const jieba = new JiebaSegment();
jieba.addWord("机器学习", 10);
jieba.addWord("深度学习", 8);

const result = jieba.cut("机器学习是深度学习的一个分支");
console.log(result); // ["机器学习", "是", "深度学习", "的", "一个", "分支"]
```

### Full Dictionary Usage
```javascript
const jieba = new JiebaSegmentFull();

// Use immediately with default dictionary
let result = jieba.cut("测试文本");
console.log(result);

// Load full dictionary for better accuracy
jieba.loadDictionary().then(() => {
    result = jieba.cut("测试文本");
    console.log("With full dictionary:", result);
    console.log("Dictionary stats:", jieba.getDictionaryStats());
});
```

## Testing

Open `test-jieba-segment.html` in a web browser to interactively test the segmentation functionality. The test page includes:

- Text segmentation
- Keyword extraction
- Custom word addition
- Example texts
- Real-time results display

## License

This extracted functionality maintains the same MIT license as the original jieba-js project.

## Contributing

This is an extracted version of the jieba-js project. For contributions to the main project, please visit the original repository.
