'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { ContentAPI, Content } from '@/api/content';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { TimerAPI, TimerState } from '@/api/timer';
import { CloudinaryAPI } from '@/api/cloudinary';
import { CommunityAPI, Community } from '@/api/community';
import { CONFIG } from '@/api/config';
import { toast } from 'react-toastify';

// Define Pulse community ID constant - REMEMBER TO REPLACE THIS
const PULSE_COMMUNITY_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"; 

// ====================================================================
// 사용자 추적 로그를 위한 헬퍼 함수들 (컴포넌트 외부에 배치)
// ====================================================================

// 쿠키에서 값을 가져오는 함수
const getCookieValue = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift();
  }
};

// 쿠키에 값을 저장하는 함수
const setCookieValue = (name: string, value: string, days: number): void => {
  if (typeof document === 'undefined') return;
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

// 고유 사용자 ID 가져오기
const getUVfromCookie = (): string => {
  const hash = Math.random().toString(36).substring(2, 8).toUpperCase();
  const existingHash = getCookieValue("user");
  if (!existingHash) {
    setCookieValue("user", hash, 180); // 쿠키 만료일은 6개월
    return hash;
  }
  return existingHash;
};

// Time Stamp 가져오기
const getTimeStamp = (): string => {
  const padValue = (value: number) => (value < 10) ? "0" + value : value;
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${year}-${padValue(month)}-${padValue(day)} ${padValue(hours)}:${padValue(minutes)}:${padValue(seconds)}`;
};


export default function PulseCommunity() {
  // Use Solana Wallet Adapter hooks
  const { publicKey, connected, connect, disconnect } = useWallet();
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
  const [animatePost, setAnimatePost] = useState(false);

  // Ref for the timer section
  const timerRef = useRef<HTMLDivElement>(null);

  // ====================================================================
  // 사용자 추적 로그 Effect (페이지 방문 시 1회 실행)
  // ====================================================================
  useEffect(() => {
    const trackUser = async () => {
      try {
        // 1. IP 주소 가져오기
        let ip = 'unknown';
        try {
          const ipResponse = await axios.get('https://api.ipify.org?format=json');
          ip = ipResponse.data.ip;
        } catch (e) {
          console.error("Could not fetch IP address.", e);
        }

        // 2. 기타 정보 수집
        const urlParams = new URLSearchParams(window.location.search);
        const utm = urlParams.get("utm") || "";
        const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
        
        // 3. 전송할 데이터 준비
        const data = JSON.stringify({
          "id": getUVfromCookie(),
          "landingUrl": window.location.href,
          "ip": ip,
          "referer": document.referrer,
          "time_stamp": getTimeStamp(),
          "utm": utm,
          "device": mobile
        });
        
        // 4. Google Apps Script로 데이터 전송
        const addrScript = 'https://script.google.com/macros/s/AKfycbz4pXhaxHurBc6LLM2yeqUruokOzeLhWPToPRDdsg4hbapnb0yOj6Sp3WH-QZ3f4hfbBw/exec';
        await axios.get(`${addrScript}?action=insert&table=visitors&data=${data}`);
        
        console.log('User tracking data sent successfully.');

      } catch (error) {
        console.error('Error sending user tracking data:', error);
      }
    };

    trackUser();
  }, []); // 빈 배열을 전달하여 컴포넌트가 마운트될 때 한 번만 실행되도록 설정


  // Initialize wallet and load data
  useEffect(() => {
    // Load initial content
    loadContent();
    
    // Fetch community info (to get dynamic timeLimit)
    CommunityAPI.fetchCommunityById(PULSE_COMMUNITY_ID)
      .then(c => { if (c) setCommunity(c); })
      .catch(console.error);
    
    // Set up auto-refresh (every 10 seconds)
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
      const timeLimit = community.timeLimit || (24 * 60); // Default 24h if null
      
      if (posts.length === 0) {
        // No posts yet, start full timeLimit
        remainingSec = timeLimit * 60;
      } else {
        // Get the latest post timestamp (already sorted descending)
        const latestPost = posts[0];
        const elapsed = Math.floor((now.getTime() - new Date(latestPost.createdAt).getTime()) / 1000);
        remainingSec = Math.max(0, timeLimit * 60 - elapsed);
      }
      setTimeLeft(TimerAPI.secondsToHMS(remainingSec));
    } else {
      // Fallback if community data not loaded yet
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 }); // Or show a loading state
    }
  };

  // Load content from API
  const loadContent = async () => {
    try {
      setLoading(true);
      const contents = await ContentAPI.fetchAllContents(PULSE_COMMUNITY_ID);
      
      // Sort by createdAt in descending order (newest first)
      contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setPosts(contents);
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content.');
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
      toast.error('Please connect your wallet first!');
      return;
    }
    
    setSubmitting(true);
    
    try {
      let imageUrl: string | undefined = undefined;
      
      // Upload image to Cloudinary if one is selected
      if (imageFile) {
        try {
          imageUrl = await CloudinaryAPI.uploadImage(imageFile, walletAddress);
          console.log('Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          toast.error('Image upload failed. Please try again or submit without it.');
          if (!confirm('Image upload failed. Do you want to continue without the image?')) {
            setSubmitting(false);
            return; // Stop submission if user cancels
          }
        }
      }
      
      // Submit content with image URL if available
      await ContentAPI.submitContent(content, PULSE_COMMUNITY_ID, imageUrl, walletAddress);
      
      // Reset the form
      resetForm();
      
      // Reload content
      await loadContent();
      
      // Trigger post animation
      setAnimatePost(true);
      setTimeout(() => setAnimatePost(false), 1000);
      
      // Scroll to the timer
      timerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Display success toast using react-toastify
      const twitterBaseUrl = "https://x.com/intent/tweet?in_reply_to=1922120780847910947&text=";
      const encodedText = encodeURIComponent(content);
      // const tweetUrl = `${twitterBaseUrl}${encodedText}`; // Keep URL logic if needed

      const PostOnXButton = () => (
        <button 
          onClick={() => window.open(twitterBaseUrl + encodedText, '_blank')}
          // You might want to adjust the styling here to match your preference
          className="mt-3 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-all duration-150 ease-in-out shadow-md hover:shadow-lg"
        >
          Post on X!
        </button>
      );

      toast.success(
        <div className="flex flex-col items-center text-center p-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
           <p className="font-semibold text-lg mb-1">Content Submitted!</p> 
           <p className="text-xs text-yellow-400 mb-2 px-2">Important: X Post is mandatory to be eligible for rewards.</p> 
           <PostOnXButton />
         </div>,
         {
           icon: false, // Keep icon false if you have a custom one in the div
           autoClose: 10000 // Keep toast open longer
         } 
      );

    } catch (error) {
      console.error('Error submitting content:', error);
      const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred.';
      if (errorMessage.includes("last content is over")) {
        toast.error('Posting limit reached. Please wait before posting again.');
      } else {
        toast.error(`Failed to submit post: ${errorMessage}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate urgency for styling
  const totalSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const isUrgent = totalSeconds < 600 && totalSeconds > 0;

  // ... 이하 기존 렌더링(JSX) 코드는 변경 없이 그대로 유지됩니다 ...
  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-hidden">

      {/* 배경 효과 */}

      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/pulsebg.jpg')] opacity-20 bg-fixed"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-indigo-950/30 to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* 헤더 - 글래스모피즘 적용 */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-indigo-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <Image
              src="/images/pulseLogoBlank.png"
              alt="Pulse Logo"
              width={120}
              height={40}
              className="cursor-pointer relative rounded-lg"
            />
          </Link>
          <div className="flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                {/* Removed Home Link */}
              </ul>
            </nav>
            <WalletMultiButton style={{ 
              backgroundColor: 'transparent', 
              border: 'none',
              padding: 0
            }} className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] shadow-lg relative overflow-hidden group" />
          </div>
        </div>
      </header>

      {/* 히어로 섹션 - 더 현대적인 디자인 */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/pulsebg.jpg"
            alt="Pulse Background"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/70 via-indigo-800/60 to-black/90"></div>
        </div>
        
        {/* 장식용 요소 */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text drop-shadow-lg">
                Pulse Community Campaign
              </h1>
              <p className="text-xl mb-8 text-gray-300 leading-relaxed backdrop-blur-sm bg-black/10 p-6 rounded-xl border border-gray-800/50">
                Join our community bootstrapper campaign for Pulse and earn rewards by posting quality content. The clock is ticking!
              </p>
              
              {/* 타이머 디스플레이 - 글래스모피즘 적용 */}
              <div ref={timerRef} className="backdrop-blur-md bg-indigo-900/20 p-8 rounded-xl border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.2)] hover:shadow-[0_0_35px_rgba(99,102,241,0.3)] transition-all duration-500">
                <h3 className="text-xl font-medium mb-4 text-indigo-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Reward Timer
                </h3>
                <div className="flex justify-center gap-4">
                  <div className="text-center">
                    <div className={`text-3xl font-bold bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-md rounded-lg w-16 h-16 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-transform duration-500 ease-in-out ${isUrgent ? 'text-red-500 animate-pulse' : ''} ${animatePost ? 'scale-125' : 'scale-100'}`}>
                      {timeLeft.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-indigo-300 font-medium tracking-wider">HOURS</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-md rounded-lg w-16 h-16 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-transform duration-500 ease-in-out ${isUrgent ? 'text-red-500 animate-pulse' : ''} ${animatePost ? 'scale-125' : 'scale-100'}`}>
                      {timeLeft.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-indigo-300 font-medium tracking-wider">MINUTES</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-md rounded-lg w-16 h-16 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-transform duration-500 ease-in-out ${isUrgent ? 'text-red-500 animate-pulse' : ''} ${animatePost ? 'scale-125' : 'scale-100'}`}>
                      {timeLeft.seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs mt-2 text-indigo-300 font-medium tracking-wider">SECONDS</div>
                  </div>
                </div>
                <p className="text-sm mt-4 text-center text-gray-300 backdrop-blur-sm bg-indigo-900/10 p-2 rounded-lg border border-indigo-500/20">
                  Last poster when timer expires wins the round's rewards!
                </p>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className="relative group">
                {/* <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 scale-105"></div> */}
                <div className="relative backdrop-blur-xl bg-indigo-950/60 p-8 rounded-2xl border border-slate-300/10 shadow-xl overflow-hidden">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-purple-500/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
                  
                  <div className="flex items-center mb-6 relative">
                    <div className="relative w-16 h-16 mr-5 flex-shrink-0 bg-gradient-to-br from-indigo-800/50 to-purple-800/50 rounded-xl flex items-center justify-center border border-slate-300/20 p-2 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                      <Image 
                        src="/images/pulselogo.jpg"
                        alt="Pulse Logo" 
                        width={48}
                        height={48}
                        style={{ objectFit: 'contain' }}
                        className="rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Pulse Community</h3> 
                      <p className="text-purple-400 text-sm font-medium">Featured Project</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-200 mb-6 text-base backdrop-blur-sm bg-indigo-900/10 p-4 rounded-lg border border-indigo-500/20">
                    Pulse is redefining community engagement through innovative tokenized participation models and time-based rewards. Join the movement!
                  </p>
                  
                  <div className="flex justify-around items-center border-t border-b border-slate-300/10 py-4 mb-6 text-center">
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">{community?.bountyAmount ? parseFloat(community.bountyAmount).toFixed(2) : '100.00'}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">SOL</div>
                    </div>
                    <div className="border-l border-slate-300/10 h-10"></div>
                    <div>
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">{posts.length}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Participants</div>
                    </div>
                  </div>

                  <a 
                    href="https://pulse.community"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-center rounded-lg font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10">Learn More About Pulse</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 콘텐츠 포스팅 섹션 - 글래스모피즘 적용 */}
      <section className="py-20 relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/pulsebg.jpg')] opacity-5 bg-fixed"></div>
          <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text inline-block">
              Post About Pulse
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          {/* 포스트 폼 - 글래스모피즘 적용 */}
          <form onSubmit={handleSubmit} className="mb-12">
            <div className="backdrop-blur-md bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl p-6 mb-4 border border-indigo-500/30 shadow-[0_0_25px_rgba(99,102,241,0.2)] hover:shadow-[0_0_35px_rgba(99,102,241,0.3)] transition-all duration-500">
              <textarea
                className="w-full backdrop-blur-md bg-indigo-900/30 border border-indigo-500/30 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                rows={4}
                placeholder="Share your thoughts about Pulse..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                disabled={!connected}
              ></textarea>
              
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <label htmlFor="image-upload" className="cursor-pointer px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-600/80 hover:to-purple-600/80 backdrop-blur-sm border border-indigo-500/30 text-white text-sm transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]">
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
                  {imageFile && <span className="ml-3 text-sm text-gray-300">{imageFile.name}</span>}
                </div>
                {imagePreview && (
                  <div className="relative group">
                    <div className="relative">
                      <Image 
                        src={imagePreview} 
                        alt="Preview" 
                        width={64} 
                        height={64} 
                        className="rounded-lg object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={submitting || !connected}
              className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white transform hover:scale-105 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">{submitting ? 'Submitting...' : (connected ? 'Submit Post' : 'Connect Wallet to Post')}</span>
            </button>
            {!connected && <p className="text-center text-purple-400 mt-2 text-sm">You must connect your Solana wallet to post.</p>}
            {/* Warning about X post requirement */}
            <p className="mt-3 text-center text-yellow-500 text-xl font-xl flex items-center justify-center gap-1.5">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
               <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
             </svg>
             Important: Post on X after submission to be eligible for rewards.
           </p>
           <p className="mt-3 text-center text-white-700 text-xl font-xl flex items-center justify-center gap-1.5">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm-.75-4.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zm0-6.75a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V5.25a.75.75 0 01.75-.75z" clipRule="evenodd" />
             </svg>
             Note: Duplicated submission is allowed!
           </p>
          </form>
          
          {/* 포스트 피드 - 글래스모피즘 적용 */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Recent Community Posts</h3>
            
            {loading && (
              <div className="py-8 text-center">
                <div className="inline-block w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-indigo-300">Loading posts...</p>
              </div>
            )}
            
            {!loading && posts.length === 0 && (
              <div className="py-12 text-center backdrop-blur-md bg-indigo-900/20 rounded-xl border border-indigo-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <p className="text-xl text-indigo-300 font-medium">Be the first to post content about Pulse!</p>
                <p className="mt-2 text-gray-400">Start the conversation and earn rewards.</p>
              </div>
            )}
            
            {posts.map((post) => (
              <div key={post.id} className="backdrop-blur-md bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] transition-all duration-500 group">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3 bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.3)] group-hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-300">
                    <span className="font-bold text-white">{ContentAPI.formatWalletAddress(post.walletAddress).charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">{ContentAPI.formatWalletAddress(post.walletAddress)}</h4>
                    <p className="text-xs text-gray-400">
                      {ContentAPI.formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="text-gray-200 backdrop-blur-sm bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-300">{post.content}</p>
                
                {post.imageURL && (
                  <div className="mt-4 relative group">
                    <div className="relative">
                      <img 
                        src={post.imageURL} 
                        alt="Content" 
                        className="rounded-lg max-w-md max-h-48 object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* 인터랙션 버튼 - 네온 효과 추가 */}
              
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 리워드 섹션 - 글래스모피즘 적용 */}
      <section id="rewards" className="py-20 relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text inline-block">
              Campaign Rewards
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          {/* 리워드 그리드 - 글래스모피즘 적용 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* 우승자 리워드 박스 */}
            <div className="backdrop-blur-md bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/30 p-8 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:shadow-[0_0_35px_rgba(59,130,246,0.3)] transition-all duration-500 group">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">Winner Rewards</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-4 shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_15px_rgba(59,130,246,0.7)] transition-all duration-300">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium bg-gradient-to-r from-blue-300 to-indigo-300 text-transparent bg-clip-text group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">X SOL</span> 
                    <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Reward description</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-4 shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_15px_rgba(59,130,246,0.7)] transition-all duration-300">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium bg-gradient-to-r from-blue-300 to-indigo-300 text-transparent bg-clip-text group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300">Exclusive NFT Badge</span>
                    <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Unique digital collectible</p>
                  </div>
                </li>
              </ul>
            </div>
            
            {/* 활발한 참가자 리워드 박스 */}
            <div className="backdrop-blur-md bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/30 p-8 rounded-xl shadow-[0_0_25px_rgba(139,92,246,0.2)] hover:shadow-[0_0_35px_rgba(139,92,246,0.3)] transition-all duration-500 group">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">Active Participant Rewards</h3>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-4 shadow-[0_0_10px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_15px_rgba(139,92,246,0.7)] transition-all duration-300">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium bg-gradient-to-r from-purple-300 to-indigo-300 text-transparent bg-clip-text group-hover:from-purple-200 group-hover:to-indigo-200 transition-all duration-300">Y SOL per quality post</span>
                    <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Earn for contributing</p>
                  </div>
                </li>
                <li className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-4 shadow-[0_0_10px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_15px_rgba(139,92,246,0.7)] transition-all duration-300">
                    <span className="text-white text-sm">✦</span>
                  </div>
                  <div>
                    <span className="text-lg font-medium bg-gradient-to-r from-purple-300 to-indigo-300 text-transparent bg-clip-text group-hover:from-purple-200 group-hover:to-indigo-200 transition-all duration-300">Community Badges</span>
                    <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors duration-300">Based on contribution</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-xl mb-8 text-indigo-300 backdrop-blur-sm bg-indigo-900/10 p-4 rounded-lg inline-block">Don't miss your chance to participate in the Pulse campaign!</p> 
            <a 
              href="#top" 
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-full font-bold text-lg inline-block transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] relative overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">Start Posting Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* 푸터 - 글래스모피즘 적용 */}
      <footer className="bg-black/50 backdrop-blur-md py-10 border-t border-indigo-900/30 relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 group">
              <Image
                src="/images/pulselogo.jpg"
                alt="Pulse Logo"
                width={100}
                height={30}
                className="rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
              <p className="mt-2 text-blue-300 group-hover:text-blue-200 transition-colors duration-300">Empowering communities through engagement</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-blue-500 after:origin-bottom-right after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300">Twitter</a>
              <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-300 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-purple-500 after:origin-bottom-right after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300">Discord</a>
              <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors duration-300 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-pink-500 after:origin-bottom-right after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300">Medium</a>
              <a href="#" className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-indigo-500 after:origin-bottom-right after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300">GitHub</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p className="group">© {new Date().getFullYear()} <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text group-hover:from-blue-300 group-hover:to-purple-400 transition-all duration-300">Pulse</span>. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
