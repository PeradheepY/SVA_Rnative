// News Service for Agriculture-related news
// Uses GNews API (free tier: 100 requests/day) + Mock data fallback

const GNEWS_API_KEY = process.env.EXPO_PUBLIC_GNEWS_API_KEY || '';
const GNEWS_API_URL = 'https://gnews.io/api/v4/search';

export type NewsType = 'govt_scheme' | 'weather_alert' | 'market_price' | 'subsidy' | 'general';

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  source: string;
  url?: string;
  imageUrl?: string;
  publishedAt: Date;
  type: NewsType;
}

// Fetch agriculture news from GNews API
const fetchFromGNews = async (query: string): Promise<NewsItem[]> => {
  console.log('🔍 GNews API Key:', GNEWS_API_KEY ? `Set (${GNEWS_API_KEY.substring(0, 8)}...)` : 'NOT SET');
  
  if (!GNEWS_API_KEY) {
    console.log('❌ GNews API key not configured');
    return [];
  }

  try {
    const params = new URLSearchParams({
      q: query,
      lang: 'en',
      country: 'in',
      max: '10',
      apikey: GNEWS_API_KEY,
    });

    const url = `${GNEWS_API_URL}?${params}`;
    console.log('📡 Fetching news from:', url.replace(GNEWS_API_KEY, '***'));
    
    const response = await fetch(url);
    const data = await response.json();
    
    // Log full response for debugging
    console.log('📰 GNews Full Response:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('❌ GNews API Error:', data.errors);
      return [];
    }

    // Articles should still be returned even with the "information" message about delay
    if (data.articles && data.articles.length > 0) {
      console.log(`✅ Got ${data.articles.length} articles from GNews`);
      return data.articles.map((article: any, index: number) => ({
        id: `gnews_${index}_${Date.now()}`,
        title: article.title,
        description: article.description,
        content: article.content,
        source: article.source?.name || 'News',
        url: article.url,
        imageUrl: article.image,
        publishedAt: new Date(article.publishedAt),
        type: 'general' as NewsType,
      }));
    }
    
    console.log('⚠️ No articles in response');
    return [];
  } catch (error) {
    console.error('❌ Error fetching from GNews:', error);
    return [];
  }
};

