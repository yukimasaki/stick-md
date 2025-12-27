'use client';

import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  onClick?: () => void;
}

/**
 * ブランドロゴコンポーネント
 * クリック可能な場合はonClickを指定
 */
export function BrandLogo({ className, onClick }: BrandLogoProps) {
  return (
    <span
      className={cn(
        'text-sm font-semibold',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      Stick MD
    </span>
  );
}

