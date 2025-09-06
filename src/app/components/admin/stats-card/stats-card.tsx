'use client';
import { tw } from 'twind';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-500',
    text: 'text-blue-700',
    subtitle: 'text-blue-600'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-500',
    text: 'text-green-700',
    subtitle: 'text-green-600'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'bg-purple-500',
    text: 'text-purple-700',
    subtitle: 'text-purple-600'
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'bg-orange-500',
    text: 'text-orange-700',
    subtitle: 'text-orange-600'
  }
};

export default function StatsCard({ title, value, subtitle, icon, trend, color }: StatsCardProps) {
  const colors = colorVariants[color];

  return (
    <div className={tw`${colors.bg} p-4 sm:p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-200`}>
      <div className={tw`flex items-center justify-between mb-3 sm:mb-4`}>
        <h3 className={tw`${colors.text} font-semibold text-xs sm:text-sm uppercase tracking-wide`}>
          {title}
        </h3>
        <div className={tw`${colors.icon} w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <span className={tw`text-white text-base sm:text-lg`}>{icon}</span>
        </div>
      </div>
      
      <div className={tw`mb-2`}>
        <p className={tw`${colors.text} text-2xl sm:text-3xl font-bold`}>{value}</p>
      </div>
      
      <div className={tw`flex items-center justify-between`}>
        <p className={tw`${colors.subtitle} text-xs sm:text-sm`}>{subtitle}</p>
        {trend && (
          <div className={tw`flex items-center space-x-1`}>
            <span className={tw`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↗' : '↘'}
            </span>
            <span className={tw`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}