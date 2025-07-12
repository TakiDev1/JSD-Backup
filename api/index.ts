import { type VercelRequest, VercelResponse } from '@vercel/node';

// Extremely minimal serverless function to avoid all import issues
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const url = req.url || '';
    const method = req.method || 'GET';

    // Health check endpoint
    if (url === '/health' || url === '/api/health') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'JSD Mods API is running on Vercel (minimal mode)',
        method,
        url
      });
    }

    // Basic mods endpoint (mock data for now)
    if (url.startsWith('/api/mods') && method === 'GET') {
      // Mock mod data to test if the function works
      const mockMods = [
        {
          id: 1,
          title: "JSD's Demo Mod",
          description: "A demo mod for testing",
          price: 9.99,
          category: "vehicles",
          previewImageUrl: "/assets/car-demo.jpg",
          isFeatured: true,
          downloadCount: 123
        },
        {
          id: 2,
          title: "Test Sports Car",
          description: "Another test mod",
          price: 14.99,
          category: "sports",
          previewImageUrl: "/assets/car-demo2.jpg",
          isFeatured: false,
          downloadCount: 89
        }
      ];

      return res.status(200).json({
        mods: mockMods,
        message: "Mock data - database not connected in minimal mode"
      });
    }

    // Auth endpoint
    if (url.startsWith('/api/auth')) {
      return res.status(401).json({
        message: "Authentication not available in minimal mode"
      });
    }

    // Cart endpoints
    if (url.startsWith('/api/cart')) {
      return res.status(200).json({
        message: "Cart functionality not available in minimal mode",
        data: []
      });
    }

    // All other routes
    return res.status(404).json({
      error: "Route not found",
      path: url,
      method: method,
      available_endpoints: [
        '/health',
        '/api/health', 
        '/api/mods',
        '/api/auth/*',
        '/api/cart'
      ],
      mode: "minimal"
    });
    
  } catch (error) {
    console.error("Handler error:", error);
    
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
    });
  }
}