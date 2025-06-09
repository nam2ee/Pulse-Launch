'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react'; // Added React import for potential future use

export default function Round3Page() {

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Image
              src="/images/pulseLogoBlank.png" // Updated Logo Path
              alt="Pulse Logo"
              width={120} 
              height={40}
              className="cursor-pointer transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <div className="flex items-center space-x-6">
            <nav>
              <ul className="flex space-x-6">
                {/* Removed Home Link */}
              </ul>
            </nav>
            {/* You might want a Connect Wallet button here too */}
          </div>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-gray-900 via-indigo-900/50 to-black">
           <div className="absolute inset-0">
             <Image
               src="/images/pulseround3.jpg" // Background image for the section
               alt="Round 3 Background"
               fill
               style={{ objectFit: 'cover' }}
               className="opacity-10 saturate-50" 
             />
             <div className="absolute inset-0 bg-black/50"></div>
           </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-transparent bg-clip-text">
              Pulse: Round 3
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              The next evolution of community bootstrapping is here. Discover enhanced mechanics, greater rewards, and new ways to make your mark.
            </p>
            <Link 
              href="/#active-campaigns"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-900/30"
            >
              Check Active Campaigns
            </Link>
          </div>
        </section>

        {/* What's New Section */}
        <section className="py-20 bg-gray-900/40">
      
        </section>

        {/* How It Works Section */}
        <section className="py-20">
           <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-orange-400">
                How Round 3 Works
              </h2>
              <div className="prose prose-invert lg:prose-xl mx-auto text-gray-300 space-y-6">
                 <p>
                   Round 3 builds upon the core Pulse mechanics you know, focusing on sustained, quality contributions. Here's a breakdown:
                 </p>
                 
                 <h4>1. Choose Your Campaign</h4>
                 <p>Select an active campaign you want to support from the main page. Each campaign has its own focus and specific rules.</p>
                 
                 <h4>2. Connect & Contribute</h4>
                 <p>Connect your wallet and start posting valuable content related to the campaign. Posts can include text and images. Remember, quality over quantity!</p>
                 
                 <h4>3. Understand the Timer & Scoring</h4>
                 <p>Each valid post resets the campaign timer (details may vary per campaign). Your posts contribute to your score based on the new dynamic scoring system, considering factors like engagement (likes/replies - if implemented), content relevance, and bonus objective completion.</p>
                 
                 <h4>4. Win the Round</h4>
                 <p>The participant who makes the last valid post before the timer expires wins the main round prize. However, active participation throughout the round is also heavily rewarded.</p>
              </div>
           </div>
        </section>
        
        {/* Rewards Section - Placeholder */}
        <section className="py-20 bg-gray-900/40">
           <div className="max-w-5xl mx-auto px-4">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-orange-400">
                Round 3 Rewards
              </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Winner Rewards */} 
                 <div className="bg-gradient-to-br from-orange-900/30 to-red-900/40 p-6 rounded-lg border border-orange-700/50">
                    <h3 className="text-2xl font-semibold mb-4 text-white">Round Winner</h3>
                     <ul className="space-y-3 text-gray-300 list-disc list-inside">
                       <li>Significant SOL Prize</li>
                       <li>Exclusive Round 3 Winner NFT</li>
                       <li>Featured spot in the Community Hall of Fame</li>
                       <li>Partner project bonuses (if applicable)</li>
                    </ul>
                 </div>
                 {/* Participation Rewards */} 
                 <div className="bg-gray-800/60 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-2xl font-semibold mb-4 text-white">Active Participants</h3>
                    <ul className="space-y-3 text-gray-300 list-disc list-inside">
                       <li>SOL based on score/rank</li>
                       <li>Participation Badges/NFTs</li>
                       <li>Points towards overall leaderboard</li>
                       <li>Bonus Objective Rewards</li>
                    </ul>
                 </div>
              </div>
           </div>
        </section>

        {/* Get Ready Section */}
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6 text-orange-400">Get Ready to Pulse!</h2>
            <p className="text-lg text-gray-400 mb-8">
               Round 3 is set to launch soon. Follow our announcements and prepare to make your impact!
            </p>
             <Link 
              href="/#active-campaigns"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-900/30"
            >
              View Campaigns
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-black/80 py-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Pulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 