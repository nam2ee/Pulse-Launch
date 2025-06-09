import axios from 'axios';
import { CONFIG } from './config';

// Cloudinary API service
export const CloudinaryAPI = {
  // Get upload signature from backend
  async getSignature(publicId: string, folder: string): Promise<any> {
    try {
      const response = await axios.post(CONFIG.api.signature(), { public_id: publicId, folder });
      return response.data;
    } catch (error) {
      console.error('Failed to get signature:', error);
      throw error;
    }
  },
  
  // Upload image to Cloudinary
  async uploadImage(file: File, walletAddress: string): Promise<string> {
    try {
      // Prepare public_id and folder
      const timestampNow = Date.now();
      const shortWallet = walletAddress.substring(0, 10);
      const shortTimestamp = timestampNow.toString().slice(-6);
      const generatedPublicId = `${shortWallet}_${shortTimestamp}`;
      const generatedFolder = `users/${walletAddress}`;

      // Request signature from backend
      const signatureDataRaw = await this.getSignature(generatedPublicId, generatedFolder);

      // Normalize signature response fields
      const apiKey = signatureDataRaw.api_key || signatureDataRaw.apiKey || CONFIG.cloudinary.cloudName;
      const timestamp = signatureDataRaw.timestamp ?? signatureDataRaw.ts;
      const signature = signatureDataRaw.signature;
      const publicId = signatureDataRaw.public_id || signatureDataRaw.publicId || generatedPublicId;
      const folder = signatureDataRaw.folder || signatureDataRaw.folderName || generatedFolder;
      const cloudName = signatureDataRaw.cloud_name || signatureDataRaw.cloudName || CONFIG.cloudinary.cloudName;

      // Build form data for upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', String(timestamp));
      formData.append('signature', signature);
      formData.append('public_id', publicId);
      formData.append('folder', folder);

      // Perform the upload using fetch (to let browser set multipart boundaries)
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      if (!uploadResponse.ok) {
        throw new Error(`Image upload failed with status ${uploadResponse.status}`);
      }
      const uploadResult = await uploadResponse.json();
      if (uploadResult.secure_url) {
        return uploadResult.secure_url;
      }
      throw new Error('Upload completed but no URL returned');
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }
}; 