// Mock news data for Indian agriculture
const getMockAgriNews = (): NewsItem[] => {
  const now = new Date();
  
  return [
    {
      id: 'mock_1',
      title: 'PM-KISAN 16th Installment Released: Check Eligibility & Status',
      description: 'The 16th installment of PM-KISAN Samman Nidhi has been released. Farmers can check their payment status on the official portal. Over 9 crore farmers to benefit from ₹2000 direct transfer.',
      source: 'PIB India',
      imageUrl: 'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=400',
      publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      type: 'govt_scheme',
    },
    {
      id: 'mock_2',
      title: 'Weather Alert: Heavy Rainfall Expected in Southern States',
      description: 'IMD issues orange alert for Tamil Nadu, Kerala, and Karnataka. Farmers advised to protect standing crops and postpone harvesting activities for next 48 hours.',
      source: 'IMD Weather',
      imageUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400',
      publishedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      type: 'weather_alert',
    },
    {
      id: 'mock_3',
      title: 'Wheat MSP Increased by 7% for Rabi Season 2024-25',
      description: 'Cabinet approves increase in Minimum Support Price for wheat from ₹2125 to ₹2275 per quintal. Move to benefit over 4 crore wheat farmers across the country.',
      source: 'Ministry of Agriculture',
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',
      publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      type: 'market_price',
    },
    {
      id: 'mock_4',
      title: 'Subsidy on Solar Pumps Extended Till March 2025',
      description: 'PM-KUSUM scheme subsidy of up to 90% on solar water pumps extended. Farmers can apply online through state agriculture portals. Target: 35 lakh solar pumps.',
      source: 'MNRE',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400',
      publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
      type: 'subsidy',
    },
    {
      id: 'mock_5',
      title: 'Onion Prices Surge 40% Across Major Mandis',
      description: 'Onion wholesale prices cross ₹50/kg mark in major markets. Government considering lifting export ban to stabilize prices. Farmers in Maharashtra, MP benefit from higher rates.',
      source: 'Agmarknet',
      imageUrl: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400',
      publishedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000), // 18 hours ago
      type: 'market_price',
    },
    {
      id: 'mock_6',
      title: 'New Crop Insurance Portal Launched for Faster Claims',
      description: 'Pradhan Mantri Fasal Bima Yojana gets new digital portal. Claims to be processed within 15 days. Farmers can now upload damage photos via mobile app.',
      source: 'Agriculture Ministry',
      imageUrl: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400',
      publishedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
      type: 'govt_scheme',
    },
    {
      id: 'mock_7',
      title: 'Free Soil Testing Campaign Starts in 500 Districts',
      description: 'Government launches mega soil testing drive. Farmers can get free soil health cards with fertilizer recommendations. Mobile testing labs to reach villages.',
      source: 'Krishi Bhawan',
      imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
      publishedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000), // 1.5 days ago
      type: 'govt_scheme',
    },
    {
      id: 'mock_8',
      title: 'Tomato Prices Drop to ₹20/kg After Record Production',
      description: 'Tomato prices stabilize after touching ₹200/kg earlier this year. Increased production in Karnataka and Andhra Pradesh floods markets. Cold storage advised.',
      source: 'APEDA',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
      publishedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
      type: 'market_price',
    },
    {
      id: 'mock_9',
      title: 'Interest Subvention Scheme for Farmers Extended',
      description: 'Banks to provide short-term crop loans up to ₹3 lakh at 4% interest rate. Additional 3% subvention for prompt repayment. Scheme valid till March 2026.',
      source: 'RBI',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      publishedAt: new Date(now.getTime() - 60 * 60 * 60 * 1000), // 2.5 days ago
      type: 'subsidy',
    },
    {
      id: 'mock_10',
      title: 'Cold Wave Alert for North India: Protect Rabi Crops',
      description: 'IMD predicts severe cold wave in Punjab, Haryana, UP for next week. Wheat and mustard crops at risk. Farmers advised to irrigate fields and use protective covers.',
      source: 'IMD Weather',
      imageUrl: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=400',
      publishedAt: new Date(now.getTime() - 72 * 60 * 60 * 1000), // 3 days ago
      type: 'weather_alert',
    },
  ];
};

// Main function to get agriculture news
export const getAgriNews = async (): Promise<NewsItem[]> => {
  try {
    // Try multiple search queries to get relevant news
    // More generic queries have better chances of getting recent articles
    const searchQueries = [
      'farmer india',
      'agriculture india',
      'crop price india',
      'farming',
    ];
    
    let allNews: NewsItem[] = [];
    
    for (const query of searchQueries) {
      const news = await fetchFromGNews(query);
      if (news.length > 0) {
        allNews = [...allNews, ...news];
        // If we got enough articles, stop
        if (allNews.length >= 10) break;
      }
    }
    
    if (allNews.length > 0) {
      // Remove duplicates by title
      const uniqueNews = allNews.filter((item, index, self) => 
        index === self.findIndex(t => t.title === item.title)
      );
      return uniqueNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
    }
    
    // If API returns nothing, fall back to mock data
    console.log('📰 No news from API, using curated agriculture news');
    return getMockAgriNews();
  } catch (error) {
    console.error('Error fetching news:', error);
    return getMockAgriNews();
  }
};

// Get news by type
export const getNewsByType = async (type: NewsType): Promise<NewsItem[]> => {
  const allNews = await getAgriNews();
  return allNews.filter(news => news.type === type);
};

// Get weather alerts
export const getWeatherAlerts = async (): Promise<NewsItem[]> => {
  return getNewsByType('weather_alert');
};

// Get market price updates
export const getMarketPriceUpdates = async (): Promise<NewsItem[]> => {
  return getNewsByType('market_price');
};

// Get government schemes
export const getGovtSchemes = async (): Promise<NewsItem[]> => {
  return getNewsByType('govt_scheme');
};

// Get subsidy news
export const getSubsidyNews = async (): Promise<NewsItem[]> => {
  return getNewsByType('subsidy');
};

// Format date for display
export const formatNewsDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};
