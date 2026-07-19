import type { NextConfig } from "next";

// Supabase Storage 공개 URL(event-covers 버킷 등)을 next/image로 최적화하려면
// 프로젝트 도메인을 remotePatterns에 등록해야 한다.
// 프로젝트 ref를 하드코딩하지 않기 위해 환경변수에서 hostname을 파싱한다.
// 빌드 타임에 환경변수가 없을 수 있으므로(예: CI lint 단계) 방어적으로 처리한다.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;
