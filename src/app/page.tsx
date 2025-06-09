'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { CommunityAPI, Community } from '@/api/community';
import { ContentAPI, Content } from '@/api/content';
import { TimerAPI, TimerState } from '@/api/timer';
import { CONFIG } from '@/api/config';

const SOON_COMMUNITY_ID = CONFIG.fixed.communityId;
const ORCA_COMMUNITY_ID = "a485968a-751d-4545-9bbb-740d55875707";
const IQ6900_COMMUNITY_ID = "a8f3e6d1-7b92-4c5f-9e48-d67f0a2b3c4e";
const PULSE_COMMUNITY_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

export default function Home() {
  const [soonTimeLeft, setSoonTimeLeft] = useState<string>('00:00:00');
  const [soonCommunityData, setSoonCommunityData] = useState<Community | null>(null);
  const [soonPostsCount, setSoonPostsCount] = useState<number>(0);

  const [orcaTimeLeft, setOrcaTimeLeft] = useState<string>('00:00:00');
  const [orcaCommunityData, setOrcaCommunityData] = useState<Community | null>(null);
  const [orcaPostsCount, setOrcaPostsCount] = useState<number>(0);

  const [iq6900TimeLeft, setIq6900TimeLeft] = useState<string>('00:00:00');
  const [iq6900CommunityData, setIq6900CommunityData] = useState<Community | null>(null);
  const [iq6900PostsCount, setIq6900PostsCount] = useState<number>(0);

  const [pulseTimeLeft, setPulseTimeLeft] = useState<string>('00:00:00');
  const [pulseCommunityData, setPulseCommunityData] = useState<Community | null>(null);
  const [pulsePostsCount, setPulsePostsCount] = useState<number>(0);

  const activeCampaignsRef = useRef<HTMLElement>(null);

  const scrollToActiveCampaigns = () => {
    console.log('Join Pulse Campaign button clicked');
    activeCampaignsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchSoonData = async () => {
      try {
        const community = await CommunityAPI.fetchCommunityById(SOON_COMMUNITY_ID);
        setSoonCommunityData(community);
        if (community) {
          const contents = await ContentAPI.fetchAllContents(SOON_COMMUNITY_ID);
          setSoonPostsCount(contents.length);
          const updateTimer = () => {
            const now = new Date();
            let remainingSec: number;
            const latestPost = contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            if (latestPost && latestPost.createdAt) {
              const lastPostTime = new Date(latestPost.createdAt).getTime();
              remainingSec = Math.max(0, (community.timeLimit * 60) - Math.floor((now.getTime() - lastPostTime) / 1000));
            } else if (community.lastMessageTime) {
                const elapsed = (now.getTime() - new Date(community.lastMessageTime).getTime()) / 1000;
                remainingSec = Math.max(0, community.timeLimit * 60 - Math.floor(elapsed));
            } else {
                remainingSec = community.timeLimit * 60;
            }
            const hms = TimerAPI.secondsToHMS(remainingSec);
            setSoonTimeLeft(TimerAPI.formatTime(hms));
          };
          updateTimer();
          interval = setInterval(updateTimer, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch Soon community data for homepage:', error);
      }
    };
    fetchSoonData();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchOrcaData = async () => {
      try {
        const community = await CommunityAPI.fetchCommunityById(ORCA_COMMUNITY_ID);
        setOrcaCommunityData(community);
        if (community) {
          const contents = await ContentAPI.fetchAllContents(ORCA_COMMUNITY_ID);
          setOrcaPostsCount(contents.length);
          const updateTimer = () => {
            const now = new Date();
            let remainingSec: number;
            const latestPost = contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            if (latestPost && latestPost.createdAt) {
              const lastPostTime = new Date(latestPost.createdAt).getTime();
              remainingSec = Math.max(0, (community.timeLimit * 60) - Math.floor((now.getTime() - lastPostTime) / 1000));
            } else if (community.lastMessageTime) {
                const elapsed = (now.getTime() - new Date(community.lastMessageTime).getTime()) / 1000;
                remainingSec = Math.max(0, community.timeLimit * 60 - Math.floor(elapsed));
            } else {
                remainingSec = community.timeLimit * 60;
            }
            const hms = TimerAPI.secondsToHMS(remainingSec);
            setOrcaTimeLeft(TimerAPI.formatTime(hms));
          };
          updateTimer();
          interval = setInterval(updateTimer, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch Orca community data for homepage:', error);
      }
    };
    fetchOrcaData();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchIQ6900Data = async () => {
      try {
        const community = await CommunityAPI.fetchCommunityById(IQ6900_COMMUNITY_ID);
        setIq6900CommunityData(community);
        if (community) {
          const contents = await ContentAPI.fetchAllContents(IQ6900_COMMUNITY_ID);
          setIq6900PostsCount(contents.length);
          const updateTimer = () => {
            const now = new Date();
            let remainingSec: number;
            const latestPost = contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            if (latestPost && latestPost.createdAt) {
              const lastPostTime = new Date(latestPost.createdAt).getTime();
              remainingSec = Math.max(0, (community.timeLimit * 60) - Math.floor((now.getTime() - lastPostTime) / 1000));
            } else if (community.lastMessageTime) {
                const elapsed = (now.getTime() - new Date(community.lastMessageTime).getTime()) / 1000;
                remainingSec = Math.max(0, community.timeLimit * 60 - Math.floor(elapsed));
            } else {
                remainingSec = community.timeLimit * 60;
            }
            const hms = TimerAPI.secondsToHMS(remainingSec);
            setIq6900TimeLeft(TimerAPI.formatTime(hms));
          };
          updateTimer();
          interval = setInterval(updateTimer, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch IQ6900 community data for homepage:', error);
      }
    };
    fetchIQ6900Data();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchPulseData = async () => {
      try {
        const community = await CommunityAPI.fetchCommunityById(PULSE_COMMUNITY_ID);
        setPulseCommunityData(community);
        if (community) {
          const contents = await ContentAPI.fetchAllContents(PULSE_COMMUNITY_ID);
          setPulsePostsCount(contents.length);
          const updateTimer = () => {
            const now = new Date();
            let remainingSec: number;
            const latestPost = contents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            if (latestPost && latestPost.createdAt) {
              const lastPostTime = new Date(latestPost.createdAt).getTime();
              remainingSec = Math.max(0, (community.timeLimit * 60) - Math.floor((now.getTime() - lastPostTime) / 1000));
            } else if (community.lastMessageTime) {
                const elapsed = (now.getTime() - new Date(community.lastMessageTime).getTime()) / 1000;
                remainingSec = Math.max(0, community.timeLimit * 60 - Math.floor(elapsed));
            } else {
                remainingSec = community.timeLimit * 60;
            }
            const hms = TimerAPI.secondsToHMS(remainingSec);
            setPulseTimeLeft(TimerAPI.formatTime(hms));
          };
          updateTimer();
          interval = setInterval(updateTimer, 1000);
        }
      } catch (error) {
        console.error('Failed to fetch Pulse community data for homepage:', error);
      }
    };
    fetchPulseData();
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white overflow-hidden">
      {/* 배경 효과 */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/background.png')] opacity-20 bg-fixed"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-blue-950/30 to-black"></div>
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* 헤더 - 글래스모피즘 적용 */}
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <Image
              src="/images/pulseLogoBlank.png"
              alt="Pulse Logo"
              width={120}
              height={40}
              className="cursor-pointer relative"
            />
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link 
                  href="#about" 
                  className="hover:text-blue-400 transition relative after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-blue-400 after:to-purple-500 after:origin-bottom-right after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 히어로 섹션 - 더 현대적인 디자인 */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/background.png"
            alt="Background"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        </div>
        
        {/* 장식용 요소 */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 text-transparent bg-clip-text drop-shadow-lg">
              Pulse Community Bootstrapper
            </h1>
            <div className="w-24 h-1 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8"></div>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-300 leading-relaxed backdrop-blur-sm bg-black/10 p-6 rounded-xl border border-gray-800/50">
              Get rewarded for quality posts about projects you love.
            </p>
          </div>
        </div>
      </section>

      {/* Round 3 Coming Soon Section - 현대적인 Web3 스타일 */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 to-purple-900/10"></div>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10">
          {/* 현대적인 Web3 스타일 이미지 프레임 */}
          <div className="flex-shrink-0 group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/40 via-purple-600/40 to-pink-600/40 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-all duration-500 scale-105"></div>
            <div className="relative p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_35px_rgba(139,92,246,0.7)] transition-all duration-500">
              <div className="bg-gray-900/90 backdrop-blur-sm p-2 rounded-xl">
                <Image
                  src="/images/pulseround3.jpg"
                  alt="Pulse Round 3 Coming Soon"
                  width={600} 
                  height={338}
                  className="rounded-lg transform transition duration-500 group-hover:scale-[1.02]"
                  priority
                />
              </div>
            </div>
            {/* 장식용 요소 추가 */}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-xl opacity-60 animate-pulse delay-700"></div>
          </div>

          {/* 텍스트 콘텐츠 & 버튼 */}
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-transparent bg-clip-text">
              Round 3 is live!
            </h2>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              
              <Link 
                href="#active-campaigns"
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-gray-800/80 to-gray-900/80 hover:from-gray-700 hover:to-gray-800 backdrop-blur-sm font-medium border border-gray-700/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              >
                Join Pulse Campaign
              </Link>
            
            </div>
          </div>
        </div>
      </section>

      {/* Active Campaigns Section - 글래스모피즘 적용 */}
      <section id="active-campaigns" ref={activeCampaignsRef} className="py-24 relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text inline-block">
              Active Campaigns
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          <div className="max-w-5xl mx-auto space-y-12">
            {/* Pulse Campaign Card - 글래스모피즘 적용 */}
            {pulseCommunityData && (
              <div className="backdrop-blur-md bg-gray-900/30 rounded-xl border border-gray-800/50 overflow-hidden group transition-all duration-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:border-purple-500/30">
                <div className="flex flex-col md:flex-row">
                  {/* 이미지 컨테이너 */}
                  <div className="md:w-1/3 relative h-40 md:h-auto flex items-center justify-center bg-gradient-to-br from-indigo-900/60 to-gray-900/80 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <Image 
                      src="/images/pulselogo.jpg" 
                      alt="Pulse Logo" 
                      fill
                      style={{ objectFit: 'contain', padding: '1rem' }} 
                      className="transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="md:w-2/3 p-6 md:p-8">
                    <div className="flex items-center mb-3">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">{pulseCommunityData?.name || 'Pulse Community'}</h3>
                      <span className="ml-3 px-3 py-1 bg-pink-500/20 text-pink-300 text-xs font-medium rounded-full border border-pink-500/30">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-300 mb-5 text-sm">
                      {pulseCommunityData?.description || 'Engage with the core Pulse community. Share your ideas, contributions, and help shape the future!'}
                    </p>
                    {/* 통계 그리드 - 글래스모피즘 적용 */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      <div className="backdrop-blur-md bg-gray-800/40 p-3 rounded-lg text-center border border-gray-700/50 group-hover:border-blue-500/30 transition-all duration-300">
                        <div className="text-xl font-bold text-blue-300">{pulsePostsCount > 0 ? pulsePostsCount : '0'}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Participants</div>
                      </div>
                      <div className="backdrop-blur-md bg-gray-800/40 p-3 rounded-lg text-center border border-gray-700/50 group-hover:border-purple-500/30 transition-all duration-300">
                        <div className="text-xl font-bold text-purple-300">{pulseCommunityData?.bountyAmount ? parseFloat(pulseCommunityData.bountyAmount).toFixed(2) : '100.00'}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">SOL</div>
                      </div>
                      <div className="backdrop-blur-md bg-gray-800/40 p-3 rounded-lg text-center border border-gray-700/50 group-hover:border-pink-500/30 transition-all duration-300">
                        <div className="text-xl font-bold text-pink-300">{pulseTimeLeft}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Time Left</div>
                      </div>
                      <div className="backdrop-blur-md bg-gray-800/40 p-3 rounded-lg text-center border border-gray-700/50 group-hover:border-indigo-500/30 transition-all duration-300">
                        <div className="text-xl font-bold text-indigo-300">{pulsePostsCount}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider">Posts</div>
                      </div>
                    </div>
                    {/* 버튼 - 네온 효과 추가 */}
                    <div className="flex flex-wrap gap-3">
                      <Link 
                        href="/pulse" 
                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                      >
                        Join Campaign
                      </Link>
                 
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Section - 글래스모피즘 적용 */}
      <section id="about" className="py-20 relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="mb-14 text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text inline-block">
              What is Pulse?
            </h2>
            <div className="h-1 w-40 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="rounded-xl overflow-hidden border border-gray-800/50 shadow-lg">
            <video
              src="/videos/logic.mp4"
              controls
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
              style={{ minHeight: 320 }}
            />
          </div>
            <div className="backdrop-blur-md bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-8 border border-blue-500/20 shadow-lg hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3 shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                  <span className="text-xl font-bold text-white">P</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">Pulse Round 3</h3>
              </div>
      
              <ul className="space-y-3 mb-6">
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center mr-3 shadow-[0_0_5px_rgba(99,102,241,0.5)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-200">6-hour countdown timer</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center mr-3 shadow-[0_0_5px_rgba(139,92,246,0.5)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-200">3SOL reward</span>
                </li>
                <li className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center mr-3 shadow-[0_0_5px_rgba(236,72,153,0.5)]">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-200">Vault: PULSE9xChTVTQXsrN4wVuiGtgEdt2zhB9uJKpVd1Qkn</span>
                </li>
              </ul>
              <Link
                href="/pulse"
                className="block w-full py-3 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-center rounded-lg font-bold transition duration-300 text-white shadow-md hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transform hover:scale-[1.02]"
              >
                Join the Campaign
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 글래스모피즘 적용 */}
      <section id="how-it-works" className="py-20 relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute inset-0 bg-[url('/images/background.png')] opacity-5 bg-fixed"></div>
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        
  
      </section>

      {/* 푸터 - 글래스모피즘 적용 */}
      <footer className="bg-black/50 backdrop-blur-md py-10 border-t border-blue-900/30 relative overflow-hidden">
        {/* 배경 효과 */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl"></div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 group">
              <Image
                src="/images/pulseLogoBlank.png"
                alt="Pulse Logo"
                width={100}
                height={30}
                className="transition-transform duration-300 group-hover:scale-105"
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