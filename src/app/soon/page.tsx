'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ContentAPI, Content } from '@/api/content';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TimerAPI, TimerState } from '@/api/timer';
import { CloudinaryAPI } from '@/api/cloudinary';
import { CommunityAPI, Community } from '@/api/community';
import { CONFIG } from '@/api/config';

// Define Soon community ID constant
const SOON_COMMUNITY_ID = "f2e8d7c6-9b5a-4183-b0c9-1d2e3f4a5b6c";

export default function SoonCommunity() {
  // Use Solana Wallet Adapter hooks
  const { publicKey, connected } = useWallet();
  const walletAddress = useMemo(() => publicKey?.toBase58(), [publicKey]);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState<TimerState>({
    hours: 23,
    minutes: 59,
    seconds: 59
  });
  const [community, setCommunity] = useState<Community | null>(null);
  
  // Post content state
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posts, setPosts] = useState<Content[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wallet connection state is managed by the adapter
    loadContent();
    CommunityAPI.fetchCommunityById(SOON_COMMUNITY_ID)
      .then(c => { if (c) setCommunity(c); })
      .catch(console.error);
    const refreshInterval = setInterval(() => {
      loadContent();
    }, 10000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Update the timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Initial timer update
    updateTimer();
    
    // Set up timer that updates every second
    timer = setInterval(() => {
      updateTimer();
    }, 1000);
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [posts, community]);

  // Function to update the timer based on the latest post
  const updateTimer = () => {
    const now = new Date();
    let remainingSec: number;
    if (community) {
      if (posts.length === 0) {
        // No posts yet, start full timeLimit
        remainingSec = community.timeLimit * 60;
      } else {
        // Get the latest post timestamp
        const latestPost = [...posts].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        const elapsed = Math.floor((now.getTime() - new Date(latestPost.createdAt).getTime()) / 1000);
        remainingSec = Math.max(0, community.timeLimit * 60 - elapsed);
      }
      setTimeLeft(TimerAPI.secondsToHMS(remainingSec));
    } else {
      // Fallback to existing behavior if community not loaded
      if (posts.length === 0) {
        setTimeLeft(TimerAPI.getInitialState());
      } else {
        setTimeLeft(TimerAPI.calculateTimeLeft(posts[0].createdAt));
      }
    }
  };

  // Load content from API
  const loadContent = async () => {
    try {
      setLoading(true);
      const contents = await ContentAPI.fetchAllContents(SOON_COMMUNITY_ID);
      
      // Sort by createdAt in descending order (newest first)
      contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setPosts(contents);
      
      // Update timer based on latest post
      if (contents.length > 0) {
        const newTimeLeft = TimerAPI.calculateTimeLeft(contents[0].createdAt);
        setTimeLeft(newTimeLeft);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setContent('');
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle post submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!content.trim()) return;
    
    if (!connected || !walletAddress) {
      alert('Please connect your wallet first!');
      return;
    }
    
    setSubmitting(true);
    
    try {
      let imageUrl: string | undefined = undefined;
      
      // Upload image to Cloudinary if one is selected
      if (imageFile && walletAddress) {
        try {
          imageUrl = await CloudinaryAPI.uploadImage(imageFile, walletAddress);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          // Ask if user wants to continue without the image
          if (!confirm('Image upload failed. Do you want to continue without the image?')) {
            setSubmitting(false);
            return; // Stop submission if user cancels
          }
        }
      }
      
      // Submit content with image URL if available
      await ContentAPI.submitContent(content, SOON_COMMUNITY_ID, imageUrl, walletAddress);
      
      // Reset the form
      resetForm();
      
      // Reload content
      await loadContent();
      
      // Show success message
      alert('Content submitted successfully!');
    } catch (error) {
      console.error('Error submitting content:', error);
      alert('Failed to submit content. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/images/pulse_soon_logo.webp"
              alt="Pulse Soon Logo"
              width={120}
              height={40}
              className="cursor-pointer"
            />
          </Link>
          <div className="flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                <li><Link href="/" className="hover:text-red-400 transition">Home</Link></li>
                <li><Link href="/soon" className="text-red-400 font-bold">Soon</Link></li>
                <li><Link href="/orca" className="hover:text-red-400 transition">Orca</Link></li>
                <li><Link href="/iq6900" className="hover:text-red-400 transition">IQ6900</Link></li>
              </ul>
            </nav>
            <WalletMultiButton style={{ 
              backgroundColor: 'transparent', 
              border: 'none',
              padding: 0
            }} className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-sm font-medium transition" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/soonbackground.png"
            alt="Soon Background"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-red-950/70 via-red-900/60 to-black/80"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 to-red-600 text-transparent bg-clip-text">
                Soon Community Campaign
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Join our community bootstrapper campaign for Soon and earn rewards by posting quality content. The clock is ticking!
              </p>
              
              {/* Timer Display */}
              <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-md p-6 rounded-xl mb-8 border border-red-500/30 shadow-lg">
                <h3 className="text-xl font-medium mb-4 text-red-300">Reward Timer</h3>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-red-900/50 rounded-lg w-16 h-16 flex items-center justify-center border border-red-500/20">
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-red-300">HOURS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-red-900/50 rounded-lg w-16 h-16 flex items-center justify-center border border-red-500/20">
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-red-300">MINUTES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-red-900/50 rounded-lg w-16 h-16 flex items-center justify-center border border-red-500/20">
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-red-300">SECONDS</div>
                  </div>
                </div>
                <p className="text-sm mt-4 text-center text-gray-300">
                  Last poster when timer expires wins the round's rewards!
                </p>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative">
                <div className="relative bg-red-950/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                  <div className="flex items-center mb-6">
                    <div className="relative w-16 h-16 mr-5 flex-shrink-0 bg-red-800/50 rounded-xl flex items-center justify-center border border-white/10 p-2">
                      <Image 
                        src="/images/soonlogo.png" 
                        alt="Soon Logo" 
                        width={48}
                        height={48}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-white">Soon Community</h3>
                      <p className="text-red-400 text-sm font-medium">Featured Project</p>
                    </div>
                  </div>
                  <p className="text-gray-200 mb-6 text-base">
                    Soon is redefining community engagement. Join the movement!
                  </p>
                  
                  <div className="flex justify-around items-center border-t border-b border-white/10 py-4 mb-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-red-300">{community?.bountyAmount ? parseFloat(community.bountyAmount).toFixed(2) : '100.00'}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">PULSE Tokens</div>
                    </div>
                    <div className="border-l border-white/10 h-10"></div>
                    <div>
                      <div className="text-2xl font-bold text-red-300">{posts.length}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Participants</div>
                    </div>
                  </div>

                  <a 
                    href="https://soon.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-red-600 hover:bg-red-700 text-white text-center rounded-lg font-semibold text-sm transition duration-300 shadow-md hover:shadow-lg"
                  >
                    Learn More About Soon
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Posting Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900/80 to-red-900/20 relative">
        <div className="absolute inset-0 bg-[url('/images/soonbackground.png')] opacity-5 bg-fixed"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 text-transparent bg-clip-text inline-block">
              Post About Soon
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-red-500 to-red-600 mx-auto"></div>
          </div>
          
          {/* Post Form */}
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-6 mb-4 border border-red-500/20 shadow-lg">
              <textarea
                className="w-full bg-red-900/40 border border-red-500/30 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Share your thoughts about Soon..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={!connected}
              ></textarea>
              
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <label htmlFor="image-upload" className="cursor-pointer px-4 py-2 rounded-lg bg-red-800/50 hover:bg-red-700/60 border border-red-500/30 text-red-300 text-sm transition">
                    {imageFile ? 'Change Image' : 'Upload Image'}
                  </label>
                  <input 
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={!connected}
                  />
                  {imageFile && <span className="ml-3 text-sm text-gray-400">{imageFile.name}</span>}
                </div>
                {imagePreview && (
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    width={64} 
                    height={64} 
                    className="rounded-lg object-cover border border-red-500/30"
                  />
                )}
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={submitting || !connected}
              className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : (connected ? 'Submit Post' : 'Connect Wallet to Post')}
            </button>
            {!connected && <p className="text-center text-red-400 mt-2 text-sm">You must connect your wallet to post.</p>}
          </form>
          
          {/* Posts Feed */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6 text-red-300">Recent Community Posts</h3>
            
            {loading && (
              <div className="py-8 text-center text-gray-400">
                Loading posts...
              </div>
            )}
            
            {!loading && posts.length === 0 && (
              <div className="py-8 text-center text-gray-400">
                Be the first to post content about Soon!
              </div>
            )}
            
            {posts.map((post) => (
              <div key={post.id} className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-xl p-6 border border-red-500/20 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center border border-red-500/30">
                    <span className="font-bold text-white">{ContentAPI.formatWalletAddress(post.walletAddress).charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-red-300">{ContentAPI.formatWalletAddress(post.walletAddress)}</h4>
                    <p className="text-xs text-gray-400">
                      {ContentAPI.formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-200">{post.content}</p>
                
                {post.imageURL && (
                  <div className="mt-4">
                    <img 
                      src={post.imageURL} 
                      alt="Content" 
                      className="max-h-60 rounded-lg border border-red-500/20"
                    />
                  </div>
                )}
                
                <div className="flex gap-4 mt-4">
                  <button className="text-gray-400 text-sm hover:text-red-400 transition">Like</button>
                  <button className="text-gray-400 text-sm hover:text-red-400 transition">Reply</button>
                  <button className="text-gray-400 text-sm hover:text-red-400 transition">Share</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rewards Section */}
      <section id="rewards" className="py-20 bg-gradient-to-b from-red-900/20 to-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 to-red-600 text-transparent bg-clip-text inline-block">
              Campaign Rewards
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-red-500 to-red-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 p-8 rounded-xl shadow-lg hover:border-red-500/50 transition duration-300">
              <h3 className="text-2xl font-bold mb-6 text-red-300">Winner Rewards</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">500 PULSE Tokens</span>
                    <p className="text-sm text-gray-300">Transferable cryptocurrency with real value</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Exclusive NFT Badge</span>
                    <p className="text-sm text-gray-300">Unique digital collectible marking your achievement</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Priority Access</span>
                    <p className="text-sm text-gray-300">First access to future Pulse campaigns and features</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Featured Profile</span>
                    <p className="text-sm text-gray-300">Highlighted profile on the Pulse platform</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-red-900/40 to-red-800/40 border border-red-500/30 p-8 rounded-xl shadow-lg hover:border-red-500/50 transition duration-300">
              <h3 className="text-2xl font-bold mb-6 text-red-300">Active Participant Rewards</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">50 PULSE Tokens per quality post</span>
                    <p className="text-sm text-gray-300">Earn as you contribute valuable content</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Community Badges</span>
                    <p className="text-sm text-gray-300">Tiered badges based on your contribution level</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Future Campaign Selection</span>
                    <p className="text-sm text-gray-300">Opportunity to be selected for exclusive campaigns</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mr-4">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium text-gray-100">Early Access Features</span>
                    <p className="text-sm text-gray-300">Preview and test new Pulse platform features</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-xl mb-8 text-red-300">Don't miss your chance to participate in this exciting campaign!</p>
            <a href="#top" className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-full font-bold text-lg inline-block transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Posting Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 py-10 border-t border-red-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Image
                src="/images/pulse_soon_logo.webp"
                alt="Pulse Soon Logo"
                width={100}
                height={30}
              />
              <p className="mt-2 text-red-300">Empowering communities through engagement</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-red-400 transition">Twitter</a>
              <a href="#" className="text-gray-300 hover:text-red-400 transition">Discord</a>
              <a href="#" className="text-gray-300 hover:text-red-400 transition">Medium</a>
              <a href="#" className="text-gray-300 hover:text-red-400 transition">GitHub</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-red-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Pulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 