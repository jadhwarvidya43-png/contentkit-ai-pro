// Using Node's native global fetch API

// Fallback dynamic generator to ensure application is fully testable without active API keys
const generateCustomCampaign = (text, brand, modelName, targetLang = 'English') => {
  const brandName = brand ? brand.brandName : 'ContentKit';
  const writingStyle = brand ? brand.writingStyle : 'Professional & Persuasive';
  const targetAudience = brand ? brand.targetAudience : 'Digital Marketers';
  const cta = brand && brand.products.length > 0 ? brand.products[0].cta : 'Get started today';
  const firstProd = brand && brand.products.length > 0 ? brand.products[0].name : 'ContentKit AI Pro';
  const firstProdDesc = brand && brand.products.length > 0 ? brand.products[0].description : 'Automated repurposing pipelines';

  const t = (val) => {
    if (targetLang === 'Spanish') return `[Spanish] ${val}`;
    if (targetLang === 'French') return `[French] ${val}`;
    if (targetLang === 'German') return `[German] ${val}`;
    if (targetLang === 'Japanese') return `[Japanese] ${val}`;
    return val;
  };

  const sampleTitle = text.slice(0, 50).trim() || 'Modern Content Marketing';

  return {
    metadata: {
      modelUsed: `${modelName} (Mock Gateway)`,
      targetLanguage: targetLang,
      tokenCount: 3850,
      costUSD: 0.057
    },
    analysis: {
      mainTopic: `Deep analysis of: "${sampleTitle}..."`,
      subtopics: [
        'Multi-channel visual workflows',
        'Direct semantic conversions',
        'Optimal audience engagement models'
      ],
      audience: targetAudience,
      tone: 'Authoritative, engaging, strategic',
      style: writingStyle,
      painPoints: [
        'Inefficient multi-platform editing operations',
        'Lack of consistent tone of voice alignment',
        'High cost of manual copywriting and scripting'
      ]
    },
    twitter: {
      threads: [
        {
          title: t('Repurposing Checklist'),
          tweets: [
            t(`1/ Stop manual writing. Ground your channels using ${brandName}'s core system. Turn one script into 30+ campaign touchpoints. Here is how:`),
            t(`2/ Whisper speech-to-text diarization isolates who is speaking. From there, semantic mapping divides chapters automatically.`),
            t(`3/ Rewrite drafts using custom style kits. Your LinkedIn voice should not look like your Twitter voice.`),
            t(`4/ Set up automated visual hooks and publish templates. Learn more with ${firstProd} - ${firstProdDesc}. ${cta}!`)
          ]
        }
      ],
      tweetIdeas: [
        t('Copywriting fatigue is a symptom of poor tooling, not lack of creativity.'),
        t('If your team only posts blog links, you are losing 90% of your potential reach.')
      ],
      viralHooks: [
        t('How we turned a 10-minute video into 25 social media drafts in under 90 seconds.'),
        t('The secret distribution playbook Notion and Linear use to dominate socials.')
      ]
    },
    linkedin: {
      posts: [
        t(`Visual workflows are replacing manual copywriting pipelines.\n\nHere is why:\n- Tone consistency is handled by guardrails.\n- Multi-platform drafts are prepared instantly.\n- You focus on editing instead of staring at blank pages.\n\nWe built ${firstProd} to solve this exact bottleneck. ${firstProdDesc}.\n\n👉 ${cta}`)
      ],
      carouselOutline: [
        t('Slide 1: Scaling content without burnout'),
        t('Slide 2: Step 1 - Extract semantic chapters'),
        t('Slide 3: Step 2 - Apply writing guardrails'),
        t('Slide 4: Step 3 - Streamline channel layouts'),
        t('Slide 5: Get the full system with ContentKit')
      ]
    },
    blog: {
      seoTitle: t(`The Ultimate Playbook to automated multi-platform distribution | ${brandName}`),
      metaDescription: t(`Learn how to turn single audio and video files into multi-channel campaigns using automated brand kits and visual workflows.`),
      outline: [
        t('Introduction: The Content Distribution bottleneck'),
        t('Why manual repurposing fails at scale'),
        t('Structuring semantic pipelines with AI'),
        t('Conclusion and Next Steps')
      ],
      faqs: [
        {
          question: t('How does the brand voice engine work?'),
          answer: t('It compiles writing style attributes and target audience data directly into the system prompts to enforce strict constraints.')
        }
      ],
      internalLinks: [
        '/features/workflows',
        '/solutions/enterprise'
      ]
    },
    newsletter: {
      subject: t(`Inside our automated multi-platform marketing playbook`),
      introduction: t(`Struggling to keep up with posting schedules? We broke down the exact framework to repurpose video files into full newsletters, blogs, and Twitter threads automatically.`),
      ctaText: t(cta)
    },
    videoClips: [
      {
        title: '0:00 - 0:45 (Viral Hook Segment)',
        score: 95,
        transcript: t('This is a highlight clip showing the visual workflow canvas and brand kit operations in action.'),
        subtitles: [
          { text: t('This visual workflow canvas is a complete game changer...'), time: '0:05' }
        ]
      }
    ],
    otherPlatforms: {
      substack: t(`Visual pipelines are replacing manual copywriting layouts. By integrating direct brand voice grounding, marketing teams can scale campaigns 10x without dilution.`),
      reddit: t(`What is your team's workflow for repurposing video/audio content? We recently automated ours using semantic mapping and custom brand styles. Here are the results...`)
    },
    seoEngine: {
      readabilityScore: 88,
      keywordDensity: [
        { keyword: brandName, density: '2.8%' },
        { keyword: 'content repurposing', density: '2.1%' }
      ],
      keywords: [
        { word: 'content automation', difficulty: 'Medium', volume: '12,500' },
        { word: 'repurpose video to text', difficulty: 'Low', volume: '3,200' }
      ]
    }
  };
};

