import axios from 'axios';
import { CONFIG } from './config';

export interface Community {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  creatorId: string;
  creatorXid: string;
  lastMessageTime: string | null;
  contractAddress: string | null;
  bountyAmount: string;
  timeLimit: number; // in minutes
  baseFeePercentage: number | null;
  walletAddress: string | null;
  imageURL: string | null;
}

export const CommunityAPI = {
  // Fetch all communities from API
  async fetchCommunities(): Promise<Community[]> {
    try {
      const timestamp = new Date().getTime();
      const response = await axios.get(`${CONFIG.api.communities()}?t=${timestamp}`);
      if (response.data && Array.isArray(response.data)) {
        return response.data as Community[];
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch communities:', error);
      return [];
    }
  },

  // Fetch a single community by id
  async fetchCommunityById(id: string): Promise<Community | null> {
    const communities = await this.fetchCommunities();
    const community = communities.find(c => c.id === id);
    return community || null;
  }
}; 