// src/pages/common/Referrals.jsx
import React, { useState, useEffect } from 'react';
import {
  Gift, Users, Share2, Copy, Check, ChevronRight,
  DollarSign, Award, TrendingUp, Calendar
} from 'lucide-react';
import { userService } from '@/services/user.service';
import Button from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import toast from 'react-hot-toast';

const Referrals = () => {
  const [referralInfo, setReferralInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const [info, statsData, referralsData] = await Promise.all([
        userService.getReferralInfo(),
        userService.getReferralStats(),
        userService.getReferrals()
      ]);
      setReferralInfo(info);
      setStats(statsData);
      setReferrals(referralsData);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralInfo?.code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Referral code copied!');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Join EasyGo and get $10 off!',
      text: `Use my referral code ${referralInfo?.code} to get $10 off your first ride!`,
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      handleCopyCode();
    }
  };

  const StatCard = ({ title, value, icon: Icon, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-gray-600">{title}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container-custom py-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <div className="text-center">
            <Gift className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Refer & Earn</h1>
            <p className="text-lg opacity-90">
              Invite your friends and earn rewards for every successful referral
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Referrals"
            value={stats?.totalReferrals || 0}
            icon={Users}
            subtitle={`${stats?.activeReferrals || 0} active`}
          />
          <StatCard
            title="Total Earned"
            value={formatCurrency(stats?.totalEarned || 0)}
            icon={DollarSign}
          />
          <StatCard
            title="Pending Rewards"
            value={formatCurrency(stats?.pendingRewards || 0)}
            icon={Award}
          />
        </div>

        {/* Referral Code Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">Your Referral Code</h2>
          <p className="text-gray-600 mb-4">
            Share this code with your friends and family. They'll get $10 off their first ride,
            and you'll earn $5 when they complete their first trip!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <code className="text-2xl font-mono font-bold text-purple-600">
                  {referralInfo?.code}
                </code>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCopyCode} icon={copied ? Check : Copy}>
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button onClick={handleShare} icon={Share2} variant="outline">
                Share
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-green-800">Your referral link</p>
                <p className="text-sm text-green-600 mt-1">
                  {window.location.origin}/signup?ref={referralInfo?.code}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${referralInfo?.code}`);
                  toast.success('Referral link copied!');
                }}
                className="text-green-600 hover:text-green-700"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Share Your Code</h3>
              <p className="text-gray-600 text-sm">
                Share your unique referral code with friends via WhatsApp, SMS, or social media
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Friends Sign Up</h3>
              <p className="text-gray-600 text-sm">
                Your friends sign up using your code and complete their first ride
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Earn Rewards</h3>
              <p className="text-gray-600 text-sm">
                You earn $5 for every successful referral. Rewards added to your wallet instantly
              </p>
            </div>
          </div>
        </div>

        {/* Referral History */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Referral History</h2>
          </div>
          {referrals.length > 0 ? (
            <div className="divide-y">
              {referrals.map(referral => (
                <div key={referral.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="font-medium">{referral.friendName.charAt(0)}</span>
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{referral.friendName}</p>
                        <p className="text-sm text-gray-500">Joined {formatDate(referral.joinedAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+{formatCurrency(referral.reward)}</p>
                      <p className="text-xs text-gray-500">{referral.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Share your code to start earning rewards
              </p>
            </div>
          )}
        </div>

        {/* Terms */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Terms and conditions apply. Rewards are credited after friend completes their first ride.</p>
          <p>Maximum referral rewards: $500 per month</p>
        </div>
      </div>
    </div>
  );
};

export default Referrals;