const generateCampaign = async (text, brand, modelName, targetLang = 'English') => {
  const brandName = brand ? brand.brandName : 'ContentKit';
  const writingStyle = brand ? brand.writingStyle : 'Professional & Persuasive';
  const targetAudience = brand ? brand.targetAudience : 'Digital Marketers';
  const cta = brand && brand.products.length > 0 ? brand.products[0].cta : 'Get started today';
  
  const systemPrompt = `You are an expert marketing copywriter and content strategist. 
Your task is to take the following input source text and repurpose it into a complete, high-quality, multi-platform marketing campaign.
Format the output strictly as a JSON object matching the JSON schema below. Do not output anything except the parsed JSON.

JSON Schema:
{
  "metadata": {
    "modelUsed": "String (the model name)",
    "targetLanguage": "String (the language generated)",
    "tokenCount": Number,
    "costUSD": Number
  },
  "analysis": {
    "mainTopic": "String",
    "subtopics": ["String"],
    "audience": "String",
    "tone": "String",
    "style": "String",
    "painPoints": ["String"]
  },
  "twitter": {
    "threads": [
      {
        "title": "String",
        "tweets": ["String"]
      }
    ],
    "tweetIdeas": ["String"],
    "viralHooks": ["String"]
  },
  "linkedin": {
    "posts": ["String (long-form thought leadership post)"],
    "carouselOutline": ["String"]
  },
  "blog": {
    "seoTitle": "String",
    "metaDescription": "String",
    "outline": ["String"],
    "faqs": [
      { "question": "String", "answer": "String" }
    ],
    "internalLinks": ["String"]
  },
  "newsletter": {
    "subject": "String",
    "introduction": "String",
    "ctaText": "String"
  },
  "videoClips": [
    {
      "title": "String",
      "score": Number,
      "transcript": "String",
      "subtitles": [
        { "text": "String", "time": "String" }
      ]
    }
  ],
  "otherPlatforms": {
    "substack": "String",
    "reddit": "String"
  },
  "seoEngine": {
    "readabilityScore": Number,
    "keywordDensity": [
      { "keyword": "String", "density": "String" }
    ],
    "keywords": [
      { "word": "String", "difficulty": "String", "volume": "String" }
    ]
  }
}

Brand Context:
- Brand Name: ${brandName}
- Writing Style: ${writingStyle}
- Target Audience: ${targetAudience}
- Target Call To Action (CTA): ${cta}
- Target Language: ${targetLang}

Input Source Text:
"${text}"
`;

  // OpenAI Routing
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: modelName.toLowerCase().includes('gpt-4') ? 'gpt-4o' : 'gpt-3.5-turbo',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are a structured marketer assistant.' },
            { role: 'user', content: systemPrompt }
          ],
          temperature: 0.7
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0]) {
        return JSON.parse(data.choices[0].message.content);
      }
    } catch (err) {
      console.error('OpenAI API gateway failed:', err);
    }
  }

  // Gemini Routing
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemPrompt }]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7
          }
        })
      });
      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return JSON.parse(data.candidates[0].content.parts[0].text);
      }
    } catch (err) {
      console.error('Gemini API gateway failed:', err);
    }
  }

  // Fallback to local dynamic campaign builder
  return generateCustomCampaign(text, brand, modelName, targetLang);
};

module.exports = {
  generateCampaign
};
