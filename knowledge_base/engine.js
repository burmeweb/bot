// knowledge_base/engine.js
const KnowledgeBase = {
    indexed: false,
    documents: [],
    
    init: function() {
        this.loadKnowledgeBase();
    },
    
    loadKnowledgeBase: function() {
        // Load knowledge base data
        fetch('/knowledge_base/data.json')
            .then(response => response.json())
            .then(data => {
                this.documents = data;
                this.indexDocuments();
            })
            .catch(error => {
                console.error('Error loading knowledge base:', error);
            });
    },
    
    indexDocuments: function() {
        // Simple indexing for search
        this.documents.forEach(doc => {
            // Create searchable text by combining title and content
            doc.searchableText = `${doc.title} ${doc.content}`.toLowerCase();
            
            // Tokenize for better searching (simple version)
            doc.tokens = doc.searchableText.split(/\s+/);
        });
        
        this.indexed = true;
        console.log('Knowledge base indexed with', this.documents.length, 'documents');
    },
    
    search: function(query, maxResults = 5) {
        if (!this.indexed) {
            console.warn('Knowledge base not yet indexed');
            return [];
        }
        
        const queryTokens = query.toLowerCase().split(/\s+/);
        const results = [];
        
        // Simple search algorithm - count matching tokens
        this.documents.forEach(doc => {
            let score = 0;
            
            queryTokens.forEach(token => {
                if (token.length < 2) return; // Ignore very short tokens
                
                doc.tokens.forEach(docToken => {
                    if (docToken.includes(token)) {
                        score += token.length; // Longer matches get higher score
                    }
                });
            });
            
            if (score > 0) {
                results.push({
                    document: doc,
                    score: score
                });
            }
        });
        
        // Sort by score (highest first) and return top results
        return results.sort((a, b) => b.score - a.score)
                     .slice(0, maxResults)
                     .map(result => result.document);
    },
    
    getAnswer: function(question) {
        // First try to find exact matches
        const results = this.search(question);
        
        if (results.length > 0) {
            return {
                answer: results[0].content,
                source: results[0].title,
                confidence: 'high'
            };
        }
        
        // If no good matches, return a default response
        return {
            answer: 'I apologize, but I could not find specific information about that in my knowledge base. Would you like me to search for more general information?',
            confidence: 'low'
        };
    },
    
    suggestRelated: function(query, maxSuggestions = 3) {
        const results = this.search(query, 10);
        
        // Return unique titles
        const suggestions = [];
        const seen = new Set();
        
        for (const result of results) {
            if (!seen.has(result.title)) {
                suggestions.push(result.title);
                seen.add(result.title);
                
                if (suggestions.length >= maxSuggestions) break;
            }
        }
        
        return suggestions;
    }
};

// Initialize knowledge base
document.addEventListener('DOMContentLoaded', function() {
    KnowledgeBase.init();
});
