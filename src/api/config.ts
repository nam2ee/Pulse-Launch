// Global configuration and constants
export const CONFIG = {
  // Cloudinary settings
  cloudinary: {
    cloudName: 'dqtuerbqr',
    uploadPreset: 'ml_default',
    url: function() {
      return `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    }
  },
  
  // API endpoints
  api: {
    base: 'https://pulse-be.onrender.com',
    signature: function() { return `${this.base}/api/cloudinary/signature`; },
    content: function() { return `${this.base}/api/contents`; },
    communities: function() { return `${this.base}/api/communities`; }
  },
  
  // Fixed values
  fixed: {
    senderId: "24c4684b-0fe0-4d22-bffc-4727457e2e7a",
    communityId: "a485968a-751d-4545-9bbb-740d55875707",
    walletAddress: "0x1234567890abcdef1234567890abcdef12345678"
  },
  
  // Timer settings
  timer: {
    initialSeconds: 10800 // 180 minutes (3 hours)
  }
}; 



