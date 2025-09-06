// server/generator.js - Content generation
const express = require('express');
const router = express.Router();
const natural = require('natural');
const db = require('./database');

// Initialize natural language tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

// Content generation endpoint
router.post('/generate', async (req, res) => {
  try {
    const { prompt, type, options } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required'
      });
    }

    const generationType = type || 'text';
    const generationOptions = options || {};

    let result;
    
    switch (generationType) {
      case 'text':
        result = await generateText(prompt, generationOptions);
        break;
      case 'summary':
        result = await generateSummary(prompt, generationOptions);
        break;
      case 'keywords':
        result = await generateKeywords(prompt, generationOptions);
        break;
      case 'questions':
        result = await generateQuestions(prompt, generationOptions);
        break;
      default:
        return res.status(400).json({
          error: `Unsupported generation type: ${generationType}`
        });
    }

    // Save to history if user ID is provided
    if (req.body.userId) {
      await db.addHistoryItem({
        userId: req.body.userId,
        type: 'generation',
        prompt: prompt,
        result: result,
        generatorType: generationType,
        timestamp: new Date().getTime()
      });
    }

    res.json({
      success: true,
      type: generationType,
      prompt: prompt,
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content'
    });
  }
});

// Batch generation endpoint
router.post('/batch-generate', async (req, res) => {
  try {
    const { prompts, type, options } = req.body;
    
    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({
        error: 'Prompts array is required'
      });
    }

    const results = [];
    
    for (const prompt of prompts) {
      try {
        const result = await generateText(prompt, options || {});
        results.push({
          success: true,
          prompt,
          result
        });
      } catch (error) {
        results.push({
          success: false,
          prompt,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to batch generate content'
    });
  }
});

// Text generation function
async function generateText(prompt, options) {
  const { length = 'medium', style = 'neutral' } = options;
  
  // This is a simplified text generation
  // In a real application, this would call an AI model API
  
  const responses = {
    short: `Based on your request about "${prompt}", here is a concise response.`,
    medium: `Regarding your inquiry about "${prompt}", I can provide this detailed explanation. This topic is important because it relates to many contemporary issues and deserves thorough examination.`,
    long: `The subject of "${prompt}" is multifaceted and complex. To fully address your query, we must consider historical context, current applications, and future implications. Firstly, the historical development of this concept has evolved significantly over time. Secondly, contemporary implementations demonstrate various approaches. Finally, future trends suggest continued evolution in this area. This comprehensive analysis should provide valuable insights into your original question.`
  };
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return responses[length] || responses.medium;
}

// Summary generation function
async function generateSummary(text, options) {
  const { maxLength = 150 } = options;
  
  // Simple summary generation using TF-IDF
  const tfidf = new TfIdf();
  tfidf.addDocument(text);
  
  const keywords = [];
  tfidf.listTerms(0).forEach(item => {
    if (item.term.length > 3) { // Filter out short words
      keywords.push(item.term);
    }
  });
  
  // Create a simple summary using important sentences
  const sentences = text.split(/[.!?]+/);
  let summary = '';
  
  for (const sentence of sentences) {
    if (summary.length + sentence.length <= maxLength) {
      const keywordCount = keywords.filter(kw => 
        sentence.toLowerCase().includes(kw.toLowerCase())
      ).length;
      
      if (keywordCount > 0) {
        summary += sentence + '. ';
      }
    } else {
      break;
    }
  }
  
  return summary || sentences[0] || 'No summary available.';
}

// Keyword generation function
async function generateKeywords(text, options) {
  const { maxKeywords = 10 } = options;
  
  const tfidf = new TfIdf();
  tfidf.addDocument(text);
  
  const keywords = [];
  tfidf.listTerms(0).forEach(item => {
    if (item.term.length > 3 && keywords.length < maxKeywords) {
      keywords.push({
        word: item.term,
        importance: item.tfidf
      });
    }
  });
  
  return keywords;
}

// Question generation function
async function generateQuestions(text, options) {
  const { numQuestions = 3 } = options;
  
  const questions = [
    `What is the main concept discussed in this text about "${text.substring(0, 30)}..."?`,
    `How does the information presented relate to current trends?`,
    `What are the potential implications of this content?`
  ];
  
  return questions.slice(0, numQuestions);
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'operational',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
