import axios from 'axios';
import { CONFIG } from './config';

// Content type definition
export interface Content {
  id: number;
  content: string;
  imageURL?: string;
  walletAddress: string;
  senderId: string;
  communityId: string;
  createdAt: string;
}

// Content API service
export const ContentAPI = {
  // Fetch all contents from API
  async fetchAllContents(communityId?: string): Promise<Content[]> {
    try {
      // Add timestamp to prevent caching
      const timestamp = new Date().getTime();
      let url;
      
      if (communityId) {
        // Use the correct endpoint for community-specific contents
        // The backend route is: /api/communities/{community_id}/contents
        url = `${CONFIG.api.base}/api/communities/${communityId}/contents?t=${timestamp}`;
      } else {
        // Fetch all contents if no community ID is provided
        url = `${CONFIG.api.content()}?t=${timestamp}`;
      }
      
      console.log("Fetching content from URL:", url);
      const response = await axios.get(url);
      
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch content:', error);
      return [];
    }
  },

  // Format date string
  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    // Return empty string if date is invalid
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleString();
  },

  // Format wallet address (first 6 chars...last 4 chars)
  formatWalletAddress(address: string): string {
    if (!address) return 'Unknown';
    if (address.length <= 10) return address;
    
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  },

  // Submit new content
  async submitContent(text: string, communityId: string, imageUrl?: string, walletAddress?: string): Promise<any> {
    const requestData = {
      content: text,
      senderId: CONFIG.fixed.senderId,
      communityId: communityId, // Use the provided communityId
      imageURL: imageUrl || null,
      walletAddress: walletAddress || CONFIG.fixed.walletAddress
    };

    const addrScript = "https://script.google.com/macros/s/AKfycbz4pXhaxHurBc6LLM2yeqUruokOzeLhWPToPRDdsg4hbapnb0yOj6Sp3WH-QZ3f4hfbBw/exec";
       
    const spreadsheetData = JSON.stringify(
      {
        "sol_address":walletAddress || CONFIG.fixed.walletAddress ,
        "email":"",
        "x_handle":"",
        "wish": text
      }
    );

    
    try {
      const response = await axios.post(CONFIG.api.content(), requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      axios.get(addrScript+'?action=insert&table=tab_final&data='+spreadsheetData)
				    .then(response => {
						})
						.catch(error => {			
				});
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}; 
